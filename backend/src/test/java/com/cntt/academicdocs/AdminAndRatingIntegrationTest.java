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
class AdminAndRatingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    private String adminToken;
    private String studentToken;
    private User admin;
    private User student;
    private Subject sampleSubject;
    private AcademicYear sampleAcademicYear;

    @BeforeEach
    void setUp() {
        ratingRepository.deleteAll();
        documentRepository.deleteAll();

        admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail("admin@cntt.local");
            admin.setPasswordHash("$2a$10$dummy");
            admin.setFullName("Admin User");
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            admin = userRepository.save(admin);
        }

        student = userRepository.findByEmail("sv01@cntt.local").orElse(null);
        if (student == null) {
            student = new User();
            student.setEmail("sv01@cntt.local");
            student.setPasswordHash("$2a$10$dummy");
            student.setFullName("Student One");
            student.setRole(UserRole.STUDENT);
            student.setActive(true);
            student = userRepository.save(student);
        }

        sampleSubject = subjectRepository.findAll().stream().findFirst().orElseGet(() -> {
            Subject s = new Subject();
            s.setCode("TEST_SUB");
            s.setName("Test Subject");
            s.setActive(true);
            return subjectRepository.save(s);
        });

        sampleAcademicYear = academicYearRepository.findAll().stream().findFirst().orElseGet(() -> {
            AcademicYear ay = new AcademicYear();
            ay.setCode("2025-2026");
            ay.setName("Năm học 2025-2026");
            ay.setStartYear((short) 2025);
            ay.setActive(true);
            return academicYearRepository.save(ay);
        });

        adminToken = jwtUtil.generateAccessToken(admin);
        studentToken = jwtUtil.generateAccessToken(student);
    }

    @Test
    @DisplayName("GET /api/admin/dashboard by Admin should return 200 with statistics")
    void getDashboardByAdminShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDocuments").exists())
                .andExpect(jsonPath("$.data.totalUsers").exists())
                .andExpect(jsonPath("$.data.topDocuments").isArray());
    }

    @Test
    @DisplayName("GET /api/admin/dashboard by Student should return 403 Forbidden")
    void getDashboardByStudentShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/admin/users by Admin should return paginated list")
    void getAdminUsersByAdminShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("PATCH /api/admin/users/{id}/active should toggle user active status")
    void toggleUserActiveShouldSucceed() throws Exception {
        mockMvc.perform(patch("/api/admin/users/" + student.getId() + "/active")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"isActive\":false}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.active").value(false));
    }

    @Test
    @DisplayName("PUT /api/users/me should update current user profile")
    void updateProfileShouldSucceed() throws Exception {
        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"Updated Student Name\"}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Updated Student Name"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/rate on APPROVED document should succeed")
    void rateApprovedDocumentShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Approved Document to Rate");
        doc.setAbstractText("Sample abstract");
        doc.setDocumentTypeCode("PROJECT");
        doc.setSubject(sampleSubject);
        doc.setAcademicYear(sampleAcademicYear);
        doc.setUploader(admin);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/rate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":5}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(delete("/api/documents/" + doc.getId() + "/rate")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/rate with invalid score should return 400")
    void rateDocumentWithInvalidScoreShouldReturn400() throws Exception {
        Document doc = new Document();
        doc.setTitle("Another Approved Document");
        doc.setAbstractText("Sample abstract");
        doc.setDocumentTypeCode("PROJECT");
        doc.setSubject(sampleSubject);
        doc.setAcademicYear(sampleAcademicYear);
        doc.setUploader(admin);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/rate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\":6}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/admin/subjects by Admin should create subject")
    void adminCreateSubjectShouldSucceed() throws Exception {
        String testCode = "TEST999";
        subjectRepository.findByCode(testCode).ifPresent(subjectRepository::delete);

        mockMvc.perform(post("/api/admin/subjects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + testCode + "\",\"name\":\"Test Subject\",\"description\":\"Testing\"}")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.code").value(testCode));
    }
}
