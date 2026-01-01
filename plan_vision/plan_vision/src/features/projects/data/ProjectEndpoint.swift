//
//  ProjectEndpoint.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-21.
//

import Foundation

enum ProjectEndpoint: Endpoint {
    case getTemplates
    case getImageTypes
    case getStyles(imageTypeId: String?) // Optional: pass imageTypeId to get contextual thumbnails
    case createProject(name: String)
    case createRenderConfig(dto: CreateRenderConfigDTO)
    case getGenerationStatus(configId: String)

    var path: String {
        switch self {
        case .getTemplates: return "/project-templates"
        case .getImageTypes: return "/image-types"
        case .getStyles: return "/styles"
        case .createProject: return "/projects"
        case .createRenderConfig: return "/render-configs"
        case .getGenerationStatus(let id): return "/render-configs/\(id)/generation"
        }
    }

    var queryItems: [URLQueryItem]? {
        switch self {
        case .getStyles(let imageTypeId):
            if let typeId = imageTypeId {
                return [URLQueryItem(name: "imageTypeId", value: typeId)]
            }
            return nil
        default:
            return nil
        }
    }
    
    var method: RequestMethod {
        switch self {
        case .getTemplates, .getImageTypes, .getStyles, .getGenerationStatus:
            return .get
        case .createProject, .createRenderConfig:
            return .post
        }
    }
    
    var header: [String : String]? {
        var headers = ["Content-Type": "application/json"]
        if let token = TokenManager.shared.getToken() {
            headers["Authorization"] = "Bearer \(token)"
        }
        return headers
    }
    
    var body: [String : Any]? {
        switch self {
        case .createProject(let name):
            return ["name": name]
            
        case .createRenderConfig(let dto):
            guard let data = try? JSONEncoder().encode(dto),
                  let dict = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                return nil
            }
            return dict
            
        default: return nil
        }
    }
}
