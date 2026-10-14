package com.cntt.academicdocs.dto;

import java.util.List;

public class TopicComparisonResultDTO {
    private double overallOverlapScore;
    private String riskLevel;
    private String verdict;
    private List<MatchedDocumentDTO> matchedDocuments;
    private List<String> noveltyRecommendations;

    public TopicComparisonResultDTO() {}

    public static class MatchedDocumentDTO {
        private Long id;
        private String title;
        private String advisorName;
        private String academicYearName;
        private String subjectName;
        private int similarityScore;
        private String overlappingAspects;
        private String githubUrl;

        public MatchedDocumentDTO() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getAdvisorName() { return advisorName; }
        public void setAdvisorName(String advisorName) { this.advisorName = advisorName; }

        public String getAcademicYearName() { return academicYearName; }
        public void setAcademicYearName(String academicYearName) { this.academicYearName = academicYearName; }

        public String getSubjectName() { return subjectName; }
        public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

        public int getSimilarityScore() { return similarityScore; }
        public void setSimilarityScore(int similarityScore) { this.similarityScore = similarityScore; }

        public String getOverlappingAspects() { return overlappingAspects; }
        public void setOverlappingAspects(String overlappingAspects) { this.overlappingAspects = overlappingAspects; }

        public String getGithubUrl() { return githubUrl; }
        public void setGithubUrl(String githubUrl) { this.githubUrl = githubUrl; }
    }

    public double getOverallOverlapScore() { return overallOverlapScore; }
    public void setOverallOverlapScore(double overallOverlapScore) { this.overallOverlapScore = overallOverlapScore; }

    public String getRiskLevel() { return riskLevel; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }

    public String getVerdict() { return verdict; }
    public void setVerdict(String verdict) { this.verdict = verdict; }

    public List<MatchedDocumentDTO> getMatchedDocuments() { return matchedDocuments; }
    public void setMatchedDocuments(List<MatchedDocumentDTO> matchedDocuments) { this.matchedDocuments = matchedDocuments; }

    public List<String> getNoveltyRecommendations() { return noveltyRecommendations; }
    public void setNoveltyRecommendations(List<String> noveltyRecommendations) { this.noveltyRecommendations = noveltyRecommendations; }
}
