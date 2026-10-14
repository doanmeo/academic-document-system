package com.cntt.academicdocs.dto;

public class AdvisorStatDTO {
    private String advisorName;
    private Long documentCount;
    private Double avgRating;

    public AdvisorStatDTO() {}

    public AdvisorStatDTO(String advisorName, Long documentCount, Double avgRating) {
        this.advisorName = advisorName;
        this.documentCount = documentCount;
        this.avgRating = avgRating;
    }

    public String getAdvisorName() { return advisorName; }
    public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

    public Long getDocumentCount() { return documentCount; }
    public void setDocumentCount(Long documentCount) { this.documentCount = documentCount; }

    public Double getAvgRating() { return avgRating; }
    public void setAvgRating(Double avgRating) { this.avgRating = avgRating; }
}
