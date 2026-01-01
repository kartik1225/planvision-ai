//
//  ProjectTemplate.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import Foundation

struct ProjectTemplate: Identifiable, Equatable, Hashable {
    let id: String
    let title: String
    let description: String
    let thumbnailUrl: URL?
    let originalThumbnailUrl: URL?
    let generatedThumbnailUrl: URL?
    let sampleImageUrls: [URL]
    let defaultImageTypeId: String

    /// Returns true if both original and generated thumbnails are available for comparison
    var hasComparisonImages: Bool {
        originalThumbnailUrl != nil && generatedThumbnailUrl != nil
    }
}

// Mapper extension to convert DTO -> Domain
extension ProjectTemplateDTO {
    func toDomain() -> ProjectTemplate {
        return ProjectTemplate(
            id: self.id,
            title: self.title,
            description: self.description ?? "",
            thumbnailUrl: URL(string: self.thumbnailUrl),
            originalThumbnailUrl: self.originalThumbnailUrl.flatMap { URL(string: $0) },
            generatedThumbnailUrl: self.generatedThumbnailUrl.flatMap { URL(string: $0) },
            sampleImageUrls: self.sampleImageUrls.compactMap { URL(string: $0) },
            defaultImageTypeId: self.defaultImageTypeId
        )
    }
}
