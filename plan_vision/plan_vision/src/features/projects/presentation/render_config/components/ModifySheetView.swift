//
//  ModifySheetView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct ModifySheetView: View {
    @ObservedObject var builder: RenderConfigBuilder
    @Environment(\.dismiss) var dismiss
    
    @State private var instructions: String = ""
    
    let suggestions = ["Make it brighter", "Add plants", "Darker wood", "Minimalist furniture", "Warm lighting"]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Describe Changes")
                .font(.headline)
                .padding(.top)
            
            // Text Editor
            TextField("e.g. Make the walls blue...", text: $instructions, axis: .vertical)
                .lineLimit(3...6)
                .padding()
                .background(Color(UIColor.secondarySystemBackground))
                .cornerRadius(12)
            
            // Suggestions
            ScrollView(.horizontal, showsIndicators: false) {
                HStack {
                    ForEach(suggestions, id: \.self) { text in
                        Button {
                            instructions = text
                        } label: {
                            Text(text)
                                .font(.caption)
                                .fontWeight(.medium)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.accentColor.opacity(0.1))
                                .foregroundColor(.accentColor)
                                .clipShape(Capsule())
                        }
                    }
                }
            }
            
            Spacer()
            
            // Submit
            Button(action: {
                dismiss() // Close sheet
                // Small delay to allow sheet to close before state change triggers animation
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    builder.refineJob(additionalInstructions: instructions)
                }
            }) {
                Text("Regenerate")
                    .bold()
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(instructions.isEmpty ? Color.gray.opacity(0.3) : Color.accentColor)
                    .foregroundColor(.white)
                    .cornerRadius(12)
            }
            .disabled(instructions.isEmpty)
        }
        .padding()
        .presentationDetents([.medium]) // Half sheet
    }
}
