package com.cntt.academicdocs.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardDTO {
    private Long totalDocuments = 0L;
    private Map<String, Long> documentsByStatus = new HashMap<>();
    private Long totalUsers = 0L;
    private Long totalDownloads = 0L;
    private Long pendingDocuments = 0L;
    private Long totalReports = 0L;
    private Long pendingReports = 0L;
    private List<DocumentSummaryDTO> topDocuments = new ArrayList<>();
    private List<DocumentSummaryDTO> topViewed = new ArrayList<>();
    private List<DocumentSummaryDTO> recentDocuments = new ArrayList<>();
    private List<DocumentSummaryDTO> recentSubmissions = new ArrayList<>();
    private Map<String, Long> documentsBySubject = new java.util.LinkedHashMap<>();
    private Map<String, Long> documentsByMajor = new java.util.LinkedHashMap<>();
    private Map<String, Long> documentsByType = new java.util.LinkedHashMap<>();
    private Map<String, Long> documentsByAcademicYear = new java.util.LinkedHashMap<>();
    private List<AdvisorStatDTO> topAdvisors = new ArrayList<>();
    private Double approvalRate = 0.0;

    public DashboardDTO() {}

    public Long getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(Long totalDocuments) { this.totalDocuments = totalDocuments; }

    public Long getPendingDocuments() { return pendingDocuments; }
    public void setPendingDocuments(Long pendingDocuments) { this.pendingDocuments = pendingDocuments; }

    public Map<String, Long> getDocumentsByStatus() { return documentsByStatus; }
    public void setDocumentsByStatus(Map<String, Long> documentsByStatus) { this.documentsByStatus = documentsByStatus; }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalDownloads() { return totalDownloads; }
    public void setTotalDownloads(Long totalDownloads) { this.totalDownloads = totalDownloads; }

    public Long getTotalReports() { return totalReports; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }

    public Long getPendingReports() { return pendingReports; }
    public void setPendingReports(Long pendingReports) { this.pendingReports = pendingReports; }

    public List<DocumentSummaryDTO> getTopDocuments() { return topDocuments; }
    public void setTopDocuments(List<DocumentSummaryDTO> topDocuments) { this.topDocuments = topDocuments; }

    public List<DocumentSummaryDTO> getTopViewed() { return topViewed; }
    public void setTopViewed(List<DocumentSummaryDTO> topViewed) { this.topViewed = topViewed; }

    public List<DocumentSummaryDTO> getRecentDocuments() { return recentDocuments; }
    public void setRecentDocuments(List<DocumentSummaryDTO> recentDocuments) { this.recentDocuments = recentDocuments; }

    public List<DocumentSummaryDTO> getRecentSubmissions() { return recentSubmissions; }
    public void setRecentSubmissions(List<DocumentSummaryDTO> recentSubmissions) { this.recentSubmissions = recentSubmissions; }

    public Map<String, Long> getDocumentsBySubject() { return documentsBySubject; }
    public void setDocumentsBySubject(Map<String, Long> documentsBySubject) { this.documentsBySubject = documentsBySubject; }

    public Map<String, Long> getDocumentsByMajor() { return documentsByMajor; }
    public void setDocumentsByMajor(Map<String, Long> documentsByMajor) { this.documentsByMajor = documentsByMajor; }

    public Map<String, Long> getDocumentsByType() { return documentsByType; }
    public void setDocumentsByType(Map<String, Long> documentsByType) { this.documentsByType = documentsByType; }

    public Map<String, Long> getDocumentsByAcademicYear() { return documentsByAcademicYear; }
    public void setDocumentsByAcademicYear(Map<String, Long> documentsByAcademicYear) { this.documentsByAcademicYear = documentsByAcademicYear; }

    public List<AdvisorStatDTO> getTopAdvisors() { return topAdvisors; }
    public void setTopAdvisors(List<AdvisorStatDTO> topAdvisors) { this.topAdvisors = topAdvisors; }

    public Double getApprovalRate() { return approvalRate; }
    public void setApprovalRate(Double approvalRate) { this.approvalRate = approvalRate; }
}
