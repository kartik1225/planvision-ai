//
//  GlassButton.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import SwiftUI

struct GlassButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: {
            Haptics.impact(.medium)
            action()
        }) {
            HStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .semibold))
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.accentColor)
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: DesignSystem.Spacing.cornerRadiusMedium, style: .continuous))
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Secondary Button Style
struct SecondaryButton: View {
    let title: String
    let icon: String?
    let action: () -> Void

    init(title: String, icon: String? = nil, action: @escaping () -> Void) {
        self.title = title
        self.icon = icon
        self.action = action
    }

    var body: some View {
        Button(action: {
            Haptics.selection()
            action()
        }) {
            HStack(spacing: 8) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 15, weight: .medium))
                }
                Text(title)
                    .font(.system(size: 17, weight: .medium))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .foregroundStyle(.primary)
            .clipShape(RoundedRectangle(cornerRadius: DesignSystem.Spacing.cornerRadiusMedium, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: DesignSystem.Spacing.cornerRadiusMedium, style: .continuous)
                    .stroke(Color(UIColor.separator), lineWidth: 1)
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.7), value: configuration.isPressed)
            .opacity(configuration.isPressed ? 0.9 : 1.0)
    }
}

#Preview {
    VStack(spacing: 16) {
        GlassButton(title: "Continue", icon: "arrow.right") {}
        SecondaryButton(title: "Skip", icon: nil) {}
    }
    .padding()
    .background(Color(UIColor.systemGroupedBackground))
}
