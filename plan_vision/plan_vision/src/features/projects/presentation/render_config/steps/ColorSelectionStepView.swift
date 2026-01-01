//
//  ColorSelectionStepView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct ColorSelectionStepView: View {
    @ObservedObject var builder: RenderConfigBuilder
    @State private var selectedFamilyId: String?

    var body: some View {
        VStack(spacing: 0) {
            // Color Family Selector
            colorFamilySelector
                .padding(.top, 8)

            // Palette List
            ScrollView {
                VStack(spacing: 16) {
                    // "No Preference" Option
                    noPreferenceCard
                        .padding(.horizontal, 20)
                        .padding(.top, 16)

                    // Palettes from selected family
                    if let family = builder.colorCollections.first(where: { $0.id == selectedFamilyId }) {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(family.category.uppercased())
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundStyle(.secondary)
                                .padding(.horizontal, 20)
                                .padding(.top, 8)

                            ForEach(family.palettes) { palette in
                                ColorPaletteCard(
                                    palette: palette,
                                    isSelected: builder.selectedPalette?.id == palette.id
                                ) {
                                    Haptics.selection()
                                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                        if builder.selectedPalette?.id == palette.id {
                                            builder.selectedPalette = nil
                                        } else {
                                            builder.selectedPalette = palette
                                        }
                                    }
                                }
                                .padding(.horizontal, 20)
                            }
                        }
                    }
                }
                .padding(.bottom, 100)
            }

            // Bottom Bar
            VStack(spacing: 0) {
                Divider()

                GlassButton(
                    title: builder.selectedPalette == nil ? "Skip Colors" : "Continue",
                    icon: "arrow.right"
                ) {
                    builder.nextStep()
                }
                .padding(20)
            }
            .background(Color(UIColor.systemGroupedBackground))
        }
        .onAppear {
            if selectedFamilyId == nil, let first = builder.colorCollections.first {
                selectedFamilyId = first.id
            }
        }
    }

    // MARK: - Color Family Selector
    private var colorFamilySelector: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Choose a color family")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(.secondary)
                .padding(.horizontal, 20)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(builder.colorCollections) { collection in
                        ColorFamilySwatch(
                            collection: collection,
                            isSelected: selectedFamilyId == collection.id
                        ) {
                            Haptics.selection()
                            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                selectedFamilyId = collection.id
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 8)
            }
        }
    }

    // MARK: - No Preference Card
    private var noPreferenceCard: some View {
        Button {
            Haptics.selection()
            builder.selectedPalette = nil
            builder.nextStep()
        } label: {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(Color(UIColor.tertiarySystemFill))
                        .frame(width: 44, height: 44)

                    Image(systemName: "wand.and.rays")
                        .font(.system(size: 18))
                        .foregroundStyle(.secondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Auto / No Preference")
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.primary)

                    Text("Let AI choose the best colors")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(.tertiary)
            }
            .padding(16)
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [6]))
                    .foregroundColor(Color(UIColor.separator))
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Color Family Swatch
struct ColorFamilySwatch: View {
    let collection: ColorCollection
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Circle()
                    .fill(Color(hex: collection.familyHex))
                    .frame(width: 52, height: 52)
                    .overlay(
                        Circle()
                            .stroke(isSelected ? Color.primary : Color.clear, lineWidth: 3)
                            .padding(-3)
                    )
                    .shadow(color: isSelected ? Color(hex: collection.familyHex).opacity(0.4) : .clear, radius: 6, y: 2)

                Text(collection.familyName)
                    .font(.system(size: 12, weight: isSelected ? .semibold : .medium))
                    .foregroundStyle(isSelected ? .primary : .secondary)
            }
        }
        .buttonStyle(.plain)
    }
}
