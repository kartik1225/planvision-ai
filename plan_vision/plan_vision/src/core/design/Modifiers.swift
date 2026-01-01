//
//  Modifiers.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import SwiftUI

// MARK: - Card Modifier
struct CardModifier: ViewModifier {
    var cornerRadius: CGFloat
    var padding: CGFloat

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .shadow(color: DesignSystem.Colors.shadow, radius: 8, x: 0, y: 2)
    }
}

// MARK: - Glass Card Modifier (subtle)
struct GlassCardModifier: ViewModifier {
    var cornerRadius: CGFloat
    var padding: CGFloat

    func body(content: Content) -> some View {
        content
            .padding(padding)
            .background(.ultraThinMaterial)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color(UIColor.separator).opacity(0.5), lineWidth: 0.5)
            )
    }
}

// MARK: - View Extensions
extension View {
    func cardStyle(cornerRadius: CGFloat = DesignSystem.Spacing.cornerRadiusMedium, padding: CGFloat = DesignSystem.Spacing.medium) -> some View {
        self.modifier(CardModifier(cornerRadius: cornerRadius, padding: padding))
    }

    func glassCard(cornerRadius: CGFloat = DesignSystem.Spacing.cornerRadiusMedium, padding: CGFloat = DesignSystem.Spacing.medium) -> some View {
        self.modifier(GlassCardModifier(cornerRadius: cornerRadius, padding: padding))
    }

    // Legacy support - maps to glassCard
    func liquidGlass(cornerRadius: CGFloat = DesignSystem.Spacing.cornerRadiusMedium, padding: CGFloat = DesignSystem.Spacing.medium) -> some View {
        self.modifier(GlassCardModifier(cornerRadius: cornerRadius, padding: padding))
    }
}
