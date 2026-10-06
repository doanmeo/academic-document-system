package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateReportRequest {

    @NotBlank(message = "Lý do báo cáo không được để trống")
    private String reasonCode;

    @NotBlank(message = "Mô tả vi phạm không được để trống")
    @Size(min = 10, message = "Mô tả vi phạm phải có tối thiểu 10 ký tự")
    private String description;

    public CreateReportRequest() {}

    public String getReasonCode() { return reasonCode; }
    public void setReasonCode(String reasonCode) { this.reasonCode = reasonCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
