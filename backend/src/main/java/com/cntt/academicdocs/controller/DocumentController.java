package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.BookmarkService;
import com.cntt.academicdocs.service.DocumentService;
import com.cntt.academicdocs.service.RatingService;
import com.cntt.academicdocs.service.ReportService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "Quản lý và tra cứu tài liệu học tập")
public class DocumentController {

    private final DocumentService documentService;
    private final BookmarkService bookmarkService;
    private final RatingService ratingService;
    private final ReportService reportService;

    public DocumentController(
            DocumentService documentService,
            BookmarkService bookmarkService,
            RatingService ratingService,
            ReportService reportService
    ) {
        this.documentService = documentService;
        this.bookmarkService = bookmarkService;
        this.ratingService = ratingService;
        this.reportService = reportService;
    }

    @PostMapping
    @Operation(summary = "Tạo tài liệu mới (bản nháp)")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> createDocument(
            @Valid @RequestBody CreateDocumentRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        DocumentDetailDTO doc = documentService.createDocument(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(doc, "Tạo tài liệu nháp thành công"));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật tài liệu")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> updateDocument(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDocumentRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        DocumentDetailDTO doc = documentService.updateDocument(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success(doc, "Cập nhật tài liệu thành công"));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Gửi tài liệu để hội đồng kiểm duyệt")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> submitDocument(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        DocumentDetailDTO doc = documentService.submitDocument(id, userId);
        return ResponseEntity.ok(ApiResponse.success(doc, "Đã gửi tài liệu phê duyệt thành công"));
    }

    @GetMapping("/my")
    @Operation(summary = "Danh sách tài liệu của sinh viên đăng nhập")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummaryDTO>>> getMyDocuments(
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<DocumentSummaryDTO> result = documentService.getMyDocuments(userId, status, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/search")
    @Operation(summary = "Tra cứu và tìm kiếm tài liệu có bộ lọc")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummaryDTO>>> searchDocuments(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long majorId,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) String documentTypeCode,
            @RequestParam(required = false) Long technologyId,
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentRole();

        Sort sortObj = Sort.by(Sort.Direction.DESC, "createdAt");
        if (sortBy != null && !sortBy.isBlank()) {
            Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sortObj = Sort.by(direction, sortBy.trim());
        } else if (sort != null && sort.contains(",")) {
            String[] parts = sort.split(",");
            sortObj = Sort.by(parts[1].equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC, parts[0].trim());
        } else if (sort != null && !sort.isBlank()) {
            sortObj = Sort.by(Sort.Direction.DESC, sort.trim());
        }

        SearchCriteria criteria = SearchCriteria.builder()
                .keyword(keyword)
                .subjectId(subjectId)
                .majorId(majorId)
                .academicYearId(academicYearId)
                .documentTypeCode(documentTypeCode)
                .technologyId(technologyId)
                .status(status)
                .build();

        PageResponse<DocumentSummaryDTO> result = documentService.search(criteria, PageRequest.of(page, Math.min(size, 50), sortObj), currentRole, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem chi tiết tài liệu")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> getDocumentById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentRole();
        DocumentDetailDTO doc = documentService.getDocumentById(id, currentUserId, currentRole);
        return ResponseEntity.ok(ApiResponse.success(doc));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa tài liệu (chuyển trạng thái ẩn)")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        documentService.deleteDocument(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa tài liệu thành công"));
    }

    // --- Bookmarks on Document ---

    @PostMapping("/{id}/bookmark")
    @Operation(summary = "Lưu tài liệu vào danh sách cá nhân")
    public ResponseEntity<ApiResponse<Void>> addBookmark(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        bookmarkService.addBookmark(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Đã lưu tài liệu thành công"));
    }

    @DeleteMapping("/{id}/bookmark")
    @Operation(summary = "Bỏ lưu tài liệu khỏi danh sách cá nhân")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        bookmarkService.removeBookmark(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa khỏi danh sách đã lưu"));
    }

    // --- Ratings on Document ---

    @PostMapping("/{id}/rate")
    @Operation(summary = "Đánh giá sao cho tài liệu (1-5 sao)")
    public ResponseEntity<ApiResponse<Void>> rateDocument(
            @PathVariable Long id,
            @Valid @RequestBody RateRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        ratingService.rateDocument(id, userId, request.getScore());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi đánh giá thành công"));
    }

    @DeleteMapping("/{id}/rate")
    @Operation(summary = "Hủy đánh giá sao của tài liệu")
    public ResponseEntity<ApiResponse<Void>> deleteRating(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        ratingService.deleteRating(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã hủy đánh giá"));
    }

    // --- Reports on Document ---

    @PostMapping("/{id}/reports")
    @Operation(summary = "Gửi báo cáo vi phạm nội dung / bản quyền")
    public ResponseEntity<ApiResponse<ReportDTO>> createReport(
            @PathVariable Long id,
            @Valid @RequestBody CreateReportRequest request
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        ReportDTO report = reportService.createReport(id, userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(report, "Đã gửi báo cáo vi phạm thành công"));
    }
}
