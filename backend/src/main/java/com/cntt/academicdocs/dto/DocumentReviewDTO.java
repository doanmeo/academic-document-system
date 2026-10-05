package com.cntt.academicdocs.dto;

import java.time.LocalDateTime;

public class DocumentReviewDTO {

    private Long id;
    private Long documentId;
    private Long reviewerId;
    private String reviewerName;
    private String fromStatus;
    private String toStatus;
    private String comment;
    private LocalDateTime createdAt;

    public DocumentReviewDTO() {
    }

    public DocumentReviewDTO(Long id, Long documentId, Long reviewerId, String reviewerName, String fromStatus, String toStatus, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.documentId = documentId;
        this.reviewerId = reviewerId;
        this.reviewerName = reviewerName;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
        this.reviewerId = reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public void setReviewerName(String reviewerName) {
        this.reviewerName = reviewerName;
    }

    public String getFromStatus() {
        return fromStatus;
    }

    public void setFromStatus(String fromStatus) {
        this.fromStatus = fromStatus;
    }

    public String getToStatus() {
        return toStatus;
    }

    public void setToStatus(String toStatus) {
        this.toStatus = toStatus;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
