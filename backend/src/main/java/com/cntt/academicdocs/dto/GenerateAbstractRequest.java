package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class GenerateAbstractRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String documentTypeCode;
    private String documentType;
    private String subjectName;
    private Object keywords;
    private String draftDescription;

    public GenerateAbstractRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDocumentTypeCode() { return documentTypeCode != null ? documentTypeCode : documentType; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getDocumentType() { return documentType != null ? documentType : documentTypeCode; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getKeywords() {
        if (keywords == null) return null;
        if (keywords instanceof java.util.List<?> list) {
            return String.join(", ", list.stream().map(Object::toString).toList());
        }
        return keywords.toString();
    }
    public void setKeywords(Object keywords) { this.keywords = keywords; }

    public String getDraftDescription() { return draftDescription; }
    public void setDraftDescription(String draftDescription) { this.draftDescription = draftDescription; }
}
