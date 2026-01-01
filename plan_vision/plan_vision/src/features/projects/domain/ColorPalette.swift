//
//  ColorPalette.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation
import SwiftUI

// 1. The Specific Color (Hex + Name)
struct ColorDefinition: Codable, Hashable {
    let hex: String
    let name: String
    
    // Helper to get SwiftUI Color
    var color: Color {
        Color(hex: hex)
    }
}

// 2. The Palette (The card user selects)
struct Palette: Codable, Identifiable, Hashable {
    let id: String
    let name: String
    let category: String
    let mood: String
    let type: String // "Interior", "Exterior"
    let description: String
    
    let primary: ColorDefinition
    let secondary: ColorDefinition
    let neutral: ColorDefinition
}

// 3. The Collection (The Filter Tab - e.g. "White", "Blue")
struct ColorCollection: Codable, Identifiable {
    var id: String { familyName } // Use name as ID
    let familyName: String
    let familyValue: String // "Off-White" (Human readable)
    let familyHex: String   // "#F8FAFC" (Machine readable)
    let category: String
    let palettes: [Palette]
}


// 4. Root JSON Container
struct ColorExportRoot: Codable {
    let generatedAt: String
    let collections: [ColorCollection]
}
