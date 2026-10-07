package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.repository.AcademicYearRepository;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.TechnologyRepository;
import com.cntt.academicdocs.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class BackendRemediationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFileRepository documentFileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private TechnologyRepository technologyRepository;

    @Autowired
    private com.cntt.academicdocs.repository.SubjectRepository subjectRepository;

    private String adminToken;
    private String studentToken;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.findByEmail("admin@cntt.local").ifPresent(u -> {
            u.setActive(true);
            userRepository.save(u);
        });
        userRepository.findByEmail("sv01@cntt.local").ifPresent(u -> {
            u.setActive(true);
            userRepository.save(u);
        });
        userRepository.findByEmail("sv02@cntt.local").ifPresent(u -> {
            u.setActive(true);
            userRepository.save(u);
        });

        if (adminToken == null) {
            String adminLoginJson = "{\"email\":\"admin@cntt.local\",\"password\":\"Admin@123\"}";
            MvcResult adminRes = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(adminLoginJson))
                    .andExpect(status().isOk())
                    .andReturn();
            JsonNode adminNode = objectMapper.readTree(adminRes.getResponse().getContentAsString());
            adminToken = adminNode.path("data").path("accessToken").asText();
        }

        if (studentToken == null) {
            String studentLoginJson = "{\"email\":\"sv01@cntt.local\",\"password\":\"Student@123\"}";
            MvcResult studentRes = mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(studentLoginJson))
                    .andExpect(status().isOk())
                    .andReturn();
            JsonNode studentNode = objectMapper.readTree(studentRes.getResponse().getContentAsString());
            studentToken = studentNode.path("data").path("accessToken").asText();
        }
    }

    @Test
    void testUnauthenticatedAdminAccessReturns401ApiEnvelope() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isNotEmpty())
                .andExpect(jsonPath("$.errors[0].code").value("UNAUTHORIZED"));
    }

    @Test
    void testStudentAccessAdminEndpointsReturns403ApiEnvelope() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/admin/documents/pending")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("FORBIDDEN"));
    }

    @Test
    void testAdminAccessAdminDashboardWithPendingDocuments() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pendingDocuments").isNumber());
    }

    @Test
    void testAdminCatalogPutEndpoints() throws Exception {
        var years = academicYearRepository.findAll();
        if (years.isEmpty()) {
            academicYearRepository.save(new com.cntt.academicdocs.domain.AcademicYear("2024-2025", "Năm học 2024-2025", (short) 2024));
            years = academicYearRepository.findAll();
        }
        Long yearId = years.get(0).getId();

        String yearUpdate = "{\"name\":\"Năm học đã cập nhật\",\"startYear\":2025}";
        mockMvc.perform(put("/api/admin/academic-years/" + yearId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(yearUpdate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Năm học đã cập nhật"));

        var techs = technologyRepository.findAll();
        if (techs.isEmpty()) {
            techs = java.util.List.of(technologyRepository.save(new com.cntt.academicdocs.domain.Technology("React", "react")));
        }
        Long techId = techs.get(0).getId();

        String techUpdate = "{\"name\":\"React Remediated\",\"slug\":\"react-remediated\"}";
        mockMvc.perform(put("/api/admin/technologies/" + techId)
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(techUpdate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("React Remediated"));
    }

    @Test
    void testToggleActiveContractAndQueryParam() throws Exception {
        User student2 = userRepository.findByEmail("sv02@cntt.local").orElseThrow();

        // Test with active field
        String toggleJsonActive = "{\"active\":false}";
        mockMvc.perform(patch("/api/admin/users/" + student2.getId() + "/active")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toggleJsonActive))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Test with isActive field
        String toggleJsonIsActive = "{\"isActive\":true}";
        mockMvc.perform(patch("/api/admin/users/" + student2.getId() + "/active")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(toggleJsonIsActive))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Test GET with active query param alias
        mockMvc.perform(get("/api/admin/users?active=true")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testDocumentSearchSortByAndSortDir() throws Exception {
        mockMvc.perform(get("/api/documents/search")
                        .header("Authorization", "Bearer " + studentToken)
                        .param("sortBy", "viewCount")
                        .param("sortDir", "desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    void testUrlXssValidationOnDocumentCreate() throws Exception {
        String xssPayload = """
                {
                    "title": "Tài liệu kiểm thử XSS",
                    "abstractText": "Mô tả tóm tắt kiểm tra tính hợp lệ của URL",
                    "documentTypeCode": "THESIS",
                    "subjectId": 1,
                    "academicYearId": 1,
                    "githubUrl": "javascript:alert(1)"
                }
                """;

        mockMvc.perform(post("/api/documents")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(xssPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("VALIDATION_ERROR"));
    }

    @Test
    void testFileAccessControlAndDownloadCountIncrement() throws Exception {
        var files = documentFileRepository.findAll();
        DocumentFile approvedFile;
        if (files.isEmpty()) {
            User student1 = userRepository.findByEmail("sv01@cntt.local").orElseThrow();
            var subjectList = subjectRepository.findAll();
            var yearList = academicYearRepository.findAll();
            var subj = subjectList.isEmpty() ? subjectRepository.save(new com.cntt.academicdocs.domain.Subject("INT1001", "Lap trinh", "Mon hoc")) : subjectList.get(0);
            var yr = yearList.isEmpty() ? academicYearRepository.save(new com.cntt.academicdocs.domain.AcademicYear("2024-2025", "Nam hoc 2024-2025", (short) 2024)) : yearList.get(0);

            Document appDoc = new Document();
            appDoc.setTitle("Tài liệu đã duyệt mẫu");
            appDoc.setAbstractText("Đã được phê duyệt");
            appDoc.setDocumentTypeCode("THESIS");
            appDoc.setStatus(DocumentStatus.APPROVED);
            appDoc.setUploader(student1);
            appDoc.setAcademicYear(yr);
            appDoc.setSubject(subj);
            appDoc = documentRepository.save(appDoc);

            approvedFile = new DocumentFile();
            approvedFile.setDocument(appDoc);
            approvedFile.setFileName("sample.pdf");
            approvedFile.setStorageKey("docs/sample/sample.pdf");
            approvedFile.setMimeType("application/pdf");
            approvedFile.setFileSize(2000L);
            approvedFile.setIsPrimary(true);
            approvedFile = documentFileRepository.save(approvedFile);
        } else {
            approvedFile = files.get(0);
        }
        Long docId = approvedFile.getDocument().getId();
        int initialDownloads = documentRepository.findById(docId).orElseThrow().getDownloadCount();

        // 1. Download approved file as authenticated student -> Should succeed and increment download count
        mockMvc.perform(get("/api/files/" + approvedFile.getId() + "/download-url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.url").isNotEmpty());

        int updatedDownloads = documentRepository.findById(docId).orElseThrow().getDownloadCount();
        assertThat(updatedDownloads).isEqualTo(initialDownloads + 1);

        // 2. Create a DRAFT document owned by student1 (sv01)
        User student1 = userRepository.findByEmail("sv01@cntt.local").orElseThrow();
        Document draftDoc = new Document();
        draftDoc.setTitle("Tài liệu nháp bí mật");
        draftDoc.setAbstractText("Chưa được phê duyệt");
        draftDoc.setDocumentTypeCode("THESIS");
        draftDoc.setStatus(DocumentStatus.DRAFT);
        draftDoc.setUploader(student1);
        draftDoc.setAcademicYear(academicYearRepository.findAll().get(0));
        draftDoc.setSubject(subjectRepository.findAll().get(0));
        draftDoc = documentRepository.save(draftDoc);

        DocumentFile draftFile = new DocumentFile();
        draftFile.setDocument(draftDoc);
        draftFile.setFileName("draft.pdf");
        draftFile.setStorageKey("docs/draft/draft.pdf");
        draftFile.setMimeType("application/pdf");
        draftFile.setFileSize(1000L);
        draftFile = documentFileRepository.save(draftFile);

        // Student2 (sv02) tries to download student1's draft file -> 403 Forbidden
        String student2LoginJson = "{\"email\":\"sv02@cntt.local\",\"password\":\"Student@123\"}";
        MvcResult s2Res = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(student2LoginJson))
                .andExpect(status().isOk())
                .andReturn();
        String student2Token = objectMapper.readTree(s2Res.getResponse().getContentAsString())
                .path("data").path("accessToken").asText();

        mockMvc.perform(get("/api/files/" + draftFile.getId() + "/download-url")
                        .header("Authorization", "Bearer " + student2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("FORBIDDEN"));

        // Student2 tries preview URL of student1's draft file -> 403 Forbidden
        mockMvc.perform(get("/api/files/" + draftFile.getId() + "/preview-url")
                        .header("Authorization", "Bearer " + student2Token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));

        // Owner (student1) tries preview URL -> 200 OK
        mockMvc.perform(get("/api/files/" + draftFile.getId() + "/preview-url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Admin tries preview URL -> 200 OK
        mockMvc.perform(get("/api/files/" + draftFile.getId() + "/preview-url")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void testGlobalExceptionHandlerSanitizesSensitiveInternalErrors() {
        com.cntt.academicdocs.exception.GlobalExceptionHandler handler = new com.cntt.academicdocs.exception.GlobalExceptionHandler();
        RuntimeException sensitiveException = new RuntimeException("SQL syntax error at line 1: SELECT password_hash, secret_key FROM users WHERE id = 1");

        var response = handler.handleGenericException(sensitiveException);

        assertThat(response.getStatusCode()).isEqualTo(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().isSuccess()).isFalse();
        assertThat(response.getBody().getMessage()).isEqualTo("Đã xảy ra lỗi hệ thống nội bộ. Vui lòng liên hệ ban quản trị.");
        assertThat(response.getBody().getErrors()).hasSize(1);
        assertThat(response.getBody().getErrors().get(0).getMessage()).isEqualTo("Đã xảy ra lỗi hệ thống nội bộ. Vui lòng liên hệ ban quản trị.");
        assertThat(response.getBody().getErrors().get(0).getCode()).isEqualTo("INTERNAL_SERVER_ERROR");
        assertThat(response.getBody().getMessage()).doesNotContain("SQL");
        assertThat(response.getBody().getErrors().get(0).getMessage()).doesNotContain("SQL");
    }

    @Test
    void testDocumentTechnologyDtoExposesNameAlias() throws Exception {
        com.cntt.academicdocs.dto.DocumentTechnologyDTO dto = new com.cntt.academicdocs.dto.DocumentTechnologyDTO();
        dto.setId(10L);
        dto.setTechnologyId(20L);
        dto.setTechnologyName("Spring Boot");

        String json = objectMapper.writeValueAsString(dto);
        JsonNode node = objectMapper.readTree(json);

        assertThat(node.has("technologyName")).isTrue();
        assertThat(node.path("technologyName").asText()).isEqualTo("Spring Boot");
        assertThat(node.has("name")).isTrue();
        assertThat(node.path("name").asText()).isEqualTo("Spring Boot");
    }
}
