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
import com.cntt.academicdocs.util.SecurityUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private final NotificationService notificationService;

    private static final Set<String> STOP_WORDS = Set.of(
            "cua", "va", "cac", "nhung", "cho", "trong", "tren", "voi", "bang", "theo", "mot", "nhu",
            "he", "thong", "nghien", "cuu", "xay", "dung", "phat", "trien", "ung", "tai",
            "khoa", "luan", "tot", "nghiep", "do", "an", "bai", "tap", "lon", "lieu", "tim",
            "hieu", "thiet", "ke", "khai", "ve", "nhom", "sinh", "vien", "giang",
            "truong", "dai", "hoc", "cntt", "utc", "phuc", "vu", "ho", "tro", "mo", "hinh"
    );

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
            LovValueRepository lovValueRepository,
            NotificationService notificationService
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
        this.notificationService = notificationService;
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
        document.setSharingScope(req.getSharingScope() != null && !req.getSharingScope().isBlank() ? req.getSharingScope() : "FACULTY_INTERNAL");
        document.setPledgeAccepted(req.getPledgeAccepted() != null ? req.getPledgeAccepted() : true);
        document.setTargetYear(req.getTargetYear() != null && !req.getTargetYear().isBlank() ? req.getTargetYear() : "ALL");
        document.setCodeLanguage(req.getCodeLanguage());
        document.setSourceCodeSnippet(req.getSourceCodeSnippet());
        document.setExamDifficulty(req.getExamDifficulty());
        document.setExamSemester(req.getExamSemester());
        document.setExamTips(req.getExamTips());
        document.setHasSolution(req.getHasSolution());
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

        // Attached files
        if (req.getFileIds() != null && !req.getFileIds().isEmpty()) {
            for (Long fileId : req.getFileIds()) {
                documentFileRepository.findById(fileId).ifPresent(file -> {
                    file.setDocument(saved);
                    documentFileRepository.save(file);
                    saved.getFiles().add(file);
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

        if (document.getStatus() != DocumentStatus.DRAFT 
                && document.getStatus() != DocumentStatus.PENDING 
                && document.getStatus() != DocumentStatus.REJECTED 
                && document.getStatus() != DocumentStatus.REVISION_REQUIRED 
                && !SecurityUtils.isAdmin()) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể chỉnh sửa tài liệu ở trạng thái Nháp, Chờ duyệt, Từ chối hoặc Yêu cầu bổ sung");
        }

        if (req.getTitle() != null && !req.getTitle().isBlank()) document.setTitle(req.getTitle());
        if (req.getAbstractText() != null && !req.getAbstractText().isBlank()) document.setAbstractText(req.getAbstractText());
        if (req.getDescription() != null) document.setDescription(req.getDescription());
        if (req.getDocumentTypeCode() != null) document.setDocumentTypeCode(req.getDocumentTypeCode());
        if (req.getAdvisorName() != null) document.setAdvisorName(req.getAdvisorName());
        if (req.getGithubUrl() != null) document.setGithubUrl(req.getGithubUrl());
        if (req.getGitlabUrl() != null) document.setGitlabUrl(req.getGitlabUrl());

        if (req.getSharingScope() != null && !req.getSharingScope().isBlank()) document.setSharingScope(req.getSharingScope());
        if (req.getPledgeAccepted() != null) document.setPledgeAccepted(req.getPledgeAccepted());
        if (req.getRevisionNote() != null) document.setRevisionNote(req.getRevisionNote());
        if (req.getTargetYear() != null && !req.getTargetYear().isBlank()) document.setTargetYear(req.getTargetYear());
        if (req.getCodeLanguage() != null) document.setCodeLanguage(req.getCodeLanguage());
        if (req.getSourceCodeSnippet() != null) document.setSourceCodeSnippet(req.getSourceCodeSnippet());
        if (req.getExamDifficulty() != null) document.setExamDifficulty(req.getExamDifficulty());
        if (req.getExamSemester() != null) document.setExamSemester(req.getExamSemester());
        if (req.getExamTips() != null) document.setExamTips(req.getExamTips());
        if (req.getHasSolution() != null) document.setHasSolution(req.getHasSolution());

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

        // Attach additional files if provided
        if (req.getFileIds() != null && !req.getFileIds().isEmpty()) {
            for (Long fileId : req.getFileIds()) {
                documentFileRepository.findById(fileId).ifPresent(file -> {
                    file.setDocument(document);
                    documentFileRepository.save(file);
                    if (!document.getFiles().contains(file)) {
                        document.getFiles().add(file);
                    }
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

        if (document.getStatus() != DocumentStatus.DRAFT && document.getStatus() != DocumentStatus.REJECTED && document.getStatus() != DocumentStatus.REVISION_REQUIRED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể nộp duyệt tài liệu ở trạng thái Nháp, Yêu cầu chỉnh sửa hoặc Từ chối");
        }

        List<DocumentFile> files = documentFileRepository.findByDocument_Id(id);
        if (files.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_ATTACHED_FILE", "Tài liệu phải có ít nhất 1 tệp đính kèm trước khi gửi duyệt");
        }

        // Strict Academic Context Checklist Validation
        if (document.getSubject() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_SUBJECT", "Tài liệu bắt buộc phải gắn với một Môn học cụ thể của Khoa");
        }

        if (document.getAcademicYear() == null) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_ACADEMIC_YEAR", "Tài liệu bắt buộc phải có Niên khóa / Năm học");
        }

        String typeCode = document.getDocumentTypeCode() != null ? document.getDocumentTypeCode().toUpperCase() : "";
        if (("THESIS".equals(typeCode) || "CAPSTONE".equals(typeCode) || "DO_AN".equals(typeCode))
                && (document.getAdvisorName() == null || document.getAdvisorName().trim().isEmpty())) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "ADVISOR_REQUIRED_FOR_CAPSTONE",
                    "Đồ án chuyên ngành / Khóa luận tốt nghiệp bắt buộc phải có Giảng viên hướng dẫn");
        }

        if (document.getAbstractText() == null || document.getAbstractText().trim().length() < 15) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "ABSTRACT_REQUIRED",
                    "Vui lòng nhập tóm tắt nội dung học thuật (tối thiểu 15 ký tự)");
        }

        if (document.getPledgeAccepted() == null || !document.getPledgeAccepted()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "PLEDGE_REQUIRED",
                    "Sinh viên bắt buộc phải đồng ý với Cam kết Liêm chính Học thuật UTC trước khi gửi duyệt");
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

        // In-app Notification cho Sinh viên
        notificationService.notifyUser(
                userId,
                "DOCUMENT_SUBMITTED",
                "Gửi duyệt tài liệu thành công",
                "Học liệu \"" + saved.getTitle() + "\" đã được gửi tới Ban Quản trị và đang chờ thẩm định.",
                "/documents/" + saved.getId()
        );

        // In-app Notification cho tất cả Admin
        try {
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            for (User admin : admins) {
                if (!admin.getId().equals(userId)) {
                    notificationService.notifyUser(
                            admin.getId(),
                            "NEW_SUBMISSION",
                            "Tài liệu mới chờ thẩm định",
                            "Sinh viên " + (saved.getUploader() != null ? saved.getUploader().getFullName() : "") +
                                    " vừa nộp tài liệu: \"" + saved.getTitle() + "\"",
                            "/admin/pending"
                    );
                }
            }
        } catch (Exception ignored) {}

        return toDetailDTO(saved, userId);
    }

    @Transactional
    public DocumentDetailDTO resubmitDocument(Long id, Long userId, String revisionNote) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!document.getUploader().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_DOCUMENT_OWNER", "Bạn không có quyền nộp lại tài liệu này");
        }

        if (document.getStatus() != DocumentStatus.REVISION_REQUIRED && document.getStatus() != DocumentStatus.REJECTED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể nộp lại tài liệu ở trạng thái Yêu cầu chỉnh sửa hoặc Từ chối");
        }

        List<DocumentFile> files = documentFileRepository.findByDocument_Id(id);
        if (files.isEmpty()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "MISSING_ATTACHED_FILE", "Tài liệu phải có ít nhất 1 tệp đính kèm trước khi nộp lại");
        }

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.PENDING);
        if (revisionNote != null && !revisionNote.isBlank()) {
            document.setRevisionNote(revisionNote.trim());
        }
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(document.getUploader());
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.PENDING);
        review.setComment(revisionNote != null && !revisionNote.isBlank() ? revisionNote.trim() : "Sinh viên nộp lại bản sửa đổi");
        documentReviewRepository.save(review);

        // In-app Notification cho Sinh viên
        notificationService.notifyUser(
                userId,
                "DOCUMENT_SUBMITTED",
                "Nộp lại tài liệu thành công",
                "Bản chỉnh sửa học liệu \"" + saved.getTitle() + "\" đã được gửi lại tới Ban Quản trị.",
                "/documents/" + saved.getId()
        );

        // In-app Notification cho tất cả Admin
        try {
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            for (User admin : admins) {
                if (!admin.getId().equals(userId)) {
                    notificationService.notifyUser(
                            admin.getId(),
                            "NEW_SUBMISSION",
                            "Tài liệu cập nhật chờ thẩm định",
                            "Sinh viên " + (saved.getUploader() != null ? saved.getUploader().getFullName() : "") +
                                    " vừa cập nhật và nộp lại tài liệu: \"" + saved.getTitle() + "\"",
                            "/admin/pending"
                    );
                }
            }
        } catch (Exception ignored) {}

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

    public static String removeAccents(String text) {
        if (text == null) return "";
        String normalized = java.text.Normalizer.normalize(text, java.text.Normalizer.Form.NFD);
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized).replaceAll("").replace('đ', 'd').replace('Đ', 'D');
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummaryDTO> search(SearchCriteria criteria, Pageable pageable, String currentRole, Long currentUserId) {
        final String rawKeyword = criteria.getKeyword() != null ? criteria.getKeyword().trim() : "";
        final String keywordLower = rawKeyword.toLowerCase();
        final String keywordNoAccent = removeAccents(keywordLower);

        Specification<Document> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (!"ADMIN".equalsIgnoreCase(currentRole)) {
                predicates.add(cb.equal(root.get("status"), DocumentStatus.APPROVED));
            } else if (criteria.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), criteria.getStatus()));
            } else {
                predicates.add(root.get("status").in(DocumentStatus.APPROVED, DocumentStatus.PENDING, DocumentStatus.REVISION_REQUIRED, DocumentStatus.DRAFT, DocumentStatus.REJECTED));
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
                String typeCode = criteria.getDocumentTypeCode().trim().toUpperCase();
                if ("CAPSTONE".equals(typeCode) || "PROJECT".equals(typeCode) || "BTL".equals(typeCode)) {
                    predicates.add(root.get("documentTypeCode").in("CAPSTONE", "PROJECT", "BTL", "DO_AN"));
                } else if ("SLIDE".equals(typeCode) || "LECTURE".equals(typeCode)) {
                    predicates.add(root.get("documentTypeCode").in("SLIDE", "LECTURE"));
                } else if ("LAB".equals(typeCode) || "EXERCISE".equals(typeCode)) {
                    predicates.add(root.get("documentTypeCode").in("LAB", "EXERCISE"));
                } else if ("EXAM".equals(typeCode) || "DE_THI".equals(typeCode)) {
                    predicates.add(root.get("documentTypeCode").in("EXAM", "DE_THI"));
                } else if ("REFERENCE".equals(typeCode) || "TAI_LIEU_THAM_KHAO".equals(typeCode)) {
                    predicates.add(root.get("documentTypeCode").in("REFERENCE", "TAI_LIEU_THAM_KHAO", "GIAO_TRINH"));
                } else {
                    predicates.add(cb.equal(cb.upper(root.get("documentTypeCode")), typeCode));
                }
            }

            if (criteria.getTargetYear() != null && !criteria.getTargetYear().isBlank() && !"ALL".equalsIgnoreCase(criteria.getTargetYear().trim())) {
                predicates.add(cb.or(
                    cb.equal(root.get("targetYear"), criteria.getTargetYear().trim()),
                    cb.equal(root.get("targetYear"), "ALL")
                ));
            }

            if (criteria.getTechnologyId() != null) {
                predicates.add(cb.equal(root.join("technologies").get("technology").get("id"), criteria.getTechnologyId()));
            }

            if (criteria.getAdvisorName() != null && !criteria.getAdvisorName().isBlank()) {
                String advPattern = "%" + criteria.getAdvisorName().trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("advisorName")), advPattern));
            }

            // Keyword filter at database level
            if (!rawKeyword.isEmpty()) {
                String likePattern = "%" + keywordLower + "%";
                List<Predicate> keywordOrList = new ArrayList<>();
                keywordOrList.add(cb.like(cb.lower(root.get("title")), likePattern));
                keywordOrList.add(cb.like(cb.lower(root.get("abstractText")), likePattern));
                keywordOrList.add(cb.like(cb.lower(root.get("advisorName")), likePattern));
                keywordOrList.add(cb.like(cb.lower(root.get("description")), likePattern));
                keywordOrList.add(cb.like(cb.lower(root.get("subject").get("name")), likePattern));
                keywordOrList.add(cb.like(cb.lower(root.get("uploader").get("fullName")), likePattern));

                if (!keywordNoAccent.equals(keywordLower)) {
                    String likeNoAccent = "%" + keywordNoAccent + "%";
                    keywordOrList.add(cb.like(cb.lower(root.get("title")), likeNoAccent));
                    keywordOrList.add(cb.like(cb.lower(root.get("abstractText")), likeNoAccent));
                }
                predicates.add(cb.or(keywordOrList.toArray(new Predicate[0])));
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

        if (document.getStatus() != DocumentStatus.PENDING && document.getStatus() != DocumentStatus.REVISION_REQUIRED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể phê duyệt tài liệu đang chờ kiểm duyệt");
        }

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

        // In-app Notification
        if (saved.getUploader() != null) {
            notificationService.notifyUser(
                    saved.getUploader().getId(),
                    "DOCUMENT_APPROVED",
                    "Tài liệu đã được phê duyệt",
                    "Học liệu \"" + saved.getTitle() + "\" đã được Ban Quản trị phê duyệt và hiển thị trong kho học liệu Khoa.",
                    "/documents/" + saved.getId()
            );
        }

        return toDetailDTO(saved, adminId);
    }

    @Transactional
    public DocumentDetailDTO rejectDocument(Long id, Long adminId, String note) {
        if (note == null || note.trim().length() < 5) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "NOTE_REQUIRED", "Cần nêu rõ lý do từ chối (tối thiểu 5 ký tự)");
        }

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.PENDING && document.getStatus() != DocumentStatus.REVISION_REQUIRED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể từ chối tài liệu đang chờ kiểm duyệt");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.REJECTED);
        document.setRejectionNote(note);
        document.setRevisionNote(note);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.REJECTED);
        review.setComment(note);
        documentReviewRepository.save(review);

        // In-app Notification
        if (saved.getUploader() != null) {
            notificationService.notifyUser(
                    saved.getUploader().getId(),
                    "DOCUMENT_REJECTED",
                    "Học liệu bị từ chối duyệt",
                    "Học liệu \"" + saved.getTitle() + "\" bị từ chối. Lý do: " + note,
                    "/documents/" + saved.getId() + "/edit"
            );
        }

        return toDetailDTO(saved, adminId);
    }

    @Transactional
    public DocumentDetailDTO requestRevision(Long id, Long adminId, String note) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.PENDING) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "INVALID_STATUS_TRANSITION", "Chỉ có thể yêu cầu chỉnh sửa tài liệu đang chờ kiểm duyệt");
        }

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        DocumentStatus oldStatus = document.getStatus();
        document.setStatus(DocumentStatus.REVISION_REQUIRED);
        document.setRejectionNote(note);
        document.setRevisionNote(note);
        Document saved = documentRepository.save(document);

        DocumentReview review = new DocumentReview();
        review.setDocument(saved);
        review.setReviewer(admin);
        review.setFromStatus(oldStatus);
        review.setToStatus(DocumentStatus.REVISION_REQUIRED);
        review.setComment(note != null ? note : "Yêu cầu chỉnh sửa bổ sung tài liệu trước khi phê duyệt");
        documentReviewRepository.save(review);

        // In-app Notification
        if (saved.getUploader() != null) {
            notificationService.notifyUser(
                    saved.getUploader().getId(),
                    "REVISION_REQUIRED",
                    "Yêu cầu chỉnh sửa học liệu",
                    "Hội đồng thẩm định yêu cầu chỉnh sửa \"" + saved.getTitle() + "\": " + (note != null ? note : "Bổ sung thông tin"),
                    "/documents/" + saved.getId() + "/edit"
            );
        }

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

        DocumentFile primaryFile = doc.getFiles().stream()
                .filter(DocumentFile::getIsPrimary)
                .findFirst()
                .orElseGet(() -> doc.getFiles().stream().findFirst().orElse(null));

        String primaryMime = primaryFile != null && primaryFile.getMimeType() != null 
                ? primaryFile.getMimeType() : "application/pdf";

        DocumentSummaryDTO dto = new DocumentSummaryDTO();
        dto.setId(doc.getId());
        dto.setTitle(doc.getTitle());
        dto.setAbstractText(doc.getAbstractText());
        dto.setStatus(doc.getStatus());
        dto.setDocumentTypeCode(doc.getDocumentTypeCode());
        dto.setDocumentTypeLabel(getDocumentTypeLabel(doc.getDocumentTypeCode()));
        dto.setTargetYear(doc.getTargetYear() != null ? doc.getTargetYear() : "ALL");
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
        if (primaryFile != null) {
            dto.setPrimaryFileId(primaryFile.getId());
            dto.setPrimaryFileName(primaryFile.getFileName());
        }
        dto.setBookmarked(isBookmarked);
        dto.setSharingScope(doc.getSharingScope());
        dto.setPledgeAccepted(doc.getPledgeAccepted());
        dto.setRejectionNote(doc.getRejectionNote());
        dto.setRevisionNote(doc.getRevisionNote());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setApprovedAt(doc.getApprovedAt());
        dto.setCodeLanguage(doc.getCodeLanguage());
        dto.setExamDifficulty(doc.getExamDifficulty());
        dto.setExamSemester(doc.getExamSemester());
        dto.setHasSolution(doc.getHasSolution());
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
        dto.setTargetYear(doc.getTargetYear() != null ? doc.getTargetYear() : "ALL");
        dto.setSharingScope(doc.getSharingScope());
        dto.setPledgeAccepted(doc.getPledgeAccepted());
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
        dto.setRevisionNote(doc.getRevisionNote());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setApprovedAt(doc.getApprovedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());
        dto.setFiles(fileDTOs);
        dto.setMembers(memberDTOs);
        dto.setTechnologies(techDTOs);

        dto.setCodeLanguage(doc.getCodeLanguage());
        dto.setSourceCodeSnippet(doc.getSourceCodeSnippet());
        dto.setExamDifficulty(doc.getExamDifficulty());
        dto.setExamSemester(doc.getExamSemester());
        dto.setExamTips(doc.getExamTips());
        dto.setHasSolution(doc.getHasSolution());

        // Academic Integrity Seal & Lineage
        dto.setVerificationCode("UTC-FIT-" + (88000 + doc.getId()));
        dto.setFacultyUnit("Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải");
        dto.setFutureWorkSuggestions(generateFutureWorkSuggestions(doc));
        return dto;
    }

    private String generateFutureWorkSuggestions(Document doc) {
        String type = doc.getDocumentTypeCode() != null ? doc.getDocumentTypeCode().toUpperCase() : "GENERAL";
        String subject = doc.getSubject() != null ? doc.getSubject().getName() : "học phần";
        return switch (type) {
            case "THESIS", "CAPSTONE", "DO_AN" ->
                "Gợi ý mở rộng cho khóa sau: Tích hợp thêm mô hình AI/RAG để tự động hóa xử lý nghiệp vụ, xây dựng giải pháp chịu tải cao phân tán trên Kubernetes và mở rộng bộ kiểm thử tự động CI/CD cho " + subject + ".";
            case "PROJECT" ->
                "Gợi ý nâng cấp bài tập lớn: Tối ưu hóa hiệu năng truy vấn cơ sở dữ liệu, bổ sung cơ chế xác thực JWT đa lớp và triển khai thử nghiệm trên môi trường Cloud Docker cho " + subject + ".";
            case "LAB" ->
                "Khuyến nghị thực hành: Sinh viên khóa sau nên chủ động clone mã nguồn mẫu trên GitHub, hoàn thiện các bài tập nâng cao (Challenge Tasks) và đối chiếu kết quả log hệ thống.";
            default ->
                "Tài liệu nền tảng phục vụ ôn tập và tham khảo cốt lõi cho học phần " + subject + " tại Khoa CNTT - UTC.";
        };
    }

    public String getDocumentTypeLabel(String code) {
        if (code == null) return "Tài liệu học thuật";
        return switch (code.toUpperCase()) {
            case "THESIS", "DO_AN" -> "Khóa luận tốt nghiệp";
            case "CAPSTONE", "PROJECT", "BTL" -> "Bài tập lớn / Đồ án môn học";
            case "SLIDE", "LECTURE" -> "Slide Bài giảng";
            case "EXAM", "DE_THI" -> "Đề thi & Lời giải";
            case "LAB", "EXERCISE" -> "Hướng dẫn Lab & Thực hành";
            case "NOTE" -> "Ghi chú ôn tập";
            case "REFERENCE", "TAI_LIEU_THAM_KHAO", "GIAO_TRINH" -> "Tài liệu tham khảo";
            default -> code;
        };
    }

    // --- Academic Similarity & Duplicate Topic Prevention ---

    @Transactional(readOnly = true)
    public List<RelatedDocumentDTO> getRelatedDocuments(Long id, int limit) {
        Document target = documentRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        List<Document> allApproved = documentRepository.findByStatus(DocumentStatus.APPROVED);

        SimilarityCheckRequest checkReq = new SimilarityCheckRequest();
        checkReq.setCurrentDocumentId(target.getId());
        checkReq.setTitle(target.getTitle());
        checkReq.setSubjectId(target.getSubject() != null ? target.getSubject().getId() : null);
        checkReq.setMajorId(target.getMajor() != null ? target.getMajor().getId() : null);
        checkReq.setAdvisorName(target.getAdvisorName());
        checkReq.setDocumentTypeCode(target.getDocumentTypeCode());
        checkReq.setAbstractText(target.getAbstractText());

        return calculateSimilarities(checkReq, allApproved, limit > 0 ? limit : 4);
    }

    @Transactional(readOnly = true)
    public List<RelatedDocumentDTO> checkSimilarity(SimilarityCheckRequest req) {
        List<Document> allApproved = documentRepository.findByStatus(DocumentStatus.APPROVED);
        return calculateSimilarities(req, allApproved, 5);
    }

    public static Set<String> extractKeywords(String text) {
        if (text == null || text.isBlank()) return Set.of();
        String noAccent = removeAccents(text.toLowerCase());
        String[] words = noAccent.split("[^a-zA-Z0-9]+");
        Set<String> result = new HashSet<>();
        for (String w : words) {
            if (w.length() >= 3 && !STOP_WORDS.contains(w)) {
                result.add(w);
            }
        }
        return result;
    }

    private List<RelatedDocumentDTO> calculateSimilarities(SimilarityCheckRequest req, List<Document> candidates, int limit) {
        Set<String> targetTitleKeywords = extractKeywords(req.getTitle());
        Set<String> targetContentKeywords = extractKeywords(req.getAbstractText());
        String targetAdvisorNoAccent = removeAccents(req.getAdvisorName() != null ? req.getAdvisorName().toLowerCase() : "");

        List<RelatedDocumentDTO> results = new ArrayList<>();

        for (Document cand : candidates) {
            if (req.getCurrentDocumentId() != null && req.getCurrentDocumentId().equals(cand.getId())) {
                continue; // Skip comparing against self
            }

            int titleScore = 0;
            int contentScore = 0;
            int metadataScore = 0;
            int subjectScore = 0;
            int advisorScore = 0;
            int majorScore = 0;

            List<String> matchReasons = new ArrayList<>();

            // ── 1. TITLE OVERLAP (Max 45 points, ~45% of total score) ──
            Set<String> candTitleKeywords = extractKeywords(cand.getTitle());
            Set<String> matchedTitleTokens = new HashSet<>(targetTitleKeywords);
            matchedTitleTokens.retainAll(candTitleKeywords);

            int matchTitleCount = matchedTitleTokens.size();
            int maxTitleCount = Math.max(targetTitleKeywords.size(), candTitleKeywords.size());
            double titleRatio = maxTitleCount > 0 ? (double) matchTitleCount / maxTitleCount : 0.0;

            if (titleRatio >= 0.70 && matchTitleCount >= 2) {
                titleScore = 45;
                matchReasons.add("Trùng khớp tiêu đề (" + matchTitleCount + "/" + maxTitleCount + " từ khóa: " + String.join(", ", matchedTitleTokens) + ", +45đ)");
            } else if (titleRatio >= 0.45 && matchTitleCount >= 2) {
                titleScore = 32;
                matchReasons.add("Trùng nhiều từ khóa tiêu đề (" + String.join(", ", matchedTitleTokens) + ", +32đ)");
            } else if (titleRatio >= 0.25 || matchTitleCount >= 2) {
                titleScore = 18;
                matchReasons.add("Trùng một số từ khóa tiêu đề (" + String.join(", ", matchedTitleTokens) + ", +18đ)");
            } else if (matchTitleCount == 1 && maxTitleCount <= 3) {
                titleScore = 10;
                matchReasons.add("Trùng 1 từ khóa tiêu đề (" + String.join(", ", matchedTitleTokens) + ", +10đ)");
            } else if (matchTitleCount == 1) {
                titleScore = 5;
                matchReasons.add("Trùng 1 từ khóa phụ (" + String.join(", ", matchedTitleTokens) + ", +5đ)");
            }

            // ── 2. CONTENT & ABSTRACT SEMANTIC OVERLAP (Max 40 points, ~40% of total score) ──
            String candAbstract = cand.getAbstractText() != null ? cand.getAbstractText() : (cand.getDescription() != null ? cand.getDescription() : "");
            Set<String> candContentKeywords = extractKeywords(candAbstract);
            Set<String> matchedContentTokens = new HashSet<>();

            if (!targetContentKeywords.isEmpty() && !candContentKeywords.isEmpty()) {
                matchedContentTokens.addAll(targetContentKeywords);
                matchedContentTokens.retainAll(candContentKeywords);

                int contentMatchCount = matchedContentTokens.size();
                int targetContentSize = targetContentKeywords.size();
                double contentRatio = (double) contentMatchCount / Math.max(1, targetContentSize);

                if (contentRatio >= 0.35 && contentMatchCount >= 4) {
                    contentScore = 40;
                    matchReasons.add("Trùng khớp chuyên sâu tóm tắt học thuật (" + contentMatchCount + " thuật ngữ, +40đ)");
                } else if (contentRatio >= 0.22 && contentMatchCount >= 3) {
                    contentScore = 26;
                    matchReasons.add("Khớp nhiều thuật ngữ trong tóm tắt nội dung (+26đ)");
                } else if (contentRatio >= 0.12 && contentMatchCount >= 2) {
                    contentScore = 15;
                    matchReasons.add("Tương đồng một số thuật ngữ nội dung đề tài (+15đ)");
                } else if (contentMatchCount >= 2) {
                    contentScore = 8;
                    matchReasons.add("Khớp một phần thuật ngữ nội dung (+8đ)");
                }
            } else if (targetContentKeywords.isEmpty() && !targetTitleKeywords.isEmpty() && !candContentKeywords.isEmpty()) {
                // Người dùng chưa nhập tóm tắt: so khớp từ khóa tiêu đề với abstract ứng viên (tối đa 15đ)
                matchedContentTokens.addAll(targetTitleKeywords);
                matchedContentTokens.retainAll(candContentKeywords);

                if (matchedContentTokens.size() >= 3) {
                    contentScore = 15;
                    matchReasons.add("Tên đề tài khớp " + matchedContentTokens.size() + " thuật ngữ trong tóm tắt KLTN (+15đ)");
                } else if (matchedContentTokens.size() >= 2) {
                    contentScore = 10;
                    matchReasons.add("Tên đề tài xuất hiện trong tóm tắt KLTN (+10đ)");
                } else if (matchedContentTokens.size() == 1) {
                    contentScore = 5;
                }
            }

            // ── 3. ACADEMIC METADATA CONTEXT (Max 20 points, < 20% total weight) ──
            // QUAN TRỌNG: Chỉ cộng điểm metadata khi đề tài có sự tương đồng nội dung hoặc tiêu đề (tránh thổi phồng tỷ lệ)
            if (titleScore > 0 || contentScore > 0) {
                if (req.getSubjectId() != null && cand.getSubject() != null && req.getSubjectId().equals(cand.getSubject().getId())) {
                    subjectScore = 8;
                    metadataScore += 8;
                    matchReasons.add("Cùng môn học (+8đ)");
                }

                if (!targetAdvisorNoAccent.isBlank() && cand.getAdvisorName() != null && !cand.getAdvisorName().isBlank()) {
                    String candAdvNoAccent = removeAccents(cand.getAdvisorName().toLowerCase());
                    if (targetAdvisorNoAccent.contains(candAdvNoAccent) || candAdvNoAccent.contains(targetAdvisorNoAccent)) {
                        advisorScore = 7;
                        metadataScore += 7;
                        matchReasons.add("Cùng GVHD (+7đ)");
                    }
                }

                if (req.getMajorId() != null && cand.getMajor() != null && req.getMajorId().equals(cand.getMajor().getId())) {
                    majorScore = 5;
                    metadataScore += 5;
                    matchReasons.add("Cùng chuyên ngành (+5đ)");
                }
            }

            int totalScore = Math.min(100, titleScore + contentScore + metadataScore);

            // Jaccard similarity
            Set<String> setA = new HashSet<>(targetTitleKeywords);
            setA.addAll(targetContentKeywords);
            Set<String> setB = new HashSet<>(candTitleKeywords);
            setB.addAll(candContentKeywords);
            Set<String> union = new HashSet<>(setA);
            union.addAll(setB);
            Set<String> intersection = new HashSet<>(setA);
            intersection.retainAll(setB);
            double jaccard = union.isEmpty() ? 0.0 : Math.round(((double) intersection.size() / union.size()) * 100.0) / 100.0;

            String formula = String.format("%d (Tiêu đề) + %d (Nội dung tóm tắt) + %d (Môn/GVHD) = %d%%",
                    titleScore, contentScore, metadataScore, totalScore);

            // Chỉ hiển thị các đề tài có độ tương đồng thực sự (tổng điểm >= 18 và có từ 2 từ khóa hoặc nội dung tương đồng)
            if (totalScore >= 18 && (titleScore >= 10 || contentScore >= 10)) {
                RelatedDocumentDTO dto = new RelatedDocumentDTO();
                dto.setId(cand.getId());
                dto.setTitle(cand.getTitle());
                dto.setDocumentTypeCode(cand.getDocumentTypeCode());
                dto.setDocumentTypeLabel(getDocumentTypeLabel(cand.getDocumentTypeCode()));
                dto.setSubjectId(cand.getSubject() != null ? cand.getSubject().getId() : null);
                dto.setSubjectName(cand.getSubject() != null ? cand.getSubject().getName() : "");
                dto.setMajorId(cand.getMajor() != null ? cand.getMajor().getId() : null);
                dto.setMajorName(cand.getMajor() != null ? cand.getMajor().getName() : "");
                dto.setAdvisorName(cand.getAdvisorName());
                dto.setAcademicYearName(cand.getAcademicYear() != null ? cand.getAcademicYear().getName() : "");
                dto.setAvgRating(cand.getAvgRating());
                dto.setViewCount(cand.getViewCount());
                dto.setDownloadCount(cand.getDownloadCount());
                dto.setSimilarityScore(totalScore);
                dto.setMatchReason(String.join(" • ", matchReasons));
                dto.setSubjectScore(subjectScore);
                dto.setAdvisorScore(advisorScore);
                dto.setMajorScore(majorScore);
                dto.setKeywordScore(titleScore);
                dto.setTitleScore(titleScore);
                dto.setContentScore(contentScore);
                dto.setMetadataScore(metadataScore);
                dto.setMatchedTokens(new ArrayList<>(matchedTitleTokens));
                dto.setMatchedContentTokens(new ArrayList<>(matchedContentTokens));
                dto.setJaccardSimilarity(jaccard);
                dto.setFormulaCalculation(formula);

                if (candAbstract != null && !candAbstract.isBlank()) {
                    String snippet = candAbstract.length() > 160 ? candAbstract.substring(0, 160) + "..." : candAbstract;
                    dto.setAbstractSnippet(snippet);
                }

                results.add(dto);
            }
        }

        results.sort((a, b) -> Integer.compare(b.getSimilarityScore(), a.getSimilarityScore()));
        return results.stream().limit(limit).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CourseHubDTO getCourseHub(Long subjectId, Long currentUserId) {
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "SUBJECT_NOT_FOUND", "Không tìm thấy môn học"));

        SubjectDTO subjectDTO = SubjectDTO.fromEntity(subject);

        List<Document> docs = documentRepository.findByStatus(DocumentStatus.APPROVED).stream()
                .filter(d -> d.getSubject() != null && d.getSubject().getId().equals(subjectId))
                .collect(Collectors.toList());

        List<DocumentSummaryDTO> lectures = new ArrayList<>();
        List<DocumentSummaryDTO> labs = new ArrayList<>();
        List<DocumentSummaryDTO> projects = new ArrayList<>();
        List<DocumentSummaryDTO> exams = new ArrayList<>();
        List<String> advisors = new ArrayList<>();

        for (Document d : docs) {
            DocumentSummaryDTO sum = toSummaryDTO(d, currentUserId);
            String type = d.getDocumentTypeCode() != null ? d.getDocumentTypeCode().toUpperCase() : "";
            if (type.contains("LECTURE") || type.contains("SLIDE") || type.contains("GIAO_TRINH")) {
                lectures.add(sum);
            } else if (type.contains("LAB") || type.contains("EXERCISE") || type.contains("THUC_HANH")) {
                labs.add(sum);
            } else if (type.contains("PROJECT") || type.contains("CAPSTONE") || type.contains("THESIS") || type.contains("DO_AN") || type.contains("BTL")) {
                projects.add(sum);
            } else if (type.contains("EXAM") || type.contains("DE_THI") || type.contains("DE_CUONG")) {
                exams.add(sum);
            } else {
                lectures.add(sum);
            }

            if (d.getAdvisorName() != null && !d.getAdvisorName().trim().isEmpty()) {
                String adv = d.getAdvisorName().trim();
                if (!advisors.contains(adv)) {
                    advisors.add(adv);
                }
            }
        }

        CourseHubDTO hub = new CourseHubDTO();
        hub.setSubject(subjectDTO);
        hub.setTotalDocuments(docs.size());
        hub.setTotalLectures(lectures.size());
        hub.setTotalLabs(labs.size());
        hub.setTotalProjects(projects.size());
        hub.setTotalExams(exams.size());
        hub.setLectures(lectures);
        hub.setLabs(labs);
        hub.setProjects(projects);
        hub.setExams(exams);
        hub.setInstructorAdvisors(advisors);
        return hub;
    }

    @Transactional(readOnly = true)
    public TopicComparisonResultDTO compareTopics(TopicComparisonRequest req) {
        TopicComparisonResultDTO result = new TopicComparisonResultDTO();
        if (req == null || req.getTitle() == null || req.getTitle().trim().length() < 3) {
            result.setOverallOverlapScore(0);
            result.setRiskLevel("LOW_DUPLICATION");
            result.setVerdict("Vui lòng nhập tên đề tài để phân tích tính mới.");
            result.setMatchedDocuments(List.of());
            result.setNoveltyRecommendations(List.of("Nhập tên đề tài cụ thể và chọn Môn học để hệ thống đối soát."));
            return result;
        }

        SimilarityCheckRequest simReq = new SimilarityCheckRequest();
        simReq.setTitle(req.getTitle());
        simReq.setSubjectId(req.getSubjectId());
        simReq.setMajorId(req.getMajorId());
        simReq.setAdvisorName(req.getAdvisorName());
        simReq.setDocumentTypeCode("CAPSTONE");
        simReq.setAbstractText(req.getDescription());

        List<RelatedDocumentDTO> similar = calculateSimilarities(simReq, documentRepository.findByStatus(DocumentStatus.APPROVED), 5);
        List<TopicComparisonResultDTO.MatchedDocumentDTO> matched = new ArrayList<>();
        int maxScore = 0;

        for (RelatedDocumentDTO s : similar) {
            TopicComparisonResultDTO.MatchedDocumentDTO m = new TopicComparisonResultDTO.MatchedDocumentDTO();
            m.setId(s.getId());
            m.setTitle(s.getTitle());
            m.setAdvisorName(s.getAdvisorName());
            m.setAcademicYearName(s.getAcademicYearName());
            m.setSubjectName(s.getSubjectName());
            m.setSimilarityScore(s.getSimilarityScore());
            m.setOverlappingAspects(s.getMatchReason());
            m.setSubjectScore(s.getSubjectScore());
            m.setAdvisorScore(s.getAdvisorScore());
            m.setMajorScore(s.getMajorScore());
            m.setKeywordScore(s.getKeywordScore());
            m.setTitleScore(s.getTitleScore());
            m.setContentScore(s.getContentScore());
            m.setMetadataScore(s.getMetadataScore());
            m.setAbstractSnippet(s.getAbstractSnippet());
            m.setMatchedTokens(s.getMatchedTokens());
            m.setMatchedContentTokens(s.getMatchedContentTokens());
            m.setJaccardSimilarity(s.getJaccardSimilarity());
            m.setFormulaCalculation(s.getFormulaCalculation());

            // Attach githubUrl if available
            documentRepository.findById(s.getId()).ifPresent(doc -> m.setGithubUrl(doc.getGithubUrl()));

            matched.add(m);
            if (s.getSimilarityScore() > maxScore) {
                maxScore = s.getSimilarityScore();
            }
        }

        result.setOverallOverlapScore(maxScore);
        result.setMatchedDocuments(matched);
        result.setAlgorithmName("Nội Dung Tóm Tắt & Tiêu Đề Đề Tài (80%) + Bối Cảnh Học Thuật (20%)");
        result.setFormulaDefinition("Score = min(100, S_tieu_de(45đ) + S_noi_dung_tom_tat(40đ) + W_mon_gvhd(20đ))");

        Set<String> cleanTokens = new HashSet<>(extractKeywords(req.getTitle()));
        if (req.getDescription() != null && !req.getDescription().isBlank()) {
            cleanTokens.addAll(extractKeywords(req.getDescription()));
        }
        result.setExtractedTokens(new ArrayList<>(cleanTokens));

        List<String> recommendations = new ArrayList<>();
        if (maxScore >= 60) {
            result.setRiskLevel("HIGH_DUPLICATION_RISK");
            result.setVerdict("Cảnh báo trùng lặp hướng nghiên cứu: Đề tài có tỷ lệ trùng khớp đáng kể (" + maxScore + "%) với các công trình khóa trước.");
            recommendations.add("Đổi mới bài toán nghiệp vụ: Thay vì làm lại mô hình cũ, hãy mở rộng sang giải quyết bài toán thực tế mới trong trường ĐH GTVT.");
            recommendations.add("Nâng cấp kiến trúc công nghệ: Đưa vào các kỹ thuật mới như Event-driven, Microservices hoặc AI Agent.");
            recommendations.add("Trao đổi trực tiếp với GVHD để xác định rõ ranh giới nghiên cứu (Scope) tránh bị hội đồng trừ điểm trùng lặp.");
        } else if (maxScore >= 30) {
            result.setRiskLevel("MODERATE_OVERLAP");
            result.setVerdict("Mức độ tương đồng vừa phải: Đề tài có nét tương đồng về bối cảnh hoặc công nghệ (" + maxScore + "%), hoàn toàn có thể kế thừa và phát triển thêm.");
            recommendations.add("Kế thừa có chọn lọc các kết quả nghiên cứu trước và tập trung giải quyết các hạn chế (Future Work) của khóa trước.");
            recommendations.add("Bổ sung thực nghiệm đánh giá hiệu năng (Benchmark định lượng) để khẳng định tính vượt trội.");
            recommendations.add("Đóng gói mã nguồn sạch, cấu hình Docker Container và viết tài liệu hướng dẫn triển khai hoàn chỉnh.");
        } else {
            result.setRiskLevel("LOW_DUPLICATION");
            result.setVerdict("Ý tưởng mới mẻ: Chưa phát hiện trùng lặp đáng kể với các đề tài đã lưu trữ trong Khoa CNTT (Điểm trùng lặp: " + maxScore + "% - An toàn).");
            recommendations.add("Đề tài có tiềm năng tốt, đủ điều kiện bảo vệ đề cương với Bộ môn.");
            recommendations.add("Nên bám sát chuẩn trích dẫn IEEE/APA và ký cam kết liêm chính học thuật khi hoàn thiện báo cáo.");
        }

        result.setNoveltyRecommendations(recommendations);
        return result;
    }
}
