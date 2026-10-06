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

        DashboardDTO dto = new DashboardDTO();
        dto.setTotalDocuments(totalDocs);
        dto.setDocumentsByStatus(statusMap);
        dto.setTotalUsers(totalUsers);
        dto.setPendingDocuments(pendingDocs);
        dto.setTotalReports(totalReports);
        dto.setPendingReports(pendingReports);
        dto.setTopDocuments(topDTOs);
        dto.setRecentDocuments(recentDTOs);
        return dto;
    }
}
