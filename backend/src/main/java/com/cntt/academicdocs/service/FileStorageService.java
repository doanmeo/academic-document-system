package com.cntt.academicdocs.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String upload(MultipartFile file, String storagePath);
    String createSignedUrl(String storageKey, int expirySeconds);
    void delete(String storageKey);
}
