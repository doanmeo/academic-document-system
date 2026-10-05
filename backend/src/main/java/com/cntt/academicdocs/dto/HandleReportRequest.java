package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.ReportStatus;
import jakarta.validation.constraints.NotNull;

public class HandleReportRequest {

    @NotNull(message = "Quyết định xử lý không được để trống (RESOLVED hoặc REJECTED)")
    private ReportStatus decision;

    private String note;

    private Boolean hideDocument = false;

    public HandleReportRequest() {
    }

    public HandleReportRequest(ReportStatus decision, String note, Boolean hideDocument) {
        this.decision = decision;
        this.note = note;
        this.hideDocument = hideDocument;
    }

    public ReportStatus getDecision() {
        return decision;
    }

    public void setDecision(ReportStatus decision) {
        this.decision = decision;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Boolean getHideDocument() {
        return hideDocument != null ? hideDocument : false;
    }

    public void setHideDocument(Boolean hideDocument) {
        this.hideDocument = hideDocument;
    }
}
