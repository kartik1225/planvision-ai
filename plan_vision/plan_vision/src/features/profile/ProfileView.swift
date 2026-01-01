//
//  HomeView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-20.
//

import SwiftUI

    struct ProfileView: View {
    let user: AuthUser
    @EnvironmentObject var sessionManager: SessionManager
    
    var body: some View {
        VStack(spacing: 24) {
            // Header
            VStack(spacing: 12) {
                Image(systemName: "person.circle.fill")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 80, height: 80)
                    .foregroundStyle(.tint)
                
                Text("Welcome!")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text(user.name)
                    .font(.title2)
                    .foregroundStyle(.secondary)
            }
            .padding(.top, 60)
            
            // User Info Card
            VStack(alignment: .leading, spacing: 16) {
                InfoRow(label: "ID", value: user.id)
                InfoRow(label: "Email", value: user.email)
                InfoRow(label: "Name", value: user.name)
            }
            .padding()
            .background(Color(UIColor.secondarySystemGroupedBackground))
            .cornerRadius(12)
            .padding(.horizontal)
            
            Spacer()
            
            // Logout Button
            Button(action: {
                sessionManager.logout()
            }) {
                Text("Logout")
                    .bold()
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.red)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
            .padding(.bottom, 40)
        }
        .background(Color(UIColor.systemGroupedBackground))
    }
}

struct InfoRow: View {
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Text(label)
                .font(.subheadline)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}
