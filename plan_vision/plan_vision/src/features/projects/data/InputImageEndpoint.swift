//
//  InputImageEndpoint.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

enum InputImageEndpoint: Endpoint {
    case upload(data: Data)
    case create(url: String) // ✅ New Case
    
    var path: String {
        switch self {
        case .upload, .create:
            // Both map to the base controller path /input-images
            // .upload adds /upload via the backend controller decorator,
            // .create hits the root @Post()
            if case .upload = self { return "/input-images/upload" }
            return "/input-images"
        }
    }
    
    var method: RequestMethod {
        return .post
    }
    
    var header: [String : String]? {
        var headers = [String: String]()
        if let token = TokenManager.shared.getToken() {
            headers["Authorization"] = "Bearer \(token)"
        }
        
        // For JSON requests, specify content type
        if case .create = self {
            headers["Content-Type"] = "application/json"
        }
        
        return headers
    }
    
    var body: [String : Any]? {
        switch self {
        case .create(let url):
            return ["url": url] // ✅ JSON Body
        default:
            return nil
        }
    }
    
    var multipartData: Data? {
        switch self {
        case .upload(let data):
            return data
        default:
            return nil
        }
    }
}
