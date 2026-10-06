package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.UpdateUserRequest;
import com.cntt.academicdocs.dto.UserDTO;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "Endpoints for user profile management")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal Long currentUserId
    ) {
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để cập nhật hồ sơ");
        }
        UserDTO dto = userService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hồ sơ thành công", dto));
    }
}
