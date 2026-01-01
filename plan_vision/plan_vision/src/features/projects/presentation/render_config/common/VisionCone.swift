//
//  VisionCone.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

struct VisionCone: View {
    var body: some View {
        ZStack {
            // 1. The Field of View (Gradient Beam)
            VStack(spacing: 0) {
                LinearGradient(
                    colors: [
                        Color.accentColor.opacity(0.0), // Fades out at top
                        Color.accentColor.opacity(0.4)  // Stronger near user
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .frame(width: 100, height: 150)
                // Mask to make it a cone shape
                .mask(
                    GeometryReader { geo in
                        Path { path in
                            let w = geo.size.width
                            let h = geo.size.height
                            
                            path.move(to: CGPoint(x: w/2, y: h)) // Bottom center (User)
                            path.addLine(to: CGPoint(x: 0, y: 0))   // Top Left
                            path.addLine(to: CGPoint(x: w, y: 0))   // Top Right
                            path.closeSubpath()
                        }
                    }
                )
            }
            .offset(y: -75) // Shift up so pivot point is at the bottom
            
            // 2. The User "Puck" (Location Pin)
            Circle()
                .fill(Color.white)
                .frame(width: 24, height: 24)
                .shadow(radius: 4)
                .overlay(
                    Circle()
                        .fill(Color.accentColor)
                        .padding(4)
                )
                // Direction Arrow inside Puck
                .overlay(
                    Image(systemName: "arrow.up")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                )
        }
        .allowsHitTesting(false) // Let gestures pass through to the container
    }
}

#Preview {
    ZStack {
        Color.gray
        VisionCone()
    }
}
