package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.DocumentStatus;

public class SearchCriteria {
    private String keyword;
    private Long subjectId;
    private Long majorId;
    private Long academicYearId;
    private String documentTypeCode;
    private Long technologyId;
    private DocumentStatus status;

    public SearchCriteria() {}

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private final SearchCriteria criteria = new SearchCriteria();

        public Builder keyword(String keyword) {
            criteria.keyword = keyword;
            return this;
        }

        public Builder subjectId(Long subjectId) {
            criteria.subjectId = subjectId;
            return this;
        }

        public Builder majorId(Long majorId) {
            criteria.majorId = majorId;
            return this;
        }

        public Builder academicYearId(Long academicYearId) {
            criteria.academicYearId = academicYearId;
            return this;
        }

        public Builder documentTypeCode(String documentTypeCode) {
            criteria.documentTypeCode = documentTypeCode;
            return this;
        }

        public Builder technologyId(Long technologyId) {
            criteria.technologyId = technologyId;
            return this;
        }

        public Builder status(DocumentStatus status) {
            criteria.status = status;
            return this;
        }

        public SearchCriteria build() {
            return criteria;
        }
    }

    public String getKeyword() { return keyword; }
    public void setKeyword(String keyword) { this.keyword = keyword; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public Long getAcademicYearId() { return academicYearId; }
    public void setAcademicYearId(Long academicYearId) { this.academicYearId = academicYearId; }

    public String getDocumentTypeCode() { return documentTypeCode; }
    public void setDocumentTypeCode(String documentTypeCode) { this.documentTypeCode = documentTypeCode; }

    public Long getTechnologyId() { return technologyId; }
    public void setTechnologyId(Long technologyId) { this.technologyId = technologyId; }

    public DocumentStatus getStatus() { return status; }
    public void setStatus(DocumentStatus status) { this.status = status; }
}
