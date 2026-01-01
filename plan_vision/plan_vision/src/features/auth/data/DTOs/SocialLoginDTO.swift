//
//  SocialLoginDTO.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import Foundation

struct SocialLoginDTO: Encodable {
    let provider: String
    let idToken: String
    // user_id or email is inside the token, backend extracts it
}
