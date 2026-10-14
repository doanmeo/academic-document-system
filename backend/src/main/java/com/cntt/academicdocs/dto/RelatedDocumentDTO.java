package com.cntt.academicdocs.dto;

public class RelatedDocumentDTO {
    private Long id;
    private String title;
    private String documentTypeCode;
    private String documentTypeLabel;
    private Long subjectId;
    private String subjectName;
    private Long majorId;
    private String majorName;
    private String advisorName;
    private String academicYearName;
    private Double avgRating;
    private Integer viewCount;
    private Integer downloadCount;
    private String matchReason;
    private int similarityScore;

    public RelatedDocumentDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getDocumentTypeLabel() { return documentTypeLabel; }
    public void setDocumentTypeLabel(String documentTypeLabel) { this.documentTypeLabel = documentTypeLabel; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public String getMajorName() { return majorName; }
    public void setMajorName(String majorName) { this.majorName = majorName; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public String getAcademicYearName() { return academicYearName; }
    public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public int getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(int similarityScore) { this.similarityScore = similarityScore; }
}
