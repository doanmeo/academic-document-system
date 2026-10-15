package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class GenerateAbstractRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String documentTypeCode;
    private String subjectName;
    private String keywords;
    private String draftDescription;

    public GenerateAbstractRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }

    public String getDraftDescription() { return draftDescription; }
    public void setDraftDescription(String draftDescription) { this.draftDescription = draftDescription; }
}
