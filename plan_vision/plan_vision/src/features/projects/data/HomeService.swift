//
//  HomeService.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import Foundation

protocol HomeServiceable {
    func fetchTemplates() async -> Result<[ProjectTemplate], NetworkError>
    func fetchImageTypes() async -> Result<[ImageType], NetworkError>
}

struct HomeService: HTTPClient, HomeServiceable {
    func fetchTemplates() async -> Result<[ProjectTemplate], NetworkError> {
        do {
            let dtos = try await sendRequest(
                endpoint: ProjectEndpoint.getTemplates,
                responseModel: [ProjectTemplateDTO].self
            )
            
            // Convert DTOs to Domain Models
            let domainModels = dtos.map { $0.toDomain() }
            return .success(domainModels)
            
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    func fetchImageTypes() async -> Result<[ImageType], NetworkError> {
        do {
            let dtos = try await sendRequest(
                endpoint: ProjectEndpoint.getImageTypes,
                responseModel: [ImageTypeDTO].self
            )
            return .success(dtos.map { $0.toDomain() })
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    /// Fetch styles, optionally filtered by image type.
    /// When imageTypeId is provided, returns styles for that type with contextual thumbnails.
    func fetchStyles(imageTypeId: String? = nil) async -> Result<[Style], NetworkError> {
        do {
            let dtos = try await sendRequest(
                endpoint: ProjectEndpoint.getStyles(imageTypeId: imageTypeId),
                responseModel: [StyleDTO].self
            )
            return .success(dtos.map { $0.toDomain() })
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
}
