package com.cntt.academicdocs.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(name = "abstract_text", nullable = false, columnDefinition = "TEXT")
    private String abstractText;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private DocumentStatus status = DocumentStatus.DRAFT;

    @Column(name = "document_type_code", nullable = false, length = 50)
    private String documentTypeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploader_id", nullable = false)
    private User uploader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id")
    private Major major;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "academic_year_id", nullable = false)
    private AcademicYear academicYear;

    @Column(name = "advisor_name", length = 150)
    private String advisorName;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Column(name = "gitlab_url", length = 500)
    private String gitlabUrl;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;

    @Column(name = "avg_rating", nullable = false)
    private Double avgRating = 0.0;

    @Column(name = "rating_count", nullable = false)
    private Integer ratingCount = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_note", columnDefinition = "TEXT")
    private String rejectionNote;

    @Column(name = "sharing_scope", length = 50)
    private String sharingScope = "FACULTY_INTERNAL";

    @Column(name = "pledge_accepted")
    private Boolean pledgeAccepted = true;

    @Column(name = "revision_note", columnDefinition = "TEXT")
    private String revisionNote;

    @Column(name = "target_year", length = 20)
    private String targetYear = "ALL";

    @Column(name = "code_language", length = 50)
    private String codeLanguage;

    @Column(name = "source_code_snippet", columnDefinition = "TEXT")
    private String sourceCodeSnippet;

    @Column(name = "exam_difficulty", length = 30)
    private String examDifficulty;

    @Column(name = "exam_semester", length = 30)
    private String examSemester;

    @Column(name = "exam_tips", columnDefinition = "TEXT")
    private String examTips;

    @Column(name = "has_solution")
    private Boolean hasSolution = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DocumentTechnology> technologies = new ArrayList<>();

    public Document() {}

    public String getCodeLanguage() { return codeLanguage; }
    public void setCodeLanguage(String codeLanguage) { this.codeLanguage = codeLanguage; }

    public String getSourceCodeSnippet() { return sourceCodeSnippet; }
    public void setSourceCodeSnippet(String sourceCodeSnippet) { this.sourceCodeSnippet = sourceCodeSnippet; }

    public String getExamDifficulty() { return examDifficulty; }
    public void setExamDifficulty(String examDifficulty) { this.examDifficulty = examDifficulty; }

    public String getExamSemester() { return examSemester; }
    public void setExamSemester(String examSemester) { this.examSemester = examSemester; }

    public String getExamTips() { return examTips; }
    public void setExamTips(String examTips) { this.examTips = examTips; }

    public Boolean getHasSolution() { return hasSolution; }
    public void setHasSolution(Boolean hasSolution) { this.hasSolution = hasSolution; }

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

    public User getUploader() { return uploader; }
    public void setUploader(User uploader) { this.uploader = uploader; }

    public Subject getSubject() { return subject; }
    public void setSubject(Subject subject) { this.subject = subject; }

    public Major getMajor() { return major; }
    public void setMajor(Major major) { this.major = major; }

    public AcademicYear getAcademicYear() { return academicYear; }
    public void setAcademicYear(AcademicYear academicYear) { this.academicYear = academicYear; }

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

    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getRejectionNote() { return rejectionNote; }
    public void setRejectionNote(String rejectionNote) { this.rejectionNote = rejectionNote; }

    public String getSharingScope() { return sharingScope; }
    public void setSharingScope(String sharingScope) { this.sharingScope = sharingScope; }

    public Boolean getPledgeAccepted() { return pledgeAccepted; }
    public void setPledgeAccepted(Boolean pledgeAccepted) { this.pledgeAccepted = pledgeAccepted; }

    public String getRevisionNote() { return revisionNote; }
    public void setRevisionNote(String revisionNote) { this.revisionNote = revisionNote; }

    public String getTargetYear() { return targetYear; }
    public void setTargetYear(String targetYear) { this.targetYear = targetYear; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<DocumentFile> getFiles() { return files; }
    public void setFiles(List<DocumentFile> files) { this.files = files; }

    public List<DocumentMember> getMembers() { return members; }
    public void setMembers(List<DocumentMember> members) { this.members = members; }

    public List<DocumentTechnology> getTechnologies() { return technologies; }
    public void setTechnologies(List<DocumentTechnology> technologies) { this.technologies = technologies; }
}
