//
//  CreateReqDTOs.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

// 1. To Create a Project
struct CreateProjectDTO: Encodable {
    let name: String
}

// Response when creating a project
struct ProjectResponseDTO: Decodable {
    let id: String
    let name: String
}

// 2. To Create a Render Config
struct CreateRenderConfigDTO: Encodable {
    let projectId: String
    let inputImageId: String
    let imageTypeId: String
    
    let styleId: String?
    let customInstructions: String?
    
    // Colors
    let colorPrimaryHex: String?
    let colorSecondaryHex: String?
    let colorNeutralHex: String?
    
    // Perspective
    let perspectiveAngle: Int?
    let perspectiveX: Int?
    let perspectiveY: Int?
}
// Response when creating config
struct RenderConfigResponseDTO: Decodable {
    let id: String
}
