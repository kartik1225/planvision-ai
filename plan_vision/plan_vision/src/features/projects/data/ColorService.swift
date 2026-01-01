//
//  ColorService.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

class ColorService {
    static let shared = ColorService()
    
    func loadCollections() -> [ColorCollection] {
        guard let url = Bundle.main.url(forResource: "lumina-palettes-export-2025-11-23", withExtension: "json") else {
            print("JSON file not found in bundle")
            return []
        }
        
        do {
            let data = try Data(contentsOf: url)
            let root = try JSONDecoder().decode(ColorExportRoot.self, from: data)
            return root.collections
        } catch {
            print("Failed to parse color JSON: \(error)")
            return []
        }
    }
}
