package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.FileUploadResponse;
import com.cntt.academicdocs.dto.SignedUrlResponse;
import com.cntt.academicdocs.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@Tag(name = "File Management", description = "Endpoints for uploading attachments and generating time-limited signed access URLs")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a file (PDF, Word, PPTX, Excel, ZIP) to Supabase Storage")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadFile(
            @Parameter(description = "Binary multipart file", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Optional document ID to attach file to")
            @RequestParam(value = "documentId", required = false) Long documentId,
            @Parameter(description = "Mark as primary document file (true/false)")
            @RequestParam(value = "isPrimary", required = false, defaultValue = "false") Boolean isPrimary,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        boolean isAdmin = checkIsAdmin(authentication);
        FileUploadResponse response = fileService.uploadFile(file, documentId, isPrimary, currentUserId, isAdmin);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tải tệp lên thành công", response));
    }

    @GetMapping("/{fileId}/preview-url")
    @Operation(summary = "Get a time-limited Signed URL to view/preview a file (TTL 300s)")
    public ResponseEntity<ApiResponse<SignedUrlResponse>> getPreviewUrl(
            @PathVariable Long fileId,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        boolean isAdmin = checkIsAdmin(authentication);
        SignedUrlResponse response = fileService.getPreviewUrl(fileId, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Tạo liên kết xem tệp thành công", response));
    }

    @GetMapping("/{fileId}/download-url")
    @Operation(summary = "Get a time-limited Signed URL to download a file and increment download count")
    public ResponseEntity<ApiResponse<SignedUrlResponse>> getDownloadUrl(
            @PathVariable Long fileId,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        boolean isAdmin = checkIsAdmin(authentication);
        SignedUrlResponse response = fileService.getDownloadUrl(fileId, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Tạo liên kết tải tệp thành công", response));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Delete an uploaded file (owner only, document must be in DRAFT/REJECTED state)")
    public ResponseEntity<ApiResponse<Void>> deleteFile(
            @PathVariable Long fileId,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        boolean isAdmin = checkIsAdmin(authentication);
        fileService.deleteFile(fileId, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Xóa tệp thành công", null));
    }

    private boolean checkIsAdmin(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null) {
            return false;
        }
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}
