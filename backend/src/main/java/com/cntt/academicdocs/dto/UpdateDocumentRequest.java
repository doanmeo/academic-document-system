package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.Pattern;

import java.util.List;

public class UpdateDocumentRequest {
    private String title;
    private String abstractText;
    private String description;
    private String documentTypeCode;
    private Long subjectId;
    private Long majorId;
    private Long academicYearId;
    private String advisorName;

    @Pattern(regexp = "^(https?://.*)?$", message = "Địa chỉ liên kết phải bắt đầu bằng http:// hoặc https://")
    private String githubUrl;

    @Pattern(regexp = "^(https?://.*)?$", message = "Địa chỉ liên kết phải bắt đầu bằng http:// hoặc https://")
    private String gitlabUrl;

    private List<Long> technologyIds;
    private List<String> memberStudentCodes;

    public UpdateDocumentRequest() {}

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

    public List<Long> getTechnologyIds() { return technologyIds; }
    public void setTechnologyIds(List<Long> technologyIds) { this.technologyIds = technologyIds; }

    public List<String> getMemberStudentCodes() { return memberStudentCodes; }
    public void setMemberStudentCodes(List<String> memberStudentCodes) { this.memberStudentCodes = memberStudentCodes; }
}
