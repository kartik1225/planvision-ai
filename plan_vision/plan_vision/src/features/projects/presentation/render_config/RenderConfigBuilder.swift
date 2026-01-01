//
//  RenderConfigBuilder.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation
import SwiftUI
import Combine

enum WizardStep {
    case inputImage
    case imageTypeSelection
    case interactiveMap
    case styleSelection
    case colorSelection
    case review
}

enum ProcessingStatus: String {
    case idle = ""
    case uploadingImage = "Uploading image..."
    case creatingProject = "Setting up project..."
    case generatingDesign = "Generating design..."
}

@MainActor
class RenderConfigBuilder: ObservableObject {
    // --- Configuration State ---
    @Published var template: ProjectTemplate
    
    @Published var selectedImage: UIImage? // For UI Display
    @Published var selectedSampleUrl: URL?
    
    @Published var uploadedImageId: String?
    @Published var finalImageUrl: URL? // The final URL (either GCS upload or Sample URL)
    
    @Published var availableImageTypes: [ImageType] = []
    @Published var selectedImageType: ImageType?
    
    // --- UI State ---
    @Published var currentStep: WizardStep = .inputImage
    @Published var isProcessing = false // Spinner on buttons
    @Published var processingStatus: ProcessingStatus = .idle
    @Published var errorMessage: String?
    
    // --- Map State ---
    @Published var perspectiveX: Double = 0.5
    @Published var perspectiveY: Double = 0.5
    @Published var perspectiveAngle: Double = 0.0 // Degrees
    @Published var mapScale: CGFloat = 1.0
    @Published var mapOffset: CGSize = .zero
    @Published var mapContainerSize: CGSize = CGSize(width: 300, height: 300) // Container where user set perspective

    // --- Style & Color State ---
    @Published var availableStyles: [Style] = []
    @Published var selectedStyle: Style?

    /// Styles filtered by the selected image type
    var filteredStyles: [Style] {
        availableStyles.filter { $0.appliesTo(imageTypeId: selectedImageType?.id) }
    }

    @Published var colorCollections: [ColorCollection] = []
    @Published var selectedPalette: Palette?
    
    // --- Result & History State ---
    @Published var createdProjectId: String? // To reuse project for refinements
    @Published var generationResult: GenerationStatusDTO? // The currently displayed result
    @Published var generationHistory: [GenerationStatusDTO] = [] // List of all generations in this session
    @Published var selectedGeneration: GenerationStatusDTO? // Currently selected generation for viewing
    @Published var isPolling = false
    
    // --- Dependencies ---
    private let imageService: InputImageServiceable
    private let projectService: ProjectServiceable
    
    init(template: ProjectTemplate,
         imageService: InputImageServiceable = InputImageService(),
         projectService: ProjectServiceable = ProjectService()) {
        self.template = template
        self.imageService = imageService
        self.projectService = projectService
    }

    /// Convenience initializer for starting from scratch without a template
    convenience init(imageService: InputImageServiceable = InputImageService(),
                    projectService: ProjectServiceable = ProjectService()) {
        let blankTemplate = ProjectTemplate(
            id: "scratch",
            title: "Custom Project",
            description: "Started from scratch",
            thumbnailUrl: nil,
            originalThumbnailUrl: nil,
            generatedThumbnailUrl: nil,
            sampleImageUrls: [],
            defaultImageTypeId: ""
        )
        self.init(template: blankTemplate, imageService: imageService, projectService: projectService)
    }
    
    // MARK: - Image Handling

    /// Returns the final preview image - composited with perspective overlay if applicable
    var previewImage: UIImage? {
        guard let image = selectedImage else { return nil }

        // Show composite for floor plans where user set perspective
        if isFloorPlan && !didSkipPerspective {
            return compositePerspectiveOverlay(onto: image)
        }

        return image
    }

    // Case A: User picked from Gallery/Camera
    func selectLocalImage(_ image: UIImage) {
        self.selectedImage = image
        self.selectedSampleUrl = nil // Clear sample flag
        self.uploadedImageId = nil
        // Note: Image upload is deferred until submitJob()
    }

    // Case B: User picked a Sample
    func selectSampleImage(_ url: URL, displayImage: UIImage) {
        self.selectedImage = displayImage
        self.selectedSampleUrl = url // Set sample flag
        self.uploadedImageId = nil
        // Note: Image registration is deferred until submitJob()
    }

    /// Upload/register the image - called at generation time
    private func uploadImageIfNeeded() async -> String? {
        // Already uploaded? Return existing ID
        if let existingId = uploadedImageId {
            return existingId
        }

        let result: Result<InputImageDTO, NetworkError>

        if let sampleUrl = selectedSampleUrl {
            // Sample URL -> For floor plans with perspective, we need to download and composite
            if isFloorPlan && !didSkipPerspective {
                print("📥 Downloading sample for perspective overlay...")
                if let compositeImage = await downloadAndCompositePerspective(from: sampleUrl) {
                    print("📤 Uploading composite image...")
                    result = await imageService.uploadImage(compositeImage)
                } else {
                    // Fallback to registering URL if composite fails
                    print("🚀 Registering Sample URL (fallback)...")
                    result = await imageService.registerImage(url: sampleUrl.absoluteString)
                }
            } else {
                // Non-floor plan or skipped perspective -> Register URL directly
                print("🚀 Registering Sample URL...")
                result = await imageService.registerImage(url: sampleUrl.absoluteString)
            }
        } else if let localImage = selectedImage {
            // Local image -> Composite perspective if floor plan
            if isFloorPlan && !didSkipPerspective {
                let compositeImage = compositePerspectiveOverlay(onto: localImage)
                print("📤 Uploading composite image with perspective...")
                result = await imageService.uploadImage(compositeImage)
            } else {
                print("📤 Uploading Local Image...")
                result = await imageService.uploadImage(localImage)
            }
        } else {
            return nil
        }

        switch result {
        case .success(let dto):
            await MainActor.run {
                self.uploadedImageId = dto.id
                self.finalImageUrl = URL(string: dto.url)
            }
            print("✅ Image Ready. ID: \(dto.id)")
            return dto.id
        case .failure(let error):
            await MainActor.run {
                self.errorMessage = "Image upload failed: \(error.customMessage)"
            }
            return nil
        }
    }

    /// Download sample image and composite perspective overlay
    private func downloadAndCompositePerspective(from url: URL) async -> UIImage? {
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            guard let image = UIImage(data: data) else { return nil }
            return compositePerspectiveOverlay(onto: image)
        } catch {
            print("Failed to download sample for composite: \(error)")
            return nil
        }
    }

    /// Composite the VisionCone SwiftUI view onto the floor plan image
    private func compositePerspectiveOverlay(onto image: UIImage) -> UIImage {
        let imageSize = image.size

        // Scale factor for the vision cone based on image size
        let coneScaleFactor = min(imageSize.width, imageSize.height) / 300.0

        print("🎯 Compositing perspective overlay:")
        print("   Position: (\(perspectiveX), \(perspectiveY))")
        print("   Angle: \(perspectiveAngle)°")
        print("   Image size: \(imageSize)")
        print("   Container size: \(mapContainerSize)")
        print("   Map scale: \(mapScale)")
        print("   Map offset: \(mapOffset)")

        // Create a SwiftUI view that overlays the VisionCone on the image
        let overlayView = VisionConeOverlay(
            image: image,
            positionX: perspectiveX,
            positionY: perspectiveY,
            angle: perspectiveAngle,
            coneScale: coneScaleFactor,
            containerSize: mapContainerSize,
            mapScale: mapScale,
            mapOffset: mapOffset
        )

        // Render the SwiftUI view to UIImage
        let renderer = ImageRenderer(content: overlayView)
        renderer.scale = 1.0 // Use 1x scale to match image dimensions

        if let uiImage = renderer.uiImage {
            return uiImage
        }

        // Fallback: return original image if rendering fails
        return image
    }

    // MARK: - Data Loading

    /// Load styles with contextual thumbnails for the selected image type
    func loadStylesAndColors() {
        // 1. Load Local JSON
        self.colorCollections = ColorService.shared.loadCollections()

        // 2. Fetch API Styles (with imageTypeId for contextual thumbnails)
        loadStyles(for: selectedImageType?.id)
    }

    /// Reload styles when image type changes to get contextual thumbnails
    func loadStyles(for imageTypeId: String?) {
        Task {
            let service = HomeService()
            let result = await service.fetchStyles(imageTypeId: imageTypeId)
            if case .success(let styles) = result {
                await MainActor.run {
                    self.availableStyles = styles
                }
            }
        }
    }
    
    func loadImageTypes() {
        Task {
            let service = HomeService()
            let result = await service.fetchImageTypes()
            if case .success(let types) = result {
                await MainActor.run {
                    self.availableImageTypes = types
                    
                    // Auto-select based on template default if available
                    if let defaultType = types.first(where: { $0.id == template.defaultImageTypeId }) {
                        self.selectedImageType = defaultType
                    }
                }
            }
        }
    }
    
    // MARK: - Submission & Generation
    
    func submitJob() {
        guard selectedImage != nil,
              let typeId = selectedImageType?.id else {
            errorMessage = "Missing required data."
            return
        }

        isProcessing = true
        processingStatus = .uploadingImage

        Task {
            // 1. Upload image first (deferred until now)
            guard let imageId = await uploadImageIfNeeded() else {
                await MainActor.run {
                    isProcessing = false
                    processingStatus = .idle
                }
                return // Error already set in uploadImageIfNeeded
            }

            // 2. Create Project
            await MainActor.run {
                processingStatus = .creatingProject
            }

            let projectName = "\(template.title) \(Date().formatted(date: .abbreviated, time: .shortened))"
            let projectResult = await projectService.createProject(name: projectName)

            switch projectResult {
            case .failure(let error):
                await MainActor.run {
                    errorMessage = "Failed to create project: \(error.customMessage)"
                    isProcessing = false
                    processingStatus = .idle
                }
                return
            case .success(let project):
                print("✅ Project Created: \(project.id)")

                await MainActor.run {
                    self.createdProjectId = project.id
                    processingStatus = .generatingDesign
                }

                // 3. Create Config
                await createAndSubmitConfig(projectId: project.id, imageId: imageId, typeId: typeId, customInstructions: nil)
            }
        }
    }
    
    // Allows creating a NEW generation based on existing project data (Modify Flow)
    func refineJob(additionalInstructions: String) {
        guard let projectId = createdProjectId,
              let imageId = uploadedImageId,
              let typeId = selectedImageType?.id else {
            errorMessage = "Cannot refine: Missing project data."
            return
        }
        
        isProcessing = true // Shows spinner on Modify button if needed, or handle in UI
        
        Task {
            await createAndSubmitConfig(projectId: projectId, imageId: imageId, typeId: typeId, customInstructions: additionalInstructions)
        }
    }
    
    private func createAndSubmitConfig(projectId: String, imageId: String, typeId: String, customInstructions: String?) async {
        let isFloorPlan = selectedImageType?.value.contains("floor_plan") ?? false
        
        let configDTO = CreateRenderConfigDTO(
            projectId: projectId,
            inputImageId: imageId,
            imageTypeId: typeId,
            styleId: selectedStyle?.id,
            customInstructions: customInstructions,
            
            // Map Colors
            colorPrimaryHex: selectedPalette?.primary.hex,
            colorSecondaryHex: selectedPalette?.secondary.hex,
            colorNeutralHex: selectedPalette?.neutral.hex,
            
            // Map Perspective
            perspectiveAngle: isFloorPlan ? Int(perspectiveAngle) : nil,
            perspectiveX: isFloorPlan ? Int(perspectiveX * 100) : nil,
            perspectiveY: isFloorPlan ? Int(perspectiveY * 100) : nil
        )
        
        let configResult = await projectService.createRenderConfig(dto: configDTO)
        
        await MainActor.run {
            isProcessing = false
            switch configResult {
            case .success(let config):
                print("✅ Config Submitted: \(config.id)")
                self.startPolling(configId: config.id)
            case .failure(let error):
                errorMessage = "Failed to submit job: \(error.customMessage)"
            }
        }
    }
    
    func startPolling(configId: String) {
        isPolling = true

        Task {
            var attempts = 0
            while attempts < 30 { // Timeout after 60s (30 * 2s)
                try? await Task.sleep(nanoseconds: 2_000_000_000) // Sleep 2s

                let result = await projectService.getGenerationStatus(configId: configId)

                if case .success(let status) = result {
                    print("🔄 Polling Status: \(status.status)")

                    if status.status == "completed" {
                        await MainActor.run {
                            self.generationResult = status
                            self.generationHistory.insert(status, at: 0) // Add to history stack
                            self.selectedGeneration = status // Auto-select the new generation
                            self.isPolling = false
                            self.isProcessing = false
                            self.processingStatus = .idle
                        }
                        return
                    } else if status.status == "failed" {
                        await MainActor.run {
                            self.errorMessage = status.errorMessage ?? "Generation failed on server."
                            self.isPolling = false
                            self.isProcessing = false
                            self.processingStatus = .idle
                        }
                        return
                    }
                }
                attempts += 1
            }

            await MainActor.run {
                self.errorMessage = "Generation timed out. Please check My Projects later."
                self.isPolling = false
                self.isProcessing = false
                self.processingStatus = .idle
            }
        }
    }
    
    // MARK: - Navigation

    /// Check if current image type is a floor plan
    var isFloorPlan: Bool {
        guard let type = selectedImageType else { return false }
        return type.value == "floor_plan_2d" || type.value == "floor_plan_3d"
    }

    /// Track if user skipped perspective step (to show style selection)
    @Published var didSkipPerspective = false

    /// Skip perspective and go to style selection
    func skipPerspectiveToStyleSelection() {
        didSkipPerspective = true
        currentStep = .styleSelection
    }

    /// Auto-select the photorealistic style for floor plans
    func autoSelectFloorPlanStyle() {
        // Try to find "Realistic 3D (Orthographic)" or similar photorealistic style
        let photoStyle = availableStyles.first { style in
            style.name.lowercased().contains("realistic") &&
            (style.name.lowercased().contains("3d") || style.name.lowercased().contains("orthographic"))
        } ?? availableStyles.first { style in
            style.name.lowercased().contains("photorealistic")
        }

        if let style = photoStyle {
            selectedStyle = style
            print("📸 Auto-selected floor plan style: \(style.name)")
        } else if !availableStyles.isEmpty {
            // Fallback: just pick the first available style for floor plans
            if let firstFloorPlanStyle = filteredStyles.first {
                selectedStyle = firstFloorPlanStyle
                print("📸 Fallback: selected first floor plan style: \(firstFloorPlanStyle.name)")
            }
        }
    }

    func nextStep() {
        switch currentStep {
        case .inputImage:
            currentStep = .imageTypeSelection
        case .imageTypeSelection:
            if isFloorPlan {
                currentStep = .interactiveMap
            } else {
                currentStep = .styleSelection
            }
        case .interactiveMap:
            // User used perspective (Continue) - skip style selection
            didSkipPerspective = false
            autoSelectFloorPlanStyle()
            currentStep = .colorSelection
        case .styleSelection:
            currentStep = .colorSelection
        case .colorSelection:
            currentStep = .review
        case .review:
            break
        }
    }
    
    func previousStep() {
        switch currentStep {
        case .inputImage:
            break
        case .imageTypeSelection:
            currentStep = .inputImage
        case .interactiveMap:
            currentStep = .imageTypeSelection
        case .styleSelection:
            if isFloorPlan && didSkipPerspective {
                // Skipped perspective → go back to perspective step
                currentStep = .interactiveMap
            } else {
                // Non-floor plans → go back to image type
                currentStep = .imageTypeSelection
            }
        case .colorSelection:
            if isFloorPlan && !didSkipPerspective {
                // Used perspective (Continue) → go back to perspective
                currentStep = .interactiveMap
            } else {
                // Skipped perspective or non-floor plan → go back to style
                currentStep = .styleSelection
            }
        case .review:
            currentStep = .colorSelection
        }
    }
}
