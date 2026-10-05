package com.cntt.academicdocs.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Interface defining contract for storage operations (Supabase / Local).
 * Note for TV1: This service is injected into FileController and DocumentService
 * to handle file uploading, signed URL generation for preview/download, and deletion.
 */
public interface FileStorageService {

    /**
     * Upload raw binary content to storage.
     *
     * @param bytes            Raw file binary data
     * @param originalFilename Original client filename (e.g., 'bao-cao.pdf')
     * @param contentType      MIME type (e.g., 'application/pdf')
     * @param folderKey        Folder prefix or document identifier (e.g., 'documents/12' or 'temp')
     * @return storageKey      The unique path of stored object (e.g., 'documents/12/uuid.pdf')
     */
    String upload(byte[] bytes, String originalFilename, String contentType, String folderKey);

    /**
     * Upload Spring MultipartFile to storage.
     *
     * @param file             Multipart file from HTTP request
     * @param folderKey        Folder prefix or document identifier
     * @return storageKey      The unique path of stored object
     */
    String upload(MultipartFile file, String folderKey);

    /**
     * Generate a temporary time-limited Signed URL for viewing or downloading private files.
     *
     * @param storageKey    The storage path of the file
     * @param expirySeconds Expiration duration in seconds (e.g., 300)
     * @return url          Full signed access URL
     */
    String createSignedUrl(String storageKey, int expirySeconds);

    /**
     * Delete an object from storage (best-effort, non-blocking failure).
     *
     * @param storageKey The storage path of the file to remove
     */
    void delete(String storageKey);
}
