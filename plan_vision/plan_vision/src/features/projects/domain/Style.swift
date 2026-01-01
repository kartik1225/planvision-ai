//
//  Style.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

struct Style: Identifiable, Equatable, Hashable {
    let id: String
    let name: String
    let thumbnailUrl: URL?
    let promptFragment: String
    let imageTypeIds: [String]

    /// Returns true if this style applies to the given image type
    /// Styles with no associated image types are considered universal
    func appliesTo(imageTypeId: String?) -> Bool {
        guard let typeId = imageTypeId else { return true }
        return imageTypeIds.isEmpty || imageTypeIds.contains(typeId)
    }
}

extension StyleDTO {
    func toDomain() -> Style {
        return Style(
            id: self.id,
            name: self.name,
            thumbnailUrl: URL(string: self.thumbnailUrl),
            promptFragment: self.promptFragment,
            imageTypeIds: self.imageTypes?.map { $0.id } ?? []
        )
    }
}
