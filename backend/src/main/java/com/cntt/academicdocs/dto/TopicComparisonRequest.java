package com.cntt.academicdocs.dto;

import java.util.List;

public class TopicComparisonRequest {
    private String title;
    private Long subjectId;
    private Long majorId;
    private String advisorName;
    private String description;
    private List<String> keywords;

    public TopicComparisonRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Long getSubjectId() { return subjectId; }
    public void setSubjectId(Long subjectId) { this.subjectId = subjectId; }

    public Long getMajorId() { return majorId; }
    public void setMajorId(Long majorId) { this.majorId = majorId; }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getKeywords() { return keywords; }
    public void setKeywords(List<String> keywords) { this.keywords = keywords; }
}
