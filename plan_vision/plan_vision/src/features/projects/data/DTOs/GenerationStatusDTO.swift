//
//  GenerationStatusDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

struct GenerationStatusDTO: Decodable, Identifiable {
    let id: String
    let status: String
    let outputImageUrl: String?
    let errorMessage: String?
}
