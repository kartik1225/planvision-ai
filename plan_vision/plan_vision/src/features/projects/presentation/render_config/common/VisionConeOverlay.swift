//
//  VisionConeOverlay.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-12-03.
//

import SwiftUI

/// A view that composites the VisionCone onto a floor plan image for export
struct VisionConeOverlay: View {
    let image: UIImage
    let positionX: Double      // 0-1 normalized in container space
    let positionY: Double      // 0-1 normalized in container space
    let angle: Double          // Degrees
    let coneScale: CGFloat     // Scale factor for the cone size
    let containerSize: CGSize  // The container size where user placed the cone
    let mapScale: CGFloat      // Zoom level of image in container
    let mapOffset: CGSize      // Pan offset of image in container

    var body: some View {
        let imageSize = image.size

        // Calculate where on the actual image the cone should be placed
        let imagePosition = transformToImageCoordinates(
            containerPosition: CGPoint(
                x: containerSize.width * positionX,
                y: containerSize.height * positionY
            ),
            containerSize: containerSize,
            imageSize: imageSize,
            mapScale: mapScale,
            mapOffset: mapOffset
        )

        // Normalize to 0-1 for image coordinates
        let normalizedX = imagePosition.x / imageSize.width
        let normalizedY = imagePosition.y / imageSize.height

        // Use overlay with GeometryReader for reliable positioning in ImageRenderer
        Image(uiImage: image)
            .overlay {
                GeometryReader { geo in
                    ScaledVisionCone(scale: coneScale)
                        .rotationEffect(.degrees(angle))
                        .position(
                            x: geo.size.width * normalizedX,
                            y: geo.size.height * normalizedY
                        )
                }
            }
            .frame(width: imageSize.width, height: imageSize.height)
    }

    /// Transform container coordinates to actual image coordinates
    private func transformToImageCoordinates(
        containerPosition: CGPoint,
        containerSize: CGSize,
        imageSize: CGSize,
        mapScale: CGFloat,
        mapOffset: CGSize
    ) -> CGPoint {
        // Calculate the fitted size of the image (aspect fit)
        let imageAspect = imageSize.width / imageSize.height
        let containerAspect = containerSize.width / containerSize.height

        var fittedSize: CGSize
        if imageAspect > containerAspect {
            // Image is wider - fit to width
            fittedSize = CGSize(
                width: containerSize.width,
                height: containerSize.width / imageAspect
            )
        } else {
            // Image is taller - fit to height
            fittedSize = CGSize(
                width: containerSize.height * imageAspect,
                height: containerSize.height
            )
        }

        // Calculate the center offset (for aspect fit centering)
        let centerOffset = CGPoint(
            x: (containerSize.width - fittedSize.width) / 2,
            y: (containerSize.height - fittedSize.height) / 2
        )

        // The displayed image center (after mapOffset)
        let displayedCenter = CGPoint(
            x: containerSize.width / 2 + mapOffset.width,
            y: containerSize.height / 2 + mapOffset.height
        )

        // Transform container position to image position:
        // 1. Get position relative to displayed image center
        let relativeToCenter = CGPoint(
            x: containerPosition.x - displayedCenter.x,
            y: containerPosition.y - displayedCenter.y
        )

        // 2. Undo the map scale
        let unscaled = CGPoint(
            x: relativeToCenter.x / mapScale,
            y: relativeToCenter.y / mapScale
        )

        // 3. Convert to image coordinates (relative to image center)
        let imageCenter = CGPoint(x: imageSize.width / 2, y: imageSize.height / 2)
        let scaleToImage = imageSize.width / fittedSize.width

        let imagePosition = CGPoint(
            x: imageCenter.x + unscaled.x * scaleToImage,
            y: imageCenter.y + unscaled.y * scaleToImage
        )

        return imagePosition
    }
}

/// A scalable version of VisionCone for image compositing
struct ScaledVisionCone: View {
    let scale: CGFloat

    // Base dimensions (from original VisionCone)
    private let baseConeWidth: CGFloat = 100
    private let baseConeHeight: CGFloat = 150
    private let basePuckSize: CGFloat = 24

    var body: some View {
        let coneWidth = baseConeWidth * scale
        let coneHeight = baseConeHeight * scale
        let puckSize = basePuckSize * scale

        ZStack {
            // 1. The Field of View (Gradient Beam)
            VStack(spacing: 0) {
                LinearGradient(
                    colors: [
                        Color.accentColor.opacity(0.0), // Fades out at top
                        Color.accentColor.opacity(0.4)  // Stronger near user
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(width: coneWidth, height: coneHeight)
                // Mask to make it a cone shape
                .mask(
                    GeometryReader { geo in
                        Path { path in
                            let w = geo.size.width
                            let h = geo.size.height

                            path.move(to: CGPoint(x: w/2, y: h)) // Bottom center (User)
                            path.addLine(to: CGPoint(x: 0, y: 0))   // Top Left
                            path.addLine(to: CGPoint(x: w, y: 0))   // Top Right
                            path.closeSubpath()
                        }
                    }
                )
            }
            .offset(y: -coneHeight / 2) // Shift up so pivot point is at the bottom

            // 2. The User "Puck" (Location Pin)
            Circle()
                .fill(Color.white)
                .frame(width: puckSize, height: puckSize)
                .shadow(radius: 4 * scale)
                .overlay(
                    Circle()
                        .fill(Color.accentColor)
                        .padding(4 * scale)
                )
                // Direction Arrow inside Puck
                .overlay(
                    Image(systemName: "arrow.up")
                        .font(.system(size: 10 * scale, weight: .bold))
                        .foregroundColor(.white)
                )
        }
        .allowsHitTesting(false)
    }
}
