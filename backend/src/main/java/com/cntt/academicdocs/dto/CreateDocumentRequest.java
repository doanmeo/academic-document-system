package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public class CreateDocumentRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Tóm tắt không được để trống")
    private String abstractText;

    private String description;

    @NotBlank(message = "Mã loại tài liệu không được để trống")
    private String documentTypeCode;

    @NotNull(message = "Môn học không được để trống")
    private Long subjectId;

    private Long majorId;

    @NotNull(message = "Năm học không được để trống")
    private Long academicYearId;

    private String advisorName;

    @Pattern(regexp = "^(https?://.*)?$", message = "Địa chỉ liên kết phải bắt đầu bằng http:// hoặc https://")
    private String githubUrl;

    @Pattern(regexp = "^(https?://.*)?$", message = "Địa chỉ liên kết phải bắt đầu bằng http:// hoặc https://")
    private String gitlabUrl;

    private String sharingScope;
    private Boolean pledgeAccepted;
    private String targetYear;
    private List<Long> fileIds;

    private List<Long> technologyIds;
    private List<String> memberStudentCodes;

    private String codeLanguage;
    private String sourceCodeSnippet;
    private String examDifficulty;
    private String examSemester;
    private String examTips;
    private Boolean hasSolution;

    public CreateDocumentRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAbstractText() { return abstractText; }
    public void setAbstractText(String abstractText) { this.abstractText = abstractText; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public String getGithubUrl() { return githubUrl; }
    public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }

    public String getGitlabUrl() { return gitlabUrl; }
    public void setGitlabUrl(String gitlabUrl) { this.gitlabUrl = gitlabUrl; }

    public String getSharingScope() { return sharingScope; }
    public void setSharingScope(String sharingScope) { this.sharingScope = sharingScope; }

    public Boolean getPledgeAccepted() { return pledgeAccepted; }
    public void setPledgeAccepted(Boolean pledgeAccepted) { this.pledgeAccepted = pledgeAccepted; }

    public String getTargetYear() { return targetYear; }
    public void setTargetYear(String targetYear) { this.targetYear = targetYear; }

    public List<Long> getFileIds() { return fileIds; }
    public void setFileIds(List<Long> fileIds) { this.fileIds = fileIds; }

    public List<Long> getTechnologyIds() { return technologyIds; }
    public void setTechnologyIds(List<Long> technologyIds) { this.technologyIds = technologyIds; }

    public List<String> getMemberStudentCodes() { return memberStudentCodes; }
    public void setMemberStudentCodes(List<String> memberStudentCodes) { this.memberStudentCodes = memberStudentCodes; }

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
}
