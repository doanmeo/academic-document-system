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

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    private String studentToken;
    private User student;
    private Subject subject;
    private AcademicYear academicYear;

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

        subject = subjectRepository.findAll().stream().findFirst().orElseGet(() ->
                subjectRepository.save(new Subject("INT1001", "Lap trinh", "Mon hoc"))
        );

        academicYear = academicYearRepository.findAll().stream().findFirst().orElseGet(() ->
                academicYearRepository.save(new AcademicYear("2024-2025", "Nam hoc 2024-2025", (short) 2024))
        );

        studentToken = jwtUtil.generateAccessToken(student);
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark for APPROVED doc should succeed (201)")
    void bookmarkApprovedDocumentShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("Deep Learning in Healthcare");
        doc.setAbstractText("Nghien cuu Deep Learning");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark when duplicate should return 409 Conflict")
    void duplicateBookmarkShouldReturn409() throws Exception {
        Document doc = new Document();
        doc.setTitle("AI in Computer Vision");
        doc.setAbstractText("Nghien cuu AI Vision");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(student);
        bookmark.setDocument(doc);
        bookmarkRepository.save(bookmark);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("BOOKMARK_EXISTS"));
    }

    @Test
    @DisplayName("POST /api/documents/{id}/bookmark for DRAFT doc should return 422 Unprocessable Entity")
    void bookmarkDraftDocumentShouldReturn422() throws Exception {
        Document doc = new Document();
        doc.setTitle("Draft Paper");
        doc.setAbstractText("Nghien cuu nhap");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.DRAFT);
        doc = documentRepository.save(doc);

        mockMvc.perform(post("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors[0].code").value("DOCUMENT_NOT_APPROVED"));
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
        doc.setAbstractText("Nghien cuu Microservices");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(student);
        bookmark.setDocument(doc);
        bookmarkRepository.save(bookmark);

        mockMvc.perform(get("/api/users/me/bookmarks")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("DELETE /api/documents/{id}/bookmark should succeed (200)")
    void removeBookmarkShouldSucceed() throws Exception {
        Document doc = new Document();
        doc.setTitle("To be unbookmarked");
        doc.setAbstractText("Nghien cuu Unbookmark");
        doc.setDocumentTypeCode("THESIS");
        doc.setSubject(subject);
        doc.setAcademicYear(academicYear);
        doc.setUploader(student);
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(student);
        bookmark.setDocument(doc);
        bookmarkRepository.save(bookmark);

        mockMvc.perform(delete("/api/documents/" + doc.getId() + "/bookmark")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        org.junit.jupiter.api.Assertions.assertFalse(
                bookmarkRepository.existsByUser_IdAndDocument_Id(student.getId(), doc.getId())
        );
    }
}
