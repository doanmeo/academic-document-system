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

    public DataInitializer(
            UserRepository userRepository,
            MajorRepository majorRepository,
            SubjectRepository subjectRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository,
            LovGroupRepository lovGroupRepository,
            LovValueRepository lovValueRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.majorRepository = majorRepository;
        this.subjectRepository = subjectRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
        this.lovGroupRepository = lovGroupRepository;
        this.lovValueRepository = lovValueRepository;
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
}
