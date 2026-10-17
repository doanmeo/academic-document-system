package com.cntt.academicdocs.dto;

import java.util.List;

public class TopicComparisonResultDTO {
    private double overallOverlapScore;
    private String riskLevel;
    private String verdict;
    private List<MatchedDocumentDTO> matchedDocuments;
    private List<String> noveltyRecommendations;
    private String algorithmName;
    private String formulaDefinition;
    private List<String> extractedTokens;

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

        // Algorithmic breakdown
        private int subjectScore;
        private int advisorScore;
        private int majorScore;
        private int keywordScore;
        private List<String> matchedTokens;
        private double jaccardSimilarity;
        private String formulaCalculation;

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

        public int getSubjectScore() { return subjectScore; }
        public void setSubjectScore(int subjectScore) { this.subjectScore = subjectScore; }

        public int getAdvisorScore() { return advisorScore; }
        public void setAdvisorScore(int advisorScore) { this.advisorScore = advisorScore; }

        public int getMajorScore() { return majorScore; }
        public void setMajorScore(int majorScore) { this.majorScore = majorScore; }

        public int getKeywordScore() { return keywordScore; }
        public void setKeywordScore(int keywordScore) { this.keywordScore = keywordScore; }

        public List<String> getMatchedTokens() { return matchedTokens; }
        public void setMatchedTokens(List<String> matchedTokens) { this.matchedTokens = matchedTokens; }

        public double getJaccardSimilarity() { return jaccardSimilarity; }
        public void setJaccardSimilarity(double jaccardSimilarity) { this.jaccardSimilarity = jaccardSimilarity; }

        public String getFormulaCalculation() { return formulaCalculation; }
        public void setFormulaCalculation(String formulaCalculation) { this.formulaCalculation = formulaCalculation; }

        private int titleScore;
        private int contentScore;
        private int metadataScore;
        private String abstractSnippet;
        private List<String> matchedContentTokens;

        public int getTitleScore() { return titleScore; }
        public void setTitleScore(int titleScore) { this.titleScore = titleScore; }

        public int getContentScore() { return contentScore; }
        public void setContentScore(int contentScore) { this.contentScore = contentScore; }

        public int getMetadataScore() { return metadataScore; }
        public void setMetadataScore(int metadataScore) { this.metadataScore = metadataScore; }

        public String getAbstractSnippet() { return abstractSnippet; }
        public void setAbstractSnippet(String abstractSnippet) { this.abstractSnippet = abstractSnippet; }

        public List<String> getMatchedContentTokens() { return matchedContentTokens; }
        public void setMatchedContentTokens(List<String> matchedContentTokens) { this.matchedContentTokens = matchedContentTokens; }
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

    public String getAlgorithmName() { return algorithmName; }
    public void setAlgorithmName(String algorithmName) { this.algorithmName = algorithmName; }

    public String getFormulaDefinition() { return formulaDefinition; }
    public void setFormulaDefinition(String formulaDefinition) { this.formulaDefinition = formulaDefinition; }

    public List<String> getExtractedTokens() { return extractedTokens; }
    public void setExtractedTokens(List<String> extractedTokens) { this.extractedTokens = extractedTokens; }
}
