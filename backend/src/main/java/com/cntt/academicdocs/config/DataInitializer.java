package com.cntt.academicdocs.config;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final MajorRepository majorRepository;
    private final SubjectRepository subjectRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TechnologyRepository technologyRepository;
    private final LovGroupRepository lovGroupRepository;
    private final LovValueRepository lovValueRepository;
    private final DocumentRepository documentRepository;
    private final DocumentFileRepository documentFileRepository;
    private final DocumentReviewRepository documentReviewRepository;
    private final BookmarkRepository bookmarkRepository;
    private final ReportRepository reportRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            MajorRepository majorRepository,
            SubjectRepository subjectRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository,
            LovGroupRepository lovGroupRepository,
            LovValueRepository lovValueRepository,
            DocumentRepository documentRepository,
            DocumentFileRepository documentFileRepository,
            DocumentReviewRepository documentReviewRepository,
            BookmarkRepository bookmarkRepository,
            ReportRepository reportRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.majorRepository = majorRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
        this.lovGroupRepository = lovGroupRepository;
        this.lovValueRepository = lovValueRepository;
        this.documentRepository = documentRepository;
        this.documentFileRepository = documentFileRepository;
        this.documentReviewRepository = documentReviewRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.reportRepository = reportRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initMajors();
        initSubjects();
        initAcademicYears();
        initTechnologies();
        initLovs();
        initUsers();
        initDemoDocuments();
    }

    private void initMajors() {
        if (majorRepository.count() == 0) {
            majorRepository.save(new Major("SE", "Kỹ thuật phần mềm"));
            majorRepository.save(new Major("IS", "Hệ thống thông tin"));
            majorRepository.save(new Major("CS", "Khoa học máy tính"));
            majorRepository.save(new Major("CN", "Mạng máy tính & Truyền thông"));
            log.info("Initialized default majors.");
        }
    }

    private void initSubjects() {
        if (subjectRepository.count() == 0) {
            subjectRepository.save(new Subject("INT1001", "Nhập môn lập trình", "Kiến thức cơ sở lập trình"));
            subjectRepository.save(new Subject("INT2001", "Cơ sở dữ liệu", "Hệ quản trị CSDL quan hệ"));
            subjectRepository.save(new Subject("INT3001", "Phát triển phần mềm mã nguồn mở", "Mã nguồn mở và quy trình phát triển"));
            subjectRepository.save(new Subject("INT3002", "Kiến trúc và Thiết kế phần mềm", "Thiết kế kiến trúc hệ thống và microservices"));
            subjectRepository.save(new Subject("INT3003", "Trí tuệ nhân tạo và Học máy", "Các mô hình học máy và xử lý ngôn ngữ tự nhiên"));
            subjectRepository.save(new Subject("INT3004", "An toàn thông tin và Mạng máy tính", "Bảo mật hệ thống thông tin"));
            log.info("Initialized default subjects.");
        }
    }

    private void initAcademicYears() {
        if (academicYearRepository.count() == 0) {
            academicYearRepository.save(new AcademicYear("2022-2023", "Năm học 2022-2023", (short) 2022));
            academicYearRepository.save(new AcademicYear("2023-2024", "Năm học 2023-2024", (short) 2023));
            academicYearRepository.save(new AcademicYear("2024-2025", "Năm học 2024-2025", (short) 2024));
            academicYearRepository.save(new AcademicYear("2025-2026", "Năm học 2025-2026", (short) 2025));
            log.info("Initialized default academic years.");
        }
    }

    private void initTechnologies() {
        if (technologyRepository.count() == 0) {
            technologyRepository.save(new Technology("React", "react"));
            technologyRepository.save(new Technology("Spring Boot", "spring-boot"));
            technologyRepository.save(new Technology("MySQL", "mysql"));
            technologyRepository.save(new Technology("TypeScript", "typescript"));
            technologyRepository.save(new Technology("Docker", "docker"));
            technologyRepository.save(new Technology("Python", "python"));
            technologyRepository.save(new Technology("PostgreSQL", "postgresql"));
            log.info("Initialized default technologies.");
        }
    }

    private void initLovs() {
        if (lovGroupRepository.count() == 0) {
            LovGroup docType = lovGroupRepository.save(new LovGroup("DOCUMENT_TYPE", "Loại tài liệu", "Phân loại tài liệu học tập"));
            LovGroup fileType = lovGroupRepository.save(new LovGroup("FILE_TYPE", "Loại file", "Định dạng file đính kèm"));
            LovGroup visibility = lovGroupRepository.save(new LovGroup("VISIBILITY", "Phạm vi hiển thị", "Phạm vi người dùng có thể xem"));
            LovGroup reportReason = lovGroupRepository.save(new LovGroup("REPORT_REASON", "Lý do báo cáo", "Lý do sinh viên báo cáo vi phạm"));
            LovGroup reportStatus = lovGroupRepository.save(new LovGroup("REPORT_STATUS", "Trạng thái báo cáo", "Tiến độ xử lý báo cáo"));

            createLovValue(docType, "THESIS", "Đồ án / Khóa luận", 1);
            createLovValue(docType, "SLIDE", "Slide bài giảng", 2);
            createLovValue(docType, "NOTE", "Ghi chú ôn tập", 3);
            createLovValue(docType, "ASSIGNMENT", "Bài tập lớn", 4);
            createLovValue(docType, "REFERENCE", "Tài liệu tham khảo", 5);
            createLovValue(docType, "OTHER", "Khác", 6);

            createLovValue(fileType, "PDF", "PDF", 1);
            createLovValue(fileType, "DOCX", "DOCX", 2);
            createLovValue(fileType, "PPTX", "PPTX", 3);
            createLovValue(fileType, "XLSX", "XLSX", 4);
            createLovValue(fileType, "ZIP", "ZIP", 5);

            createLovValue(visibility, "PUBLIC_INTERNAL", "Nội bộ Khoa", 1);

            createLovValue(reportReason, "COPYRIGHT", "Vi phạm bản quyền", 1);
            createLovValue(reportReason, "INAPPROPRIATE", "Nội dung không phù hợp", 2);
            createLovValue(reportReason, "SPAM", "Spam", 3);
            createLovValue(reportReason, "WRONG_INFO", "Thông tin sai lệch", 4);
            createLovValue(reportReason, "OTHER", "Khác", 5);

            createLovValue(reportStatus, "PENDING", "Chờ xử lý", 1);
            createLovValue(reportStatus, "IN_REVIEW", "Đang xem xét", 2);
            createLovValue(reportStatus, "RESOLVED", "Đã xử lý", 3);
            createLovValue(reportStatus, "REJECTED", "Từ chối báo cáo", 4);

            log.info("Initialized default LOV groups and values.");
        }
    }

    private void createLovValue(LovGroup group, String code, String label, int order) {
        LovValue value = new LovValue();
        value.setGroup(group);
        value.setCode(code);
        value.setLabel(label);
        value.setDisplayOrder(order);
        value.setActive(true);
        lovValueRepository.save(value);
    }

    private void initUsers() {
        if (!userRepository.existsByEmail("admin@cntt.local")) {
            User admin = new User();
            admin.setEmail("admin@cntt.local");
            admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Admin Khoa");
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("Seeded default admin user: admin@cntt.local / Admin@123");
        }

        Major seMajor = majorRepository.findByCode("SE").orElse(null);

        if (!userRepository.existsByEmail("sv01@cntt.local")) {
            User student1 = new User();
            student1.setEmail("sv01@cntt.local");
            student1.setPasswordHash(passwordEncoder.encode("Student@123"));
            student1.setFullName("Nguyen Van A");
            student1.setStudentCode("SV001");
            student1.setRole(UserRole.STUDENT);
            student1.setMajor(seMajor);
            student1.setActive(true);
            userRepository.save(student1);
            log.info("Seeded default student: sv01@cntt.local / Student@123");
        }

        if (!userRepository.existsByEmail("sv02@cntt.local")) {
            User student2 = new User();
            student2.setEmail("sv02@cntt.local");
            student2.setPasswordHash(passwordEncoder.encode("Student@123"));
            student2.setFullName("Tran Thi B");
            student2.setStudentCode("SV002");
            student2.setRole(UserRole.STUDENT);
            student2.setMajor(seMajor);
            student2.setActive(true);
            userRepository.save(student2);
            log.info("Seeded default student: sv02@cntt.local / Student@123");
        }
    }

    private void initDemoDocuments() {
        if (documentRepository.count() > 0) {
            return;
        }

        User admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
        User sv01 = userRepository.findByEmail("sv01@cntt.local").orElse(null);
        User sv02 = userRepository.findByEmail("sv02@cntt.local").orElse(null);

        if (sv01 == null || sv02 == null || admin == null) {
            return;
        }

        Subject subInt3001 = subjectRepository.findByCode("INT3001").orElseGet(() -> subjectRepository.findAll().get(0));
        Subject subInt3003 = subjectRepository.findByCode("INT3003").orElseGet(() -> subInt3001);
        Subject subInt2001 = subjectRepository.findByCode("INT2001").orElseGet(() -> subInt3001);

        AcademicYear year2425 = academicYearRepository.findByCode("2024-2025").orElseGet(() -> academicYearRepository.findAll().get(0));
        AcademicYear year2324 = academicYearRepository.findByCode("2023-2024").orElseGet(() -> year2425);

        Major majorSe = majorRepository.findByCode("SE").orElse(null);
        Major majorCs = majorRepository.findByCode("CS").orElse(majorSe);
        Major majorIs = majorRepository.findByCode("IS").orElse(majorSe);

        Long thesisTypeId = lovValueRepository.findByGroup_CodeAndCode("DOCUMENT_TYPE", "THESIS")
                .map(LovValue::getId).orElse(1L);
        Long assignmentTypeId = lovValueRepository.findByGroup_CodeAndCode("DOCUMENT_TYPE", "ASSIGNMENT")
                .map(LovValue::getId).orElse(4L);

        // 1. Document APPROVED (Tài liệu đồ án đã được duyệt)
        Document docApproved = new Document();
        docApproved.setTitle("Nghiên cứu và Ứng dụng Kiến trúc Microservices trong Quản trị Tài liệu Học thuật");
        docApproved.setAbstractText("Đồ án tập trung khảo sát các mô hình kiến trúc Microservices hiện đại, kết hợp Spring Boot 3 và Supabase Storage để quản lý tài liệu dung lượng lớn bảo mật.");
        docApproved.setDescription("Báo cáo hoàn chỉnh kèm sơ đồ kiến trúc, giải thuật xác thực JWT phân tán và tối ưu truy vấn MySQL.");
        docApproved.setDocumentTypeId(thesisTypeId);
        docApproved.setSubjectId(subInt3001.getId());
        docApproved.setMajorId(majorSe != null ? majorSe.getId() : null);
        docApproved.setAcademicYearId(year2425.getId());
        docApproved.setAdvisorName("PGS.TS. Trần Đình Minh");
        docApproved.setGithubUrl("https://github.com/cntt-fit/academic-docs-microservices");
        docApproved.setCreatedBy(sv01.getId());
        docApproved.setStatus(DocumentStatus.APPROVED);
        docApproved.setViewCount(128);
        docApproved.setDownloadCount(35);
        docApproved = documentRepository.save(docApproved);

        // File đính kèm cho APPROVED doc
        DocumentFile fileApproved = new DocumentFile();
        fileApproved.setDocumentId(docApproved.getId());
        fileApproved.setFileName("Bao_cao_Do_an_Tot_nghiep_Microservices.pdf");
        fileApproved.setStorageKey("seed/microservices_thesis.pdf");
        fileApproved.setMimeType("application/pdf");
        fileApproved.setFileSize(4829104L);
        fileApproved.setIsPrimary(true);
        fileApproved.setCreatedBy(sv01.getId());
        documentFileRepository.save(fileApproved);

        // Lịch sử duyệt của Admin
        DocumentReview reviewApproved = new DocumentReview(
                docApproved.getId(),
                admin.getId(),
                "PENDING",
                "APPROVED",
                "Tài liệu đạt chuẩn chất lượng đồ án tốt nghiệp, đề tài có tính ứng dụng cao."
        );
        documentReviewRepository.save(reviewApproved);

        // Sinh viên sv02 bookmark tài liệu APPROVED này
        Bookmark bookmark = new Bookmark(sv02.getId(), docApproved.getId());
        bookmarkRepository.save(bookmark);

        // 2. Document PENDING (Tài liệu đang chờ Admin duyệt)
        Document docPending = new Document();
        docPending.setTitle("Xây dựng Hệ thống Trích xuất và Tóm tắt Văn bản Tự động bằng LLM");
        docPending.setAbstractText("Nghiên cứu áp dụng các mô hình ngôn ngữ lớn (LLM) để tự động sinh tóm tắt tài liệu học thuật và phân loại theo chủ đề.");
        docPending.setDescription("Bao gồm pipeline xử lý dữ liệu PDF tiếng Việt, embedding vector và mô hình sinh văn bản.");
        docPending.setDocumentTypeId(thesisTypeId);
        docPending.setSubjectId(subInt3003.getId());
        docPending.setMajorId(majorCs != null ? majorCs.getId() : null);
        docPending.setAcademicYearId(year2425.getId());
        docPending.setAdvisorName("TS. Lê Thị Mai Hoa");
        docPending.setGithubUrl("https://github.com/cntt-fit/llm-text-summarizer");
        docPending.setCreatedBy(sv01.getId());
        docPending.setStatus(DocumentStatus.PENDING);
        docPending.setViewCount(12);
        docPending.setDownloadCount(0);
        docPending = documentRepository.save(docPending);

        DocumentFile filePending = new DocumentFile();
        filePending.setDocumentId(docPending.getId());
        filePending.setFileName("Khoa_luan_LLM_Text_Summarizer.pdf");
        filePending.setStorageKey("seed/llm_summarizer.pdf");
        filePending.setMimeType("application/pdf");
        filePending.setFileSize(3154890L);
        filePending.setIsPrimary(true);
        filePending.setCreatedBy(sv01.getId());
        documentFileRepository.save(filePending);

        // 3. Document REJECTED (Tài liệu bị Admin từ chối kèm lý do)
        Document docRejected = new Document();
        docRejected.setTitle("Báo cáo Thực tập Doanh nghiệp tại Công ty Giải pháp Phần mềm ABC");
        docRejected.setAbstractText("Báo cáo tổng kết quá trình thực tập vị trí Frontend Developer tại ABC Corp trong thời gian 3 tháng.");
        docRejected.setDescription("Báo cáo mô tả công việc và bài học kinh nghiệm.");
        docRejected.setDocumentTypeId(assignmentTypeId);
        docRejected.setSubjectId(subInt2001.getId());
        docRejected.setMajorId(majorIs != null ? majorIs.getId() : null);
        docRejected.setAcademicYearId(year2324.getId());
        docRejected.setAdvisorName("ThS. Phạm Quang Huy");
        docRejected.setCreatedBy(sv02.getId());
        docRejected.setStatus(DocumentStatus.REJECTED);
        docRejected.setRejectionNote("Thiếu nhận xét và chữ ký đóng dấu từ phía Doanh nghiệp tiếp nhận thực tập; cấu trúc chương 3 chưa đầy đủ biểu đồ thiết kế CSDL.");
        docRejected.setViewCount(5);
        docRejected.setDownloadCount(0);
        docRejected = documentRepository.save(docRejected);

        DocumentReview reviewRejected = new DocumentReview(
                docRejected.getId(),
                admin.getId(),
                "PENDING",
                "REJECTED",
                "Thiếu nhận xét và chữ ký đóng dấu từ phía Doanh nghiệp tiếp nhận thực tập; cấu trúc chương 3 chưa đầy đủ biểu đồ thiết kế CSDL."
        );
        documentReviewRepository.save(reviewRejected);

        // 4. Sample Report (Báo cáo vi phạm đang PENDING)
        Report sampleReport = new Report();
        sampleReport.setDocumentId(docApproved.getId());
        sampleReport.setReporterId(sv02.getId());
        sampleReport.setReasonCode("COPYRIGHT_VIOLATION");
        sampleReport.setDescription("Đoạn mô tả chương 2 có nội dung tham khảo từ tài liệu mở mà chưa trích dẫn đầy đủ nguồn.");
        sampleReport.setStatus(ReportStatus.PENDING);
        reportRepository.save(sampleReport);

        log.info("Seeded default demo documents (APPROVED, PENDING, REJECTED), files, bookmarks, and reports.");
    }
}
