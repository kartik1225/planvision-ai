//
//  Haptics.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import UIKit

struct Haptics {
    static func impact(_ style: UIImpactFeedbackGenerator.FeedbackStyle) {
        let generator = UIImpactFeedbackGenerator(style: style)
        generator.impactOccurred()
    }

    static func notification(_ type: UINotificationFeedbackGenerator.FeedbackType) {
        let generator = UINotificationFeedbackGenerator()
        generator.notificationOccurred(type)
    }

    static func selection() {
        let generator = UISelectionFeedbackGenerator()
        generator.selectionChanged()
    }

    // Convenience methods
    static func light() {
        impact(.light)
    }

    static func medium() {
        impact(.medium)
    }

    static func heavy() {
        impact(.heavy)
    }
}
