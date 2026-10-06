package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.DocumentFileDTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.service.FileStorageService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "Tải lên, xem trực tuyến và tải xuống tệp tài liệu")
public class FileController {

    private final FileStorageService fileStorageService;
    private final DocumentFileRepository documentFileRepository;
    private final DocumentRepository documentRepository;

    public FileController(
            FileStorageService fileStorageService,
            DocumentFileRepository documentFileRepository,
            DocumentRepository documentRepository
    ) {
        this.fileStorageService = fileStorageService;
        this.documentFileRepository = documentFileRepository;
        this.documentRepository = documentRepository;
    }

    @Value("${app.upload.max-size:20}")
    private long maxFileSizeMb;

    @Value("${app.upload.allowed-mime:application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/zip}")
    private String allowedMimeTypes;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải lên tệp tài liệu")
    public ResponseEntity<ApiResponse<DocumentFileDTO>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentId", required = false) Long documentId,
            @RequestParam(value = "isPrimary", defaultValue = "false") boolean isPrimary
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");

        if (file.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "EMPTY_FILE", "Tệp tải lên không được để trống");
        }

        // Validate size
        if (file.getSize() > maxFileSizeMb * 1024 * 1024) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "FILE_TOO_LARGE", "Kích thước tệp vượt quá giới hạn " + maxFileSizeMb + "MB");
        }

        // Validate MIME type
        String contentType = file.getContentType();
        List<String> allowedList = Arrays.asList(allowedMimeTypes.split(","));
        if (contentType == null || !allowedList.contains(contentType.trim())) {
            // Also check file extension as fallback
            String originalName = file.getOriginalFilename();
            if (originalName == null || (!originalName.toLowerCase().endsWith(".pdf") && !originalName.toLowerCase().endsWith(".docx") && !originalName.toLowerCase().endsWith(".pptx") && !originalName.toLowerCase().endsWith(".zip"))) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_FILE_TYPE", "Định dạng tệp không được hỗ trợ");
            }
        }

        Document document = null;
        if (documentId != null) {
            document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

            if (!document.getUploader().getId().equals(userId) && !SecurityUtils.isAdmin()) {
                throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không phải chủ sở hữu tài liệu");
            }

            if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED && document.getStatus() != DocumentStatus.REVISION_REQUIRED && !SecurityUtils.isAdmin()) {
                throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể tải tệp lên tài liệu ở trạng thái Nháp hoặc Yêu cầu bổ sung");
            }
        }

        String extension = "";
        String orig = file.getOriginalFilename();
        if (orig != null && orig.contains(".")) {
            extension = orig.substring(orig.lastIndexOf("."));
        }

        String docPath = documentId != null ? String.valueOf(documentId) : "temp_" + userId;
        String storagePath = docPath + "/" + UUID.randomUUID() + extension;
        String storageKey = fileStorageService.upload(file, storagePath);

        DocumentFile docFile = new DocumentFile();
        docFile.setDocument(document);
        docFile.setFileName(file.getOriginalFilename());
        docFile.setStorageKey(storageKey);
        docFile.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        docFile.setFileSize(file.getSize());
        docFile.setIsPrimary(isPrimary);

        DocumentFile saved = documentFileRepository.save(docFile);

        DocumentFileDTO dto = new DocumentFileDTO();
        dto.setId(saved.getId());
        dto.setDocumentId(documentId);
        dto.setFileName(saved.getFileName());
        dto.setStorageKey(saved.getStorageKey());
        dto.setMimeType(saved.getMimeType());
        dto.setFileSize(saved.getFileSize());
        dto.setIsPrimary(saved.getIsPrimary());
        dto.setCreatedAt(saved.getCreatedAt());

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto, "Tải tệp lên thành công"));
    }

    @GetMapping("/{fileId}/preview-url")
    @Transactional(readOnly = true)
    @Operation(summary = "Lấy URL xem trước tài liệu PDF an toàn (Signed URL)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPreviewUrl(@PathVariable Long fileId) {
        DocumentFile file = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Không tìm thấy tệp"));

        checkFileAccess(file);

        String signedUrl = fileStorageService.createSignedUrl(file.getStorageKey(), 300);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", signedUrl, "expiresIn", 300)));
    }

    @GetMapping("/{fileId}/download-url")
    @Transactional
    @Operation(summary = "Lấy URL tải xuống tài liệu và tăng lượt tải")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDownloadUrl(@PathVariable Long fileId) {
        DocumentFile file = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Không tìm thấy tệp"));

        checkFileAccess(file);

        if (file.getDocument() != null) {
            documentRepository.incrementDownloadCount(file.getDocument().getId());
        }

        String signedUrl = fileStorageService.createSignedUrl(file.getStorageKey(), 300);
        return ResponseEntity.ok(ApiResponse.success(Map.of("url", signedUrl, "expiresIn", 300)));
    }

    @DeleteMapping("/{fileId}")
    @Transactional
    @Operation(summary = "Xóa tệp đính kèm")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long fileId) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");

        DocumentFile file = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Không tìm thấy tệp"));

        if (file.getDocument() == null) {
            if (!SecurityUtils.isAdmin()) {
                throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền xóa tệp này");
            }
        } else if (!file.getDocument().getUploader().getId().equals(userId) && !SecurityUtils.isAdmin()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền xóa tệp này");
        }

        try {
            fileStorageService.delete(file.getStorageKey());
        } catch (Exception ignored) {}

        documentFileRepository.delete(file);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa tệp thành công"));
    }

    private void checkFileAccess(DocumentFile file) {
        Document document = file.getDocument();
        if (document == null) {
            if (!SecurityUtils.isAdmin()) {
                throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền truy cập tệp tin này");
            }
            return;
        }

        boolean isApproved = document.getStatus() == DocumentStatus.APPROVED;
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isOwner = currentUserId != null && document.getUploader() != null && currentUserId.equals(document.getUploader().getId());
        boolean isAdmin = SecurityUtils.isAdmin();

        if (!isApproved && !isOwner && !isAdmin) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền truy cập tệp tin này");
        }
    }
}
