package com.cntt.academicdocs.dto;

import java.time.LocalDateTime;

public class BookmarkResponse {

    private Long id;
    private Long userId;
    private Long documentId;
    private LocalDateTime createdAt;
    private DocumentResponse document;

    public BookmarkResponse() {
    }

    public BookmarkResponse(Long id, Long userId, Long documentId, LocalDateTime createdAt, DocumentResponse document) {
        this.id = id;
        this.userId = userId;
        this.documentId = documentId;
        this.createdAt = createdAt;
        this.document = document;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public DocumentResponse getDocument() {
        return document;
    }

    public void setDocument(DocumentResponse document) {
        this.document = document;
    }
}
