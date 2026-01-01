//
//  HomeViewModel.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-22.
//

import Foundation
import SwiftUI

@MainActor
class HomeViewModel: ObservableObject {
    
    @Published var templates: [ProjectTemplate] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let service: HomeServiceable
    
    init(service: HomeServiceable = HomeService()) {
        self.service = service
    }
    
    func loadTemplates() {
        isLoading = true
        errorMessage = nil
        
        Task {
            let result = await service.fetchTemplates()
            
            self.isLoading = false
            
            switch result {
            case .success(let data):
                self.templates = data
            case .failure(let error):
                self.errorMessage = error.customMessage
            }
        }
    }
}
