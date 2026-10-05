package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.CreateReportRequest;
import com.cntt.academicdocs.dto.ReportResponse;
import com.cntt.academicdocs.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Reports", description = "Endpoints for students to submit and view document violation reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/api/documents/{id}/reports")
    @Operation(summary = "Submit a violation report for an APPROVED document (Student)")
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            @PathVariable Long id,
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal Long currentUserId
    ) {
        ReportResponse response = reportService.createReport(id, request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Gửi báo cáo vi phạm thành công", response));
    }

    @GetMapping("/api/users/me/reports")
    @Operation(summary = "Get list of reports submitted by current student")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(
            @AuthenticationPrincipal Long currentUserId
    ) {
        List<ReportResponse> response = reportService.getMyReports(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách báo cáo vi phạm thành công", response));
    }
}
