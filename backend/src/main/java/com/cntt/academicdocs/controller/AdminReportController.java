package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.ReportStatus;
import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.HandleReportRequest;
import com.cntt.academicdocs.dto.ReportResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@Tag(name = "Admin Reports", description = "Endpoints for administrators to review and resolve violation reports")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @Operation(summary = "Get list of violation reports, optionally filtered by status (ADMIN only)")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getReports(
            @RequestParam(value = "status", required = false) ReportStatus status,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        List<ReportResponse> response = reportService.getAdminReports(status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách báo cáo vi phạm thành công", response));
    }

    @PostMapping("/{id}/handle")
    @Operation(summary = "Handle violation report (RESOLVED / REJECTED) with optional document hiding (ADMIN only)")
    public ResponseEntity<ApiResponse<ReportResponse>> handleReport(
            @PathVariable Long id,
            @Valid @RequestBody HandleReportRequest request,
            @AuthenticationPrincipal Long currentUserId,
            Authentication authentication
    ) {
        validateAdminRole(authentication);
        ReportResponse response = reportService.handleReport(id, request, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Xử lý báo cáo vi phạm thành công", response));
    }

    private void validateAdminRole(Authentication authentication) {
        if (authentication == null || authentication.getAuthorities() == null ||
                authentication.getAuthorities().stream().noneMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()))) {
            throw new AppException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Chỉ quản trị viên mới có quyền thực hiện thao tác này");
        }
    }
}
