package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Bookmark;
import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.BookmarkResponse;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.BookmarkRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentService documentService;

    public BookmarkService(
            BookmarkRepository bookmarkRepository,
            DocumentRepository documentRepository,
            DocumentService documentService
    ) {
        this.bookmarkRepository = bookmarkRepository;
        this.documentRepository = documentRepository;
        this.documentService = documentService;
    }

    @Transactional
    public BookmarkResponse addBookmark(Long documentId, Long userId) {
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để lưu tài liệu");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể đánh dấu yêu thích tài liệu đã được phê duyệt (APPROVED)");
        }

        if (bookmarkRepository.existsByUserIdAndDocumentId(userId, documentId)) {
            throw new AppException(HttpStatus.CONFLICT, "DUPLICATE_BOOKMARK", "Tài liệu này đã được lưu vào danh sách yêu thích");
        }

        Bookmark bookmark = new Bookmark(userId, documentId);
        Bookmark saved = bookmarkRepository.save(bookmark);

        DocumentResponse docResponse = documentService.mapToResponse(document);
        return new BookmarkResponse(saved.getId(), saved.getUserId(), saved.getDocumentId(), saved.getCreatedAt(), docResponse);
    }

    @Transactional
    public void removeBookmark(Long documentId, Long userId) {
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }

        bookmarkRepository.deleteByUserIdAndDocumentId(userId, documentId);
    }

    @Transactional(readOnly = true)
    public List<BookmarkResponse> getMyBookmarks(Long userId) {
        if (userId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }

        List<Bookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return bookmarks.stream().map(b -> {
            Document doc = documentRepository.findById(b.getDocumentId()).orElse(null);
            DocumentResponse docResponse = doc != null ? documentService.mapToResponse(doc) : null;
            return new BookmarkResponse(b.getId(), b.getUserId(), b.getDocumentId(), b.getCreatedAt(), docResponse);
        }).toList();
    }
}
