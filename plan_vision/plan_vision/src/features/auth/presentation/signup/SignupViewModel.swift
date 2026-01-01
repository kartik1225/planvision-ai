//
//  SignupViewModel.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import SwiftUI

@MainActor
class SignupViewModel: ObservableObject {
    @Published var name = ""
    @Published var email = ""
    @Published var password = ""
    @Published var confirmPassword = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    var onSignupSuccess: ((AuthUser) -> Void)?
    
    private let service: AuthServiceable
    
    init(service: AuthServiceable = AuthService()) {
        self.service = service
    }
    
    func signup() {
        guard !name.isEmpty, !email.isEmpty, !password.isEmpty else {
            errorMessage = "Please fill all fields"
            return
        }
        
        guard password == confirmPassword else {
            errorMessage = "Passwords do not match"
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            let result = await service.signUp(name: name, email: email, pass: password)
            isLoading = false
            
            switch result {
            case .success(let user):
                onSignupSuccess?(user)
            case .failure(let error):
                errorMessage = error.customMessage
            }
        }
    }
}
