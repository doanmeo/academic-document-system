package com.cntt.academicdocs.dto;

import java.time.LocalDateTime;

public class CollectionItemDTO {
    private Long id;
    private Long collectionId;
    private Long documentId;
    private String documentTitle;
    private String documentTypeCode;
    private String documentTypeLabel;
    private String subjectName;
    private String note;
    private Integer sortOrder;
    private LocalDateTime createdAt;

    public CollectionItemDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCollectionId() { return collectionId; }
    public void setCollectionId(Long collectionId) { this.collectionId = collectionId; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getDocumentTypeLabel() { return documentTypeLabel; }
    public void setDocumentTypeLabel(String documentTypeLabel) { this.documentTypeLabel = documentTypeLabel; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
