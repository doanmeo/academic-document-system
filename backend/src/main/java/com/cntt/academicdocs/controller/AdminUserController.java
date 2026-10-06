package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.dto.ToggleActiveRequest;
import com.cntt.academicdocs.dto.UserDTO;
import com.cntt.academicdocs.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Users", description = "Quản trị danh sách người dùng hệ thống")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách người dùng kèm bộ lọc")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean active,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Boolean activeFilter = isActive != null ? isActive : active;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        PageResponse<UserDTO> result = userService.getAllUsers(role, activeFilter, keyword, pageable);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PatchMapping("/{id}/active")
    @Operation(summary = "Kích hoạt hoặc vô hiệu hóa tài khoản")
    public ResponseEntity<ApiResponse<UserDTO>> toggleActive(
            @PathVariable Long id,
            @Valid @RequestBody ToggleActiveRequest request
    ) {
        UserDTO result = userService.toggleUserActive(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.success(result, "Cập nhật trạng thái tài khoản thành công"));
    }
}
