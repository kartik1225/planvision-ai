//
//  ProjectService.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation

protocol ProjectServiceable {
    func createProject(name: String) async -> Result<ProjectResponseDTO, NetworkError>
    func createRenderConfig(dto: CreateRenderConfigDTO) async -> Result<RenderConfigResponseDTO, NetworkError>
    func getGenerationStatus(configId: String) async -> Result<GenerationStatusDTO, NetworkError>
}

struct ProjectService: HTTPClient, ProjectServiceable {
    
    func createProject(name: String) async -> Result<ProjectResponseDTO, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: ProjectEndpoint.createProject(name: name),
                responseModel: ProjectResponseDTO.self
            )
            return .success(response)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    func createRenderConfig(dto: CreateRenderConfigDTO) async -> Result<RenderConfigResponseDTO, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: ProjectEndpoint.createRenderConfig(dto: dto),
                responseModel: RenderConfigResponseDTO.self
            )
            return .success(response)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    func getGenerationStatus(configId: String) async -> Result<GenerationStatusDTO, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: ProjectEndpoint.getGenerationStatus(configId: configId),
                responseModel: GenerationStatusDTO.self
            )
            return .success(response)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
}
