package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.dto.BookmarkResponse;
import com.cntt.academicdocs.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Bookmarks", description = "Endpoints for students to bookmark, unbookmark and view bookmarked documents")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @PostMapping("/api/documents/{id}/bookmark")
    @Operation(summary = "Bookmark an APPROVED document for current user")
    public ResponseEntity<ApiResponse<BookmarkResponse>> addBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        BookmarkResponse response = bookmarkService.addBookmark(id, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã lưu tài liệu vào danh sách yêu thích", response));
    }

    @DeleteMapping("/api/documents/{id}/bookmark")
    @Operation(summary = "Remove bookmark of a document for current user")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        bookmarkService.removeBookmark(id, currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa tài liệu khỏi danh sách yêu thích", null));
    }

    @GetMapping("/api/users/me/bookmarks")
    @Operation(summary = "Get list of bookmarked documents for current user")
    public ResponseEntity<ApiResponse<List<BookmarkResponse>>> getMyBookmarks(
            @AuthenticationPrincipal Long currentUserId
    ) {
        List<BookmarkResponse> response = bookmarkService.getMyBookmarks(currentUserId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tài liệu yêu thích thành công", response));
    }
}
