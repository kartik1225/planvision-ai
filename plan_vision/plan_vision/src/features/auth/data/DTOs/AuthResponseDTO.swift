//
//  AuthResponseDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

struct AuthResponseDTO: Codable {
    let token: String  // 👈 Moved to root
    let user: UserDTO
}

struct UserDTO: Codable {
    let id: String
    let email: String
    let name: String
}
