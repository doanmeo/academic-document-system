package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.repository.BookmarkRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
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
class BookmarkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    private String studentToken;
    private User student;

    @BeforeEach
    void setUp() {
        bookmarkRepository.deleteAll();
        documentRepository.deleteAll();

        student = userRepository.findByEmail("sv_bm@cntt.local").orElse(null);
        if (student == null) {
            student = new User();
            student.setEmail("sv_bm@cntt.local");
            student.setPasswordHash("$2a$10$dummy");
            student.setFullName("Student Bookmark Tester");
            student.setRole(UserRole.STUDENT);
            student = userRepository.save(student);
        }

        studentToken = jwtUtil.generateAccessToken(student);
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark for APPROVED doc should succeed (201)")
    void bookmarkApprovedDocumentShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Deep Learning in Healthcare");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.documentId").value(doc.getId()))
                .andExpect(jsonPath("$.data.document.title").value("Deep Learning in Healthcare"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark when duplicate should return 409 Conflict")
    void duplicateBookmarkShouldReturn409() throws Exception {
        Document doc = new Document();
        doc.setTitle("AI in Computer Vision");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark(student.getId(), doc.getId());
        bookmarkRepository.save(bookmark);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("DUPLICATE_BOOKMARK"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark for DRAFT doc should return 400 Bad Request")
    void bookmarkDraftDocumentShouldReturn400() throws Exception {
        Document doc = new Document();
        doc.setTitle("Draft Paper");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("INVALID_DOCUMENT_STATUS"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark for non-existing doc should return 404")
    void bookmarkNotFoundShouldReturn404() throws Exception {
        mockMvc.perform(post("/api/documents/99999/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("DOCUMENT_NOT_FOUND"));
    }

    @Test
    @DisplayName("GET /api/users/me/bookmarks should return list of bookmarks (200)")
    void getMyBookmarksShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Microservices Architecture");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark(student.getId(), doc.getId());
        bookmarkRepository.save(bookmark);

        mockMvc.perform(get("/api/users/me/bookmarks")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].documentId").value(doc.getId()))
                .andExpect(jsonPath("$.data[0].document.title").value("Microservices Architecture"));
    }

    @Test
    @DisplayName("DELETE /api/documents/{id}/bookmark should succeed (200)")
    void removeBookmarkShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("To be unbookmarked");
        doc.setSubjectId(1L);
        doc.setAcademicYearId(1L);
        doc.setCreatedBy(student.getId());
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark(student.getId(), doc.getId());
        bookmarkRepository.save(bookmark);

        mockMvc.perform(delete("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        org.junit.jupiter.api.Assertions.assertFalse(
                bookmarkRepository.existsByUserIdAndDocumentId(student.getId(), doc.getId())
        );
    }
}
