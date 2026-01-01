//
//  StyleDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

struct StyleDTO: Codable {
    let id: String
    let name: String
    let thumbnailUrl: String
    let promptFragment: String
    let imageTypes: [ImageTypeDTO]?
}

struct ImageTypeRefDTO: Codable {
    let id: String
}
