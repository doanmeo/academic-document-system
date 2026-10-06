package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.HandleReportRequest;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.dto.ReportDTO;
import com.cntt.academicdocs.exception.BusinessException;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Reports", description = "Quản lý và giải quyết khiếu nại báo cáo vi phạm")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách báo cáo vi phạm")
    public ResponseEntity<ApiResponse<PageResponse<ReportDTO>>> getReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReportDTO> result = reportService.getAdminReports(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PostMapping("/{id}/handle")
    @Operation(summary = "Xử lý báo cáo vi phạm (xác nhận vi phạm hoặc bác bỏ)")
    public ResponseEntity<ApiResponse<ReportDTO>> handleReport(
            @PathVariable Long id,
            @Valid @RequestBody HandleReportRequest request
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        if (adminId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        ReportDTO result = reportService.handleReport(id, adminId, request);
        return ResponseEntity.ok(ApiResponse.success(result, "Đã xử lý báo cáo vi phạm thành công"));
    }
}
