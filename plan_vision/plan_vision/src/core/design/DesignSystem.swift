//
//  DesignSystem.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import SwiftUI

struct DesignSystem {

    // MARK: - Colors (System Colors Only)
    struct Colors {
        // Primary - Uses system accent color
        static let primary = Color.accentColor
        static let secondary = Color.secondary

        // Text
        static let textPrimary = Color.primary
        static let textSecondary = Color.secondary
        static let textTertiary = Color(UIColor.tertiaryLabel)

        // Backgrounds
        static let background = Color(UIColor.systemBackground)
        static let secondaryBackground = Color(UIColor.secondarySystemBackground)
        static let groupedBackground = Color(UIColor.systemGroupedBackground)
        static let secondaryGroupedBackground = Color(UIColor.secondarySystemGroupedBackground)

        // Semantic Colors
        static let success = Color.green
        static let warning = Color.orange
        static let error = Color.red

        // Surface colors for cards
        static let cardBackground = Color(UIColor.secondarySystemGroupedBackground)
        static let cardBorder = Color(UIColor.separator)

        // Shadows
        static let shadow = Color.black.opacity(0.08)
    }

    // MARK: - Typography
    struct Typography {
        static func titleLarge() -> Font {
            .system(size: 28, weight: .bold, design: .rounded)
        }

        static func titleMedium() -> Font {
            .system(size: 22, weight: .semibold, design: .rounded)
        }

        static func headline() -> Font {
            .system(size: 17, weight: .semibold)
        }

        static func body() -> Font {
            .system(size: 17, weight: .regular)
        }

        static func callout() -> Font {
            .system(size: 16, weight: .regular)
        }

        static func subheadline() -> Font {
            .system(size: 15, weight: .regular)
        }

        static func footnote() -> Font {
            .system(size: 13, weight: .regular)
        }

        static func caption() -> Font {
            .system(size: 12, weight: .regular)
        }
    }

    // MARK: - Spacing & Layout
    struct Spacing {
        static let xs: CGFloat = 4
        static let small: CGFloat = 8
        static let medium: CGFloat = 16
        static let large: CGFloat = 24
        static let xLarge: CGFloat = 32

        static let cornerRadiusSmall: CGFloat = 8
        static let cornerRadiusMedium: CGFloat = 12
        static let cornerRadiusLarge: CGFloat = 16
        static let cornerRadiusXL: CGFloat = 20
    }
}
