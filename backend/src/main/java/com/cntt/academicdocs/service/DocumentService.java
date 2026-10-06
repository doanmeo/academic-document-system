package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.*;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentFileRepository documentFileRepository;
    private final DocumentMemberRepository documentMemberRepository;
    private final DocumentTechnologyRepository documentTechnologyRepository;
    private final DocumentReviewRepository documentReviewRepository;
    private final BookmarkRepository bookmarkRepository;
    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final MajorRepository majorRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TechnologyRepository technologyRepository;
    private final LovValueRepository lovValueRepository;

    public DocumentService(
            DocumentRepository documentRepository,
            DocumentFileRepository documentFileRepository,
            DocumentMemberRepository documentMemberRepository,
            DocumentTechnologyRepository documentTechnologyRepository,
            DocumentReviewRepository documentReviewRepository,
            BookmarkRepository bookmarkRepository,
            RatingRepository ratingRepository,
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            MajorRepository majorRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository,
            LovValueRepository lovValueRepository
    ) {
        this.documentRepository = documentRepository;
        this.documentFileRepository = documentFileRepository;
        this.documentMemberRepository = documentMemberRepository;
        this.documentTechnologyRepository = documentTechnologyRepository;
        this.documentReviewRepository = documentReviewRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.ratingRepository = ratingRepository;
        this.userRepository = userRepository;
        this.subjectRepository = subjectRepository;
        this.majorRepository = majorRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
        this.lovValueRepository = lovValueRepository;
    }

    @Transactional
    public DocumentDetailDTO createDocument(CreateDocumentRequest req, Long userId) {
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Subject subject = subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Môn học không tồn tại"));

        AcademicYear academicYear = academicYearRepository.findById(req.getAcademicYearId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ACADEMIC_YEAR_NOT_FOUND", "Năm học không tồn tại"));

        Major major = null;
        if (req.getMajorId() != null) {
            major = majorRepository.findById(req.getMajorId()).orElse(null);
        }

        Document document = new Document();
        document.setTitle(req.getTitle());
        document.setAbstractText(req.getAbstractText());
        document.setDescription(req.getDescription());
        document.setDocumentTypeCode(req.getDocumentTypeCode());
        document.setStatus(DocumentStatus.DRAFT);
        document.setUploader(uploader);
        document.setSubject(subject);
        document.setAcademicYear(academicYear);
        document.setMajor(major);
        document.setAdvisorName(req.getAdvisorName());
        document.setGithubUrl(req.getGithubUrl());
        document.setGitlabUrl(req.getGitlabUrl());
        document.setViewCount(0);
        document.setDownloadCount(0);
        document.setAvgRating(0.0);
        document.setRatingCount(0);

        Document saved = documentRepository.save(document);

        // Add creator as leader member
        DocumentMember leader = new DocumentMember();
        leader.setDocument(saved);
        leader.setUser(uploader);
        leader.setMemberOrder(0);
        leader.setIsLeader(true);
        documentMemberRepository.save(leader);

        // Additional members
        if (req.getMemberStudentCodes() != null && !req.getMemberStudentCodes().isEmpty()) {
            int order = 1;
            for (String code : req.getMemberStudentCodes()) {
                if (code != null && !code.trim().isEmpty() && !code.equalsIgnoreCase(uploader.getStudentCode())) {
                    final int currentOrder = order;
                    userRepository.findByStudentCode(code.trim()).ifPresent(memberUser -> {
                        DocumentMember member = new DocumentMember();
                        member.setDocument(saved);
                        member.setUser(memberUser);
                        member.setMemberOrder(currentOrder);
                        member.setIsLeader(false);
                        documentMemberRepository.save(member);
                    });
                    order++;
                }
            }
        }

        // Technologies
        if (req.getTechnologyIds() != null) {
            for (Long techId : req.getTechnologyIds()) {
                technologyRepository.findById(techId).ifPresent(tech -> {
                    DocumentTechnology dt = new DocumentTechnology();
                    dt.setDocument(saved);
                    dt.setTechnology(tech);
                    documentTechnologyRepository.save(dt);
                });
            }
        }

        return toDetailDTO(saved, userId);
    }

    @Transactional
    public DocumentDetailDTO updateDocument(Long id, UpdateDocumentRequest req, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!document.getUploader().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền chỉnh sửa tài liệu này");
        }

        if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED && document.getStatus() != DocumentStatus.REVISION_REQUIRED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể chỉnh sửa tài liệu ở trạng thái Nháp, Từ chối hoặc Yêu cầu bổ sung");
        }

        if (req.getTitle() != null && !req.getTitle().isBlank()) document.setTitle(req.getTitle());
        if (req.getAbstractText() != null && !req.getAbstractText().isBlank()) document.setAbstractText(req.getAbstractText());
        if (req.getDescription() != null) document.setDescription(req.getDescription());
        if (req.getDocumentTypeCode() != null) document.setDocumentTypeCode(req.getDocumentTypeCode());
        if (req.getAdvisorName() != null) document.setAdvisorName(req.getAdvisorName());
        if (req.getGithubUrl() != null) document.setGithubUrl(req.getGithubUrl());
        if (req.getGitlabUrl() != null) document.setGitlabUrl(req.getGitlabUrl());

        if (req.getSubjectId() != null) {
            subjectRepository.findById(req.getSubjectId()).ifPresent(document::setSubject);
        }
        if (req.getMajorId() != null) {
            document.setMajor(majorRepository.findById(req.getMajorId()).orElse(null));
        }
        if (req.getAcademicYearId() != null) {
            academicYearRepository.findById(req.getAcademicYearId()).ifPresent(document::setAcademicYear);
        }

        // Update technologies if provided
        if (req.getTechnologyIds() != null) {
            documentTechnologyRepository.deleteByDocument_Id(document.getId());
            for (Long techId : req.getTechnologyIds()) {
                technologyRepository.findById(techId).ifPresent(tech -> {
                    DocumentTechnology dt = new DocumentTechnology();
                    dt.setDocument(document);
                    dt.setTechnology(tech);
                    documentTechnologyRepository.save(dt);
                });
            }
        }

        Document updated = documentRepository.save(document);
        return toDetailDTO(updated, userId);
    }

    @Transactional
    public DocumentDetailDTO submitDocument(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!document.getUploader().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền gửi duyệt tài liệu này");
        }

        List<DocumentFile> files = documentFileRepository.findByDocument_Id(id);
        if (files.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_ATTACHED_FILE", "Tài liệu phải có ít nhất 1 tệp đính kèm trước khi gửi duyệt");
        }

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.PENDING);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(document.getUploader());
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.PENDING);
        review.setComment("Sinh viên gửi yêu cầu thẩm định tài liệu");
        documentReviewRepository.save(review);

        return toDetailDTO(saved, userId);
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummaryDTO> getMyDocuments(Long userId, DocumentStatus status, String keyword, Pageable pageable) {
        Specification<Document> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("uploader").get("id"), userId));

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(root.get("status").in(
                        DocumentStatus.DRAFT, DocumentStatus.PENDING, DocumentStatus.REVISION_REQUIRED, DocumentStatus.APPROVED, DocumentStatus.REJECTED
                ));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("abstractText")), pattern)
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Document> page = documentRepository.findAll(spec, pageable);
        List<DocumentSummaryDTO> dtoList = page.getContent().stream()
                .map(doc -> toSummaryDTO(doc, userId))
                .collect(Collectors.toList());

        return PageResponse.of(page, dtoList);
    }

    @Transactional
    public DocumentDetailDTO getDocumentById(Long id, Long currentUserId, String currentRole) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        boolean isOwner = currentUserId != null && document.getUploader().getId().equals(currentUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentRole);

        if (!isAdmin && !isOwner && document.getStatus() != DocumentStatus.APPROVED) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền xem tài liệu chưa được phê duyệt");
        }

        // Increment view count if not owner viewing draft
        if (!isOwner || document.getStatus() == DocumentStatus.APPROVED) {
            documentRepository.incrementViewCount(id);
            document.setViewCount(document.getViewCount() + 1);
        }

        return toDetailDTO(document, currentUserId);
    }

    @Transactional
    public void deleteDocument(Long id, Long userId) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!document.getUploader().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền xóa tài liệu này");
        }

        if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể xóa tài liệu ở trạng thái Nháp hoặc Từ chối");
        }

        document.setStatus(DocumentStatus.HIDDEN);
        documentRepository.save(document);
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummaryDTO> search(SearchCriteria criteria, Pageable pageable, String currentRole, Long currentUserId) {
        Specification<Document> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!"ADMIN".equalsIgnoreCase(currentRole)) {
                predicates.add(cb.equal(root.get("status"), DocumentStatus.APPROVED));
            } else if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            } else {
                predicates.add(root.get("status").in(DocumentStatus.APPROVED, DocumentStatus.PENDING, DocumentStatus.REVISION_REQUIRED, DocumentStatus.DRAFT, DocumentStatus.REJECTED));
            }

            if (criteria.getKeyword() != null && !criteria.getKeyword().trim().isEmpty()) {
                String pattern = "%" + criteria.getKeyword().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("abstractText")), pattern),
                        cb.like(cb.lower(root.get("advisorName")), pattern)
                ));
            }

            if (criteria.getSubjectId() != null) {
                predicates.add(cb.equal(root.get("subject").get("id"), criteria.getSubjectId()));
            }

            if (criteria.getMajorId() != null) {
                predicates.add(cb.equal(root.get("major").get("id"), criteria.getMajorId()));
            }

            if (criteria.getAcademicYearId() != null) {
                predicates.add(cb.equal(root.get("academicYear").get("id"), criteria.getAcademicYearId()));
            }

            if (criteria.getDocumentTypeCode() != null && !criteria.getDocumentTypeCode().isBlank()) {
                predicates.add(cb.equal(root.get("documentTypeCode"), criteria.getDocumentTypeCode()));
            }

            if (criteria.getTechnologyId() != null) {
                predicates.add(cb.equal(root.join("technologies").get("technology").get("id"), criteria.getTechnologyId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Document> page = documentRepository.findAll(spec, pageable);
        List<DocumentSummaryDTO> dtoList = page.getContent().stream()
                .map(doc -> toSummaryDTO(doc, currentUserId))
                .collect(Collectors.toList());

        return PageResponse.of(page, dtoList);
    }

    // --- Admin Moderation Methods ---

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummaryDTO> getPendingDocuments(Pageable pageable) {
        Page<Document> page = documentRepository.findByStatus(DocumentStatus.PENDING, pageable);
        List<DocumentSummaryDTO> dtoList = page.getContent().stream()
                .map(doc -> toSummaryDTO(doc, null))
                .collect(Collectors.toList());
        return PageResponse.of(page, dtoList);
    }

    @Transactional
    public DocumentDetailDTO approveDocument(Long id, Long adminId, String note) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.APPROVED);
        document.setApprovedBy(admin);
        document.setApprovedAt(LocalDateTime.now());
        document.setRejectionNote(null);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.APPROVED);
        review.setComment(note != null ? note : "Hội đồng Khoa CNTT phê duyệt thông qua tài liệu");
        documentReviewRepository.save(review);

        return toDetailDTO(saved, adminId);
    }

    @Transactional
    public DocumentDetailDTO rejectDocument(Long id, Long adminId, String note) {
        if (note == null || note.trim().length() < 5) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "NOTE_REQUIRED", "Cần nêu rõ lý do từ chối (tối thiểu 5 ký tự)");
        }

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionNote(note);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.REJECTED);
        review.setComment(note);
        documentReviewRepository.save(review);

        return toDetailDTO(saved, adminId);
    }

    @Transactional
    public DocumentDetailDTO requestRevision(Long id, Long adminId, String note) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.REVISION_REQUIRED);
        document.setRejectionNote(note);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.REVISION_REQUIRED);
        review.setComment(note != null ? note : "Yêu cầu chỉnh sửa bổ sung tài liệu trước khi phê duyệt");
        documentReviewRepository.save(review);

        return toDetailDTO(saved, adminId);
    }

    @Transactional
    public DocumentDetailDTO hideDocument(Long id, Long adminId, String note) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.HIDDEN);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.HIDDEN);
        review.setComment(note != null ? note : "Tạm ẩn tài liệu khỏi hệ thống công khai");
        documentReviewRepository.save(review);

        return toDetailDTO(saved, adminId);
    }

    @Transactional(readOnly = true)
    public List<DocumentReviewDTO> getDocumentReviews(Long docId) {
        return documentReviewRepository.findByDocument_IdOrderByCreatedAtDesc(docId).stream()
                .map(r -> {
                    DocumentReviewDTO dto = new DocumentReviewDTO();
                    dto.setId(r.getId());
                    dto.setDocumentId(r.getDocument().getId());
                    dto.setReviewerId(r.getReviewer().getId());
                    dto.setReviewerName(r.getReviewer().getFullName());
                    dto.setFromStatus(r.getFromStatus());
                    dto.setToStatus(r.getToStatus());
                    dto.setComment(r.getComment());
                    dto.setCreatedAt(r.getCreatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // --- Helper Mapping Methods ---

    public DocumentSummaryDTO toSummaryDTO(Document doc, Long currentUserId) {
        boolean isBookmarked = false;
        if (currentUserId != null) {
            isBookmarked = bookmarkRepository.existsByUser_IdAndDocument_Id(currentUserId, doc.getId());
        }

        String primaryMime = doc.getFiles().stream()
                .filter(DocumentFile::getIsPrimary)
                .map(DocumentFile::getMimeType)
                .findFirst()
                .orElse("application/pdf");

        DocumentSummaryDTO dto = new DocumentSummaryDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setAbstractText(doc.getAbstractText());
        dto.setStatus(doc.getStatus());
        dto.setDocumentTypeCode(doc.getDocumentTypeCode());
        dto.setDocumentTypeLabel(getDocumentTypeLabel(doc.getDocumentTypeCode()));
        dto.setSubjectId(doc.getSubject() != null ? doc.getSubject().getId() : null);
        dto.setSubjectName(doc.getSubject() != null ? doc.getSubject().getName() : "");
        dto.setAcademicYearId(doc.getAcademicYear() != null ? doc.getAcademicYear().getId() : null);
        dto.setAcademicYearName(doc.getAcademicYear() != null ? doc.getAcademicYear().getName() : "");
        dto.setUploaderId(doc.getUploader() != null ? doc.getUploader().getId() : null);
        dto.setUploaderName(doc.getUploader() != null ? doc.getUploader().getFullName() : "");
        dto.setAdvisorName(doc.getAdvisorName());
        dto.setViewCount(doc.getViewCount());
        dto.setDownloadCount(doc.getDownloadCount());
        dto.setAvgRating(doc.getAvgRating());
        dto.setRatingCount(doc.getRatingCount());
        dto.setPrimaryFileMimeType(primaryMime);
        dto.setBookmarked(isBookmarked);
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setApprovedAt(doc.getApprovedAt());
        return dto;
    }

    public DocumentDetailDTO toDetailDTO(Document doc, Long currentUserId) {
        DocumentSummaryDTO summary = toSummaryDTO(doc, currentUserId);

        Integer userRating = null;
        if (currentUserId != null) {
            userRating = ratingRepository.findByUser_IdAndDocument_Id(currentUserId, doc.getId())
                    .map(Rating::getScore)
                    .orElse(null);
        }

        List<DocumentFileDTO> fileDTOs = doc.getFiles().stream()
                .map(f -> {
                    DocumentFileDTO fdto = new DocumentFileDTO();
                    fdto.setId(f.getId());
                    fdto.setDocumentId(doc.getId());
                    fdto.setFileName(f.getFileName());
                    fdto.setStorageKey(f.getStorageKey());
                    fdto.setMimeType(f.getMimeType());
                    fdto.setFileSize(f.getFileSize());
                    fdto.setIsPrimary(f.getIsPrimary());
                    fdto.setExternalUrl(f.getExternalUrl());
                    fdto.setCreatedAt(f.getCreatedAt());
                    return fdto;
                })
                .collect(Collectors.toList());

        List<DocumentMemberDTO> memberDTOs = doc.getMembers().stream()
                .map(m -> {
                    DocumentMemberDTO mdto = new DocumentMemberDTO();
                    mdto.setId(m.getId());
                    mdto.setUserId(m.getUser().getId());
                    mdto.setFullName(m.getUser().getFullName());
                    mdto.setStudentCode(m.getUser().getStudentCode());
                    mdto.setMemberOrder(m.getMemberOrder());
                    mdto.setIsLeader(m.getIsLeader());
                    return mdto;
                })
                .collect(Collectors.toList());

        List<DocumentTechnologyDTO> techDTOs = doc.getTechnologies().stream()
                .map(t -> {
                    DocumentTechnologyDTO tdto = new DocumentTechnologyDTO();
                    tdto.setId(t.getId());
                    tdto.setTechnologyId(t.getTechnology().getId());
                    tdto.setTechnologyName(t.getTechnology().getName());
                    tdto.setUsageNote(t.getUsageNote());
                    return tdto;
                })
                .collect(Collectors.toList());

        DocumentDetailDTO dto = new DocumentDetailDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setAbstractText(doc.getAbstractText());
        dto.setDescription(doc.getDescription());
        dto.setStatus(doc.getStatus());
        dto.setDocumentTypeCode(doc.getDocumentTypeCode());
        dto.setDocumentTypeLabel(summary.getDocumentTypeLabel());
        dto.setSubjectId(summary.getSubjectId());
        dto.setSubjectName(summary.getSubjectName());
        dto.setMajorId(doc.getMajor() != null ? doc.getMajor().getId() : null);
        dto.setMajorName(doc.getMajor() != null ? doc.getMajor().getName() : null);
        dto.setAcademicYearId(summary.getAcademicYearId());
        dto.setAcademicYearName(summary.getAcademicYearName());
        dto.setUploaderId(summary.getUploaderId());
        dto.setUploaderName(summary.getUploaderName());
        dto.setAdvisorName(doc.getAdvisorName());
        dto.setGithubUrl(doc.getGithubUrl());
        dto.setGitlabUrl(doc.getGitlabUrl());
        dto.setViewCount(doc.getViewCount());
        dto.setDownloadCount(doc.getDownloadCount());
        dto.setAvgRating(doc.getAvgRating());
        dto.setRatingCount(doc.getRatingCount());
        dto.setBookmarked(summary.getBookmarked());
        dto.setUserRating(userRating);
        dto.setRejectionNote(doc.getRejectionNote());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setApprovedAt(doc.getApprovedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());
        dto.setFiles(fileDTOs);
        dto.setMembers(memberDTOs);
        dto.setTechnologies(techDTOs);
        return dto;
    }

    private String getDocumentTypeLabel(String code) {
        if ("THESIS".equalsIgnoreCase(code)) return "Đồ án Tốt nghiệp (KLTN)";
        if ("CAPSTONE".equalsIgnoreCase(code)) return "Đồ án Chuyên ngành";
        if ("PROJECT".equalsIgnoreCase(code)) return "Bài tập lớn (BTL)";
        if ("LECTURE".equalsIgnoreCase(code)) return "Bài giảng / Slide";
        if ("EXAM".equalsIgnoreCase(code)) return "Đề thi & Lời giải";
        if ("LAB".equalsIgnoreCase(code)) return "Tài liệu Thực hành Lab";
        return code;
    }
}
