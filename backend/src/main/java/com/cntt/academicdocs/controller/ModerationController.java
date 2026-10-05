package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.dto.DocumentReviewDTO;
import com.cntt.academicdocs.dto.ModerationNoteRequest;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.service.ModerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/documents")
@Tag(name = "Admin Moderation", description = "Endpoints for administrators to review, approve, reject and audit student documents")
public class ModerationController {

    private final ModerationService moderationService;

    public ModerationController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping("/pending")
    @Operation(summary = "Get list of documents pending admin review (ADMIN only)")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getPendingDocuments(
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        List<DocumentResponse> response = moderationService.getPendingDocuments();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài liệu chờ duyệt thành công", response));
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve a pending document (ADMIN only)")
    public ResponseEntity<ApiResponse<DocumentResponse>> approveDocument(
            @PathVariable Long id,
            @RequestBody(required = false) ModerationNoteRequest request,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        String note = request != null ? request.getNote() : null;
        DocumentResponse response = moderationService.approveDocument(id, note, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Phê duyệt tài liệu thành công", response));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a pending document with required note (ADMIN only)")
    public ResponseEntity<ApiResponse<DocumentResponse>> rejectDocument(
            @PathVariable Long id,
            @RequestBody(required = false) ModerationNoteRequest request,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        String note = request != null ? request.getNote() : null;
        DocumentResponse response = moderationService.rejectDocument(id, note, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Từ chối tài liệu thành công", response));
    }

    @PostMapping("/{id}/hide")
    @Operation(summary = "Hide a document due to violations or policy (ADMIN only)")
    public ResponseEntity<ApiResponse<DocumentResponse>> hideDocument(
            @PathVariable Long id,
            @RequestBody(required = false) ModerationNoteRequest request,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        String reason = request != null ? request.getNote() : null;
        DocumentResponse response = moderationService.hideDocument(id, reason, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã ẩn tài liệu thành công", response));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get moderation review history for a document (ADMIN only)")
    public ResponseEntity<ApiResponse<List<DocumentReviewDTO>>> getDocumentReviews(
            @PathVariable Long id,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        List<DocumentReviewDTO> response = moderationService.getDocumentReviews(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy lịch sử kiểm duyệt thành công", response));
    }

    private void validateAdminRole(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null ||
                authentication.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ quản trị viên mới có quyền thực hiện thao tác này");
        }
    }
}
