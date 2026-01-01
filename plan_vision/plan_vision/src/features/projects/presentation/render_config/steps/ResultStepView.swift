//
//  ResultStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI
import Photos

enum ResultViewMode: String, CaseIterable {
    case slider = "Compare"
    case original = "Original"
    case result = "Result"
}

struct ResultStepView: View {
    @ObservedObject var builder: RenderConfigBuilder

    @State private var viewMode: ResultViewMode = .slider
    @State private var sliderValue: Double = 0.5

    @State private var showModifySheet = false

    @State private var isSaving = false
    @State private var showSaveSuccess = false
    @State private var saveErrorMessage: String?

    var body: some View {
        VStack(spacing: 0) {
            // View Mode Picker
            Picker("View Mode", selection: $viewMode.animation()) {
                ForEach(ResultViewMode.allCases, id: \.self) { mode in
                    Text(mode.rawValue).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)

            // Main Image Area
            GeometryReader { geo in
                mainImageArea(geo: geo)
            }

            // Bottom Controls
            bottomControls
        }
        .background(Color(UIColor.systemBackground))
        .sheet(isPresented: $showModifySheet) {
            ModifySheetView(builder: builder)
        }
        .alert("Save Failed", isPresented: Binding(
            get: { saveErrorMessage != nil },
            set: { _ in saveErrorMessage = nil }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(saveErrorMessage ?? "Unknown error")
        }
    }

    // MARK: - Bottom Controls
    private var bottomControls: some View {
        VStack(spacing: 16) {
            // History Strip
            if !builder.generationHistory.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 12) {
                        // New Generation Button
                        Button {
                            showModifySheet = true
                        } label: {
                            VStack(spacing: 4) {
                                ZStack {
                                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                                        .fill(Color(UIColor.tertiarySystemFill))
                                        .frame(width: 56, height: 56)

                                    Image(systemName: "plus")
                                        .font(.system(size: 20, weight: .medium))
                                        .foregroundStyle(.secondary)
                                }

                                Text("Refine")
                                    .font(.system(size: 11))
                                    .foregroundStyle(.secondary)
                            }
                        }

                        // History Thumbnails
                        ForEach(builder.generationHistory) { gen in
                            HistoryThumbnail(
                                generation: gen,
                                isSelected: builder.selectedGeneration?.id == gen.id
                            ) {
                                Haptics.selection()
                                withAnimation {
                                    builder.selectedGeneration = gen
                                }
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                }
                .frame(height: 80)
            }

            Divider()

            // Save Button
            Button {
                if let urlStr = builder.selectedGeneration?.outputImageUrl,
                   let url = URL(string: urlStr) {
                    downloadAndSave(url: url)
                }
            } label: {
                HStack(spacing: 8) {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    } else if showSaveSuccess {
                        Image(systemName: "checkmark")
                        Text("Saved to Photos")
                    } else {
                        Image(systemName: "square.and.arrow.down")
                        Text("Save to Photos")
                    }
                }
                .font(.system(size: 17, weight: .semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(showSaveSuccess ? Color.green : Color.accentColor)
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .disabled(isSaving || showSaveSuccess || builder.selectedGeneration?.outputImageUrl == nil)
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        }
        .padding(.top, 16)
        .background(Color(UIColor.systemGroupedBackground))
    }

    // MARK: - Main Image Area
    @ViewBuilder
    private func mainImageArea(geo: GeometryProxy) -> some View {
        if let currentGen = builder.selectedGeneration,
           let outputUrlString = currentGen.outputImageUrl,
           let outputUrl = URL(string: outputUrlString),
           let originalImage = builder.selectedImage {

            ZStack {
                // Original Image
                Image(uiImage: originalImage)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: geo.size.width, height: geo.size.height)
                    .opacity(viewMode == .result ? 0 : 1)

                // Generated Image
                AsyncImage(url: outputUrl) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fit)
                    } else if phase.error != nil {
                        Color.red.opacity(0.2)
                            .overlay(
                                Text("Failed to load")
                                    .foregroundStyle(.secondary)
                            )
                    } else {
                        ProgressView()
                    }
                }
                .frame(width: geo.size.width, height: geo.size.height)
                .mask(
                    HStack(spacing: 0) {
                        Rectangle()
                            .frame(
                                width: viewMode == .slider ? geo.size.width * sliderValue :
                                       viewMode == .result ? geo.size.width : 0
                            )
                        Spacer(minLength: 0)
                    }
                )
                .opacity(viewMode == .original ? 0 : 1)

                // Slider Handle
                if viewMode == .slider {
                    SliderHandle(height: geo.size.height)
                        .position(x: geo.size.width * sliderValue, y: geo.size.height / 2)
                }
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { value in
                        guard viewMode == .slider else { return }
                        let percentage = value.location.x / geo.size.width
                        sliderValue = min(max(percentage, 0), 1)
                    }
            )
        } else {
            VStack(spacing: 12) {
                ProgressView()
                    .scaleEffect(1.2)
                Text("Loading result...")
                    .font(.system(size: 15))
                    .foregroundStyle(.secondary)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }

    // MARK: - Save Logic
    private func downloadAndSave(url: URL) {
        isSaving = true
        Task {
            do {
                let (data, _) = try await URLSession.shared.data(from: url)
                guard let image = UIImage(data: data) else {
                    throw NSError(domain: "ImageError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Invalid image data"])
                }
                let saver = ImageSaver()
                saver.onSuccess = {
                    isSaving = false
                    withAnimation { showSaveSuccess = true }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                        withAnimation { showSaveSuccess = false }
                    }
                }
                saver.onError = { error in
                    isSaving = false
                    saveErrorMessage = error.localizedDescription
                }
                saver.writeToPhotoAlbum(image: image)
            } catch {
                isSaving = false
                saveErrorMessage = error.localizedDescription
            }
        }
    }
}

// MARK: - Slider Handle
struct SliderHandle: View {
    let height: CGFloat

    var body: some View {
        ZStack {
            Rectangle()
                .fill(.white)
                .frame(width: 2, height: height)
                .shadow(color: .black.opacity(0.3), radius: 2)

            Circle()
                .fill(.white)
                .frame(width: 32, height: 32)
                .shadow(color: .black.opacity(0.2), radius: 4, y: 2)
                .overlay(
                    Image(systemName: "chevron.left.chevron.right")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.black.opacity(0.6))
                )
        }
    }
}

// MARK: - History Thumbnail
struct HistoryThumbnail: View {
    let generation: GenerationStatusDTO
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            AsyncImage(url: URL(string: generation.outputImageUrl ?? "")) { phase in
                if let image = phase.image {
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                } else if generation.status == "failed" {
                    Color.red.opacity(0.2)
                        .overlay(
                            Image(systemName: "exclamationmark.triangle")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        )
                } else {
                    Color(UIColor.tertiarySystemFill)
                        .overlay(ProgressView().scaleEffect(0.7))
                }
            }
            .frame(width: 56, height: 56)
            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 3)
            )
        }
    }
}
