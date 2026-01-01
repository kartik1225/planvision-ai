//
//  StyleSelectionStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct StyleSelectionStepView: View {
    @ObservedObject var builder: RenderConfigBuilder

    let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12)
    ]

    var body: some View {
        VStack(spacing: 0) {
            if builder.availableStyles.isEmpty {
                // Loading State
                Spacer()
                VStack(spacing: 12) {
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Loading styles...")
                        .font(.system(size: 15))
                        .foregroundStyle(.secondary)
                }
                Spacer()
            } else if builder.filteredStyles.isEmpty {
                // No styles for selected image type
                Spacer()
                VStack(spacing: 12) {
                    Image(systemName: "paintbrush")
                        .font(.system(size: 40))
                        .foregroundStyle(.tertiary)
                    Text("No styles available")
                        .font(.system(size: 17, weight: .medium))
                        .foregroundStyle(.secondary)
                    Text("No styles are configured for this space type")
                        .font(.system(size: 15))
                        .foregroundStyle(.tertiary)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 40)
                Spacer()
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        // Header
                        Text("Choose an aesthetic")
                            .font(.system(size: 15))
                            .foregroundStyle(.secondary)
                            .padding(.horizontal, 20)

                        // Grid
                        LazyVGrid(columns: columns, spacing: 12) {
                            ForEach(builder.filteredStyles) { style in
                                StyleCard(
                                    style: style,
                                    isSelected: builder.selectedStyle?.id == style.id
                                ) {
                                    Haptics.selection()
                                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                        builder.selectedStyle = style
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                    .padding(.vertical, 20)
                }
            }

            // Bottom Bar
            VStack(spacing: 0) {
                Divider()

                GlassButton(title: "Continue", icon: "arrow.right") {
                    builder.nextStep()
                }
                .disabled(!canProceed)
                .opacity(canProceed ? 1.0 : 0.5)
                .padding(20)
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
        .onAppear {
            // Always reload styles with the current imageTypeId to get contextual thumbnails
            builder.loadStylesAndColors()

            // Clear selected style if it doesn't apply to current image type
            if let selected = builder.selectedStyle,
               !selected.appliesTo(imageTypeId: builder.selectedImageType?.id) {
                builder.selectedStyle = nil
            }
        }
    }

    var canProceed: Bool {
        builder.selectedStyle != nil &&
        builder.selectedStyle!.appliesTo(imageTypeId: builder.selectedImageType?.id)
    }
}

// MARK: - Style Card
struct StyleCard: View {
    let style: Style
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 0) {
                // Thumbnail
                AsyncImage(url: style.thumbnailUrl) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    } else if phase.error != nil {
                        Color(UIColor.tertiarySystemFill)
                            .overlay(
                                Image(systemName: "photo")
                                    .font(.title2)
                                    .foregroundStyle(.tertiary)
                            )
                    } else {
                        Color(UIColor.tertiarySystemFill)
                            .overlay(ProgressView())
                    }
                }
                .frame(height: 140)
                .clipped()

                // Label
                HStack {
                    Text(style.name)
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(.primary)
                        .lineLimit(1)

                    Spacer()

                    if isSelected {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(Color.accentColor)
                            .font(.system(size: 18))
                    }
                }
                .padding(12)
                .background(Color(UIColor.secondarySystemGroupedBackground))
            }
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 2)
            )
            .shadow(color: .black.opacity(isSelected ? 0.1 : 0.05), radius: isSelected ? 8 : 4, y: 2)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}
