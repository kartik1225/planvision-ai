//
//  RenderConfigWizardView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct RenderConfigWizardView: View {
    @StateObject var builder: RenderConfigBuilder
    @Environment(\.dismiss) var dismiss

    // Track transition direction
    @State private var transitionEdge: Edge = .trailing

    // Step configuration
    private var steps: [WizardStep] {
        var allSteps: [WizardStep] = [.inputImage, .imageTypeSelection]

        // Add interactive map step for floor plans
        if let type = builder.selectedImageType,
           (type.value == "floor_plan_2d" || type.value == "floor_plan_3d") {
            allSteps.append(.interactiveMap)
        }

        allSteps.append(contentsOf: [.styleSelection, .colorSelection, .review])
        return allSteps
    }

    private var currentStepIndex: Int {
        steps.firstIndex(of: builder.currentStep) ?? 0
    }

    var body: some View {
        VStack(spacing: 0) {
            // Step Progress Indicator
            StepProgressView(
                currentStep: currentStepIndex,
                totalSteps: steps.count,
                stepTitle: stepTitle
            )
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 16)

            // Content Area
            ZStack {
                switch builder.currentStep {
                case .inputImage:
                    InputImageStepView(builder: builder)
                        .transition(slideTransition)

                case .imageTypeSelection:
                    ImageTypeStepView(builder: builder)
                        .transition(slideTransition)

                case .interactiveMap:
                    InteractiveMapStepView(builder: builder)
                        .transition(slideTransition)

                case .styleSelection:
                    StyleSelectionStepView(builder: builder)
                        .transition(slideTransition)

                case .colorSelection:
                    ColorSelectionStepView(builder: builder)
                        .transition(slideTransition)

                case .review:
                    ReviewStepView(builder: builder)
                        .transition(slideTransition)
                }
            }
            .id(builder.currentStep)
        }
        .background(Color(UIColor.systemGroupedBackground))
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button {
                    handleBack()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 16, weight: .semibold))
                        Text("Back")
                            .font(.system(size: 17))
                    }
                    .foregroundStyle(.primary)
                }
                .disabled(builder.isPolling)
            }
        }
        .onChange(of: builder.currentStep) { oldValue, newValue in
            if transitionEdge == .leading {
                DispatchQueue.main.async {
                    transitionEdge = .trailing
                }
            }
        }
        .animation(.spring(response: 0.35, dampingFraction: 0.85), value: builder.currentStep)
        // Polling Overlay
        .overlay {
            if builder.isPolling {
                ZStack {
                    Color.black.opacity(0.5)
                        .ignoresSafeArea()

                    VStack(spacing: 20) {
                        ProgressView()
                            .scaleEffect(1.5)
                            .tint(.white)

                        Text("Creating your design...")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundColor(.white)

                        Text("This may take a moment")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    .padding(32)
                    .background(.ultraThinMaterial)
                    .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
                }
                .transition(.opacity)
            }
        }
        // Show Result when ready
        .fullScreenCover(item: $builder.generationResult) { result in
            NavigationStack {
                ResultStepView(builder: builder)
                    .toolbar {
                        ToolbarItem(placement: .topBarLeading) {
                            Button("Done") {
                                builder.generationResult = nil
                                dismiss()
                            }
                            .font(.system(size: 17, weight: .semibold))
                        }
                    }
            }
        }
    }

    // Smart Back Logic
    private func handleBack() {
        if builder.currentStep == .inputImage {
            dismiss()
        } else {
            transitionEdge = .leading
            withAnimation {
                builder.previousStep()
            }
        }
    }

    // Dynamic Transition based on direction
    var slideTransition: AnyTransition {
        .asymmetric(
            insertion: .move(edge: transitionEdge),
            removal: .move(edge: transitionEdge == .trailing ? .leading : .trailing)
        )
    }

    var stepTitle: String {
        switch builder.currentStep {
        case .inputImage: return "Upload Image"
        case .imageTypeSelection: return "Space Type"
        case .interactiveMap: return "Perspective"
        case .styleSelection: return "Style"
        case .colorSelection: return "Colors"
        case .review: return "Review"
        }
    }
}

// MARK: - Step Progress View
struct StepProgressView: View {
    let currentStep: Int
    let totalSteps: Int
    let stepTitle: String

    var body: some View {
        VStack(spacing: 12) {
            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    // Background track
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color(UIColor.systemFill))
                        .frame(height: 4)

                    // Progress fill
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.accentColor)
                        .frame(width: progressWidth(for: geo.size.width), height: 4)
                        .animation(.spring(response: 0.4, dampingFraction: 0.8), value: currentStep)
                }
            }
            .frame(height: 4)

            // Step info
            HStack {
                Text(stepTitle)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.primary)

                Spacer()

                Text("Step \(currentStep + 1) of \(totalSteps)")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
            }
        }
    }

    private func progressWidth(for totalWidth: CGFloat) -> CGFloat {
        let progress = CGFloat(currentStep + 1) / CGFloat(totalSteps)
        return totalWidth * progress
    }
}
