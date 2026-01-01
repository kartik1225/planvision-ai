//
//  LoginView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import SwiftUI
import AuthenticationServices

struct LoginView: View {
    // 1. Use the ViewModel
    @StateObject private var viewModel = LoginViewModel()
    
    // 2. Access SessionManager to update global state on success
    @EnvironmentObject var sessionManager: SessionManager
    
    var body: some View {
        ZStack {
            // Background
            Color(UIColor.systemGroupedBackground)
                .ignoresSafeArea()

            VStack(spacing: 32) {
                // Header
                VStack(spacing: 16) {
                    Image(systemName: "lock.circle.fill")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 80, height: 80)
                        .foregroundStyle(Color.accentColor)
                    
                    Text("Welcome Back")
                        .font(DesignSystem.Typography.titleLarge())
                        .foregroundStyle(DesignSystem.Colors.textPrimary)
                }
                .padding(.top, 40)
                
                // Glass Card Form
                GlassCard {
                    VStack(spacing: 20) {
                        GlassTextField(
                            placeholder: "Email",
                            text: $viewModel.email,
                            icon: "envelope"
                        )
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .disabled(viewModel.isLoading)
                        
                        GlassTextField(
                            placeholder: "Password",
                            text: $viewModel.password,
                            isSecure: true,
                            icon: "lock"
                        )
                        .disabled(viewModel.isLoading)
                        
                        if let error = viewModel.errorMessage {
                            Text(error)
                                .foregroundColor(.red)
                                .font(DesignSystem.Typography.caption())
                                .multilineTextAlignment(.center)
                        }
                        
                        GlassButton(title: "Sign In") {
                            // Hide keyboard
                            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                            viewModel.login()
                        }
                        .disabled(viewModel.isLoading)
                        .opacity(viewModel.isLoading ? 0.7 : 1.0)
                        
                        // Divider
                        HStack {
                            Rectangle().frame(height: 1).foregroundColor(.gray.opacity(0.3))
                            Text("OR").font(.caption).foregroundColor(.secondary)
                            Rectangle().frame(height: 1).foregroundColor(.gray.opacity(0.3))
                        }
                        .padding(.vertical, 8)
                        
                        // Apple Sign In
                        SignInWithAppleButton(
                            onRequest: { request in
                                viewModel.configureAppleRequest(request)
                            },
                            onCompletion: { result in
                                viewModel.handleAppleLogin(result: result)
                            }
                        )
                        .signInWithAppleButtonStyle(.black) // Adjust for dark mode if needed
                        .frame(height: 50)
                        .cornerRadius(DesignSystem.Spacing.cornerRadiusSmall)
                    }
                    .padding(.vertical, 8)
                }
                .padding(.horizontal)
                
                // Signup Link
                NavigationLink(destination: SignupView()) {
                    HStack {
                        Text("Don't have an account?")
                            .foregroundStyle(DesignSystem.Colors.textSecondary)
                        Text("Sign Up")
                            .bold()
                            .foregroundStyle(Color.blue)
                    }
                    .font(DesignSystem.Typography.body())
                }
                
                Spacer()
            }
        }
        .onAppear {
            // When LoginViewModel succeeds, update SessionManager
            viewModel.onLoginSuccess = { user in
                sessionManager.login(user: user)
            }
        }
    }
}
