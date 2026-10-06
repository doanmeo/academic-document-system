package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.domain.Report;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.CreateReportRequest;
import com.cntt.academicdocs.dto.HandleReportRequest;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.dto.ReportDTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.LovValueRepository;
import com.cntt.academicdocs.repository.ReportRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final LovValueRepository lovValueRepository;

    public ReportService(
            ReportRepository reportRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository,
            LovValueRepository lovValueRepository
    ) {
        this.reportRepository = reportRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
        this.lovValueRepository = lovValueRepository;
    }

    @Transactional
    public ReportDTO createReport(Long documentId, Long reporterId, CreateReportRequest req) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new BusinessException(HttpStatus.UNPROCESSABLE_ENTITY, "DOCUMENT_NOT_APPROVED", "Chỉ có thể báo cáo vi phạm tài liệu đã được phê duyệt");
        }

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Report report = new Report();
        report.setDocument(document);
        report.setReporter(reporter);
        report.setReasonCode(req.getReasonCode());
        report.setDescription(req.getDescription());
        report.setStatus("PENDING");

        Report saved = reportRepository.save(report);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportDTO> getMyReports(Long userId, Pageable pageable) {
        Page<Report> page = reportRepository.findByReporter_IdOrderByCreatedAtDesc(userId, pageable);
        List<ReportDTO> dtoList = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return PageResponse.of(page, dtoList);
    }

    @Transactional(readOnly = true)
    public PageResponse<ReportDTO> getAdminReports(String status, Pageable pageable) {
        Page<Report> page;
        if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
            page = reportRepository.findByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        } else {
            page = reportRepository.findAll(pageable);
        }
        List<ReportDTO> dtoList = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return PageResponse.of(page, dtoList);
    }

    @Transactional
    public ReportDTO handleReport(Long reportId, Long adminId, HandleReportRequest req) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "REPORT_NOT_FOUND", "Không tìm thấy báo cáo"));

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy quản trị viên"));

        String decision = req.getDecision().toUpperCase();
        if (!"RESOLVED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_DECISION", "Quyết định xử lý phải là RESOLVED hoặc REJECTED");
        }

        report.setStatus(decision);
        report.setHandledBy(admin);
        report.setHandledAt(LocalDateTime.now());
        report.setHandlingNote(req.getNote());

        if (Boolean.TRUE.equals(req.getHideDocument())) {
            Document document = report.getDocument();
            document.setStatus(DocumentStatus.HIDDEN);
            documentRepository.save(document);
        }

        Report saved = reportRepository.save(report);
        return toDTO(saved);
    }

    private ReportDTO toDTO(Report report) {
        String reasonLabel = lovValueRepository.findByGroupCodeAndActiveTrue("REPORT_REASON").stream()
                .filter(v -> v.getCode().equalsIgnoreCase(report.getReasonCode()))
                .map(v -> v.getLabel())
                .findFirst()
                .orElse(report.getReasonCode());

        ReportDTO dto = new ReportDTO();
        dto.setId(report.getId());
        dto.setDocumentId(report.getDocument() != null ? report.getDocument().getId() : null);
        dto.setDocumentTitle(report.getDocument() != null ? report.getDocument().getTitle() : "");
        dto.setReporterId(report.getReporter() != null ? report.getReporter().getId() : null);
        dto.setReporterName(report.getReporter() != null ? report.getReporter().getFullName() : "");
        dto.setReasonCode(report.getReasonCode());
        dto.setReasonLabel(reasonLabel);
        dto.setDescription(report.getDescription());
        dto.setStatus(report.getStatus());
        dto.setHandledBy(report.getHandledBy() != null ? report.getHandledBy().getFullName() : null);
        dto.setHandledAt(report.getHandledAt());
        dto.setHandlingNote(report.getHandlingNote());
        dto.setCreatedAt(report.getCreatedAt());
        return dto;
    }
}
