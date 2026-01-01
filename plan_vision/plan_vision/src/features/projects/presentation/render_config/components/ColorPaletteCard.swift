//
//  ColorPaletteCard.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct ColorPaletteCard: View {
    let palette: Palette
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 0) {
                // --- Left: Color Swatches ---
                GeometryReader { geo in
                    VStack(spacing: 0) {
                        // Top Half: Primary Color
                        palette.primary.color
                            .frame(height: geo.size.height * 0.5)
                        
                        // Bottom Half: Split Secondary / Neutral
                        HStack(spacing: 0) {
                            palette.secondary.color
                            palette.neutral.color
                        }
                        .frame(height: geo.size.height * 0.5)
                    }
                }
                .frame(width: 120) // Fixed width for color block
                
                // --- Right: Content ---
                VStack(alignment: .leading, spacing: 8) {
                    // Tags
                    HStack(spacing: 6) {
                        TagView(text: palette.mood.uppercased())
                        TagView(text: palette.type.uppercased())
                    }
                    
                    // Title
                    Text(palette.name)
                        .font(.system(.headline, design: .rounded))
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    // Description
                    Text(palette.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .lineLimit(3)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    Spacer(minLength: 0)
                }
                .padding(16)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(UIColor.systemBackground))
            }
            .frame(height: 160) // Fixed Card Height
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            // Selection Border
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.accentColor : Color.gray.opacity(0.2), lineWidth: isSelected ? 3 : 1)
            )
            // Shadow
            .shadow(color: Color.black.opacity(0.08), radius: 8, x: 0, y: 4)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// Helper: Tag Pill
struct TagView: View {
    let text: String
    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold, design: .rounded))
            .foregroundColor(.secondary)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Color.gray.opacity(0.15))
            .clipShape(Capsule())
    }
}
