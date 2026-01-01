//
//  ProjectTemplateDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import Foundation

struct ProjectTemplateDTO: Codable {
    let id: String
    let title: String
    let description: String?
    let thumbnailUrl: String
    let originalThumbnailUrl: String?
    let generatedThumbnailUrl: String?
    let sampleImageUrls: [String]
    let defaultImageTypeId: String
}
