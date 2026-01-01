//
//  InputImageStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

// Enum to use with fullScreenCover(item:) for proper source type capture
enum ImagePickerSource: Identifiable {
    case camera
    case photoLibrary

    var id: String {
        switch self {
        case .camera: return "camera"
        case .photoLibrary: return "photoLibrary"
        }
    }

    var uiSourceType: UIImagePickerController.SourceType {
        switch self {
        case .camera: return .camera
        case .photoLibrary: return .photoLibrary
        }
    }
}

struct InputImageStepView: View {
    @ObservedObject var builder: RenderConfigBuilder

    @State private var activePickerSource: ImagePickerSource?
    @State private var isLoadingSample = false
    @State private var selectedSampleURL: URL?

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(spacing: 24) {
                    // Main Image Area
                    imageSection
                        .padding(.horizontal, 20)

                    // Sample Images (if available)
                    if !builder.template.sampleImageUrls.isEmpty {
                        sampleImagesSection
                    }
                }
                .padding(.vertical, 20)
            }

            // Bottom Action Area
            bottomBar
        }
        .fullScreenCover(item: $activePickerSource) { source in
            ImagePickerWrapper(
                sourceType: source.uiSourceType,
                onImagePicked: { image in
                    withAnimation {
                        selectedSampleURL = nil
                    }
                    builder.selectLocalImage(image)
                },
                onDismiss: {
                    activePickerSource = nil
                }
            )
        }
    }

    // MARK: - Image Section
    private var imageSection: some View {
        Group {
            if let image = builder.selectedImage {
                // Image Selected State
                VStack(spacing: 16) {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .frame(maxWidth: .infinity)
                        .frame(maxHeight: 300)
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .background(Color(UIColor.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .shadow(color: .black.opacity(0.08), radius: 8, y: 4)

                    // Replace button
                    Menu {
                        if UIImagePickerController.isSourceTypeAvailable(.camera) {
                            Button {
                                activePickerSource = .camera
                            } label: {
                                Label("Take Photo", systemImage: "camera")
                            }
                        }

                        Button {
                            activePickerSource = .photoLibrary
                        } label: {
                            Label("Choose from Library", systemImage: "photo.on.rectangle")
                        }
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "arrow.triangle.2.circlepath")
                                .font(.system(size: 14, weight: .medium))
                            Text("Replace Image")
                                .font(.system(size: 15, weight: .medium))
                        }
                        .foregroundStyle(.secondary)
                    }
                }
            } else {
                // Empty State
                Menu {
                    if UIImagePickerController.isSourceTypeAvailable(.camera) {
                        Button {
                            activePickerSource = .camera
                        } label: {
                            Label("Take Photo", systemImage: "camera")
                        }
                    }

                    Button {
                        activePickerSource = .photoLibrary
                    } label: {
                        Label("Choose from Library", systemImage: "photo.on.rectangle")
                    }
                } label: {
                    VStack(spacing: 16) {
                        ZStack {
                            Circle()
                                .fill(Color(UIColor.tertiarySystemFill))
                                .frame(width: 80, height: 80)

                            Image(systemName: "photo.badge.plus")
                                .font(.system(size: 32))
                                .foregroundStyle(.secondary)
                        }

                        VStack(spacing: 4) {
                            Text("Add Photo")
                                .font(.system(size: 17, weight: .semibold))
                                .foregroundStyle(.primary)

                            Text("Tap to upload or take a photo")
                                .font(.system(size: 14))
                                .foregroundStyle(.secondary)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 240)
                    .background(Color(UIColor.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [8]))
                            .foregroundColor(Color(UIColor.separator))
                    )
                }
                .disabled(isLoadingSample)
            }
        }
    }

    // MARK: - Sample Images Section
    private var sampleImagesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Or try a sample")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(builder.template.sampleImageUrls, id: \.self) { url in
                        let isSelected = selectedSampleURL == url

                        Button {
                            downloadAndSelect(url: url)
                        } label: {
                            AsyncImage(url: url) { phase in
                                if let image = phase.image {
                                    image
                                        .resizable()
                                        .aspectRatio(contentMode: .fill)
                                } else if phase.error != nil {
                                    Color(UIColor.tertiarySystemFill)
                                        .overlay(
                                            Image(systemName: "photo")
                                                .foregroundStyle(.tertiary)
                                        )
                                } else {
                                    Color(UIColor.tertiarySystemFill)
                                        .overlay(ProgressView())
                                }
                            }
                            .frame(width: 100, height: 100)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 12, style: .continuous)
                                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 3)
                            )
                            .overlay(alignment: .topTrailing) {
                                if isSelected {
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 20))
                                        .foregroundStyle(.white, Color.accentColor)
                                        .offset(x: 6, y: -6)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                        .scaleEffect(isSelected ? 1.02 : 1.0)
                        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isSelected)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10) // Extra vertical padding for border & badge
            }
        }
    }

    // MARK: - Bottom Bar
    private var bottomBar: some View {
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

    var canProceed: Bool {
        builder.selectedImage != nil && !isLoadingSample
    }

    private func downloadAndSelect(url: URL) {
        guard selectedSampleURL != url else { return }

        isLoadingSample = true
        selectedSampleURL = url

        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                if let image = UIImage(data: data) {
                    await MainActor.run {
                        builder.selectSampleImage(url, displayImage: image)
                        isLoadingSample = false
                    }
                }
            } catch {
                print("Failed to download sample: \(error)")
                await MainActor.run {
                    isLoadingSample = false
                    selectedSampleURL = nil
                }
            }
        }
    }
}

// MARK: - Image Picker Wrapper
/// Wrapper to ensure source type is properly captured at presentation time
struct ImagePickerWrapper: UIViewControllerRepresentable {
    let sourceType: UIImagePickerController.SourceType
    let onImagePicked: (UIImage) -> Void
    let onDismiss: () -> Void

    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator

        // Use the requested source type if available
        if UIImagePickerController.isSourceTypeAvailable(sourceType) {
            picker.sourceType = sourceType
        } else {
            picker.sourceType = .photoLibrary
        }

        picker.allowsEditing = false
        return picker
    }

    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePickerWrapper

        init(_ parent: ImagePickerWrapper) {
            self.parent = parent
        }

        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.onImagePicked(image)
            }
            parent.onDismiss()
        }

        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.onDismiss()
        }
    }
}
