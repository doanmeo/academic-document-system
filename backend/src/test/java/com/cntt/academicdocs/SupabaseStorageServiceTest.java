package com.cntt.academicdocs;

import com.cntt.academicdocs.config.AppProperties;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.service.SupabaseStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

class SupabaseStorageServiceTest {

    private SupabaseStorageService storageService;
    private AppProperties appProperties;

    @BeforeEach
    void setUp() {
        appProperties = new AppProperties();
        appProperties.getSupabase().setUrl("https://test.supabase.co");
        appProperties.getSupabase().setKey("test_key");
        appProperties.getSupabase().setBucket("documents");
        appProperties.getSupabase().setUrlExpiry(300);
        appProperties.getUpload().setMaxSize(50);
        appProperties.getUpload().setMaxFileSizeMb(50);
        appProperties.getUpload().setAllowedMime("application/pdf,application/zip");

        storageService = new SupabaseStorageService(appProperties);
    }

    @Test
    @DisplayName("Should reject empty file with FILE_EMPTY")
    void shouldRejectEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file", "empty.pdf", "application/pdf", new byte[0]
        );

        AppException ex = assertThrows(AppException.class, () ->
                storageService.upload(emptyFile, "temp")
        );
        assertEquals("FILE_EMPTY", ex.getCode());
    }

    @Test
    @DisplayName("Should reject invalid MIME type/extension with INVALID_FILE_TYPE")
    void shouldRejectInvalidFileType() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "danger.exe", "application/x-msdownload", "malicious content".getBytes()
        );

        AppException ex = assertThrows(AppException.class, () ->
                storageService.upload(exeFile, "temp")
        );
        assertEquals("INVALID_FILE_TYPE", ex.getCode());
    }

    @Test
    @DisplayName("Should reject oversized file with FILE_TOO_LARGE")
    void shouldRejectOversizedFile() {
        // Set max size to 1MB for test
        appProperties.getUpload().setMaxFileSizeMb(1);
        appProperties.getUpload().setMaxSize(1);

        byte[] largeBytes = new byte[2 * 1024 * 1024]; // 2MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file", "large.pdf", "application/pdf", largeBytes
        );

        AppException ex = assertThrows(AppException.class, () ->
                storageService.upload(largeFile, "temp")
        );
        assertEquals("FILE_TOO_LARGE", ex.getCode());
    }

    @Test
    @DisplayName("Should reject empty storage key when creating signed url")
    void shouldRejectEmptyStorageKeyForSignedUrl() {
        AppException ex = assertThrows(AppException.class, () ->
                storageService.createSignedUrl("", 300)
        );
        assertEquals("INVALID_STORAGE_KEY", ex.getCode());
    }

    @Test
    @DisplayName("Should not throw exception when deleting non-existent file (best-effort)")
    void shouldNotThrowExceptionOnDelete() {
        assertDoesNotThrow(() -> storageService.delete("non_existent_key.pdf"));
        assertDoesNotThrow(() -> storageService.delete(null));
    }
}
