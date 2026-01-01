//
//  InteractiveMapStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct InteractiveMapStepView: View {
    @ObservedObject var builder: RenderConfigBuilder

    // Gesture State (temporary during drag/pinch)
    @State private var lastMapScale: CGFloat = 1.0
    @State private var lastMapOffset: CGSize = .zero

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 20) {
                    // Instructions
                    VStack(spacing: 4) {
                        Text("Set the camera position")
                            .font(.system(size: 15))
                            .foregroundStyle(.secondary)

                        Text("Drag the pin to your standing point")
                            .font(.system(size: 13))
                            .foregroundStyle(.tertiary)
                    }
                    .padding(.top, 8)

                    // Map Area
                    GeometryReader { geo in
                        let containerSize = geo.size

                        ZStack {
                            // Floor Plan Image
                            if let image = builder.selectedImage {
                                Image(uiImage: image)
                                    .resizable()
                                    .aspectRatio(contentMode: .fit)
                                    .scaleEffect(builder.mapScale)
                                    .offset(builder.mapOffset)
                                    .gesture(
                                        SimultaneousGesture(
                                            MagnificationGesture()
                                                .onChanged { val in builder.mapScale = lastMapScale * val }
                                                .onEnded { _ in lastMapScale = builder.mapScale },
                                            DragGesture()
                                                .onChanged { val in
                                                    builder.mapOffset = CGSize(
                                                        width: lastMapOffset.width + val.translation.width,
                                                        height: lastMapOffset.height + val.translation.height
                                                    )
                                                }
                                                .onEnded { _ in lastMapOffset = builder.mapOffset }
                                        )
                                    )
                            }

                            // Vision Cone
                            VisionCone()
                                .rotationEffect(.degrees(builder.perspectiveAngle))
                                .position(
                                    x: containerSize.width * builder.perspectiveX,
                                    y: containerSize.height * builder.perspectiveY
                                )
                                .gesture(
                                    DragGesture()
                                        .onChanged { value in
                                            let newX = value.location.x / containerSize.width
                                            let newY = value.location.y / containerSize.height
                                            builder.perspectiveX = min(max(newX, 0), 1)
                                            builder.perspectiveY = min(max(newY, 0), 1)
                                        }
                                )
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                        .background(Color(UIColor.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .onAppear {
                            builder.mapContainerSize = containerSize
                        }
                        .onChange(of: containerSize) { _, newSize in
                            builder.mapContainerSize = newSize
                        }
                    }
                    .frame(height: 300)
                    .padding(.horizontal, 20)

                    // Rotation Control
                    VStack(spacing: 12) {
                        HStack {
                            Text("Rotation")
                                .font(.system(size: 15, weight: .medium))
                                .foregroundStyle(.primary)

                            Spacer()

                            Text("\(Int(builder.perspectiveAngle))°")
                                .font(.system(size: 15, weight: .medium, design: .monospaced))
                                .foregroundStyle(.secondary)
                        }

                        Slider(value: $builder.perspectiveAngle, in: 0...360)
                            .tint(Color.accentColor)
                    }
                    .padding(16)
                    .background(Color(UIColor.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }

            // Bottom Bar
            VStack(spacing: 0) {
                Divider()

                VStack(spacing: 12) {
                    GlassButton(title: "Continue", icon: "arrow.right") {
                        builder.nextStep()
                    }

                    Button {
                        // Skip perspective → go to style selection instead
                        builder.perspectiveX = 0.5
                        builder.perspectiveY = 0.5
                        builder.perspectiveAngle = 0.0
                        builder.skipPerspectiveToStyleSelection()
                    } label: {
                        Text("Skip this step")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(20)
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
        .onAppear {
            // Pre-load styles for auto-selection (floor plans skip style selection)
            if builder.availableStyles.isEmpty {
                builder.loadStylesAndColors()
            }
        }
    }
}
