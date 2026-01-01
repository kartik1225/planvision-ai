//
//  ContentView.swift
//  plan_vision
//
//  Created by Kartik Garasia on 19/11/25.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var sessionManager = SessionManager()
    
    var body: some View {
        Group {
            if sessionManager.isLoading {
                ProgressView("Loading session...")
            } else if sessionManager.currentUser != nil {
                HomeView()
                    .environmentObject(sessionManager)
            } else {
                NavigationStack {
                    LoginView()
                }
                .environmentObject(sessionManager)
            }
        }
        .onAppear {
            sessionManager.checkSession()
        }
    }
}

#Preview {
    ContentView()
}
