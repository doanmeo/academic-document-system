package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.FileUploadResponse;
import com.cntt.academicdocs.dto.SignedUrlResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Objects;

@Service
public class FileService {

    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    private final FileStorageService fileStorageService;
    private final DocumentFileRepository documentFileRepository;
    private final DocumentRepository documentRepository;

    public FileService(
            FileStorageService fileStorageService,
            DocumentFileRepository documentFileRepository,
            DocumentRepository documentRepository
    ) {
        this.fileStorageService = fileStorageService;
        this.documentFileRepository = documentFileRepository;
        this.documentRepository = documentRepository;
    }

    /**
     * Upload a file and link with an optional document.
     */
    @Transactional
    public FileUploadResponse uploadFile(
            MultipartFile file,
            Long documentId,
            Boolean isPrimary,
            Long currentUserId,
            boolean isAdmin
    ) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để tải tệp lên");
        }

        Document document = null;
        if (documentId != null) {
            document = documentRepository.findById(documentId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

            // Ownership check
            if (!isAdmin && !Objects.equals(document.getCreatedBy(), currentUserId)) {
                throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền đính kèm tệp vào tài liệu này");
            }

            // Status check: only DRAFT and REJECTED can be modified
            if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể đính kèm tệp vào tài liệu ở trạng thái DRAFT hoặc REJECTED");
            }
        }

        // Upload to storage (folderKey: documentId or 'temp')
        String folderKey = (documentId != null) ? String.valueOf(documentId) : "temp";
        String storageKey = fileStorageService.upload(file, folderKey);

        // Save metadata to DB
        DocumentFile docFile = new DocumentFile();
        docFile.setDocumentId(documentId);
        docFile.setFileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "unnamed_file");
        docFile.setStorageKey(storageKey);
        docFile.setMimeType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
        docFile.setFileSize(file.getSize());
        docFile.setIsPrimary(isPrimary != null && isPrimary);
        docFile.setCreatedBy(currentUserId);

        DocumentFile saved = documentFileRepository.save(docFile);

        return new FileUploadResponse(
                saved.getId(),
                saved.getFileName(),
                saved.getStorageKey(),
                saved.getMimeType(),
                saved.getFileSize(),
                saved.getIsPrimary(),
                saved.getDocumentId()
        );
    }

    /**
     * Get preview signed URL for a file.
     */
    @Transactional(readOnly = true)
    public SignedUrlResponse getPreviewUrl(Long fileId, Long currentUserId, boolean isAdmin) {
        DocumentFile docFile = checkFileAccessPermission(fileId, currentUserId, isAdmin);
        String signedUrl = fileStorageService.createSignedUrl(docFile.getStorageKey(), 300);

        return new SignedUrlResponse(
                docFile.getId(),
                docFile.getFileName(),
                signedUrl,
                300
        );
    }

    /**
     * Get download signed URL for a file and increment download count.
     */
    @Transactional
    public SignedUrlResponse getDownloadUrl(Long fileId, Long currentUserId, boolean isAdmin) {
        DocumentFile docFile = checkFileAccessPermission(fileId, currentUserId, isAdmin);

        // Increment download count if attached to document
        if (docFile.getDocumentId() != null) {
            try {
                documentRepository.incrementDownloadCount(docFile.getDocumentId());
            } catch (Exception e) {
                log.warn("Failed to increment download count for document id {}: {}", docFile.getDocumentId(), e.getMessage());
            }
        }

        String signedUrl = fileStorageService.createSignedUrl(docFile.getStorageKey(), 300);

        return new SignedUrlResponse(
                docFile.getId(),
                docFile.getFileName(),
                signedUrl,
                300
        );
    }

    /**
     * Delete an attached file.
     */
    @Transactional
    public void deleteFile(Long fileId, Long currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để thực hiện thao tác này");
        }

        DocumentFile docFile = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Không tìm thấy tệp đính kèm"));

        // Creator check
        if (!isAdmin && !Objects.equals(docFile.getCreatedBy(), currentUserId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xóa tệp này");
        }

        // If attached to document, check document status
        if (docFile.getDocumentId() != null) {
            Document document = documentRepository.findById(docFile.getDocumentId()).orElse(null);
            if (document != null && document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED && !isAdmin) {
                throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Không thể xóa tệp của tài liệu đã nộp hoặc đã được phê duyệt");
            }
        }

        // Delete from Storage (best-effort)
        fileStorageService.delete(docFile.getStorageKey());

        // Delete from DB
        documentFileRepository.delete(docFile);
    }

    /**
     * Helper to verify access permission for file download/preview.
     */
    private DocumentFile checkFileAccessPermission(Long fileId, Long currentUserId, boolean isAdmin) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để truy cập tệp");
        }

        DocumentFile docFile = documentFileRepository.findById(fileId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "FILE_NOT_FOUND", "Không tìm thấy tệp đính kèm"));

        if (isAdmin) {
            return docFile;
        }

        // If file creator is current user -> allowed
        if (Objects.equals(docFile.getCreatedBy(), currentUserId)) {
            return docFile;
        }

        // If file is attached to a document
        if (docFile.getDocumentId() != null) {
            Document document = documentRepository.findById(docFile.getDocumentId()).orElse(null);
            if (document != null) {
                // Anyone logged in can view APPROVED documents
                if (document.getStatus() == DocumentStatus.APPROVED) {
                    return docFile;
                }
                // Document owner can view
                if (Objects.equals(document.getCreatedBy(), currentUserId)) {
                    return docFile;
                }
            }
        }

        throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem hoặc tải tệp này");
    }
}
