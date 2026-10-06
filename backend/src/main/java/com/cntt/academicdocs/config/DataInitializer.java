package com.cntt.academicdocs.config;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final PasswordEncoder passwordEncoder;
    private final DocumentRepository documentRepository;
    private final DocumentFileRepository documentFileRepository;

    public DataInitializer(
            UserRepository userRepository,
            MajorRepository majorRepository,
            SubjectRepository subjectRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository,
            LovGroupRepository lovGroupRepository,
            LovValueRepository lovValueRepository,
            PasswordEncoder passwordEncoder,
            DocumentRepository documentRepository,
            DocumentFileRepository documentFileRepository
    ) {
        this.userRepository = userRepository;
        this.majorRepository = majorRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
        this.lovGroupRepository = lovGroupRepository;
        this.lovValueRepository = lovValueRepository;
        this.passwordEncoder = passwordEncoder;
        this.documentRepository = documentRepository;
        this.documentFileRepository = documentFileRepository;
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
        initDocuments();
    }

    private void initMajors() {
        if (majorRepository.count() == 0) {
            majorRepository.save(new Major("SE", "Kỹ thuật phần mềm"));
            majorRepository.save(new Major("IS", "Hệ thống thông tin"));
            majorRepository.save(new Major("CS", "Khoa học máy tính"));
            log.info("Initialized default majors.");
        }
    }

    private void initSubjects() {
        if (subjectRepository.count() == 0) {
            subjectRepository.save(new Subject("INT1001", "Nhập môn lập trình", "Kiến thức cơ sở lập trình"));
            subjectRepository.save(new Subject("INT2001", "Cơ sở dữ liệu", "Hệ quản trị CSDL quan hệ"));
            subjectRepository.save(new Subject("INT3001", "Phát triển phần mềm mã nguồn mở", "Mã nguồn mở và quy trình phát triển"));
            log.info("Initialized default subjects.");
        }
    }

    private void initAcademicYears() {
        if (academicYearRepository.count() == 0) {
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

    private void initDocuments() {
        if (documentRepository.count() == 0) {
            User student1 = userRepository.findByEmail("sv01@cntt.local").orElse(null);
            User admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
            Subject s1 = subjectRepository.findByCode("INT1001").orElse(null);
            Subject s2 = subjectRepository.findByCode("INT2001").orElse(null);
            Subject s3 = subjectRepository.findByCode("INT3001").orElse(null);
            AcademicYear y1 = academicYearRepository.findByCode("2024-2025").orElse(null);
            Major se = majorRepository.findByCode("SE").orElse(null);

            if (student1 != null && s1 != null && y1 != null) {
                Document doc1 = new Document();
                doc1.setTitle("Graph Algorithms: Tối ưu Phân cụm");
                doc1.setAbstractText("Nghiên cứu tập trung giải quyết bài toán phân cụm đồ thị quy mô lớn với độ phức tạp tính toán tối ưu O(V log V). Ứng dụng kỹ thuật phân rã phổ kết hợp thuật toán tối ưu Louvain, giúp giảm 42% độ trễ xử lý các tập dữ liệu mạng lưới giao thông thông minh thời gian thực.");
                doc1.setDescription("Tài liệu đồ án tốt nghiệp xuất sắc ngành Kỹ thuật Phần mềm UTC.");
                doc1.setDocumentTypeCode("THESIS");
                doc1.setStatus(DocumentStatus.APPROVED);
                doc1.setUploader(student1);
                doc1.setSubject(s1);
                doc1.setAcademicYear(y1);
                doc1.setMajor(se);
                doc1.setAdvisorName("PGS. TS. Đào Thị Lệ Thủy");
                doc1.setGithubUrl("https://github.com/utc-fit/graph-louvain-opt");
                doc1.setViewCount(1280);
                doc1.setDownloadCount(320);
                doc1.setAvgRating(4.9);
                doc1.setRatingCount(48);
                doc1.setApprovedBy(admin);
                doc1.setApprovedAt(java.time.LocalDateTime.now());
                Document savedDoc1 = documentRepository.save(doc1);

                DocumentFile file1 = new DocumentFile();
                file1.setDocument(savedDoc1);
                file1.setFileName("KLTN_GraphAlgorithms_AliceWang.pdf");
                file1.setStorageKey("docs/1/graph-algorithms.pdf");
                file1.setMimeType("application/pdf");
                file1.setFileSize(15400000L);
                file1.setIsPrimary(true);
                documentFileRepository.save(file1);

                if (s2 != null) {
                    Document doc2 = new Document();
                    doc2.setTitle("Mô hình Học sâu trong Thị giác máy");
                    doc2.setAbstractText("Xây dựng kiến trúc mạng nơ-ron tích chập (CNN) phát hiện chướng ngại vật và biển báo giao thông trong điều kiện thời tiết sương mù và ánh sáng yếu.");
                    doc2.setDescription("Đồ án chuyên ngành Thị giác máy tính.");
                    doc2.setDocumentTypeCode("CAPSTONE");
                    doc2.setStatus(DocumentStatus.APPROVED);
                    doc2.setUploader(student1);
                    doc2.setSubject(s2);
                    doc2.setAcademicYear(y1);
                    doc2.setMajor(se);
                    doc2.setAdvisorName("TS. Nguyễn Thị Mai");
                    doc2.setGithubUrl("https://github.com/utc-fit/deeplearning-medical-vision");
                    doc2.setViewCount(1540);
                    doc2.setDownloadCount(410);
                    doc2.setAvgRating(4.8);
                    doc2.setRatingCount(36);
                    doc2.setApprovedBy(admin);
                    doc2.setApprovedAt(java.time.LocalDateTime.now());
                    Document savedDoc2 = documentRepository.save(doc2);

                    DocumentFile file2 = new DocumentFile();
                    file2.setDocument(savedDoc2);
                    file2.setFileName("DoAn_DeepLearning_Vision.pdf");
                    file2.setStorageKey("docs/2/deeplearning-vision.pdf");
                    file2.setMimeType("application/pdf");
                    file2.setFileSize(22100000L);
                    file2.setIsPrimary(true);
                    documentFileRepository.save(file2);
                }

                if (s3 != null) {
                    Document doc3 = new Document();
                    doc3.setTitle("Kiến trúc Micro-Frontend hiện đại");
                    doc3.setAbstractText("Phát triển kiến trúc Web phân tán ứng dụng Module Federation, kết hợp React 19 và Tailwind CSS.");
                    doc3.setDescription("Đồ án môn học Phát triển PM Mã nguồn mở.");
                    doc3.setDocumentTypeCode("PROJECT");
                    doc3.setStatus(DocumentStatus.APPROVED);
                    doc3.setUploader(student1);
                    doc3.setSubject(s3);
                    doc3.setAcademicYear(y1);
                    doc3.setMajor(se);
                    doc3.setAdvisorName("ThS. Nguyễn Duy Hưng");
                    doc3.setGithubUrl("https://github.com/utc-fit/micro-frontends-react");
                    doc3.setViewCount(2340);
                    doc3.setDownloadCount(620);
                    doc3.setAvgRating(4.9);
                    doc3.setRatingCount(52);
                    doc3.setApprovedBy(admin);
                    doc3.setApprovedAt(java.time.LocalDateTime.now());
                    Document savedDoc3 = documentRepository.save(doc3);

                    DocumentFile file3 = new DocumentFile();
                    file3.setDocument(savedDoc3);
                    file3.setFileName("BTL_MicroFrontend_React19.pdf");
                    file3.setStorageKey("docs/3/microfrontends.pdf");
                    file3.setMimeType("application/pdf");
                    file3.setFileSize(8400000L);
                    file3.setIsPrimary(true);
                    documentFileRepository.save(file3);
                }

                // Sample Pending Documents for Review Queue
                if (s1 != null) {
                    Document doc4 = new Document();
                    doc4.setTitle("Nghiên cứu ứng dụng Blockchain trong xác thực văn bằng đại học");
                    doc4.setAbstractText("Đề tài tập trung xây dựng hệ thống quản lý và xác thực văn bằng chứng chỉ ứng dụng mạng Ethereum và smart contracts, nhằm ngăn chặn triệt để tình trạng làm giả chứng chỉ và tối ưu hóa thời gian thẩm định văn bằng cho nhà tuyển dụng.");
                    doc4.setDescription("Báo cáo Đồ án tốt nghiệp chuyên ngành Hệ thống thông tin.");
                    doc4.setDocumentTypeCode("THESIS");
                    doc4.setStatus(DocumentStatus.PENDING);
                    doc4.setUploader(student1);
                    doc4.setSubject(s1);
                    doc4.setAcademicYear(y1);
                    doc4.setMajor(se);
                    doc4.setAdvisorName("TS. Trần Văn Nam");
                    doc4.setGithubUrl("https://github.com/utc-fit/edu-blockchain-certs");
                    doc4.setViewCount(35);
                    doc4.setDownloadCount(5);
                    Document savedDoc4 = documentRepository.save(doc4);

                    DocumentFile file4 = new DocumentFile();
                    file4.setDocument(savedDoc4);
                    file4.setFileName("DoAn_Blockchain_XacThucVanBang.pdf");
                    file4.setStorageKey("docs/4/blockchain-certs.pdf");
                    file4.setMimeType("application/pdf");
                    file4.setFileSize(12600000L);
                    file4.setIsPrimary(true);
                    documentFileRepository.save(file4);
                }

                if (s2 != null) {
                    Document doc5 = new Document();
                    doc5.setTitle("Hệ thống khuyến nghị học liệu thông minh dựa trên đồ thị tri thức (Knowledge Graph)");
                    doc5.setAbstractText("Xây dựng mô hình đồ thị tri thức cho chương trình đào tạo ngành CNTT, kết hợp thuật toán lan truyền đồ thị GCN để gợi ý lộ trình môn học và tài liệu chuyên sâu phù hợp cho từng sinh viên.");
                    doc5.setDescription("Đồ án chuyên ngành Kỹ thuật phần mềm.");
                    doc5.setDocumentTypeCode("CAPSTONE");
                    doc5.setStatus(DocumentStatus.PENDING);
                    doc5.setUploader(student1);
                    doc5.setSubject(s2);
                    doc5.setAcademicYear(y1);
                    doc5.setMajor(se);
                    doc5.setAdvisorName("PGS. TS. Đào Thị Lệ Thủy");
                    doc5.setGithubUrl("https://github.com/utc-fit/kg-recommender");
                    doc5.setViewCount(18);
                    doc5.setDownloadCount(2);
                    Document savedDoc5 = documentRepository.save(doc5);

                    DocumentFile file5 = new DocumentFile();
                    file5.setDocument(savedDoc5);
                    file5.setFileName("DoAn_KnowledgeGraph_Recommender.pdf");
                    file5.setStorageKey("docs/5/kg-recommender.pdf");
                    file5.setMimeType("application/pdf");
                    file5.setFileSize(18400000L);
                    file5.setIsPrimary(true);
                    documentFileRepository.save(file5);
                }

                log.info("Initialized default approved and pending demo documents and files.");
            }
        }
    }
}

