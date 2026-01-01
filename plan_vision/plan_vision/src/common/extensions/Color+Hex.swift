//
//  Color+Hex.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import SwiftUI

extension Color {
    init(hex: String) {
        // 1. Clean the string
        let cleaned = hex.trimmingCharacters(in: .whitespacesAndNewlines)
                         .replacingOccurrences(of: "#", with: "")
                         .uppercased()
        
        // 2. Check if it's a Named Color (Fallback for non-hex values)
        if let namedHex = ColorNameMap[cleaned] ?? ColorNameMap[hex] {
            self.init(hex: namedHex)
            return
        }

        // 3. Parse Hex
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)
        
        let a, r, g, b: UInt64
        switch cleaned.count {
        case 3: // RGB (12-bit) -> F00
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit) -> FF0000
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit) -> FFFF0000
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            // If all else fails, return a placeholder gray so it's visible (debugging)
            (a, r, g, b) = (255, 200, 200, 200)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// Mapping common design names to Hex Codes
private let ColorNameMap: [String: String] = [
    "WHITE": "FFFFFF",
    "OFF-WHITE": "F8F8F8",
    "CREAM": "FFFDD0",
    "BEIGE": "F5F5DC",
    "SAND": "C2B280",
    "TAUPE": "483C32",
    "BROWN": "A52A2A",
    "EARTH": "A0522D",
    "BLUE": "0000FF",
    "NAVY": "000080",
    "SKY": "87CEEB",
    "TEAL": "008080",
    "GREEN": "008000",
    "SAGE": "BCB88A",
    "FOREST": "228B22",
    "OLIVE": "808000",
    "YELLOW": "FFFF00",
    "GOLD": "FFD700",
    "ORANGE": "FFA500",
    "TERRACOTTA": "E2725B",
    "RED": "FF0000",
    "BURGUNDY": "800020",
    "PINK": "FFC0CB",
    "BLUSH": "DE5D83",
    "PURPLE": "800080",
    "LAVENDER": "E6E6FA",
    "GRAY": "808080",
    "GREY": "808080",
    "CHARCOAL": "36454F",
    "BLACK": "000000",
    "DARK": "1A1A1A",
    "LIGHT": "F0F0F0",
    "NEUTRAL": "E5E4E2"
]
