//
//  AuthEndpoint.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

enum AuthEndpoint: Endpoint {
    
    case signIn(email: String, pass: String)
    case signUp(name: String, email: String, pass: String)
    case signOut
    case getSession
    case socialLogin(provider: String, idToken: String, nonce: String)
    
    var path: String {
        switch self {
        case .signIn:
            return "/api/auth/sign-in/email"
        case .signUp:
            return "/api/auth/sign-up/email"
        case .signOut:
            return "/api/auth/sign-out"
        case .getSession:
            return "/api/auth/get-session"
        case .socialLogin:
            return "/api/auth/sign-in/social"
        }
    }
    
    var method: RequestMethod {
        switch self {
        case .signIn, .signUp, .signOut, .socialLogin:
            return .post
        case .getSession:
            return .get
        }
    }
    
    var header: [String : String]? {
        var headers = ["Content-Type": "application/json"]
        headers["Origin"] = Config.baseURL
        switch self {
        case .signOut, .getSession:
            if let token = TokenManager.shared.getToken() {
                headers["Authorization"] = "Bearer \(token)"
            }
        default:
            break
        }
        
        return headers
    }
    
    var body: [String : Any]? {
        switch self {
        case .signIn(let email, let pass):
            return [
                "email": email,
                "password": pass
            ]
            
        case .signUp(let name, let email, let pass):
            return [
                "name": name,
                "email": email,
                "password": pass
            ]
            
        case .socialLogin(let provider, let idToken, let nonce):
            return [
                "provider": provider,
                "idToken": idToken, // better-auth usually expects camelCase
                "id_token": idToken, // Adding snake_case just in case
                "nonce": nonce,
                "callbackURL": "\(Config.baseURL)/home" // Must be a valid URL
            ]
            
        case .signOut, .getSession:
            return nil
        }
    }
}
