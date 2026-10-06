package com.cntt.academicdocs.dto;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardDTO {
    private Long totalDocuments = 0L;
    private Map<String, Long> documentsByStatus = new HashMap<>();
    private Long totalUsers = 0L;
    private Long pendingDocuments = 0L;
    private Long totalReports = 0L;
    private Long pendingReports = 0L;
    private List<DocumentSummaryDTO> topDocuments = new ArrayList<>();
    private List<DocumentSummaryDTO> recentDocuments = new ArrayList<>();

    public DashboardDTO() {}

    public Long getTotalDocuments() { return totalDocuments; }
    public void setTotalDocuments(Long totalDocuments) { this.totalDocuments = totalDocuments; }

    public Long getPendingDocuments() { return pendingDocuments; }
    public void setPendingDocuments(Long pendingDocuments) { this.pendingDocuments = pendingDocuments; }

    public Map<String, Long> getDocumentsByStatus() { return documentsByStatus; }
    public void setDocumentsByStatus(Map<String, Long> documentsByStatus) { this.documentsByStatus = documentsByStatus; }

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalReports() { return totalReports; }
    public void setTotalReports(Long totalReports) { this.totalReports = totalReports; }

    public Long getPendingReports() { return pendingReports; }
    public void setPendingReports(Long pendingReports) { this.pendingReports = pendingReports; }

    public List<DocumentSummaryDTO> getTopDocuments() { return topDocuments; }
    public void setTopDocuments(List<DocumentSummaryDTO> topDocuments) { this.topDocuments = topDocuments; }

    public List<DocumentSummaryDTO> getRecentDocuments() { return recentDocuments; }
    public void setRecentDocuments(List<DocumentSummaryDTO> recentDocuments) { this.recentDocuments = recentDocuments; }
}
