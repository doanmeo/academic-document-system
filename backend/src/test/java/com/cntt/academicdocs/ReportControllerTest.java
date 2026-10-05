package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.DocumentReviewRepository;
import com.cntt.academicdocs.repository.ReportRepository;
import com.cntt.academicdocs.repository.UserRepository;
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
    private DocumentReviewRepository documentReviewRepository;

    private String adminToken;
    private String studentToken;
    private User admin;
    private User student;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
        documentReviewRepository.deleteAll();
        documentRepository.deleteAll();

        admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail("admin@cntt.local");
            admin.setPasswordHash("$2a$10$dummy");
            admin.setFullName("Admin User");
            admin.setRole(UserRole.ADMIN);
            admin = userRepository.save(admin);
        }

        student = userRepository.findByEmail("sv01@cntt.local").orElse(null);
        if (student == null) {
            student = new User();
            student.setEmail("sv01@cntt.local");
            student.setPasswordHash("$2a$10$dummy");
            student.setFullName("Student One");
            student.setRole(UserRole.STUDENT);
            student = userRepository.save(student);
        }

        adminToken = jwtUtil.generateAccessToken(admin);
        studentToken = jwtUtil.generateAccessToken(student);
    }

    @Test
    @DisplayName("POST /api/documents/{id}/reports for APPROVED document should succeed (201)")
    void submitReportForApprovedDocShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Approved Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
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
    @DisplayName("POST /api/documents/{id}/reports for DRAFT document should fail (400)")
    void submitReportForDraftDocShouldFail() throws Exception {
        Document doc = new Document();
        doc.setTitle("Draft Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        String json = "{\"reasonCode\":\"SPAM\",\"description\":\"Nội dung rác.\"}";

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/reports")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID_DOCUMENT_STATUS"));
    }

    @Test
    @DisplayName("GET /api/users/me/reports should return student reports (200)")
    void getMyReportsShouldSucceed() throws Exception {
        Report report = new Report();
        report.setDocumentId(1L);
        report.setReporterId(student.getId());
        report.setReasonCode("PLAGIARISM");
        report.setStatus(ReportStatus.PENDING);
        reportRepository.save(report);

        mockMvc.perform(get("/api/users/me/reports")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].reasonCode").value("PLAGIARISM"));
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
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Report report = new Report();
        report.setDocumentId(doc.getId());
        report.setReporterId(student.getId());
        report.setReasonCode("COPYRIGHT_VIOLATION");
        report.setStatus(ReportStatus.PENDING);
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
