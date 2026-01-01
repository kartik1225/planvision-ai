//
//  HomeView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var sessionManager: SessionManager
    @StateObject private var viewModel = HomeViewModel()
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    // Track which template is selected to trigger navigation
    @State private var selectedTemplate: ProjectTemplate?
    @State private var showStartFromScratch = false

    // Dynamic columns based on orientation/size class
    private var columns: [GridItem] {
        if horizontalSizeClass == .compact {
            // Portrait iPhone: Single column
            return [GridItem(.flexible(), spacing: 16)]
        } else {
            // Landscape or iPad: Multiple columns
            return [
                GridItem(.adaptive(minimum: 320, maximum: 400), spacing: 20)
            ]
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 0) {
                    // Hero Section
                    heroSection
                        .padding(.bottom, 8)

                    // Content
                    if viewModel.isLoading {
                        loadingView
                    } else if let error = viewModel.errorMessage {
                        errorView(error)
                    } else {
                        templatesSection
                    }
                }
            }
            .background(Color(UIColor.systemGroupedBackground))
            .refreshable {
                await refreshTemplates()
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("PlanVision")
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundStyle(.primary)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    NavigationLink(destination: ProfileWrapper(sessionManager: sessionManager)) {
                        Image(systemName: "person.fill")
                            .font(.system(size: 28))
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationDestination(item: $selectedTemplate) { template in
                RenderConfigWizardView(builder: RenderConfigBuilder(template: template))
            }
            .navigationDestination(isPresented: $showStartFromScratch) {
                RenderConfigWizardView(builder: RenderConfigBuilder())
            }
        }
        .onAppear {
            if viewModel.templates.isEmpty {
                viewModel.loadTemplates()
            }
        }
    }

    // MARK: - Hero Section
    private var heroSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Welcome Back")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.secondary)

            Text("What would you like\nto transform today?")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(.primary)
                .lineSpacing(4)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
        .padding(.top, 16)
        .padding(.bottom, 20)
    }

    // MARK: - Loading View
    private var loadingView: some View {
        VStack(spacing: 16) {
            ProgressView()
                .scaleEffect(1.2)
                .tint(.secondary)

            Text("Loading templates...")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    // MARK: - Error View
    private func errorView(_ error: String) -> some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.orange.opacity(0.15))
                    .frame(width: 72, height: 72)

                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 32))
                    .foregroundStyle(.orange)
            }

            VStack(spacing: 8) {
                Text("Something went wrong")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundStyle(.primary)

                Text(error)
                    .font(.system(size: 14))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }

            Button {
                Haptics.selection()
                viewModel.loadTemplates()
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.clockwise")
                        .font(.system(size: 14, weight: .semibold))
                    Text("Try Again")
                        .font(.system(size: 15, weight: .semibold))
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 24)
                .padding(.vertical, 12)
                .background(
                    Capsule()
                        .fill(Color.accentColor)
                )
            }
            .buttonStyle(.plain)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 60)
    }

    // MARK: - Templates Section
    private var templatesSection: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Start from Scratch Card
            startFromScratchCard
                .padding(.horizontal, 20)

            // Templates Section
            VStack(alignment: .leading, spacing: 16) {
                // Section Header
                HStack {
                    Text("Or choose a template")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundStyle(.primary)

                    Spacer()

                    Text("\(viewModel.templates.count) available")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal, 20)

                // Template Grid
                LazyVGrid(columns: columns, spacing: 16) {
                    ForEach(viewModel.templates) { template in
                        Button {
                            Haptics.selection()
                            selectedTemplate = template
                        } label: {
                            TemplateCardView(template: template)
                        }
                        .buttonStyle(TemplateButtonStyle())
                    }
                }
                .padding(.horizontal, 20)
            }
            .padding(.bottom, 32)
        }
    }

    // MARK: - Start from Scratch Card
    private var startFromScratchCard: some View {
        Button {
            Haptics.selection()
            showStartFromScratch = true
        } label: {
            HStack(spacing: 16) {
                // Icon
                ZStack {
                    Circle()
                        .fill(Color.accentColor)
                        .frame(width: 56, height: 56)

                    Image(systemName: "plus")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(.white)
                }

                // Text
                VStack(alignment: .leading, spacing: 4) {
                    Text("Start from Scratch")
                        .font(.system(size: 17, weight: .semibold))
                        .foregroundStyle(.primary)

                    Text("Upload your own image and customize")
                        .font(.system(size: 14))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                // Arrow
                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(16)
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .shadow(color: .black.opacity(0.05), radius: 8, x: 0, y: 2)
        }
        .buttonStyle(TemplateButtonStyle())
    }

    // MARK: - Refresh
    private func refreshTemplates() async {
        viewModel.loadTemplates()
        // Add a small delay for the refresh control feel
        try? await Task.sleep(nanoseconds: 500_000_000)
    }
}

// MARK: - Template Button Style
struct TemplateButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1.0)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
    }
}

// Helper: Wrapper to allow passing EnvironmentObject safely into ProfileView
struct ProfileWrapper: View {
    @ObservedObject var sessionManager: SessionManager

    var body: some View {
        if let user = sessionManager.currentUser {
            ProfileView(user: user)
        } else {
            EmptyView()
        }
    }
}

#Preview {
    HomeView()
        .environmentObject(SessionManager())
}
