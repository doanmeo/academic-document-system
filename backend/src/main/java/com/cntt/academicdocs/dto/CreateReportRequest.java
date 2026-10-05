package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateReportRequest {

    @NotBlank(message = "Lý do báo cáo không được để trống")
    private String reasonCode;

    private String description;

    public CreateReportRequest() {
    }

    public CreateReportRequest(String reasonCode, String description) {
        this.reasonCode = reasonCode;
        this.description = description;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public void setReasonCode(String reasonCode) {
        this.reasonCode = reasonCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
