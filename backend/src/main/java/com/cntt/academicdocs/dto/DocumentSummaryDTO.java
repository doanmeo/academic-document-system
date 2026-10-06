package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.DocumentStatus;

import java.time.LocalDateTime;

public class DocumentSummaryDTO {
    private Long id;
    private String title;
    private String abstractText;
    private DocumentStatus status;
    private String documentTypeCode;
    private String documentTypeLabel;
    private Long subjectId;
    private String subjectName;
    private Long academicYearId;
    private String academicYearName;
    private Long uploaderId;
    private String uploaderName;
    private String advisorName;
    private Integer viewCount = 0;
    private Integer downloadCount = 0;
    private Double avgRating = 0.0;
    private Integer ratingCount = 0;
    private String primaryFileMimeType;
    private Boolean bookmarked = false;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;

    public DocumentSummaryDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public DocumentStatus getStatus() { return status; }
    public void setStatus(DocumentStatus status) { this.status = status; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public String getDocumentTypeLabel() { return documentTypeLabel; }
    public void setDocumentTypeLabel(String documentTypeLabel) { this.documentTypeLabel = documentTypeLabel; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public String getAcademicYearName() { return academicYearName; }
    public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }

    public Long getUploaderId() { return uploaderId; }
    public void setUploaderId(Long uploaderId) { this.uploaderId = uploaderId; }

    public String getUploaderName() { return uploaderName; }
    public void setUploaderName(String uploaderName) { this.uploaderName = uploaderName; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public String getPrimaryFileMimeType() { return primaryFileMimeType; }
    public void setPrimaryFileMimeType(String primaryFileMimeType) { this.primaryFileMimeType = primaryFileMimeType; }

    public Boolean getBookmarked() { return bookmarked; }
    public void setBookmarked(Boolean bookmarked) { this.bookmarked = bookmarked; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
}
