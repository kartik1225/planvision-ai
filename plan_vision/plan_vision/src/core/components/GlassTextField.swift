//
//  GlassTextField.swift
//  plan_vision
//
//  Created by PlanVision AI on 2025-11-23.
//

import SwiftUI

struct GlassTextField: View {
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var icon: String? = nil
    
    @FocusState private var isFocused: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            if let icon = icon {
                Image(systemName: icon)
                    .foregroundColor(isFocused ? .white : .secondary)
                    .font(.system(size: 18))
            }
            
            if isSecure {
                SecureField(placeholder, text: $text)
                    .focused($isFocused)
                    .textFieldStyle(.plain)
            } else {
                TextField(placeholder, text: $text)
                    .focused($isFocused)
                    .textFieldStyle(.plain)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(DesignSystem.Spacing.cornerRadiusSmall)
        .overlay(
            RoundedRectangle(cornerRadius: DesignSystem.Spacing.cornerRadiusSmall)
                .stroke(
                    isFocused ? Color.white.opacity(0.6) : Color.white.opacity(0.1),
                    lineWidth: 1
                )
        )
        .animation(.easeInOut(duration: 0.2), value: isFocused)
    }
}

#Preview {
    ZStack {
        Color.blue.ignoresSafeArea()
        VStack {
            GlassTextField(placeholder: "Email", text: .constant(""), icon: "envelope")
            GlassTextField(placeholder: "Password", text: .constant(""), isSecure: true, icon: "lock")
        }
        .padding()
    }
}
