//
//  SessionResponseDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import Foundation

struct SessionResponseDTO: Codable {
    let session: SessionDataDTO
    let user: UserDTO
}

struct SessionDataDTO: Codable {
    let id: String
    let expiresAt: String
}
