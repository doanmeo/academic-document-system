package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.NotificationDTO;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.NotificationService;
import com.cntt.academicdocs.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/me/notifications")
@Tag(name = "Notifications", description = "Hệ thống thông báo nội bộ cho sinh viên và quản trị viên")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo của tài khoản hiện tại")
    public ResponseEntity<ApiResponse<PageResponse<NotificationDTO>>> getNotifications(
            @RequestParam(value = "unreadOnly", required = false, defaultValue = "false") Boolean unreadOnly,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "15") int size
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        }

        PageResponse<NotificationDTO> result = notificationService.getUserNotifications(
                userId, unreadOnly, PageRequest.of(Math.max(0, page), Math.min(50, size))
        );
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc (dành cho polling badge)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadCount() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", 0)));
        }

        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu 1 thông báo là đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        }

        notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã đánh dấu thông báo là đã đọc"));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo là đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Yêu cầu đăng nhập");
        }

        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã đánh dấu tất cả là đã đọc"));
    }
}
