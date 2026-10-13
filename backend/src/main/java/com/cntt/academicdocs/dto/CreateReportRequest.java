package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateReportRequest {

    private String reasonCode;
    private String reason;
    private String description;

    public CreateReportRequest() {}

    public String getReasonCode() {
        return (reasonCode != null && !reasonCode.isBlank()) ? reasonCode : "COPYRIGHT";
    }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() {
        if (description != null && !description.isBlank()) return description;
        return reason != null ? reason : "";
    }
    public void setDescription(String description) { this.description = description; }
}
