package com.cntt.academicdocs.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

/**
 * Type-safe configuration properties mapped from application.yml (prefix: 'app')
 * Used across the system for JWT, CORS, Supabase Storage, and File Upload constraints.
 */
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private Supabase supabase = new Supabase();
    private Upload upload = new Upload();

    public Jwt getJwt() {
        return jwt;
    }

    public void setJwt(Jwt jwt) {
        this.jwt = jwt;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Supabase getSupabase() {
        return supabase;
    }

    public void setSupabase(Supabase supabase) {
        this.supabase = supabase;
    }

    public Upload getUpload() {
        return upload;
    }

    public void setUpload(Upload upload) {
        this.upload = upload;
    }

    // =========================================================================
    // Nested Property Classes
    // =========================================================================

    public static class Jwt {
        private String secret = "change_me_to_long_random_string_at_least_32_chars";
        private long expirationMs = 86400000L;
        private long accessExpirationMs = 3600000L;
        private long refreshExpirationMs = 604800000L;

        public String getSecret() {
            return secret;
        }

        public void setSecret(String secret) {
            this.secret = secret;
        }

        public long getExpirationMs() {
            return expirationMs;
        }

        public void setExpirationMs(long expirationMs) {
            this.expirationMs = expirationMs;
        }

        public long getAccessExpirationMs() {
            return accessExpirationMs;
        }

        public void setAccessExpirationMs(long accessExpirationMs) {
            this.accessExpirationMs = accessExpirationMs;
        }

        public long getRefreshExpirationMs() {
            return refreshExpirationMs;
        }

        public void setRefreshExpirationMs(long refreshExpirationMs) {
            this.refreshExpirationMs = refreshExpirationMs;
        }
    }

    public static class Cors {
        private String allowedOrigins = "http://localhost:5173";

        public String getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(String allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class Supabase {
        private String url = "https://placeholder.supabase.co";
        private String key = "your_service_role_key";
        private String serviceRoleKey;
        private String bucket = "documents";
        private int urlExpiry = 300;
        private int signedUrlExpirySeconds = 300;

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getServiceRoleKey() {
            return serviceRoleKey;
        }

        public void setServiceRoleKey(String serviceRoleKey) {
            this.serviceRoleKey = serviceRoleKey;
        }

        public String getBucket() {
            return bucket;
        }

        public void setBucket(String bucket) {
            this.bucket = bucket;
        }

        public int getUrlExpiry() {
            return urlExpiry;
        }

        public void setUrlExpiry(int urlExpiry) {
            this.urlExpiry = urlExpiry;
        }

        public int getSignedUrlExpirySeconds() {
            return signedUrlExpirySeconds;
        }

        public void setSignedUrlExpirySeconds(int signedUrlExpirySeconds) {
            this.signedUrlExpirySeconds = signedUrlExpirySeconds;
        }

        /**
         * Get effective secret key, supporting both 'key' and 'serviceRoleKey' properties.
         */
        public String getEffectiveKey() {
            if (serviceRoleKey != null && !serviceRoleKey.isBlank()) {
                return serviceRoleKey;
            }
            return key;
        }

        /**
         * Get effective signed URL TTL in seconds.
         */
        public int getEffectiveExpirySeconds() {
            if (signedUrlExpirySeconds > 0) {
                return signedUrlExpirySeconds;
            }
            return urlExpiry > 0 ? urlExpiry : 300;
        }
    }

    public static class Upload {
        private int maxSize = 20;
        private int maxFileSizeMb = 20;
        private String allowedMime = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/zip";
        private String allowedMimeTypes;

        public int getMaxSize() {
            return maxSize;
        }

        public void setMaxSize(int maxSize) {
            this.maxSize = maxSize;
        }

        public int getMaxFileSizeMb() {
            return maxFileSizeMb;
        }

        public void setMaxFileSizeMb(int maxFileSizeMb) {
            this.maxFileSizeMb = maxFileSizeMb;
        }

        public String getAllowedMime() {
            return allowedMime;
        }

        public void setAllowedMime(String allowedMime) {
            this.allowedMime = allowedMime;
        }

        public String getAllowedMimeTypes() {
            return allowedMimeTypes;
        }

        public void setAllowedMimeTypes(String allowedMimeTypes) {
            this.allowedMimeTypes = allowedMimeTypes;
        }

        public int getEffectiveMaxSizeMb() {
            return maxFileSizeMb > 0 ? maxFileSizeMb : maxSize;
        }

        public List<String> getAllowedMimeList() {
            String raw = allowedMimeTypes != null && !allowedMimeTypes.isBlank() ? allowedMimeTypes : allowedMime;
            if (raw == null || raw.isBlank()) {
                return List.of("application/pdf");
            }
            return Arrays.stream(raw.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }
}
