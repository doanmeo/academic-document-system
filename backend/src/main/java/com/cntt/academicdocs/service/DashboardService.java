package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.DashboardDTO;
import com.cntt.academicdocs.dto.DocumentSummaryDTO;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.ReportRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final DocumentRepository documentRepository;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final DocumentService documentService;

    public DashboardService(
            DocumentRepository documentRepository,
            ReportRepository reportRepository,
            UserRepository userRepository,
            DocumentService documentService
    ) {
        this.documentRepository = documentRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.documentService = documentService;
    }

    @Transactional(readOnly = true)
    public DashboardDTO getDashboardStats() {
        long totalDocs = documentRepository.count();
        long totalUsers = userRepository.count();
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("PENDING");
        long pendingDocs = documentRepository.countByStatus(DocumentStatus.PENDING);

        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> statusCounts = documentRepository.countByStatusGroup();
        for (Object[] row : statusCounts) {
            if (row[0] != null) {
                statusMap.put(row[0].toString(), (Long) row[1]);
            }
        }

        List<Document> topDocs = documentRepository.findTop5ByStatusOrderByViewCountDesc(DocumentStatus.APPROVED);
        List<DocumentSummaryDTO> topDTOs = topDocs.stream()
                .map(d -> documentService.toSummaryDTO(d, null))
                .collect(Collectors.toList());

        List<Document> recentDocs = documentRepository.findTop5ByStatusOrderByCreatedAtDesc(DocumentStatus.APPROVED);
        List<DocumentSummaryDTO> recentDTOs = recentDocs.stream()
                .map(d -> documentService.toSummaryDTO(d, null))
                .collect(Collectors.toList());

        long totalDownloads = documentRepository.sumDownloadCount();

        // 1. Documents by Subject
        java.util.Map<String, Long> subjectMap = new java.util.LinkedHashMap<>();
        List<Object[]> subjectCounts = documentRepository.countBySubjectGroup();
        for (Object[] row : subjectCounts) {
            if (row[0] != null) {
                subjectMap.put(row[0].toString(), (Long) row[1]);
            }
        }

        // 2. Documents by Major
        java.util.Map<String, Long> majorMap = new java.util.LinkedHashMap<>();
        List<Object[]> majorCounts = documentRepository.countByMajorGroup();
        for (Object[] row : majorCounts) {
            if (row[0] != null) {
                majorMap.put(row[0].toString(), (Long) row[1]);
            }
        }

        // 3. Documents by Type (friendly labels)
        java.util.Map<String, Long> typeMap = new java.util.LinkedHashMap<>();
        List<Object[]> typeCounts = documentRepository.countByTypeGroup();
        for (Object[] row : typeCounts) {
            if (row[0] != null) {
                String typeCode = row[0].toString();
                String label = documentService.getDocumentTypeLabel(typeCode);
                typeMap.put(label, (Long) row[1]);
            }
        }

        // 4. Documents by Academic Year
        java.util.Map<String, Long> yearMap = new java.util.LinkedHashMap<>();
        List<Object[]> yearCounts = documentRepository.countByAcademicYearGroup();
        for (Object[] row : yearCounts) {
            if (row[0] != null) {
                yearMap.put(row[0].toString(), (Long) row[1]);
            }
        }

        // 5. Top Advisors
        List<com.cntt.academicdocs.dto.AdvisorStatDTO> advisorStats = new java.util.ArrayList<>();
        List<Object[]> advisorCounts = documentRepository.countByAdvisorGroup();
        for (Object[] row : advisorCounts) {
            if (row[0] != null && !row[0].toString().isBlank()) {
                String advName = row[0].toString().trim();
                Long count = (Long) row[1];
                Double rating = row[2] != null ? ((Number) row[2]).doubleValue() : 5.0;
                advisorStats.add(new com.cntt.academicdocs.dto.AdvisorStatDTO(advName, count, Math.round(rating * 10.0) / 10.0));
            }
        }

        // 6. Approval rate percentage
        long approved = statusMap.getOrDefault("APPROVED", 0L);
        long rejected = statusMap.getOrDefault("REJECTED", 0L);
        long revision = statusMap.getOrDefault("REVISION_REQUIRED", 0L);
        long reviewedTotal = approved + rejected + revision;
        double approvalRate = reviewedTotal > 0 ? (double) approved / reviewedTotal * 100.0 : 0.0;

        DashboardDTO dto = new DashboardDTO();
        dto.setTotalDocuments(totalDocs);
        dto.setDocumentsByStatus(statusMap);
        dto.setTotalUsers(totalUsers);
        dto.setTotalDownloads(totalDownloads);
        dto.setPendingDocuments(pendingDocs);
        dto.setTotalReports(totalReports);
        dto.setPendingReports(pendingReports);
        dto.setTopDocuments(topDTOs);
        dto.setTopViewed(topDTOs);
        dto.setRecentDocuments(recentDTOs);
        dto.setDocumentsBySubject(subjectMap);
        dto.setDocumentsByMajor(majorMap);
        dto.setDocumentsByType(typeMap);
        dto.setDocumentsByAcademicYear(yearMap);
        dto.setTopAdvisors(advisorStats);
        dto.setApprovalRate(Math.round(approvalRate * 10.0) / 10.0);
        return dto;
    }
}
