//
//  SignupView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import SwiftUI

struct SignupView: View {
    @StateObject private var viewModel = SignupViewModel()
    @EnvironmentObject var sessionManager: SessionManager
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ZStack {
            // Background
            Color(UIColor.systemGroupedBackground)
                .ignoresSafeArea()

            ScrollView {
                VStack(spacing: 32) {
                    // Header
                    VStack(spacing: 16) {
                        Image(systemName: "person.badge.plus.fill")
                            .resizable()
                            .scaledToFit()
                            .frame(width: 80, height: 80)
                            .foregroundStyle(Color.accentColor)

                        Text("Create Account")
                            .font(DesignSystem.Typography.titleLarge())
                            .foregroundStyle(DesignSystem.Colors.textPrimary)
                    }
                    .padding(.top, 40)
                    
                    // Glass Card Form
                    GlassCard {
                        VStack(spacing: 20) {
                            GlassTextField(
                                placeholder: "Full Name",
                                text: $viewModel.name,
                                icon: "person"
                            )
                            
                            GlassTextField(
                                placeholder: "Email",
                                text: $viewModel.email,
                                icon: "envelope"
                            )
                            .keyboardType(.emailAddress)
                            .textInputAutocapitalization(.never)
                            
                            GlassTextField(
                                placeholder: "Password",
                                text: $viewModel.password,
                                isSecure: true,
                                icon: "lock"
                            )
                            
                            GlassTextField(
                                placeholder: "Confirm Password",
                                text: $viewModel.confirmPassword,
                                isSecure: true,
                                icon: "lock.shield"
                            )
                            
                            if let error = viewModel.errorMessage {
                                Text(error)
                                    .foregroundColor(.red)
                                    .font(DesignSystem.Typography.caption())
                                    .multilineTextAlignment(.center)
                            }
                            
                            GlassButton(title: "Sign Up") {
                                viewModel.signup()
                            }
                            .disabled(viewModel.isLoading)
                            .opacity(viewModel.isLoading ? 0.7 : 1.0)
                        }
                        .padding(.vertical, 8)
                    }
                    .padding(.horizontal)
                    
                    // Back to Login
                    Button(action: { dismiss() }) {
                        Text("Already have an account? Sign In")
                            .font(DesignSystem.Typography.body())
                            .foregroundStyle(DesignSystem.Colors.textSecondary)
                    }
                    .padding(.bottom, 40)
                }
            }
        }
        .onAppear {
            viewModel.onSignupSuccess = { user in
                sessionManager.login(user: user)
            }
        }
    }
}
