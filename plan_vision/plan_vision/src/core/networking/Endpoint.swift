//
//  Endpoint.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-19.
//

import Foundation

enum RequestMethod: String {
    case delete = "DELETE"
    case get = "GET"
    case patch = "PATCH"
    case post = "POST"
    case put = "PUT"
}

protocol Endpoint {
    var scheme: String { get }
    var host: String { get }
    var port: Int? { get }
    var path: String { get }
    var queryItems: [URLQueryItem]? { get }
    var method: RequestMethod { get }
    var header: [String: String]? { get }
    var body: [String: Any]? { get }
    var multipartData: Data? { get }
}

extension Endpoint {
    var scheme: String { Config.scheme }
    var host: String { Config.host }
    var port: Int? { Config.port }
    var queryItems: [URLQueryItem]? { nil }
    var multipartData: Data? { nil }
}
