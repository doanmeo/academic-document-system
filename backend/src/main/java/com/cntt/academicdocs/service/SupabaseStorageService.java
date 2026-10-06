package com.cntt.academicdocs.service;

import com.cntt.academicdocs.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class SupabaseStorageService implements FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String bucketName;
    private final int defaultExpirySeconds;
    private final RestTemplate restTemplate;

    public SupabaseStorageService(
            @Value("${app.supabase.url:https://placeholder.supabase.co}") String supabaseUrl,
            @Value("${app.supabase.key:dummy_key}") String serviceRoleKey,
            @Value("${app.supabase.bucket:documents}") String bucketName,
            @Value("${app.supabase.url-expiry:300}") int defaultExpirySeconds
    ) {
        this.supabaseUrl = supabaseUrl;
        this.serviceRoleKey = serviceRoleKey;
        this.bucketName = bucketName;
        this.defaultExpirySeconds = defaultExpirySeconds;
        this.restTemplate = new RestTemplate();
    }

    @Override
    public String upload(MultipartFile file, String storagePath) {
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, storagePath);

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apikey", serviceRoleKey);
            headers.setContentType(MediaType.parseMediaType(
                    file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE
            ));

            HttpEntity<byte[]> requestEntity = new HttpEntity<>(file.getBytes(), headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return storagePath;
            } else {
                throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_UPLOAD_FAILED", "Không thể tải tệp lên hệ thống lưu trữ");
            }
        } catch (Exception e) {
            log.error("Failed to upload file to Supabase: {}", e.getMessage());
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_ERROR", "Lỗi lưu trữ tệp: " + e.getMessage());
        }
    }

    @Override
    public String createSignedUrl(String storageKey, int expirySeconds) {
        try {
            int ttl = expirySeconds > 0 ? expirySeconds : defaultExpirySeconds;
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
            throw new BusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "STORAGE_SIGN_FAILED", "Không thể tạo liên kết tải tệp");
        } catch (Exception e) {
            log.warn("Using placeholder signed URL fallback: {}", e.getMessage());
            return String.format("%s/storage/v1/object/public/%s/%s", supabaseUrl, bucketName, storageKey);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            String url = String.format("%s/storage/v1/object/%s/%s", supabaseUrl, bucketName, storageKey);
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + serviceRoleKey);
            headers.set("apikey", serviceRoleKey);

            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            restTemplate.exchange(url, HttpMethod.DELETE, requestEntity, String.class);
        } catch (Exception e) {
            log.warn("Failed to delete object from Supabase (best-effort): {}", e.getMessage());
        }
    }
}
