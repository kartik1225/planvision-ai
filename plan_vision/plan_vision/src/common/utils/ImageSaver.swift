//
//  ImageSaver.swift
//  plan_vision
//
//  Created by Kartik Garasia on 2025-11-23.
//

import UIKit

class ImageSaver: NSObject {
    var onSuccess: (() -> Void)?
    var onError: ((Error) -> Void)?
    
    func writeToPhotoAlbum(image: UIImage) {
        UIImageWriteToSavedPhotosAlbum(image, self, #selector(saveCompleted), nil)
    }
    
    @objc func saveCompleted(_ image: UIImage, didFinishSavingWithError error: Error?, contextInfo: UnsafeRawPointer) {
        if let error = error {
            onError?(error)
        } else {
            onSuccess?()
        }
    }
}
