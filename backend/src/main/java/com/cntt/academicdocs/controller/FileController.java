package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.DocumentFileDTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.FileService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "Tải lên, xem trực tuyến và tải xuống tệp tài liệu")
public class FileController {

    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên tệp tài liệu")
    public ResponseEntity<ApiResponse<DocumentFileDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentId", required = false) Long documentId,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        }

        DocumentFileDTO dto = fileService.uploadFile(file, documentId, isPrimary, userId, SecurityUtils.isAdmin());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto, "Tải tệp lên thành công"));
    }

    @GetMapping("/{fileId}/preview-url")
    @Operation(summary = "Lấy URL xem trước tài liệu PDF an toàn (Signed URL)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPreviewUrl(@PathVariable Long fileId) {
        Map<String, Object> result = fileService.getPreviewUrl(
                fileId,
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.isAdmin()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping(value = "/{fileId}/view", produces = {MediaType.APPLICATION_OCTET_STREAM_VALUE, MediaType.APPLICATION_PDF_VALUE})
    @Operation(summary = "Xem trực tuyến nội dung PDF dạng stream (không kích hoạt IDM)")
    public ResponseEntity<byte[]> viewFileInline(@PathVariable Long fileId) {
        byte[] pdfBytes = fileService.getFileBytes(
                fileId,
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.isAdmin()
        );

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline");
        headers.set("X-Content-Type-Options", "nosniff");
        headers.setCacheControl(org.springframework.http.CacheControl.noCache().getHeaderValue());

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/{fileId}/download-url")
    @Operation(summary = "Lấy URL tải xuống tài liệu và tăng lượt tải")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDownloadUrl(@PathVariable Long fileId) {
        Map<String, Object> result = fileService.getDownloadUrl(
                fileId,
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.isAdmin()
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @DeleteMapping("/{fileId}")
    @Operation(summary = "Xóa tệp đính kèm")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long fileId) {
        fileService.deleteFile(
                fileId,
                SecurityUtils.getCurrentUserId(),
                SecurityUtils.isAdmin()
        );
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa tệp thành công"));
    }
}
