//
//  NetworkError.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

enum NetworkError: Error {
    case invalidURL
    case unauthorized
    case unknown
    case decodingError
    
    var customMessage: String {
        switch self {
            case .unauthorized: return "Invalid credentials"
            case .decodingError: return "Server data format invalid"
            default: return "Something went wrong"
        }
    }
}
