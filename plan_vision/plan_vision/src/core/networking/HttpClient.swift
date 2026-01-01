//
//  HttpClient.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

struct APIErrorResponse: Decodable {
    let message: String?
    let code: String?
}

protocol HTTPClient {
    func sendRequest<T: Decodable>(endpoint: Endpoint, responseModel: T.Type) async throws -> T
}

extension HTTPClient {
    func sendRequest<T: Decodable>(
        endpoint: Endpoint,
        responseModel: T.Type
    ) async throws -> T {
        
        var urlComponents = URLComponents()
        urlComponents.scheme = endpoint.scheme
        urlComponents.host = endpoint.host
        urlComponents.port = endpoint.port
        urlComponents.path = endpoint.path
        urlComponents.queryItems = endpoint.queryItems

        guard let url = urlComponents.url else { throw NetworkError.invalidURL }
        
        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        
        // Handle Headers
        var allHeaders = endpoint.header ?? [:]
        
        // --- BODY CONSTRUCTION ---
        if let uploadData = endpoint.multipartData {
            // Handle Multipart Upload
            let boundary = "Boundary-\(UUID().uuidString)"
            allHeaders["Content-Type"] = "multipart/form-data; boundary=\(boundary)"
            request.httpBody = createMultipartBody(data: uploadData, boundary: boundary, filename: "upload.jpg")
        } else if let body = endpoint.body {
            // Handle Standard JSON
            request.httpBody = try? JSONSerialization.data(withJSONObject: body, options: [])
        }
        
        request.allHTTPHeaderFields = allHeaders
        
        // --- Request Logging ---
        print("\n[REQUEST] ---------------------------------------")
        print("URL: \(url.absoluteString)")
        print("Method: \(endpoint.method.rawValue)")
        if let headers = request.allHTTPHeaderFields {
            print("Headers: \(headers)")
        }
        
        if endpoint.multipartData != nil {
            print("Body: [Multipart Binary Data - \(request.httpBody?.count ?? 0) bytes]")
        } else if let bodyData = request.httpBody {
            if let bodyString = String(data: bodyData, encoding: .utf8) {
                print("Body: \(bodyString)")
            } else {
                print("Body: [Binary Data]")
            }
        } else {
            print("Body: nil")
        }
        print("-------------------------------------------------\n")
        
        do {
            let (data, response) = try await URLSession.shared.data(for: request)
            
            guard let httpResponse = response as? HTTPURLResponse else {
                throw NetworkError.unknown
            }
            
            // --- Response Logging ---
            print("\n[RESPONSE] --------------------------------------")
            print("URL: \(url.absoluteString)")
            print("Status Code: \(httpResponse.statusCode)")
            if let responseString = String(data: data, encoding: .utf8) {
                print("Body: \(responseString)")
            } else {
                print("Body: [Unable to convert data to string]")
            }
            print("-------------------------------------------------\n")
            
            switch httpResponse.statusCode {
            case 200...299:
                do {
                    let decoded = try JSONDecoder().decode(responseModel, from: data)
                    return decoded
                } catch {
                    print("[ERROR] Decoding failed: \(error)")
                    throw NetworkError.decodingError
                }
            case 401:
                NotificationCenter.default.post(name: .didReceiveUnauthorized, object: nil)
                throw NetworkError.unauthorized
            default:
                throw NetworkError.unknown
            }
        } catch {
            print("[ERROR] System Error: \(error)")
            throw error
        }
    }
    
    // Helper to build the multipart body
    private func createMultipartBody(data: Data, boundary: String, filename: String) -> Data {
        var body = Data()
        let lineBreak = "\r\n"
        
        // 1. Boundary
        body.append("--\(boundary + lineBreak)")
        
        // 2. Content-Disposition
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\(lineBreak)")
        
        // 3. Content-Type
        body.append("Content-Type: image/jpeg\(lineBreak + lineBreak)")
        
        // 4. The Image Data
        body.append(data)
        body.append(lineBreak)
        
        // 5. Closing Boundary
        body.append("--\(boundary)--\(lineBreak)")
        
        return body
    }
}

// Helper extension to append strings to Data
extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
