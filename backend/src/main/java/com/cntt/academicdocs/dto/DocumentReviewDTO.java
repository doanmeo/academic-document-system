package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.DocumentStatus;

import java.time.LocalDateTime;

public class DocumentReviewDTO {
    private Long id;
    private Long documentId;
    private Long reviewerId;
    private String reviewerName;
    private DocumentStatus fromStatus;
    private DocumentStatus toStatus;
    private String comment;
    private LocalDateTime createdAt;

    public DocumentReviewDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getReviewerId() { return reviewerId; }
    public void setReviewerId(Long reviewerId) { this.reviewerId = reviewerId; }

    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }

    public DocumentStatus getFromStatus() { return fromStatus; }
    public void setFromStatus(DocumentStatus fromStatus) { this.fromStatus = fromStatus; }

    public DocumentStatus getToStatus() { return toStatus; }
    public void setToStatus(DocumentStatus toStatus) { this.toStatus = toStatus; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
