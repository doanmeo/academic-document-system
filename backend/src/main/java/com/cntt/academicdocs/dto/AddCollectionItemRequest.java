package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotNull;

public class AddCollectionItemRequest {

    @NotNull(message = "Tài liệu không được để trống")
    private Long documentId;

    private String note;
    private Integer sortOrder = 0;

    public AddCollectionItemRequest() {}

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
