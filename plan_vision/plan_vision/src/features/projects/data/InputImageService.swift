//
//  InputImageService.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import Foundation
import UIKit

protocol InputImageServiceable {
    func uploadImage(_ image: UIImage) async -> Result<InputImageDTO, NetworkError>
    func registerImage(url: String) async -> Result<InputImageDTO, NetworkError> // ✅ New
}

struct InputImageService: HTTPClient, InputImageServiceable {
    
    // 1. Upload Binary (Local Files)
    func uploadImage(_ image: UIImage) async -> Result<InputImageDTO, NetworkError> {
        guard let imageData = image.jpegData(compressionQuality: 0.8) else {
            return .failure(.unknown)
        }
        
        do {
            let response = try await sendRequest(
                endpoint: InputImageEndpoint.upload(data: imageData),
                responseModel: InputImageDTO.self
            )
            return .success(response)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    // 2. Register URL (Sample Images)
    func registerImage(url: String) async -> Result<InputImageDTO, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: InputImageEndpoint.create(url: url),
                responseModel: InputImageDTO.self
            )
            return .success(response)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
}
