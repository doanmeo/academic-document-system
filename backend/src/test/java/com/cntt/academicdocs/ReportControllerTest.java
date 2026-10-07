package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.repository.*;
import com.cntt.academicdocs.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    private String adminToken;
    private String studentToken;
    private User admin;
    private User student;
    private Subject subject;
    private AcademicYear academicYear;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
        documentRepository.deleteAll();

        admin = userRepository.findByEmail("admin_report@cntt.local").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail("admin_report@cntt.local");
            admin.setPasswordHash("$2a$10$dummy");
            admin.setFullName("Admin Report User");
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            admin = userRepository.save(admin);
        } else {
            admin.setActive(true);
            admin = userRepository.save(admin);
        }

        student = userRepository.findByEmail("sv_report@cntt.local").orElse(null);
        if (student == null) {
            student = new User();
            student.setEmail("sv_report@cntt.local");
            student.setPasswordHash("$2a$10$dummy");
            student.setFullName("Student Report Tester");
            student.setRole(UserRole.STUDENT);
            student.setActive(true);
            student = userRepository.save(student);
        } else {
            student.setActive(true);
            student = userRepository.save(student);
        }

        subject = subjectRepository.findAll().stream().findFirst().orElseGet(() ->
                subjectRepository.save(new Subject("INT1001", "Lap trinh", "Mon hoc"))
        );

        academicYear = academicYearRepository.findAll().stream().findFirst().orElseGet(() ->
                academicYearRepository.save(new AcademicYear("2024-2025", "Nam hoc 2024-2025", (short) 2024))
        );

        adminToken = jwtUtil.generateAccessToken(admin);
        studentToken = jwtUtil.generateAccessToken(student);
    }

    @Test
    @DisplayName("POST /api/documents/{id}/reports for APPROVED document should succeed (201)")
    void submitReportForApprovedDocShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Approved Document");
        doc.setAbstractText("Nghien cuu bao cao");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        String json = "{\"reasonCode\":\"COPYRIGHT_VIOLATION\",\"description\":\"Tài liệu sao chép đồ án năm 2024.\"}";

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.reasonCode").value("COPYRIGHT_VIOLATION"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/reports for DRAFT document should fail (422)")
    void submitReportForDraftDocShouldFail() throws Exception {
        Document doc = new Document();
        doc.setTitle("Draft Document");
        doc.setAbstractText("Nghien cuu nhap");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        String json = "{\"reasonCode\":\"SPAM\",\"description\":\"Nội dung rác.\"}";

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("DOCUMENT_NOT_APPROVED"));
    }

    @Test
    @DisplayName("GET /api/users/me/reports should return student reports (200)")
    void getMyReportsShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Reported Document");
        doc.setAbstractText("Nghien cuu bao cao");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Report report = new Report();
        report.setDocument(doc);
        report.setReporter(student);
        report.setReasonCode("PLAGIARISM");
        report.setDescription("Tài liệu nghi ngờ sao chép nội dung");
        report.setStatus("PENDING");
        reportRepository.save(report);

        mockMvc.perform(get("/api/users/me/reports")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/reports by Student should return 403 Forbidden")
    void getAdminReportsByStudentShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/reports")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/admin/reports/{id}/handle with hideDocument=true should hide document")
    void handleReportWithHideDocumentShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Violating Thesis");
        doc.setAbstractText("Nghien cuu vi pham");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Report report = new Report();
        report.setDocument(doc);
        report.setReporter(student);
        report.setReasonCode("COPYRIGHT_VIOLATION");
        report.setDescription("Tài liệu vi phạm bản quyền đề tài 2024");
        report.setStatus("PENDING");
        report = reportRepository.save(report);

        String handleJson = "{\"decision\":\"RESOLVED\",\"note\":\"Xác minh vi phạm bản quyền, ẩn tài liệu.\",\"hideDocument\":true}";

        mockMvc.perform(post("/api/admin/reports/" + report.getId() + "/handle")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(handleJson)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));

        // Verify document is now HIDDEN
        Document updatedDoc = documentRepository.findById(doc.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(DocumentStatus.HIDDEN, updatedDoc.getStatus());
    }
}
