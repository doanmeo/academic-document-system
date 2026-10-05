package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.domain.UserRole;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.DocumentReviewRepository;
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
class ModerationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentReviewRepository documentReviewRepository;

    private String adminToken;
    private String studentToken;
    private User admin;
    private User student;

    @BeforeEach
    void setUp() {
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
    @DisplayName("GET /api/admin/documents/pending by Student should return 403 Forbidden")
    void getPendingByStudentShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/documents/pending")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/admin/documents/pending by Admin should return 200 OK")
    void getPendingByAdminShouldReturn200() throws Exception {
        Document doc = new Document();
        doc.setTitle("Pending Paper");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.PENDING);
        documentRepository.save(doc);

        mockMvc.perform(get("/api/admin/documents/pending")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].title").value("Pending Paper"));
    }

    @Test
    @DisplayName("POST /api/admin/documents/{id}/approve by Admin should succeed and record review")
    void approveDocumentByAdminShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Ready to Approve");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.PENDING);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/admin/documents/" + doc.getId() + "/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"Nội dung rất tốt, phê duyệt.\"}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));

        // Verify review history
        mockMvc.perform(get("/api/admin/documents/" + doc.getId() + "/reviews")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].toStatus").value("APPROVED"));
    }

    @Test
    @DisplayName("POST /api/admin/documents/{id}/reject without valid note should return 400")
    void rejectDocumentWithoutNoteShouldReturn400() throws Exception {
        Document doc = new Document();
        doc.setTitle("Doc to Reject");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.PENDING);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/admin/documents/" + doc.getId() + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"\"}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID_REJECTION_NOTE"));
    }

    @Test
    @DisplayName("POST /api/admin/documents/{id}/reject with valid note should succeed")
    void rejectDocumentWithValidNoteShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Doc to Reject");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.PENDING);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/admin/documents/" + doc.getId() + "/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"note\":\"Thiếu danh mục tài liệu tham khảo.\"}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.rejectionNote").value("Thiếu danh mục tài liệu tham khảo."));
    }

    @Test
    @DisplayName("POST /api/admin/documents/{id}/hide should transition to HIDDEN")
    void hideDocumentShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Violating Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/admin/documents/" + doc.getId() + "/hide")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"reason\":\"Vi phạm bản quyền nội dung.\"}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("HIDDEN"));
    }
}
