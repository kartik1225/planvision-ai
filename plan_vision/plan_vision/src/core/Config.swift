//
//  Config.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-21.
//

import Foundation

struct Config {
    // MARK: - Configuration
    // Change these values to match your backend server
    static let host = "localhost"
    static let port = 3000
    static let scheme = "http"

    static var baseURL: String {
        return "\(scheme)://\(host):\(port)"
    }
}
