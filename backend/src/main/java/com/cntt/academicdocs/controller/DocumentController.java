package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.CreateDocumentRequest;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.cntt.academicdocs.dto.RateRequest;
import com.cntt.academicdocs.service.RatingService;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@Tag(name = "Documents", description = "Endpoints for student document management and submission")
public class DocumentController {

    private final DocumentService documentService;
    private final RatingService ratingService;

    public DocumentController(DocumentService documentService, RatingService ratingService) {
        this.documentService = documentService;
        this.ratingService = ratingService;
    }

    @PostMapping
    @Operation(summary = "Create a new document draft metadata")
    public ResponseEntity<ApiResponse<DocumentResponse>> createDocument(
            @Valid @RequestBody CreateDocumentRequest request,
            @AuthenticationPrincipal Long currentUserId
    ) {
        DocumentResponse response = documentService.createDocument(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bản nháp tài liệu thành công", response));
    }

    @PostMapping("/{id}/submit")
    @Operation(summary = "Submit a DRAFT/REJECTED document for admin approval (transition to PENDING)")
    public ResponseEntity<ApiResponse<DocumentResponse>> submitDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        DocumentResponse response = documentService.submitDocument(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Nộp tài liệu chờ duyệt thành công", response));
    }

    @GetMapping("/my")
    @Operation(summary = "Get list of documents created by current student")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getMyDocuments(
            @AuthenticationPrincipal Long currentUserId
    ) {
        List<DocumentResponse> response = documentService.getMyDocuments(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài liệu thành công", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get detailed information of a document")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        DocumentResponse response = documentService.getDocumentDetail(id, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết tài liệu thành công", response));
    }

    @PostMapping("/{id}/rate")
    @Operation(summary = "Rate an approved document (1 to 5 stars)")
    public ResponseEntity<ApiResponse<Void>> rateDocument(
            @PathVariable Long id,
            @Valid @RequestBody RateRequest request,
            @AuthenticationPrincipal Long currentUserId
    ) {
        ratingService.rateDocument(id, currentUserId, request.getScore());
        return ResponseEntity.ok(ApiResponse.success("Đánh giá tài liệu thành công", null));
    }

    @DeleteMapping("/{id}/rate")
    @Operation(summary = "Remove rating for an approved document")
    public ResponseEntity<ApiResponse<Void>> deleteRating(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        ratingService.deleteRating(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá tài liệu thành công", null));
    }
}
