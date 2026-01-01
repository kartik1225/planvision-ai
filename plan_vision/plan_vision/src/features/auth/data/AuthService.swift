//
//  AuthService.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

protocol AuthServiceable {
    func signIn(email: String, pass: String) async -> Result<AuthUser, NetworkError>
    func signUp(name: String, email: String, pass: String) async -> Result<AuthUser, NetworkError>
    func signOut() async -> Result<Void, NetworkError>
    func fetchSession() async -> Result<AuthUser, NetworkError>
    func socialLogin(provider: String, idToken: String, nonce: String) async -> Result<AuthUser, NetworkError>
}

struct AuthService: HTTPClient, AuthServiceable {
    func fetchSession() async -> Result<AuthUser, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: AuthEndpoint.getSession,
                responseModel: SessionResponseDTO.self
            )
            
            let user = AuthUser(
                id: response.user.id,
                name: response.user.name,
                email: response.user.email
            )
            
            return .success(user)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    
    func signIn(email: String, pass: String) async -> Result<AuthUser, NetworkError> {
        return await authenticate(endpoint: AuthEndpoint.signIn(email: email, pass: pass))
    }
    
    func signUp(name: String, email: String, pass: String) async -> Result<AuthUser, NetworkError> {
        return await authenticate(endpoint: AuthEndpoint.signUp(name: name, email: email, pass: pass))
    }
    
    func socialLogin(provider: String, idToken: String, nonce: String) async -> Result<AuthUser, NetworkError> {
        return await authenticate(endpoint: AuthEndpoint.socialLogin(provider: provider, idToken: idToken, nonce: nonce))
    }
    
    private func authenticate(endpoint: Endpoint) async -> Result<AuthUser, NetworkError> {
        do {
            let response = try await sendRequest(
                endpoint: endpoint,
                responseModel: AuthResponseDTO.self
            )
            
            TokenManager.shared.save(token: response.token)
            
            let user = AuthUser(
                id: response.user.id,
                name: response.user.name,
                email: response.user.email
            )
            
            return .success(user)
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
    
    func signOut() async -> Result<Void, NetworkError> {
        do {
            // We don't expect a return model body from signOut, just 200 OK
            // We might need a helper in HTTPClient for "No Response Body",
            // but for now, let's assume we just want to clear local data.
            
            _ = try await sendRequest(endpoint: AuthEndpoint.signOut, responseModel: EmptyResponse.self)
            
             TokenManager.shared.delete()
            
            return .success(())
        } catch {
            return .failure(error as? NetworkError ?? .unknown)
        }
    }
}

struct EmptyResponse: Decodable {}
