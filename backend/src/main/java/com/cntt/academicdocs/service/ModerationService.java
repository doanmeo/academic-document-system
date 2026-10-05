package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentReview;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.dto.DocumentReviewDTO;
import com.cntt.academicdocs.dto.FileUploadResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.DocumentReviewRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ModerationService {

    private final DocumentRepository documentRepository;
    private final DocumentFileRepository documentFileRepository;
    private final DocumentReviewRepository documentReviewRepository;
    private final UserRepository userRepository;

    public ModerationService(
            DocumentRepository documentRepository,
            DocumentFileRepository documentFileRepository,
            DocumentReviewRepository documentReviewRepository,
            UserRepository userRepository
    ) {
        this.documentRepository = documentRepository;
        this.documentFileRepository = documentFileRepository;
        this.documentReviewRepository = documentReviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getPendingDocuments() {
        return documentRepository.findAll().stream()
                .filter(d -> d.getStatus() == DocumentStatus.PENDING)
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public DocumentResponse approveDocument(Long documentId, String note, Long adminId) {
        Document document = findDocumentOrThrow(documentId);

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể phê duyệt tài liệu đang ở trạng thái PENDING");
        }

        String fromStatus = document.getStatus().name();
        document.setStatus(DocumentStatus.APPROVED);
        document.setRejectionNote(null);
        Document saved = documentRepository.save(document);

        // Record moderation history
        DocumentReview review = new DocumentReview(
                documentId,
                adminId != null ? adminId : 0L,
                fromStatus,
                DocumentStatus.APPROVED.name(),
                note != null && !note.isBlank() ? note : "Tài liệu đạt yêu cầu và được phê duyệt"
        );
        documentReviewRepository.save(review);

        return mapToResponse(saved);
    }

    @Transactional
    public DocumentResponse rejectDocument(Long documentId, String note, Long adminId) {
        if (note == null || note.trim().length() < 5) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_REJECTION_NOTE", "Lý do từ chối không được để trống và phải có ít nhất 5 ký tự");
        }

        Document document = findDocumentOrThrow(documentId);

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể từ chối tài liệu đang ở trạng thái PENDING");
        }

        String fromStatus = document.getStatus().name();
        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionNote(note.trim());
        Document saved = documentRepository.save(document);

        // Record moderation history
        DocumentReview review = new DocumentReview(
                documentId,
                adminId != null ? adminId : 0L,
                fromStatus,
                DocumentStatus.REJECTED.name(),
                note.trim()
        );
        documentReviewRepository.save(review);

        return mapToResponse(saved);
    }

    @Transactional
    public DocumentResponse hideDocument(Long documentId, String reason, Long adminId) {
        Document document = findDocumentOrThrow(documentId);

        String fromStatus = document.getStatus().name();
        document.setStatus(DocumentStatus.HIDDEN);
        Document saved = documentRepository.save(document);

        // Record moderation history
        DocumentReview review = new DocumentReview(
                documentId,
                adminId != null ? adminId : 0L,
                fromStatus,
                DocumentStatus.HIDDEN.name(),
                reason != null && !reason.isBlank() ? reason : "Tài liệu bị ẩn do vi phạm quy định hoặc theo yêu cầu quản trị"
        );
        documentReviewRepository.save(review);

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<DocumentReviewDTO> getDocumentReviews(Long documentId) {
        findDocumentOrThrow(documentId);

        List<DocumentReview> reviews = documentReviewRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
        return reviews.stream().map(r -> {
            String reviewerName = "Quản trị viên";
            if (r.getReviewerId() != null && r.getReviewerId() > 0) {
                User reviewer = userRepository.findById(r.getReviewerId()).orElse(null);
                if (reviewer != null && reviewer.getFullName() != null) {
                    reviewerName = reviewer.getFullName();
                }
            }
            return new DocumentReviewDTO(
                    r.getId(),
                    r.getDocumentId(),
                    r.getReviewerId(),
                    reviewerName,
                    r.getFromStatus(),
                    r.getToStatus(),
                    r.getComment(),
                    r.getCreatedAt()
            );
        }).toList();
    }

    private Document findDocumentOrThrow(Long documentId) {
        return documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));
    }

    private DocumentResponse mapToResponse(Document document) {
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
