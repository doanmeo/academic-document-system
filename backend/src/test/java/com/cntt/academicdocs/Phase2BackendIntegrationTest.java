package com.cntt.academicdocs;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.dto.CreateDocumentRequest;
import com.cntt.academicdocs.dto.CreateReportRequest;
import com.cntt.academicdocs.dto.HandleReportRequest;
import com.cntt.academicdocs.repository.*;
import com.cntt.academicdocs.util.JwtUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class Phase2BackendIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private DocumentFileRepository documentFileRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private AcademicYearRepository academicYearRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private DocumentReviewRepository documentReviewRepository;

    @Autowired
    private DocumentMemberRepository documentMemberRepository;

    @Autowired
    private DocumentTechnologyRepository documentTechnologyRepository;

    @Autowired
    private BookmarkRepository bookmarkRepository;

    @Autowired
    private RatingRepository ratingRepository;

    private User admin;
    private User student;
    private String adminToken;
    private String studentToken;
    private Subject sampleSubject;
    private AcademicYear sampleAcademicYear;

    @BeforeEach
    void setUp() {
        reportRepository.deleteAll();
        documentReviewRepository.deleteAll();
        documentMemberRepository.deleteAll();
        documentTechnologyRepository.deleteAll();
        bookmarkRepository.deleteAll();
        ratingRepository.deleteAll();
        documentFileRepository.deleteAll();
        documentRepository.deleteAll();

        admin = userRepository.findByEmail("admin@cntt.local").orElseGet(() -> {
            User u = new User();
            u.setEmail("admin@cntt.local");
            return u;
        });
        admin.setFullName("Admin Nguyễn Văn Trưởng");
        admin.setRole(UserRole.ADMIN);
        admin.setActive(true);
        admin = userRepository.save(admin);

        student = userRepository.findByEmail("sv01@cntt.local").orElseGet(() -> {
            User u = new User();
            u.setEmail("sv01@cntt.local");
            return u;
        });
        student.setFullName("Nguyễn Văn An");
        student.setRole(UserRole.STUDENT);
        student.setActive(true);
        student = userRepository.save(student);

        sampleSubject = subjectRepository.findAll().stream().findFirst().orElseGet(() -> {
            Subject s = new Subject();
            s.setCode("TEST_CS");
            s.setName("Khoa học máy tính");
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
    @DisplayName("Public Access: Unauthenticated visitor can view documents, details, and citations")
    void testPublicBrowsingAndCitations() throws Exception {
        // Create an approved document
        Document doc = new Document();
        doc.setTitle("Hệ thống nhận diện biển số xe ứng dụng YOLO");
        doc.setAbstractText("Tóm tắt: Nghiên cứu áp dụng mạng nơ-ron tích chập để nhận diện biển số phương tiện");
        doc.setDescription("Nghiên cứu áp dụng Deep Learning trong xử lý ảnh");
        doc.setUploader(student);
        doc.setSubject(sampleSubject);
        doc.setAcademicYear(sampleAcademicYear);
        doc.setDocumentTypeCode("PROJECT");
        doc.setStatus(DocumentStatus.APPROVED);
        doc.setSharingScope("FACULTY_INTERNAL");
        doc.setPledgeAccepted(true);
        doc.setViewCount(15);
        doc.setDownloadCount(5);
        doc = documentRepository.save(doc);

        // 1. GET /api/documents without token
        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items[0].id").value(doc.getId()))
                .andExpect(jsonPath("$.data.items[0].sharingScope").value("FACULTY_INTERNAL"));

        // 2. GET /api/documents/{id} without token
        mockMvc.perform(get("/api/documents/" + doc.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(doc.getId()))
                .andExpect(jsonPath("$.data.pledgeAccepted").value(true));

        // 3. GET /api/documents/{id}/citation without token
        // IEEE format
        mockMvc.perform(get("/api/documents/" + doc.getId() + "/citation?format=IEEE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("IEEE"))
                .andExpect(jsonPath("$.data.citation").value(org.hamcrest.Matchers.containsString("N. V. An")));

        // APA format
        mockMvc.perform(get("/api/documents/" + doc.getId() + "/citation?format=APA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.format").value("APA"))
                .andExpect(jsonPath("$.data.citation").value(org.hamcrest.Matchers.containsString("Nguyễn Văn An")));

        // BibTeX format
        mockMvc.perform(get("/api/documents/" + doc.getId() + "/citation?format=BIBTEX"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.format").value("BIBTEX"))
                .andExpect(jsonPath("$.data.citation").value(org.hamcrest.Matchers.containsString("@misc{utc_fit_" + doc.getId())));

        // 4. GET /api/documents/my without token must return 401
        mockMvc.perform(get("/api/documents/my"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Sorting: Documents can be sorted by views, downloads, rating, newest")
    void testSortingParameters() throws Exception {
        Document doc1 = new Document();
        doc1.setTitle("Tài liệu A");
        doc1.setAbstractText("Tóm tắt tài liệu A");
        doc1.setUploader(student);
        doc1.setSubject(sampleSubject);
        doc1.setAcademicYear(sampleAcademicYear);
        doc1.setDocumentTypeCode("PROJECT");
        doc1.setStatus(DocumentStatus.APPROVED);
        doc1.setViewCount(100);
        doc1.setDownloadCount(10);
        doc1.setAvgRating(3.5);
        documentRepository.save(doc1);

        Document doc2 = new Document();
        doc2.setTitle("Tài liệu B");
        doc2.setAbstractText("Tóm tắt tài liệu B");
        doc2.setUploader(student);
        doc2.setSubject(sampleSubject);
        doc2.setAcademicYear(sampleAcademicYear);
        doc2.setDocumentTypeCode("PROJECT");
        doc2.setStatus(DocumentStatus.APPROVED);
        doc2.setViewCount(500);
        doc2.setDownloadCount(50);
        doc2.setAvgRating(4.9);
        documentRepository.save(doc2);

        // Sort by views desc
        mockMvc.perform(get("/api/documents?sortBy=views&sortDir=desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].title").value("Tài liệu B"));

        // Sort by downloads desc
        mockMvc.perform(get("/api/documents?sortBy=downloads&sortDir=desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].title").value("Tài liệu B"));

        // Sort by rating desc
        mockMvc.perform(get("/api/documents?sortBy=rating&sortDir=desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].title").value("Tài liệu B"));

        // Sort by newest
        mockMvc.perform(get("/api/documents?sortBy=newest&sortDir=desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Lifecycle & Resubmit: Full flow Draft -> Submit -> Revision Required -> Resubmit -> Approve")
    void testDocumentLifecycleAndResubmit() throws Exception {
        // Create an uploaded file to attach
        DocumentFile sampleFile = new DocumentFile();
        sampleFile.setFileName("microservices_architecture.pdf");
        sampleFile.setStorageKey("temp/microservices_architecture.pdf");
        sampleFile.setMimeType("application/pdf");
        sampleFile.setFileSize(2048L);
        sampleFile.setIsPrimary(true);
        sampleFile = documentFileRepository.save(sampleFile);

        // 1. Create Draft
        CreateDocumentRequest createReq = new CreateDocumentRequest();
        createReq.setTitle("Nghiên cứu kiến trúc vi dịch vụ Spring Cloud");
        createReq.setAbstractText("Tóm tắt phân tích các mẫu thiết kế vi dịch vụ chịu tải cao");
        createReq.setDescription("Báo cáo môn học kiến trúc phần mềm");
        createReq.setSubjectId(sampleSubject.getId());
        createReq.setAcademicYearId(sampleAcademicYear.getId());
        createReq.setDocumentTypeCode("PROJECT");
        createReq.setSharingScope("FACULTY_INTERNAL");
        createReq.setPledgeAccepted(true);
        createReq.setFileIds(java.util.List.of(sampleFile.getId()));

        MvcResult createResult = mockMvc.perform(post("/api/documents")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.sharingScope").value("FACULTY_INTERNAL"))
                .andExpect(jsonPath("$.data.pledgeAccepted").value(true))
                .andReturn();

        JsonNode createdJson = objectMapper.readTree(createResult.getResponse().getContentAsString());
        long docId = createdJson.path("data").path("id").asLong();

        // 2. Submit document
        mockMvc.perform(post("/api/documents/" + docId + "/submit")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"));

        // 3. Admin requests revision with body {"comment": "Yêu cầu bổ sung biểu đồ sequence"}
        mockMvc.perform(post("/api/admin/documents/" + docId + "/request-revision")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("comment", "Yêu cầu bổ sung biểu đồ sequence"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REVISION_REQUIRED"))
                .andExpect(jsonPath("$.data.rejectionNote").value("Yêu cầu bổ sung biểu đồ sequence"));

        // 4. Student resubmits document with PUT /api/documents/{id}/resubmit
        mockMvc.perform(put("/api/documents/" + docId + "/resubmit")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("revisionNote", "Đã vẽ lại sơ đồ sequence và gửi bổ sung"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.revisionNote").value("Đã vẽ lại sơ đồ sequence và gửi bổ sung"));

        // 5. Admin approves document with body {"comment": "Đã xem xét và đạt yêu cầu"}
        mockMvc.perform(post("/api/admin/documents/" + docId + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("comment", "Đã xem xét và đạt yêu cầu"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @DisplayName("Admin Report Handling: hideDocument sets document status to HIDDEN")
    void testReportHandlingHidesDocument() throws Exception {
        // Create an approved document
        Document doc = new Document();
        doc.setTitle("Tài liệu báo cáo vi phạm");
        doc.setAbstractText("Tóm tắt tài liệu báo cáo vi phạm");
        doc.setUploader(student);
        doc.setSubject(sampleSubject);
        doc.setAcademicYear(sampleAcademicYear);
        doc.setDocumentTypeCode("PROJECT");
        doc.setStatus(DocumentStatus.APPROVED);
        doc = documentRepository.save(doc);

        // Student sends report
        CreateReportRequest reportReq = new CreateReportRequest();
        reportReq.setReasonCode("COPYRIGHT");
        reportReq.setDescription("Tài liệu sao chép trái phép không trích dẫn");

        MvcResult reportRes = mockMvc.perform(post("/api/documents/" + doc.getId() + "/reports")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reportReq)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode reportJson = objectMapper.readTree(reportRes.getResponse().getContentAsString());
        long reportId = reportJson.path("data").path("id").asLong();

        // Admin handles report with hideDocument = true
        HandleReportRequest handleReq = new HandleReportRequest();
        handleReq.setDecision("RESOLVED");
        handleReq.setHideDocument(true);
        handleReq.setResolutionNote("Xác nhận vi phạm, tạm ẩn tài liệu khỏi hệ thống");

        mockMvc.perform(post("/api/admin/reports/" + reportId + "/handle")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(handleReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RESOLVED"));

        // Verify document is now HIDDEN
        Document updated = documentRepository.findById(doc.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(DocumentStatus.HIDDEN);

        // Verify public search does not return this HIDDEN document
        mockMvc.perform(get("/api/documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    @DisplayName("Admin Dashboard Stats: Returns totalDownloads, documentsByStatus, and topViewed")
    void testAdminDashboardStats() throws Exception {
        Document doc1 = new Document();
        doc1.setTitle("Tài liệu top views");
        doc1.setAbstractText("Tóm tắt tài liệu top views");
        doc1.setUploader(student);
        doc1.setSubject(sampleSubject);
        doc1.setAcademicYear(sampleAcademicYear);
        doc1.setDocumentTypeCode("PROJECT");
        doc1.setStatus(DocumentStatus.APPROVED);
        doc1.setViewCount(120);
        doc1.setDownloadCount(45);
        documentRepository.save(doc1);

        mockMvc.perform(get("/api/admin/dashboard/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDownloads").value(45))
                .andExpect(jsonPath("$.data.documentsByStatus.APPROVED").value(1))
                .andExpect(jsonPath("$.data.topViewed").isArray())
                .andExpect(jsonPath("$.data.topViewed[0].viewCount").value(120));

        // Also test root /api/admin/dashboard
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalDownloads").value(45));
    }

    @Test
    @DisplayName("User Me: GET /api/users/me returns authenticated user profile")
    void testGetUserProfile() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("sv01@cntt.local"))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn An"));
    }
}
