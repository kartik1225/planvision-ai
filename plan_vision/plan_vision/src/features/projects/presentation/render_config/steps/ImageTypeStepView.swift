//
//  ImageTypeStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct ImageTypeStepView: View {
    @ObservedObject var builder: RenderConfigBuilder
    @State private var searchText = ""

    var filteredImageTypes: [ImageType] {
        if searchText.isEmpty {
            return builder.availableImageTypes
        }
        return builder.availableImageTypes.filter {
            $0.label.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            if builder.availableImageTypes.isEmpty {
                // Loading State
                Spacer()
                VStack(spacing: 12) {
                    ProgressView()
                        .scaleEffect(1.2)
                    Text("Loading categories...")
                        .font(.system(size: 15))
                        .foregroundStyle(.secondary)
                }
                Spacer()
            } else {
                VStack(spacing: 0) {
                    // Search Bar
                    HStack(spacing: 8) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 15))
                            .foregroundStyle(.secondary)

                        TextField("Search spaces...", text: $searchText)
                            .font(.system(size: 15))
                            .autocorrectionDisabled()

                        if !searchText.isEmpty {
                            Button {
                                searchText = ""
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 15))
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 10)
                    .background(Color(UIColor.tertiarySystemFill))
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    .padding(.horizontal, 20)
                    .padding(.top, 16)
                    .padding(.bottom, 8)

                    ScrollViewReader { proxy in
                        ScrollView {
                            VStack(alignment: .leading, spacing: 12) {
                                // Results count
                                Text(searchText.isEmpty ? "All spaces" : "\(filteredImageTypes.count) results")
                                    .font(.system(size: 13))
                                    .foregroundStyle(.secondary)
                                    .padding(.horizontal, 20)

                                // Compact list of space types
                                LazyVStack(spacing: 8) {
                                    ForEach(filteredImageTypes) { type in
                                        ImageTypeCard(
                                            type: type,
                                            isSelected: builder.selectedImageType?.id == type.id
                                        ) {
                                            Haptics.selection()
                                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                                builder.selectedImageType = type
                                            }
                                        }
                                        .id(type.id)
                                    }
                                }
                                .padding(.horizontal, 20)
                            }
                            .padding(.vertical, 8)
                        }
                        .onAppear {
                            // Auto-scroll to selected type (from template flow)
                            if let selectedId = builder.selectedImageType?.id {
                                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                                    withAnimation(.easeInOut(duration: 0.3)) {
                                        proxy.scrollTo(selectedId, anchor: .center)
                                    }
                                }
                            }
                        }
                    }
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
            if builder.availableImageTypes.isEmpty {
                builder.loadImageTypes()
            }
        }
    }

    var canProceed: Bool {
        builder.selectedImageType != nil
    }
}

// MARK: - Image Type Card (Compact)
struct ImageTypeCard: View {
    let type: ImageType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                // Icon
                ZStack {
                    Circle()
                        .fill(isSelected ? Color.accentColor : Color(UIColor.tertiarySystemFill))
                        .frame(width: 36, height: 36)

                    Image(systemName: iconFor(type.value))
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(isSelected ? .white : .secondary)
                }

                Text(type.label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(.primary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)

                Spacer(minLength: 0)

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                        .foregroundStyle(Color.accentColor)
                }
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(isSelected ? Color.accentColor : Color.clear, lineWidth: 1.5)
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }

    func iconFor(_ value: String) -> String {
        // Floor Plans & Sketches
        if value == "floor_plan_2d" { return "square.split.2x2" }
        if value == "floor_plan_3d" { return "cube" }
        if value == "sketch_drawing" { return "pencil.and.scribble" }

        // Interior - Living Spaces
        if value == "interior_living_room" { return "sofa.fill" }
        if value == "interior_bedroom" { return "bed.double.fill" }
        if value == "interior_dining_room" { return "fork.knife" }
        if value == "interior_kitchen" { return "cooktop.fill" }
        if value == "interior_bathroom" { return "shower.fill" }

        // Interior - Functional Spaces
        if value == "interior_office" { return "desktopcomputer" }
        if value == "interior_home_gym" { return "dumbbell.fill" }
        if value == "interior_media_room" { return "tv.fill" }
        if value == "interior_laundry_room" { return "washer.fill" }
        if value == "interior_walkin_closet" { return "tshirt.fill" }

        // Interior - Transition Spaces
        if value == "interior_entryway" { return "door.left.hand.open" }
        if value == "interior_hallway" { return "arrow.left.and.right" }
        if value == "interior_staircase" { return "stairs" }
        if value == "interior_empty" { return "square.dashed" }

        // Interior - Special Rooms
        if value == "interior_kids_room" { return "teddybear.fill" }
        if value == "interior_attic" { return "triangle.fill" }
        if value == "interior_game_room" { return "gamecontroller.fill" }
        if value == "interior_sunroom" { return "sun.max.fill" }

        // Exterior - Outdoor Spaces
        if value == "exterior_garden" { return "leaf.fill" }
        if value == "exterior_backyard" { return "tree.fill" }
        if value == "exterior_patio" { return "chair.lounge.fill" }
        if value == "exterior_balcony" { return "building.2.fill" }
        if value == "exterior_porch" { return "house.fill" }
        if value == "exterior_rooftop" { return "building.fill" }
        if value == "exterior_pool" { return "figure.pool.swim" }
        if value == "exterior_facade" { return "building.columns.fill" }

        // Commercial Spaces
        if value == "commercial_office" { return "briefcase.fill" }
        if value == "commercial_conference" { return "person.3.fill" }
        if value == "commercial_lobby" { return "person.and.background.dotted" }
        if value == "commercial_restaurant" { return "cup.and.saucer.fill" }
        if value == "commercial_retail" { return "bag.fill" }

        // Fallback for legacy/unknown
        if value.contains("floor_plan") { return "map.fill" }
        if value.contains("living") { return "sofa.fill" }
        if value.contains("kitchen") { return "cooktop.fill" }
        if value.contains("bedroom") { return "bed.double.fill" }
        if value.contains("bath") { return "shower.fill" }
        if value.contains("garden") { return "leaf.fill" }
        if value.contains("office") { return "desktopcomputer" }
        if value.contains("dining") { return "fork.knife" }

        return "square.grid.2x2.fill"
    }
}
