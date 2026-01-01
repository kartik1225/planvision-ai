//
//  ImageType.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

struct ImageType: Identifiable, Equatable, Hashable {
    let id: String
    let label: String
    let value: String
    let description: String
}

extension ImageTypeDTO {
    func toDomain() -> ImageType {
        return ImageType(
            id: self.id,
            label: self.label,
            value: self.value,
            description: self.description ?? ""
        )
    }
}
