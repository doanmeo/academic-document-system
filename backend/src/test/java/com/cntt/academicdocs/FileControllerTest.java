package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.domain.UserRole;
import com.cntt.academicdocs.repository.DocumentFileRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.UserRepository;
import com.cntt.academicdocs.service.FileStorageService;
import com.cntt.academicdocs.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFileRepository documentFileRepository;

    @Autowired
    private FileStorageService fileStorageService;

    private String studentToken;
    private String otherStudentToken;
    private String adminToken;
    private User student;
    private User otherStudent;

    @TestConfiguration
    static class MockConfig {
        @Bean
        @Primary
        public FileStorageService mockFileStorageService() {
            FileStorageService mock = Mockito.mock(FileStorageService.class);
            Mockito.when(mock.upload(any(org.springframework.web.multipart.MultipartFile.class), anyString()))
                    .thenReturn("temp/test-mock-uuid.pdf");
            Mockito.when(mock.createSignedUrl(anyString(), anyInt()))
                    .thenReturn("https://test.supabase.co/storage/v1/object/sign/documents/test.pdf?token=mock");
            return mock;
        }
    }

    @BeforeEach
    void setUp() {
        documentFileRepository.deleteAll();
        documentRepository.deleteAll();

        student = userRepository.findByEmail("sv01@cntt.local").orElse(null);
        if (student == null) {
            student = new User();
            student.setEmail("sv01@cntt.local");
            student.setPasswordHash("$2a$10$dummy");
            student.setFullName("Student One");
            student.setRole(UserRole.STUDENT);
            student = userRepository.save(student);
        }

        otherStudent = userRepository.findByEmail("sv02@cntt.local").orElse(null);
        if (otherStudent == null) {
            otherStudent = new User();
            otherStudent.setEmail("sv02@cntt.local");
            otherStudent.setPasswordHash("$2a$10$dummy");
            otherStudent.setFullName("Student Two");
            otherStudent.setRole(UserRole.STUDENT);
            otherStudent = userRepository.save(otherStudent);
        }

        User admin = userRepository.findByEmail("admin@cntt.local").orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail("admin@cntt.local");
            admin.setPasswordHash("$2a$10$dummy");
            admin.setFullName("Admin User");
            admin.setRole(UserRole.ADMIN);
            admin = userRepository.save(admin);
        }

        studentToken = jwtUtil.generateAccessToken(student);
        otherStudentToken = jwtUtil.generateAccessToken(otherStudent);
        adminToken = jwtUtil.generateAccessToken(admin);
    }

    @Test
    @DisplayName("POST /api/files/upload without token should return 4xx client error")
    void uploadWithoutAuthShouldReturn4xx() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "dummy content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload").file(file))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @DisplayName("POST /api/files/upload standalone temp file should return 201")
    void uploadStandaloneFileShouldReturn201() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "report.pdf", "application/pdf", "dummy content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileName").value("report.pdf"))
                .andExpect(jsonPath("$.data.storageKey").value("temp/test-mock-uuid.pdf"));
    }

    @Test
    @DisplayName("POST /api/files/upload attached to DRAFT document should return 201")
    void uploadAttachedToDraftDocShouldReturn201() throws Exception {
        Document doc = new Document();
        doc.setTitle("Graduation Project");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        MockMultipartFile file = new MockMultipartFile(
                "file", "thesis.pdf", "application/pdf", "dummy content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("documentId", String.valueOf(doc.getId()))
                        .param("isPrimary", "true")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.documentId").value(doc.getId()))
                .andExpect(jsonPath("$.data.isPrimary").value(true));
    }

    @Test
    @DisplayName("POST /api/files/upload attached to someone else's document should return 403")
    void uploadAttachedToOthersDocShouldReturn403() throws Exception {
        Document doc = new Document();
        doc.setTitle("Graduation Project");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(otherStudent.getId());
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        MockMultipartFile file = new MockMultipartFile(
                "file", "thesis.pdf", "application/pdf", "dummy content".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("documentId", String.valueOf(doc.getId()))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/files/{id}/preview-url for own file should return 200")
    void previewUrlForOwnFileShouldReturn200() throws Exception {
        DocumentFile docFile = new DocumentFile();
        docFile.setFileName("preview.pdf");
        docFile.setStorageKey("temp/preview.pdf");
        docFile.setMimeType("application/pdf");
        docFile.setFileSize(1024L);
        docFile.setCreatedBy(student.getId());
        docFile = documentFileRepository.save(docFile);

        mockMvc.perform(get("/api/files/" + docFile.getId() + "/preview-url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fileId").value(docFile.getId()))
                .andExpect(jsonPath("$.data.signedUrl").isNotEmpty());
    }

    @Test
    @DisplayName("GET /api/files/{id}/preview-url for APPROVED document should be accessible by all students")
    void previewUrlForApprovedDocShouldReturn200ForAll() throws Exception {
        Document doc = new Document();
        doc.setTitle("Public Approved Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        DocumentFile docFile = new DocumentFile();
        docFile.setDocumentId(doc.getId());
        docFile.setFileName("public.pdf");
        docFile.setStorageKey("1/public.pdf");
        docFile.setMimeType("application/pdf");
        docFile.setFileSize(2048L);
        docFile.setCreatedBy(student.getId());
        docFile = documentFileRepository.save(docFile);

        mockMvc.perform(get("/api/files/" + docFile.getId() + "/preview-url")
                        .header("Authorization", "Bearer " + otherStudentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("GET /api/files/{id}/download-url should increment download count on document")
    void downloadUrlShouldIncrementCount() throws Exception {
        Document doc = new Document();
        doc.setTitle("Public Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc.setDownloadCount(5);
        doc = documentRepository.save(doc);

        DocumentFile docFile = new DocumentFile();
        docFile.setDocumentId(doc.getId());
        docFile.setFileName("doc.pdf");
        docFile.setStorageKey("1/doc.pdf");
        docFile.setMimeType("application/pdf");
        docFile.setFileSize(100L);
        docFile.setCreatedBy(student.getId());
        docFile = documentFileRepository.save(docFile);

        mockMvc.perform(get("/api/files/" + docFile.getId() + "/download-url")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        Document updated = documentRepository.findById(doc.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(6, updated.getDownloadCount());
    }

    @Test
    @DisplayName("DELETE /api/files/{id} by owner on DRAFT document should return 200")
    void deleteFileByOwnerShouldReturn200() throws Exception {
        Document doc = new Document();
        doc.setTitle("Draft Document");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        DocumentFile docFile = new DocumentFile();
        docFile.setDocumentId(doc.getId());
        docFile.setFileName("to_delete.pdf");
        docFile.setStorageKey("1/to_delete.pdf");
        docFile.setMimeType("application/pdf");
        docFile.setFileSize(100L);
        docFile.setCreatedBy(student.getId());
        docFile = documentFileRepository.save(docFile);

        mockMvc.perform(delete("/api/files/" + docFile.getId())
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        org.junit.jupiter.api.Assertions.assertTrue(documentFileRepository.findById(docFile.getId()).isEmpty());
    }
}
