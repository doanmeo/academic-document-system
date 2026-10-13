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
            majorRepository.save(new Major("CN", "Mạng máy tính & Truyền thông"));
            log.info("Initialized default majors.");
        } else if (majorRepository.findByCode("CN").isEmpty()) {
            majorRepository.save(new Major("CN", "Mạng máy tính & Truyền thông"));
        }
    }

    private void initSubjects() {
        if (subjectRepository.count() == 0) {
            subjectRepository.save(new Subject("INT1001", "Nhập môn lập trình", "Kiến thức cơ sở lập trình"));
            subjectRepository.save(new Subject("INT2001", "Cơ sở dữ liệu phân tán", "Hệ quản trị CSDL quan hệ và phân tán"));
            subjectRepository.save(new Subject("INT2002", "Cấu trúc dữ liệu & GT", "Thuật toán và cấu trúc dữ liệu nâng cao"));
            subjectRepository.save(new Subject("INT2003", "Lập trình Hướng đối tượng", "OOP với Java và C++"));
            subjectRepository.save(new Subject("INT2004", "Mạng máy tính", "Kiến trúc mạng máy tính và truyền thông"));
            subjectRepository.save(new Subject("INT3001", "Phát triển phần mềm mã nguồn mở", "Mã nguồn mở và quy trình phát triển"));
            subjectRepository.save(new Subject("INT3002", "Deep Learning & AI", "Trí tuệ nhân tạo và học sâu"));
            subjectRepository.save(new Subject("INT3003", "An toàn thông tin", "Bảo mật hệ thống và an ninh mạng"));
            subjectRepository.save(new Subject("INT3004", "Hệ thống thông tin", "Phân tích và thiết kế hệ thống thông tin"));
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

            createLovValue(docType, "THESIS", "Khóa luận tốt nghiệp", 1);
            createLovValue(docType, "CAPSTONE", "Đồ án chuyên ngành", 2);
            createLovValue(docType, "PROJECT", "Bài tập lớn", 3);
            createLovValue(docType, "LECTURE", "Bài giảng & Slide", 4);
            createLovValue(docType, "EXAM", "Đề thi & Lời giải", 5);
            createLovValue(docType, "EXERCISE", "Bài tập & Thực hành", 6);
            createLovValue(docType, "LAB", "Hướng dẫn Lab", 7);
            createLovValue(docType, "SLIDE", "Slide bài giảng", 8);
            createLovValue(docType, "NOTE", "Ghi chú ôn tập", 9);
            createLovValue(docType, "ASSIGNMENT", "Bài tập lớn", 10);
            createLovValue(docType, "REFERENCE", "Tài liệu tham khảo", 11);
            createLovValue(docType, "OTHER", "Khác", 12);

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
        if (documentRepository.count() < 18) {
            if (documentRepository.count() > 0) {
                documentRepository.deleteAll();
            }
            User student1 = userRepository.findByEmail("sv01@cntt.local").orElse(null);
            User admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
            AcademicYear y1 = academicYearRepository.findByCode("2024-2025").orElse(null);
            Major se = majorRepository.findByCode("SE").orElse(null);
            Major is = majorRepository.findByCode("IS").orElse(null);
            Major cs = majorRepository.findByCode("CS").orElse(null);
            Major cn = majorRepository.findByCode("CN").orElse(null);

            Subject subDSA = subjectRepository.findByCode("INT2002").orElse(null); // Cấu trúc dữ liệu & GT
            Subject subOOP = subjectRepository.findByCode("INT2003").orElse(null); // Lập trình Hướng đối tượng
            Subject subDB = subjectRepository.findByCode("INT2001").orElse(null);  // Cơ sở dữ liệu phân tán
            Subject subNet = subjectRepository.findByCode("INT2004").orElse(null); // Mạng máy tính
            Subject subOSS = subjectRepository.findByCode("INT3001").orElse(null); // Phát triển PM mã nguồn mở
            Subject subAI = subjectRepository.findByCode("INT3002").orElse(null);  // Deep Learning & AI
            Subject subSec = subjectRepository.findByCode("INT3003").orElse(null); // An toàn thông tin
            Subject subIS = subjectRepository.findByCode("INT3004").orElse(null);  // Hệ thống thông tin

            if (student1 != null && y1 != null) {
                // 1. [KLTN] Cấu trúc dữ liệu & GT -> Khoa học máy tính (CS / Purple)
                seedDoc("Graph Algorithms: Tối ưu Phân cụm",
                        "Nghiên cứu tập trung giải quyết bài toán phân cụm đồ thị quy mô lớn với độ phức tạp tính toán tối ưu O(V log V). Ứng dụng kỹ thuật phân rã phổ kết hợp thuật toán tối ưu Louvain, giúp giảm 42% độ trễ xử lý các tập dữ liệu mạng lưới giao thông thông minh thời gian thực.",
                        "Tài liệu đồ án tốt nghiệp xuất sắc ngành Kỹ thuật Phần mềm UTC.",
                        "THESIS", DocumentStatus.APPROVED, student1, subDSA, y1, cs != null ? cs : se,
                        "PGS. TS. Đào Thị Lệ Thủy", "https://github.com/utc-fit/graph-louvain-opt",
                        1280, 320, 4.9, 48, admin, "KLTN_GraphAlgorithms_AliceWang.pdf", "docs/1/graph-algorithms.pdf", 15400000L);

                // 2. [BTL] Deep Learning & AI -> Khoa học máy tính (CS / Purple)
                seedDoc("Mô hình Học sâu trong Thị giác máy",
                        "Xây dựng kiến trúc mạng nơ-ron tích chập (CNN) phát hiện chướng ngại vật và biển báo giao thông trong điều kiện thời tiết sương mù và ánh sáng yếu.",
                        "Đồ án chuyên ngành Thị giác máy tính.",
                        "CAPSTONE", DocumentStatus.APPROVED, student1, subAI, y1, cs != null ? cs : se,
                        "TS. Nguyễn Thị Mai", "https://github.com/utc-fit/deeplearning-medical-vision",
                        1540, 410, 4.8, 36, admin, "DoAn_DeepLearning_Vision.pdf", "docs/2/deeplearning-vision.pdf", 22100000L);

                // 3. [KLTN] Mạng máy tính -> Mạng máy tính & TT (CN / Amber)
                seedDoc("Tính toán Biên trong IoT Công nghiệp với K3s & MQTT",
                        "Kiến trúc điện toán biên phân tán (Edge Computing) xử lý dữ liệu cảm biến thời gian thực, giảm áp lực băng thông lên Cloud và đảm bảo tính sẵn sàng cao.",
                        "Đồ án tốt nghiệp ứng dụng Kubernetes tại biên.",
                        "THESIS", DocumentStatus.APPROVED, student1, subNet, y1, cn != null ? cn : se,
                        "PGS. TS. Trần Văn Hùng", "https://github.com/utc-fit/edge-iot-mesh",
                        980, 210, 4.7, 19, admin, "KLTN_EdgeComputing_K3s.pdf", "docs/3/edge-iot.pdf", 8400000L);

                // 4. [Slide] Cơ sở dữ liệu phân tán -> Hệ thống thông tin (IS / Emerald)
                seedDoc("Slide Bài giảng: Thiết kế & Tối ưu Cơ sở Dữ liệu Phân tán",
                        "Phân tích kế hoạch thực thi (Execution Plan), đánh chỉ mục chuyên sâu và thiết kế bộ đệm đa tầng cho hệ thống cơ sở dữ liệu giao dịch tần suất cao.",
                        "Slide bài giảng chính quy dành cho sinh viên năm 3 Khoa CNTT UTC.",
                        "LECTURE", DocumentStatus.APPROVED, student1, subDB, y1, is != null ? is : se,
                        "ThS. Lê Hoàng Nam", "https://github.com/utc-fit/sql-distributed-opt",
                        2450, 580, 4.9, 58, admin, "Slide_CSDL_PhanTan.pdf", "docs/4/sql-opt.pdf", 14200000L);

                // 5. [Đề thi] Lập trình Hướng đối tượng -> Kỹ thuật phần mềm (SE / Navy)
                seedDoc("Bộ Đề thi & Lời giải mẫu Môn Lập trình Hướng đối tượng Java",
                        "Tuyển tập 10 bộ đề thi học kỳ kèm lời giải chi tiết, sơ đồ lớp UML và phân tích tính đa hình, trừu tượng hóa, kế thừa và đóng gói trong Java.",
                        "Tài liệu ôn thi chính thức lưu hành nội bộ Khoa CNTT.",
                        "EXAM", DocumentStatus.APPROVED, student1, subOOP, y1, se,
                        "TS. Đào Thị Lệ Thủy", "https://github.com/utc-fit/java-oop-exams",
                        3120, 890, 5.0, 92, admin, "DeThi_LoiGiai_OOP_Java.pdf", "docs/5/oop-exams.pdf", 9800000L);

                // 6. [Lab] An toàn thông tin -> Mạng máy tính & TT (CN / Amber)
                seedDoc("Tài liệu Thực hành Lab: Kiểm thử An toàn Thông tin OWASP Top 10",
                        "Phân tích các lỗ hổng bảo mật phổ biến (SQL Injection, XSS, CSRF, SSRF) và xây dựng hệ thống phòng thủ đa lớp kết hợp Web Application Firewall (WAF).",
                        "Hướng dẫn thực hành phòng lab an toàn bảo mật thông tin.",
                        "LAB", DocumentStatus.APPROVED, student1, subSec, y1, cn != null ? cn : se,
                        "ThS. Nguyễn Duy Hưng", "https://github.com/utc-fit/owasp-security-lab",
                        2150, 620, 4.9, 64, admin, "Lab_AnToanThongTin_OWASP.pdf", "docs/6/owasp-lab.pdf", 11600000L);

                // 7. [BTL] Phát triển PM mã nguồn mở -> Kỹ thuật phần mềm (SE / Navy)
                seedDoc("Kiến trúc Micro-Frontend hiện đại",
                        "Phát triển kiến trúc Web phân tán ứng dụng Module Federation, kết hợp React 19 và Tailwind CSS.",
                        "Đồ án môn học Phát triển PM Mã nguồn mở.",
                        "PROJECT", DocumentStatus.APPROVED, student1, subOSS, y1, se,
                        "ThS. Nguyễn Duy Hưng", "https://github.com/utc-fit/micro-frontends-react",
                        2340, 620, 4.9, 52, admin, "BTL_MicroFrontend_React19.pdf", "docs/7/microfrontends.pdf", 8400000L);

                // 8. [Bài tập] Cấu trúc dữ liệu & GT -> Khoa học máy tính (CS / Purple)
                seedDoc("Bài tập & Lời giải Thuật toán Quy hoạch động & Đồ thị",
                        "Tổng hợp 120 bài tập thuật toán kinh điển từ cơ bản đến nâng cao: Floyd-Warshall, Dijkstra, Knapsack, Longest Common Subsequence kèm mã nguồn mẫu C++.",
                        "Tài liệu bài tập thực hành thuật toán chuẩn UTC.",
                        "EXERCISE", DocumentStatus.APPROVED, student1, subDSA, y1, cs != null ? cs : se,
                        "TS. Vũ Trọng Khang", "https://github.com/utc-fit/dsa-dynamic-programming",
                        1430, 460, 4.8, 41, admin, "BaiTap_QuyHoachDong_DoThi.pdf", "docs/8/dsa-exercises.pdf", 7900000L);

                // 9. [Slide] Hệ thống thông tin -> Hệ thống thông tin (IS / Emerald)
                seedDoc("Slide Bài giảng: Phân tích & Thiết kế Hệ thống Thông tin UML",
                        "Hệ thống hóa toàn bộ phương pháp mô hình hóa hướng đối tượng bằng UML 2.5: Use Case, Sequence Diagram, Class Diagram và thiết kế kiến trúc kiến trúc 3 lớp.",
                        "Bài giảng đào tạo chính quy chuyên ngành HTTT.",
                        "LECTURE", DocumentStatus.APPROVED, student1, subIS, y1, is != null ? is : se,
                        "TS. Nguyễn Mạnh Hùng", "https://github.com/utc-fit/is-uml-design",
                        1620, 390, 4.7, 33, admin, "Slide_PhanTichThietKe_HTTT.pdf", "docs/9/uml-lecture.pdf", 12500000L);

                // 10. [Đề thi] Mạng máy tính -> Mạng máy tính & TT (CN / Amber)
                seedDoc("Đề thi Cuối kỳ & Đáp án Môn Mạng máy tính (2022-2025)",
                        "Tổng hợp đề thi chính thức các kỳ học qua các năm kèm bảng phân chia subnetting IPv4/IPv6, phân tích bắt gói tin Wireshark TCP/IP.",
                        "Bộ đề ôn tập kỳ thi kết thúc học phần.",
                        "EXAM", DocumentStatus.APPROVED, student1, subNet, y1, cn != null ? cn : se,
                        "PGS. TS. Trần Văn Hùng", "https://github.com/utc-fit/network-final-exams",
                        2890, 750, 4.9, 75, admin, "DeThi_MangMayTinh_UTC.pdf", "docs/10/network-exams.pdf", 6800000L);

                // 11. [Lab] Mạng máy tính -> Mạng máy tính & TT (CN / Amber)
                seedDoc("Tài liệu Hướng dẫn Cài đặt & Triển khai Docker, Kubernetes Lab",
                        "Từng bước hướng dẫn cấu hình cụm Kubernetes đa node trên máy ảo Linux, triển khai Ingress Controller và giám sát hệ thống với Prometheus & Grafana.",
                        "Tài liệu thực hành thực tế cho sinh viên.",
                        "LAB", DocumentStatus.APPROVED, student1, subNet, y1, cn != null ? cn : se,
                        "ThS. Lê Hoàng Nam", "https://github.com/utc-fit/k8s-lab-guide",
                        1760, 480, 4.8, 38, admin, "HuongDan_Lab_Docker_Kubernetes.pdf", "docs/11/k8s-lab.pdf", 13200000L);

                // 12. [BTL] Phát triển PM mã nguồn mở -> Kỹ thuật phần mềm (SE / Navy)
                seedDoc("Đồ án Xây dựng Website Bán sách Spring Boot & React",
                        "Xây dựng ứng dụng web thương mại điện tử với kiến trúc Microservices, thanh toán VNPay và xác thực JWT an toàn.",
                        "Đồ án tốt nghiệp môn học mã nguồn mở.",
                        "PROJECT", DocumentStatus.APPROVED, student1, subOSS, y1, se,
                        "ThS. Nguyễn Duy Hưng", "https://github.com/utc-fit/bookstore-fullstack",
                        1870, 510, 4.6, 44, admin, "DoAn_Website_BanSach_SpringBoot.pdf", "docs/12/bookstore.pdf", 16500000L);

                // 13. [KLTN - PENDING] Hệ thống thông tin -> Hệ thống thông tin (IS / Emerald)
                seedDoc("Nghiên cứu ứng dụng Blockchain trong xác thực văn bằng đại học",
                        "Đề tài tập trung xây dựng hệ thống quản lý và xác thực văn bằng chứng chỉ ứng dụng mạng Ethereum và smart contracts, nhằm ngăn chặn triệt để tình trạng làm giả chứng chỉ và tối ưu hóa thời gian thẩm định văn bằng cho nhà tuyển dụng.",
                        "Báo cáo Đồ án tốt nghiệp chuyên ngành Hệ thống thông tin.",
                        "THESIS", DocumentStatus.PENDING, student1, subIS, y1, is != null ? is : se,
                        "TS. Trần Văn Nam", "https://github.com/utc-fit/edu-blockchain-certs",
                        35, 5, 0.0, 0, null, "DoAn_Blockchain_XacThucVanBang.pdf", "docs/13/blockchain-certs.pdf", 12600000L);

                // 14. [BTL - PENDING] Cấu trúc dữ liệu & GT -> Khoa học máy tính (CS / Purple)
                seedDoc("Hệ thống khuyến nghị học liệu thông minh dựa trên đồ thị tri thức (Knowledge Graph)",
                        "Xây dựng mô hình đồ thị tri thức cho chương trình đào tạo ngành CNTT, kết hợp thuật toán lan truyền đồ thị GCN để gợi ý lộ trình môn học và tài liệu chuyên sâu phù hợp cho từng sinh viên.",
                        "Đồ án chuyên ngành Kỹ thuật phần mềm.",
                        "CAPSTONE", DocumentStatus.PENDING, student1, subDSA, y1, cs != null ? cs : se,
                        "PGS. TS. Đào Thị Lệ Thủy", "https://github.com/utc-fit/kg-recommender",
                        18, 2, 0.0, 0, null, "DoAn_KnowledgeGraph_Recommender.pdf", "docs/14/kg-recommender.pdf", 18400000L);

                // 15. [BTL - REVISION_REQUIRED] Cơ sở dữ liệu phân tán -> Kỹ thuật phần mềm (SE / Navy)
                seedDoc("Hệ thống Quản lý Thư viện Số UTC kiến trúc Microservices",
                        "Thiết kế hệ thống mượn trả tài liệu học thuật theo mô hình hướng dịch vụ Spring Boot 3 & Next.js.",
                        "Cần bổ sung: Sơ đồ ERD độ phân giải cao và cam kết bản quyền mã nguồn theo yêu cầu của hội đồng thẩm định.",
                        "CAPSTONE", DocumentStatus.REVISION_REQUIRED, student1, subDB, y1, se,
                        "PGS. TS. Trần Văn Hùng", "https://github.com/utc-fit/clean-library-sys",
                        120, 5, 0.0, 0, null, "DoAn_Clean_Library_V1.pdf", "docs/15/clean-library-v1.pdf", 12300000L);

                // 16. [Lab] Mạng máy tính -> Mạng máy tính & TT (CN / Amber)
                seedDoc("Tài liệu Hướng dẫn Thực hành Lab: Cấu hình VLAN & Định tuyến Router Cisco",
                        "Tài liệu thực hành chuyên sâu môn Mạng máy tính: Thiết kế topology mạng doanh nghiệp, cấu hình Trunking 802.1Q, Inter-VLAN routing và Access Control List (ACL) trên Cisco Packet Tracer.",
                        "Bài lab thực hành phòng máy bộ môn Mạng máy tính & TT.",
                        "LAB", DocumentStatus.APPROVED, student1, subNet, y1, cn != null ? cn : se,
                        "PGS. TS. Trần Văn Hùng", "https://github.com/utc-fit/cisco-packet-tracer-vlan",
                        2140, 680, 4.9, 67, admin, "Lab_Cisco_PacketTracer_VLAN.pdf", "docs/16/cisco-lab.pdf", 9600000L);

                // 17. [Lab] Lập trình Hướng đối tượng -> Kỹ thuật phần mềm (SE / Navy)
                seedDoc("Tài liệu Hướng dẫn Thực hành Lab: Thiết kế RESTful API Chuẩn OpenAPI với Spring Boot",
                        "Hướng dẫn từng bước xây dựng API dịch vụ phân tán, xác thực token JWT, tích hợp Swagger UI tài liệu hóa tự động và kiểm thử tự động với MockMvc & Postman.",
                        "Tài liệu bài tập lớn phòng Lab môn Kỹ thuật phần mềm.",
                        "LAB", DocumentStatus.APPROVED, student1, subOOP, y1, se,
                        "TS. Đào Thị Lệ Thủy", "https://github.com/utc-fit/springboot-rest-lab",
                        1890, 520, 4.8, 55, admin, "Lab_SpringBoot_Rest_OpenAPI.pdf", "docs/17/rest-api-lab.pdf", 8900000L);

                // 18. [Lab] Deep Learning & AI -> Khoa học máy tính (CS / Purple)
                seedDoc("Tài liệu Hướng dẫn Thực hành Lab: Huấn luyện Mạng Nơ-ron PyTorch trên Google Colab",
                        "Thực hành xây dựng mô hình phân loại ảnh Convolutional Neural Network (CNN) với PyTorch, xử lý tiền dữ liệu augmentation và tối ưu hàm mất mát với GPU T4.",
                        "Tài liệu thực hành chuyên ngành Khoa học máy tính & Trí tuệ nhân tạo.",
                        "LAB", DocumentStatus.APPROVED, student1, subAI, y1, cs != null ? cs : se,
                        "TS. Nguyễn Thị Mai", "https://github.com/utc-fit/pytorch-colab-vision-lab",
                        2540, 810, 5.0, 82, admin, "Lab_PyTorch_DeepLearning_Colab.pdf", "docs/18/pytorch-lab.pdf", 14500000L);

                log.info("Initialized 18 real academic demo documents across all hot subjects and document types (including 5 Lab guides).");
            }
        }
    }

    private Document seedDoc(
            String title, String abstractText, String desc, String typeCode, DocumentStatus status,
            User uploader, Subject subject, AcademicYear year, Major major, String advisor,
            String githubUrl, int views, int downloads, double rating, int ratingCount,
            User approvedBy, String fileName, String storageKey, long fileSize
    ) {
        Document doc = new Document();
        doc.setTitle(title);
        doc.setAbstractText(abstractText);
        doc.setDescription(desc);
        doc.setDocumentTypeCode(typeCode);
        doc.setStatus(status);
        doc.setUploader(uploader);
        doc.setSubject(subject);
        doc.setAcademicYear(year);
        doc.setMajor(major);
        doc.setAdvisorName(advisor);
        doc.setGithubUrl(githubUrl);
        doc.setViewCount(views);
        doc.setDownloadCount(downloads);
        doc.setAvgRating(rating);
        doc.setRatingCount(ratingCount);
        if (status == DocumentStatus.APPROVED) {
            doc.setApprovedBy(approvedBy);
            doc.setApprovedAt(java.time.LocalDateTime.now());
        }
        Document saved = documentRepository.save(doc);

        DocumentFile file = new DocumentFile();
        file.setDocument(saved);
        file.setFileName(fileName);
        file.setStorageKey(storageKey);
        file.setMimeType("application/pdf");
        file.setFileSize(fileSize);
        file.setIsPrimary(true);
        documentFileRepository.save(file);

        return saved;
    }
}

