//
//  GlassModifier.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import SwiftUI

struct GlassModifier: ViewModifier {
    var cornerRadius: CGFloat = 24
    
    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial) // The "Frosted" Glass effect
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)) // Apple-style smooth corners
            .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 10) // Soft depth shadow
            .overlay(
                // The "Light Catching" border
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [
                                .white.opacity(0.6), // Top-left is brighter
                                .white.opacity(0.1)  // Bottom-right fades out
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
    }
}

extension View {
    func glassStyle(cornerRadius: CGFloat = 24) -> some View {
        self.modifier(GlassModifier(cornerRadius: cornerRadius))
    }
}
