//
//  LoginViewModel.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//
import CryptoKit
import AuthenticationServices

@MainActor
class LoginViewModel: ObservableObject {
    
    @Published var email = ""
    @Published var password = ""
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var currentNonce: String?
    
    // We don't store currentUser here anymore, we pass it back via callback
    var onLoginSuccess: ((AuthUser) -> Void)?
    
    private let service: AuthServiceable
    
    init(service: AuthServiceable = AuthService()) {
        self.service = service
    }
    
    func configureAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.fullName, .email]
        
        // Generate nonce
        let nonce = randomNonceString()
        self.currentNonce = nonce
        
        // Send HASHED nonce to Apple
        request.nonce = sha256(nonce)
    }
    
    func handleAppleLogin(result: Result<ASAuthorization, Error>) {
           switch result {
           case .success(let auth):
               guard let appleIDCredential = auth.credential as? ASAuthorizationAppleIDCredential,
                     let identityTokenData = appleIDCredential.identityToken,
                     let idTokenString = String(data: identityTokenData, encoding: .utf8)
               else {
                   self.errorMessage = "Could not fetch Apple Token"
                   return
               }
               
               // Verify we have the nonce we generated earlier
               guard let nonce = currentNonce else {
                   self.errorMessage = "Nonce mismatch"
                   return
               }
               
               isLoading = true
               Task {
                   // Send Raw Nonce to Backend
                   let result = await service.socialLogin(provider: "apple", idToken: idTokenString, nonce: nonce)
                   isLoading = false
                   
                   switch result {
                   case .success(let user):
                       onLoginSuccess?(user)
                   case .failure(let error):
                       self.errorMessage = error.customMessage
                   }
               }
               
           case .failure(let error):
               self.errorMessage = error.localizedDescription
           }
       }
    
    func login() {
        guard !email.isEmpty, !password.isEmpty else {
             errorMessage = "Please fill in all fields"
             return
        }
        
        isLoading = true
        errorMessage = nil
        
        Task {
            let result = await service.signIn(email: email, pass: password)
            isLoading = false
            
            switch result {
            case .success(let user):
                print("Login Success: \(user.name)")
                onLoginSuccess?(user) // Tell the View we are done
            case .failure(let error):
                self.errorMessage = error.customMessage
            }
        }
    }
}


private func randomNonceString(length: Int = 32) -> String {
    precondition(length > 0)
    var randomBytes = [UInt8](repeating: 0, count: length)
    let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
    if errorCode != errSecSuccess {
        fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
    }
    
    let charset: [Character] = Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
    
    let nonce = randomBytes.map { byte in
        charset[Int(byte) % charset.count]
    }.map { String($0) }.joined()
    
    return nonce
}

private func sha256(_ input: String) -> String {
    let inputData = Data(input.utf8)
    let hashedData = SHA256.hash(data: inputData)
    return hashedData.compactMap {
        String(format: "%02x", $0)
    }.joined()
}
