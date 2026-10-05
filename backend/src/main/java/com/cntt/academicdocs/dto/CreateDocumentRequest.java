package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateDocumentRequest {

    @NotBlank(message = "Tiêu đề tài liệu không được để trống")
    private String title;

    private String abstractText;
    private String description;
    private Long documentTypeId;

    @NotNull(message = "Môn học không được để trống")
    private Long subjectId;

    private Long majorId;

    @NotNull(message = "Năm học không được để trống")
    private Long academicYearId;

    private String advisorName;
    private String githubUrl;
    private List<Long> technologyIds;
    private List<String> memberStudentCodes;

    public CreateDocumentRequest() {
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAbstractText() {
        return abstractText;
    }

    public void setAbstractText(String abstractText) {
        this.abstractText = abstractText;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getDocumentTypeId() {
        return documentTypeId;
    }

    public void setDocumentTypeId(Long documentTypeId) {
        this.documentTypeId = documentTypeId;
    }

    public Long getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Long subjectId) {
        this.subjectId = subjectId;
    }

    public Long getMajorId() {
        return majorId;
    }

    public void setMajorId(Long majorId) {
        this.majorId = majorId;
    }

    public Long getAcademicYearId() {
        return academicYearId;
    }

    public void setAcademicYearId(Long academicYearId) {
        this.academicYearId = academicYearId;
    }

    public String getAdvisorName() {
        return advisorName;
    }

    public void setAdvisorName(String advisorName) {
        this.advisorName = advisorName;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public List<Long> getTechnologyIds() {
        return technologyIds;
    }

    public void setTechnologyIds(List<Long> technologyIds) {
        this.technologyIds = technologyIds;
    }

    public List<String> getMemberStudentCodes() {
        return memberStudentCodes;
    }

    public void setMemberStudentCodes(List<String> memberStudentCodes) {
        this.memberStudentCodes = memberStudentCodes;
    }
}
