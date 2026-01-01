//
//  TemplateCardView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import SwiftUI

struct TemplateCardView: View {
    let template: ProjectTemplate

    @State private var currentImageIndex = 0

    private var hasComparisonImages: Bool {
        template.originalThumbnailUrl != nil && template.generatedThumbnailUrl != nil
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Image Section with swipe capability
            ZStack(alignment: .bottom) {
                if hasComparisonImages {
                    // Swipeable comparison images
                    TabView(selection: $currentImageIndex) {
                        // Original Image
                        TemplateImageView(
                            url: template.originalThumbnailUrl,
                            label: "Original"
                        )
                        .tag(0)

                        // Generated Image
                        TemplateImageView(
                            url: template.generatedThumbnailUrl,
                            label: "AI Generated"
                        )
                        .tag(1)
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))

                    // Custom page indicator
                    HStack(spacing: 6) {
                        ForEach(0..<2) { index in
                            Capsule()
                                .fill(currentImageIndex == index ? Color.white : Color.white.opacity(0.4))
                                .frame(width: currentImageIndex == index ? 20 : 6, height: 6)
                                .animation(.spring(response: 0.3), value: currentImageIndex)
                        }
                    }
                    .padding(.bottom, 12)
                } else {
                    // Single thumbnail
                    TemplateImageView(
                        url: template.thumbnailUrl,
                        label: nil
                    )
                }
            }
            .frame(height: 200)
            .clipped()

            // Content Section
            VStack(alignment: .leading, spacing: 8) {
                Text(template.title)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                if !template.description.isEmpty {
                    Text(template.description)
                        .font(.system(size: 14, weight: .regular))
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                // Swipe hint for comparison images
                if hasComparisonImages {
                    HStack(spacing: 4) {
                        Image(systemName: "hand.draw")
                            .font(.system(size: 11))
                        Text("Swipe to compare")
                            .font(.system(size: 11, weight: .medium))
                    }
                    .foregroundStyle(.secondary.opacity(0.7))
                    .padding(.top, 4)
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
        }
        .background(Color(UIColor.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .shadow(color: .black.opacity(0.08), radius: 12, x: 0, y: 4)
    }
}

// MARK: - Template Image View
private struct TemplateImageView: View {
    let url: URL?
    let label: String?

    var body: some View {
        ZStack(alignment: .topLeading) {
            AsyncImage(url: url) { phase in
                switch phase {
                case .empty:
                    Rectangle()
                        .fill(Color(UIColor.tertiarySystemFill))
                        .overlay {
                            ProgressView()
                                .tint(.secondary)
                        }
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                case .failure:
                    Rectangle()
                        .fill(Color(UIColor.tertiarySystemFill))
                        .overlay {
                            VStack(spacing: 8) {
                                Image(systemName: "photo")
                                    .font(.title2)
                                Text("Failed to load")
                                    .font(.caption)
                            }
                            .foregroundStyle(.secondary)
                        }
                @unknown default:
                    EmptyView()
                }
            }

            // Label badge
            if let label = label {
                Text(label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(
                        Capsule()
                            .fill(.ultraThinMaterial)
                            .overlay(
                                Capsule()
                                    .fill(label == "AI Generated" ?
                                          Color.purple.opacity(0.6) :
                                          Color.black.opacity(0.3))
                            )
                    )
                    .padding(12)
            }
        }
    }
}

#Preview {
    ScrollView {
        VStack(spacing: 20) {
            // With comparison images
            TemplateCardView(
                template: ProjectTemplate(
                    id: "1",
                    title: "Modern Kitchen",
                    description: "Transform your kitchen into a sleek, contemporary space.",
                    thumbnailUrl: URL(string: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"),
                    originalThumbnailUrl: URL(string: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136"),
                    generatedThumbnailUrl: URL(string: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"),
                    sampleImageUrls: [],
                    defaultImageTypeId: "1"
                )
            )

            // Without comparison images
            TemplateCardView(
                template: ProjectTemplate(
                    id: "2",
                    title: "Cozy Living Room",
                    description: "Create a warm and inviting living space for your family.",
                    thumbnailUrl: URL(string: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"),
                    originalThumbnailUrl: nil,
                    generatedThumbnailUrl: nil,
                    sampleImageUrls: [],
                    defaultImageTypeId: "2"
                )
            )
        }
        .padding()
    }
    .background(Color(UIColor.systemGroupedBackground))
}
