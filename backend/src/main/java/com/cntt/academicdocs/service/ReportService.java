package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.*;
import com.cntt.academicdocs.dto.CreateReportRequest;
import com.cntt.academicdocs.dto.HandleReportRequest;
import com.cntt.academicdocs.dto.ReportResponse;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.DocumentReviewRepository;
import com.cntt.academicdocs.repository.ReportRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final DocumentRepository documentRepository;
    private final DocumentReviewRepository documentReviewRepository;
    private final UserRepository userRepository;

    public ReportService(
            ReportRepository reportRepository,
            DocumentRepository documentRepository,
            DocumentReviewRepository documentReviewRepository,
            UserRepository userRepository
    ) {
        this.reportRepository = reportRepository;
        this.documentRepository = documentRepository;
        this.documentReviewRepository = documentReviewRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReportResponse createReport(Long documentId, CreateReportRequest request, Long reporterId) {
        if (reporterId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để gửi báo cáo");
        }

        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (document.getStatus() != DocumentStatus.APPROVED) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT_STATUS", "Chỉ có thể báo cáo vi phạm đối với tài liệu đã được phê duyệt (APPROVED)");
        }

        Report report = new Report();
        report.setDocumentId(documentId);
        report.setReporterId(reporterId);
        report.setReasonCode(request.getReasonCode());
        report.setDescription(request.getDescription());
        report.setStatus(ReportStatus.PENDING);

        Report saved = reportRepository.save(report);
        return mapToResponse(saved, document);
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(Long reporterId) {
        if (reporterId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập");
        }
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId).stream()
                .map(r -> {
                    Document doc = documentRepository.findById(r.getDocumentId()).orElse(null);
                    return mapToResponse(r, doc);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> getAdminReports(ReportStatus status) {
        List<Report> reports = (status != null)
                ? reportRepository.findByStatusOrderByCreatedAtDesc(status)
                : reportRepository.findAllByOrderByCreatedAtDesc();

        return reports.stream().map(r -> {
            Document doc = documentRepository.findById(r.getDocumentId()).orElse(null);
            return mapToResponse(r, doc);
        }).toList();
    }

    @Transactional
    public ReportResponse handleReport(Long reportId, HandleReportRequest request, Long adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "REPORT_NOT_FOUND", "Không tìm thấy báo cáo vi phạm"));

        report.setStatus(request.getDecision());
        report.setResolvedBy(adminId);
        report.setResolutionNote(request.getNote());
        report.setResolvedAt(LocalDateTime.now());

        Document document = documentRepository.findById(report.getDocumentId()).orElse(null);

        // If hideDocument is requested, hide the document and record in moderation history
        if (request.getHideDocument() && document != null) {
            String fromStatus = document.getStatus().name();
            document.setStatus(DocumentStatus.HIDDEN);
            documentRepository.save(document);

            DocumentReview review = new DocumentReview(
                    document.getId(),
                    adminId != null ? adminId : 0L,
                    fromStatus,
                    DocumentStatus.HIDDEN.name(),
                    "Ẩn tài liệu do xử lý báo cáo vi phạm #" + report.getId() + (request.getNote() != null ? " - " + request.getNote() : "")
            );
            documentReviewRepository.save(review);
        }

        Report saved = reportRepository.save(report);
        return mapToResponse(saved, document);
    }

    private ReportResponse mapToResponse(Report report, Document document) {
        ReportResponse res = new ReportResponse();
        res.setId(report.getId());
        res.setDocumentId(report.getDocumentId());
        res.setDocumentTitle(document != null ? document.getTitle() : "Tài liệu #" + report.getDocumentId());
        res.setReporterId(report.getReporterId());

        User reporter = userRepository.findById(report.getReporterId()).orElse(null);
        res.setReporterName(reporter != null ? reporter.getFullName() : "Sinh viên");

        res.setReasonCode(report.getReasonCode());
        res.setDescription(report.getDescription());
        res.setStatus(report.getStatus());
        res.setResolvedBy(report.getResolvedBy());

        if (report.getResolvedBy() != null && report.getResolvedBy() > 0) {
            User resolver = userRepository.findById(report.getResolvedBy()).orElse(null);
            res.setResolverName(resolver != null ? resolver.getFullName() : "Quản trị viên");
        }

        res.setResolutionNote(report.getResolutionNote());
        res.setCreatedAt(report.getCreatedAt());
        res.setResolvedAt(report.getResolvedAt());
        return res;
    }
}
