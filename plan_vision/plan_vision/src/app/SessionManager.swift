//
//  SessionManager.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import SwiftUI
import Combine

@MainActor
class SessionManager: ObservableObject {
    @Published var currentUser: AuthUser?
    @Published var isLoading = true
    
    private let authService: AuthServiceable
    
    init(service: AuthServiceable = AuthService()) {
        self.authService = service
        setupTokenLifecycle()
    }
    
    func checkSession() {
        guard TokenManager.shared.getToken() != nil else {
            self.isLoading = false
            return
        }
        
        Task {
            let result = await authService.fetchSession()
            
            switch result {
            case .success(let user):
                self.currentUser = user
            case .failure:

                self.logout()
            }
            
            self.isLoading = false
        }
    }
    
    func login(user: AuthUser) {
        self.currentUser = user
        self.isLoading = false
    }
    
    func logout() {
        Task {
            // Attempt server logout (optional, but good practice)
            _ = await authService.signOut()
            
            TokenManager.shared.delete()
            self.currentUser = nil
            self.isLoading = false
        }
    }
    
    

    private func setupTokenLifecycle() {
        NotificationCenter.default.addObserver(forName: .didReceiveUnauthorized, object: nil, queue: .main) { [weak self] _ in
            // Use Task/MainActor to ensure UI updates are safe
            Task { @MainActor [weak self] in
                print("⚠️ Session Expired (401). Logging out locally.")
                self?.currentUser = nil
                TokenManager.shared.delete()
                self?.isLoading = false
            }
        }
    }
}

// Helper Extension for Notification
extension Notification.Name {
    static let didReceiveUnauthorized = Notification.Name("didReceiveUnauthorized")
}
