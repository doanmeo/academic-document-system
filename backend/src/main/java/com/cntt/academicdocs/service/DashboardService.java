package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.ReportStatus;
import com.cntt.academicdocs.dto.DashboardDTO;
import com.cntt.academicdocs.dto.DocumentResponse;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.ReportRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);
        long pendingDocs = documentRepository.countByStatus(DocumentStatus.PENDING);

        Map<String, Long> statusMap = new HashMap<>();
        List<Object[]> statusCounts = documentRepository.countByStatusGroup();
        for (Object[] row : statusCounts) {
            if (row != null && row.length >= 2 && row[0] != null) {
                statusMap.put(row[0].toString(), (Long) row[1]);
            }
        }

        List<Document> topDocs = documentRepository.findTop5ByStatusOrderByViewCountDesc(DocumentStatus.APPROVED);
        List<DocumentResponse> topResponses = topDocs.stream()
                .map(documentService::mapToResponse)
                .toList();

        List<Document> recentDocs = documentRepository.findTop5ByStatusOrderByCreatedAtDesc(DocumentStatus.APPROVED);
        List<DocumentResponse> recentResponses = recentDocs.stream()
                .map(documentService::mapToResponse)
                .toList();

        DashboardDTO dto = new DashboardDTO();
        dto.setTotalDocuments(totalDocs);
        dto.setDocumentsByStatus(statusMap);
        dto.setTotalUsers(totalUsers);
        dto.setPendingDocuments(pendingDocs);
        dto.setTotalReports(totalReports);
        dto.setPendingReports(pendingReports);
        dto.setTopDocuments(topResponses);
        dto.setRecentDocuments(recentResponses);
        return dto;
    }
}
