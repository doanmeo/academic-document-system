package com.cntt.academicdocs.dto;

public class UpdateCollectionItemRequest {

    private String note;
    private Integer sortOrder;

    public UpdateCollectionItemRequest() {}

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
