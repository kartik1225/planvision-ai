//
//  ReviewStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct ReviewStepView: View {
    @ObservedObject var builder: RenderConfigBuilder

    var body: some View {
        ZStack {
            // Main Content
            VStack(spacing: 0) {
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        VStack(spacing: 4) {
                            Text("Ready to generate")
                                .font(.system(size: 22, weight: .bold))
                                .foregroundStyle(.primary)

                            Text("Review your selections below")
                                .font(.system(size: 15))
                                .foregroundStyle(.secondary)
                        }
                        .padding(.top, 8)

                    // Image Preview (shows composite with perspective overlay for floor plans)
                    if let image = builder.previewImage {
                        Image(uiImage: image)
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                            .frame(maxWidth: .infinity)
                            .frame(maxHeight: 200)
                            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                            .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
                            .padding(.horizontal, 20)
                    }

                    // Summary Card
                    VStack(spacing: 0) {
                        SummaryRow(
                            icon: "square.grid.2x2",
                            title: "Space Type",
                            value: builder.selectedImageType?.label ?? "Not selected"
                        )

                        Divider()
                            .padding(.leading, 52)

                        SummaryRow(
                            icon: "paintbrush",
                            title: "Style",
                            value: builder.selectedStyle?.name ?? "Not selected"
                        )

                        Divider()
                            .padding(.leading, 52)

                        SummaryRow(
                            icon: "paintpalette",
                            title: "Colors",
                            value: builder.selectedPalette?.name ?? "Auto"
                        )

                        // Perspective (for floor plans only)
                        if let type = builder.selectedImageType,
                           type.value.contains("floor_plan") {
                            Divider()
                                .padding(.leading, 52)

                            SummaryRow(
                                icon: "camera.metering.center.weighted",
                                title: "Perspective",
                                value: "Custom angle"
                            )
                        }
                    }
                    .padding(.vertical, 8)
                    .background(Color(UIColor.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .padding(.horizontal, 20)
                }
                .padding(.vertical, 20)
            }

                // Bottom Bar
                VStack(spacing: 12) {
                    // Error Message
                    if let error = builder.errorMessage {
                        Text(error)
                            .font(.system(size: 14))
                            .foregroundColor(.red)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 20)
                    }

                    Divider()

                    GlassButton(title: "Generate Design", icon: "sparkles") {
                        builder.submitJob()
                    }
                    .disabled(builder.isProcessing)
                    .opacity(builder.isProcessing ? 0.6 : 1.0)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)
                }
                .background(Color(UIColor.systemGroupedBackground))
            }

            // Processing Overlay
            if builder.isProcessing {
                ProcessingOverlay(status: builder.processingStatus)
            }
        }
    }
}

// MARK: - Processing Overlay
struct ProcessingOverlay: View {
    let status: ProcessingStatus

    var body: some View {
        ZStack {
            // Dimmed background
            Color.black.opacity(0.5)
                .ignoresSafeArea()

            // Card
            VStack(spacing: 20) {
                // Animated indicator
                ProgressView()
                    .scaleEffect(1.5)
                    .tint(.white)

                // Status text
                Text(status.rawValue)
                    .font(.system(size: 17, weight: .medium))
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)

                // Substatus
                Text("This may take a moment")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.7))
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .environment(\.colorScheme, .dark)
            )
            .shadow(color: .black.opacity(0.3), radius: 20, y: 10)
        }
        .animation(.easeInOut(duration: 0.2), value: status)
    }
}

// MARK: - Summary Row
struct SummaryRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundStyle(.secondary)
                .frame(width: 28)

            Text(title)
                .font(.system(size: 15))
                .foregroundStyle(.secondary)

            Spacer()

            Text(value)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
    }
}
