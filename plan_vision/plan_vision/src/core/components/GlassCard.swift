//
//  GlassCard.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import SwiftUI

struct GlassCard<Content: View>: View {
    let content: Content
    
    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }
    
    var body: some View {
        content
            .padding()
            .background(.ultraThinMaterial)
            .cornerRadius(DesignSystem.Spacing.cornerRadiusMedium)
            .overlay(
                RoundedRectangle(cornerRadius: DesignSystem.Spacing.cornerRadiusMedium)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
    }
}

#Preview {
    ZStack {
        Color.purple.ignoresSafeArea()
        GlassCard {
            VStack(alignment: .leading) {
                Text("Project Alpha")
                    .font(.headline)
                Text("Last edited 2 hours ago")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
    }
}
