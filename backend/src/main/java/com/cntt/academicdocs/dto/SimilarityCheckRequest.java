package com.cntt.academicdocs.dto;

public class SimilarityCheckRequest {
    private Long currentDocumentId;
    private String title;
    private Long subjectId;
    private Long majorId;
    private String advisorName;
    private String documentTypeCode;
    private String abstractText;

    public SimilarityCheckRequest() {}

    public Long getCurrentDocumentId() { return currentDocumentId; }
    public void setCurrentDocumentId(Long currentDocumentId) { this.currentDocumentId = currentDocumentId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }
}
