package com.cntt.academicdocs;

import com.cntt.academicdocs.service.SupabaseStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SupabaseStorageServiceTest {

    private SupabaseStorageService storageService;

    @BeforeEach
    void setUp() {
        storageService = new SupabaseStorageService(
                "https://test.supabase.co",
                "test_key",
                "documents",
                300
        );
    }

    @Test
    @DisplayName("Should create fallback signed url when external call fails")
    void shouldCreateSignedUrlFallback() {
        String url = storageService.createSignedUrl("sample.pdf", 300);
        assertNotNull(url);
        assertTrue(url.contains("sample.pdf"));
    }

    @Test
    @DisplayName("Should not throw exception when deleting non-existent file (best-effort)")
    void shouldNotThrowExceptionOnDelete() {
        assertDoesNotThrow(() -> storageService.delete("non_existent_key.pdf"));
        assertDoesNotThrow(() -> storageService.delete(null));
    }
}
