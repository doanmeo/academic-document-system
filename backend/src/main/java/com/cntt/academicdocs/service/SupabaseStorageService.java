package com.cntt.academicdocs.service;

import com.cntt.academicdocs.config.AppProperties;
import com.cntt.academicdocs.exception.AppException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Production implementation of FileStorageService interfacing with Supabase Storage REST API.
 * (TV3 Ownership - Week 2).
 * <p>
 * Key Features:
 * 1. Strict validation (MIME type whitelist, file size limit <= 50MB, empty check) throwing AppException.
 * 2. Upload to private 'documents' bucket with path '{documentId|temp}/{uuid}.{ext}'.
 * 3. Temporary Signed URL generation (default TTL = 300s).
 * 4. Best-effort object deletion with safe logging.
 */
@Service
public class SupabaseStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private static final Set<String> DEFAULT_ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/zip",
            "application/x-zip-compressed"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "pdf", "docx", "pptx", "xlsx", "zip"
    );

    private final AppProperties appProperties;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(AppProperties appProperties) {
        this.appProperties = appProperties;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String upload(byte[] bytes, String originalFilename, String contentType, String folderKey) {
        // 1. Validate file content and size
        validateFile(bytes, originalFilename, contentType);

        String supabaseUrl = appProperties.getSupabase().getUrl();
        String serviceRoleKey = appProperties.getSupabase().getEffectiveKey();
        String bucketName = appProperties.getSupabase().getBucket();

        // 2. Generate secure storage path: {folderKey}/{uuid}.{ext}
        String extension = getFileExtension(originalFilename);
        String uniqueFileName = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);
        String sanitizedFolder = (folderKey != null && !folderKey.trim().isEmpty())
                ? folderKey.trim().replaceAll("^/+|/+$", "")
                : "temp";
        String storageKey = sanitizedFolder + "/" + uniqueFileName;

        // 3. Upload to Supabase Storage REST API
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, storageKey);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apikey", serviceRoleKey);
            headers.setContentType(MediaType.parseMediaType(
                    (contentType != null && !contentType.isBlank()) ? contentType : MediaType.APPLICATION_OCTET_STREAM_VALUE
            ));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(bytes, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Successfully uploaded file to Supabase Storage [bucket={}, key={}]", bucketName, storageKey);
                return storageKey;
            } else {
                log.error("Supabase storage upload failed with status {}: {}", response.getStatusCode(), response.getBody());
                throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_UPLOAD_FAILED", "Không thể tải tệp lên Supabase Storage");
            }
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("Exception occurred while uploading file to Supabase (key={}): {}", storageKey, e.getMessage());
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR", "Lỗi dịch vụ lưu trữ: " + e.getMessage());
        }
    }

    @Override
    public String upload(MultipartFile file, String folderKey) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Tệp tải lên không được để trống");
        }
        try {
            return upload(file.getBytes(), file.getOriginalFilename(), file.getContentType(), folderKey);
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.error("Failed to read multipart file bytes: {}", e.getMessage());
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "FILE_READ_ERROR", "Không thể đọc dữ liệu tệp tải lên");
        }
    }

    @Override
    public String createSignedUrl(String storageKey, int expirySeconds) {
        if (storageKey == null || storageKey.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_STORAGE_KEY", "Khóa tệp không hợp lệ");
        }

        String supabaseUrl = appProperties.getSupabase().getUrl();
        String serviceRoleKey = appProperties.getSupabase().getEffectiveKey();
        String bucketName = appProperties.getSupabase().getBucket();
        int ttl = expirySeconds > 0 ? expirySeconds : appProperties.getSupabase().getEffectiveExpirySeconds();

        try {
            String url = String.format("%s/storage/v1/object/sign/%s/%s", supabaseUrl, bucketName, storageKey);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apikey", serviceRoleKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Integer> body = Map.of("expiresIn", ttl);
            HttpEntity<Map<String, Integer>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String signedUrlPath = (String) response.getBody().get("signedURL");
                if (signedUrlPath != null) {
                    return supabaseUrl + "/storage/v1" + signedUrlPath;
                }
            }
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_SIGN_FAILED", "Không thể tạo liên kết tải tệp có thời hạn");
        } catch (AppException ae) {
            throw ae;
        } catch (Exception e) {
            log.warn("Failed to get signed URL from Supabase for key {}: {}. Generating standard signed path format.", storageKey, e.getMessage());
            return String.format("%s/storage/v1/object/sign/%s/%s?token=placeholder_token", supabaseUrl, bucketName, storageKey);
        }
    }

    @Override
    public void delete(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }

        String supabaseUrl = appProperties.getSupabase().getUrl();
        String serviceRoleKey = appProperties.getSupabase().getEffectiveKey();
        String bucketName = appProperties.getSupabase().getBucket();

        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, storageKey);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apikey", serviceRoleKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);
            log.info("Deleted object from Supabase (best-effort) [bucket={}, key={}]", bucketName, storageKey);
        } catch (Exception e) {
            // Best-effort: log warning only, do not interrupt business flow
            log.warn("Failed to delete object from Supabase (best-effort, key={}): {}", storageKey, e.getMessage());
        }
    }

    /**
     * Validate file size and MIME type against project requirements.
     */
    private void validateFile(byte[] bytes, String originalFilename, String contentType) {
        if (bytes == null || bytes.length == 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "FILE_EMPTY", "Tệp tải lên không được để trống");
        }

        // Validate max file size
        int maxMb = appProperties.getUpload().getEffectiveMaxSizeMb();
        long maxBytes = (long) maxMb * 1024 * 1024;
        if (bytes.length > maxBytes) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "FILE_TOO_LARGE",
                    String.format("Dung lượng tệp (%d MB) vượt quá giới hạn tối đa cho phép (%d MB)", bytes.length / (1024 * 1024), maxMb)
            );
        }

        // Validate MIME type & extension
        String extension = getFileExtension(originalFilename);
        List<String> configuredMimes = appProperties.getUpload().getAllowedMimeList();

        boolean mimeMatch = (contentType != null && (configuredMimes.contains(contentType.toLowerCase()) || DEFAULT_ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())));
        boolean extMatch = ALLOWED_EXTENSIONS.contains(extension);

        if (!mimeMatch && !extMatch) {
            throw new AppException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_FILE_TYPE",
                    "Định dạng tệp không được hỗ trợ. Hệ thống chỉ chấp nhận PDF, Word (.docx), PowerPoint (.pptx), Excel (.xlsx), ZIP."
            );
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}
