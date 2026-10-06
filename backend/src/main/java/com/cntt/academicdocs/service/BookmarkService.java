package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Bookmark;
import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.DocumentSummaryDTO;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.BookmarkRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;

    public BookmarkService(
            BookmarkRepository bookmarkRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            DocumentService documentService
    ) {
        this.bookmarkRepository = bookmarkRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
    }

    @Transactional
    public void addBookmark(Long documentId, Long userId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "DOCUMENT_NOT_APPROVED", "Chỉ có thể lưu tài liệu đã được phê duyệt");
        }

        if (bookmarkRepository.existsByUser_IdAndDocument_Id(userId, documentId)) {
            throw new BusinessException(HttpStatus.CONFLICT, "BOOKMARK_EXISTS", "Tài liệu này đã được lưu trong danh sách");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Bookmark bookmark = new Bookmark();
        bookmark.setUser(user);
        bookmark.setDocument(document);
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(Long documentId, Long userId) {
        if (!bookmarkRepository.existsByUser_IdAndDocument_Id(userId, documentId)) {
            throw new BusinessException(HttpStatus.NOT_FOUND, "BOOKMARK_NOT_FOUND", "Tài liệu chưa được lưu trong danh sách");
        }
        bookmarkRepository.deleteByUser_IdAndDocument_Id(userId, documentId);
    }

    @Transactional(readOnly = true)
    public PageResponse<DocumentSummaryDTO> getMyBookmarks(Long userId, Pageable pageable) {
        Page<Bookmark> page = bookmarkRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        List<DocumentSummaryDTO> dtoList = page.getContent().stream()
                .map(b -> documentService.toSummaryDTO(b.getDocument(), userId))
                .collect(Collectors.toList());
        return PageResponse.of(page, dtoList);
    }
}
