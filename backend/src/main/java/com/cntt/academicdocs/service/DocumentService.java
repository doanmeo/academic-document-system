package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.CreateDocumentRequest;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.dto.FileUploadResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFileRepository documentFileRepository;

    public DocumentService(DocumentRepository documentRepository, DocumentFileRepository documentFileRepository) {
        this.documentRepository = documentRepository;
        this.documentFileRepository = documentFileRepository;
    }

    @Transactional
    public DocumentResponse createDocument(CreateDocumentRequest request, Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để tạo tài liệu");
        }

        Document document = new Document();
        document.setTitle(request.getTitle());
        document.setAbstractText(request.getAbstractText());
        document.setDescription(request.getDescription());
        document.setDocumentTypeId(request.getDocumentTypeId());
        document.setSubjectId(request.getSubjectId());
        document.setMajorId(request.getMajorId());
        document.setAcademicYearId(request.getAcademicYearId());
        document.setAdvisorName(request.getAdvisorName());
        document.setGithubUrl(request.getGithubUrl());
        document.setCreatedBy(currentUserId);
        document.setStatus(DocumentStatus.DRAFT);

        Document saved = documentRepository.save(document);
        return mapToResponse(saved);
    }

    @Transactional
    public DocumentResponse submitDocument(Long documentId, Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!Objects.equals(document.getCreatedBy(), currentUserId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không phải tác giả tài liệu này");
        }

        if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể nộp duyệt tài liệu ở trạng thái DRAFT hoặc REJECTED");
        }

        document.setStatus(DocumentStatus.PENDING);
        Document updated = documentRepository.save(document);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getMyDocuments(Long currentUserId) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }
        return documentRepository.findByCreatedBy(currentUserId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getPendingDocuments() {
        return documentRepository.findAll().stream()
                .filter(d -> d.getStatus() == DocumentStatus.PENDING)
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public DocumentResponse approveDocument(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể phê duyệt tài liệu ở trạng thái PENDING");
        }

        document.setStatus(DocumentStatus.APPROVED);
        document.setRejectionNote(null);
        Document updated = documentRepository.save(document);
        return mapToResponse(updated);
    }

    @Transactional
    public DocumentResponse rejectDocument(Long documentId, String note) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể từ chối tài liệu ở trạng thái PENDING");
        }

        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionNote(note != null ? note : "Tài liệu không đạt yêu cầu");
        Document updated = documentRepository.save(document);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentDetail(Long documentId, Long currentUserId, boolean isAdmin) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!isAdmin && !Objects.equals(document.getCreatedBy(), currentUserId) && document.getStatus() != DocumentStatus.APPROVED) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem tài liệu này");
        }

        return mapToResponse(document);
    }

    public DocumentResponse mapToResponse(Document document) {
        DocumentResponse res = new DocumentResponse();
        res.setId(document.getId());
        res.setTitle(document.getTitle());
        res.setAbstractText(document.getAbstractText());
        res.setDescription(document.getDescription());
        res.setDocumentTypeId(document.getDocumentTypeId());
        res.setSubjectId(document.getSubjectId());
        res.setMajorId(document.getMajorId());
        res.setAcademicYearId(document.getAcademicYearId());
        res.setAdvisorName(document.getAdvisorName());
        res.setGithubUrl(document.getGithubUrl());
        res.setCreatedBy(document.getCreatedBy());
        res.setStatus(document.getStatus());
        res.setRejectionNote(document.getRejectionNote());
        res.setViewCount(document.getViewCount());
        res.setDownloadCount(document.getDownloadCount());
        res.setCreatedAt(document.getCreatedAt());
        res.setUpdatedAt(document.getUpdatedAt());

        List<DocumentFile> files = documentFileRepository.findByDocumentId(document.getId());
        res.setFiles(files.stream().map(f -> new FileUploadResponse(
                f.getId(),
                f.getFileName(),
                f.getStorageKey(),
                f.getMimeType(),
                f.getFileSize(),
                f.getIsPrimary(),
                f.getDocumentId()
        )).toList());

        return res;
    }
}
