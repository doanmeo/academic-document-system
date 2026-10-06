package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class HandleReportRequest {

    @NotBlank(message = "Quyết định xử lý không được để trống")
    private String decision;

    private String note;
    private Boolean hideDocument;

    public HandleReportRequest() {}

    public String getDecision() { return decision; }
    public void setDecision(String decision) { this.decision = decision; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getHideDocument() { return hideDocument; }
    public void setHideDocument(Boolean hideDocument) { this.hideDocument = hideDocument; }
}
