package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.DocumentService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/documents")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Documents", description = "Kiểm duyệt và quản trị tài liệu khoa CNTT")
public class AdminDocumentController {

    private final DocumentService documentService;

    public AdminDocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/pending")
    @Operation(summary = "Lấy danh sách tài liệu đang chờ kiểm duyệt")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummaryDTO>>> getPendingDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));
        PageResponse<DocumentSummaryDTO> result = documentService.getPendingDocuments(pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping
    @Operation(summary = "Lấy toàn bộ danh sách tài liệu kèm bộ lọc nâng cao")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummaryDTO>>> getAllDocuments(
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        SearchCriteria criteria = SearchCriteria.builder()
                .status(status)
                .keyword(keyword)
                .build();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<DocumentSummaryDTO> result = documentService.search(criteria, pageable, "ADMIN", SecurityUtils.getCurrentUserId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Hội đồng phê duyệt chấp thuận tài liệu")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        if (adminId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        String note = body != null ? (body.get("reason") != null ? body.get("reason") : body.get("note")) : null;
        DocumentDetailDTO doc = documentService.approveDocument(id, adminId, note);
        return ResponseEntity.ok(ApiResponse.success(doc, "Phê duyệt tài liệu thành công"));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Hội đồng từ chối tài liệu kèm lý do")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> reject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        if (adminId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        String note = body != null ? (body.get("reason") != null ? body.get("reason") : body.get("note")) : null;
        DocumentDetailDTO doc = documentService.rejectDocument(id, adminId, note);
        return ResponseEntity.ok(ApiResponse.success(doc, "Từ chối tài liệu thành công"));
    }

    @PostMapping("/{id}/request-revision")
    @Operation(summary = "Yêu cầu sinh viên chỉnh sửa bổ sung tài liệu")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> requestRevision(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        if (adminId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        String note = body != null ? (body.get("reason") != null ? body.get("reason") : body.get("note")) : null;
        DocumentDetailDTO doc = documentService.requestRevision(id, adminId, note);
        return ResponseEntity.ok(ApiResponse.success(doc, "Đã gửi yêu cầu chỉnh sửa"));
    }

    @PostMapping("/{id}/hide")
    @Operation(summary = "Tạm ẩn tài liệu khỏi hệ thống")
    public ResponseEntity<ApiResponse<DocumentDetailDTO>> hide(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        if (adminId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        String note = body != null ? (body.get("reason") != null ? body.get("reason") : body.get("note")) : null;
        DocumentDetailDTO doc = documentService.hideDocument(id, adminId, note);
        return ResponseEntity.ok(ApiResponse.success(doc, "Đã tạm ẩn tài liệu khỏi hệ thống"));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Lịch sử thẩm định và xét duyệt của tài liệu")
    public ResponseEntity<ApiResponse<List<DocumentReviewDTO>>> getReviews(@PathVariable Long id) {
        List<DocumentReviewDTO> reviews = documentService.getDocumentReviews(id);
        return ResponseEntity.ok(ApiResponse.success(reviews));
    }
}
