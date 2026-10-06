package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.BookmarkService;
import com.cntt.academicdocs.service.ReportService;
import com.cntt.academicdocs.service.UserService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Quản lý hồ sơ cá nhân và danh sách tương tác")
public class UserController {

    private final UserService userService;
    private final BookmarkService bookmarkService;
    private final ReportService reportService;

    public UserController(
            UserService userService,
            BookmarkService bookmarkService,
            ReportService reportService
    ) {
        this.userService = userService;
        this.bookmarkService = bookmarkService;
        this.reportService = reportService;
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật thông tin hồ sơ cá nhân")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(@RequestBody UpdateUserRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        UserDTO dto = userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success(dto, "Cập nhật hồ sơ thành công"));
    }

    @GetMapping("/me/bookmarks")
    @Operation(summary = "Danh sách tài liệu đã lưu của người dùng")
    public ResponseEntity<ApiResponse<PageResponse<DocumentSummaryDTO>>> getMyBookmarks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<DocumentSummaryDTO> result = bookmarkService.getMyBookmarks(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/me/reports")
    @Operation(summary = "Danh sách báo cáo vi phạm người dùng đã gửi")
    public ResponseEntity<ApiResponse<PageResponse<ReportDTO>>> getMyReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<ReportDTO> result = reportService.getMyReports(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
