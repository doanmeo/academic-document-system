package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class HandleReportRequest {

    private String decision = "RESOLVED";
    private String note;
    private String resolutionNote;
    private Boolean hideDocument = false;

    public HandleReportRequest() {}

    public String getDecision() {
        return (decision != null && !decision.isBlank()) ? decision : "RESOLVED";
    }
    public void setDecision(String decision) { this.decision = decision; }

    public String getNote() {
        if (note != null && !note.isBlank()) return note;
        return resolutionNote;
    }
    public void setNote(String note) { this.note = note; }

    public String getResolutionNote() {
        if (resolutionNote != null && !resolutionNote.isBlank()) return resolutionNote;
        return note;
    }
    public void setResolutionNote(String resolutionNote) { this.resolutionNote = resolutionNote; }

    public Boolean getHideDocument() { return hideDocument; }
    public void setHideDocument(Boolean hideDocument) { this.hideDocument = hideDocument; }
}
