package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.DocumentStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DocumentDetailDTO {
    private Long id;
    private String title;
    private String abstractText;
    private String description;
    private DocumentStatus status;
    private String documentTypeCode;
    private String documentTypeLabel;
    private Long subjectId;
    private String subjectName;
    private Long majorId;
    private String majorName;
    private Long academicYearId;
    private String academicYearName;
    private Long uploaderId;
    private String uploaderName;
    private String advisorName;
    private String githubUrl;
    private String gitlabUrl;
    private Integer viewCount = 0;
    private Integer downloadCount = 0;
    private Double avgRating = 0.0;
    private Integer ratingCount = 0;
    private Boolean bookmarked = false;
    private Integer userRating;
    private String rejectionNote;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime updatedAt;

    private List<DocumentFileDTO> files = new ArrayList<>();
    private List<DocumentMemberDTO> members = new ArrayList<>();
    private List<DocumentTechnologyDTO> technologies = new ArrayList<>();

    public DocumentDetailDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

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

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public String getMajorName() { return majorName; }
    public void setMajorName(String majorName) { this.majorName = majorName; }

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

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getGitlabUrl() { return gitlabUrl; }
    public void setGitlabUrl(String gitlabUrl) { this.gitlabUrl = gitlabUrl; }

    public Integer getViewCount() { return viewCount; }
    public void setViewCount(Integer viewCount) { this.viewCount = viewCount; }

    public Integer getDownloadCount() { return downloadCount; }
    public void setDownloadCount(Integer downloadCount) { this.downloadCount = downloadCount; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }

    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }

    public Boolean getBookmarked() { return bookmarked; }
    public void setBookmarked(Boolean bookmarked) { this.bookmarked = bookmarked; }

    public Integer getUserRating() { return userRating; }
    public void setUserRating(Integer userRating) { this.userRating = userRating; }

    public String getRejectionNote() { return rejectionNote; }
    public void setRejectionNote(String rejectionNote) { this.rejectionNote = rejectionNote; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<DocumentFileDTO> getFiles() { return files; }
    public void setFiles(List<DocumentFileDTO> files) { this.files = files; }

    public List<DocumentMemberDTO> getMembers() { return members; }
    public void setMembers(List<DocumentMemberDTO> members) { this.members = members; }

    public List<DocumentTechnologyDTO> getTechnologies() { return technologies; }
    public void setTechnologies(List<DocumentTechnologyDTO> technologies) { this.technologies = technologies; }
}
