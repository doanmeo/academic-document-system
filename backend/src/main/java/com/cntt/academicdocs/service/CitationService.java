package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import com.cntt.academicdocs.dto.CitationResponseDTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.util.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CitationService {

    private final DocumentRepository documentRepository;
    private final DocumentService documentService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public CitationService(DocumentRepository documentRepository, DocumentService documentService) {
        this.documentRepository = documentRepository;
        this.documentService = documentService;
    }

    @Transactional(readOnly = true)
    public CitationResponseDTO generateCitation(Long documentId, String format) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentRole = SecurityUtils.getCurrentRole();
        boolean isOwner = currentUserId != null && doc.getUploader() != null && doc.getUploader().getId().equals(currentUserId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentRole);

        if (!isAdmin && !isOwner && doc.getStatus() != DocumentStatus.APPROVED) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Tài liệu chưa được phê duyệt");
        }

        String citationFormat = (format != null && !format.isBlank()) ? format.trim().toUpperCase() : "IEEE";
        if (!citationFormat.equals("APA") && !citationFormat.equals("IEEE") && !citationFormat.equals("BIBTEX")) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_FORMAT", "Định dạng trích dẫn không hợp lệ (hỗ trợ APA, IEEE, BIBTEX)");
        }

        String author = (doc.getUploader() != null && doc.getUploader().getFullName() != null && !doc.getUploader().getFullName().isBlank())
                ? doc.getUploader().getFullName().trim()
                : "Khoa CNTT - UTC";

        String title = (doc.getTitle() != null && !doc.getTitle().isBlank())
                ? doc.getTitle().trim()
                : "Học liệu Khoa CNTT";

        String year = "2025";
        if (doc.getAcademicYear() != null && doc.getAcademicYear().getName() != null) {
            Matcher m = Pattern.compile("\\d{4}").matcher(doc.getAcademicYear().getName());
            if (m.find()) {
                year = m.group();
            }
        } else if (doc.getCreatedAt() != null) {
            year = String.valueOf(doc.getCreatedAt().getYear());
        }

        String typeLabel = documentService.getDocumentTypeLabel(doc.getDocumentTypeCode());
        String advisor = doc.getAdvisorName() != null && !doc.getAdvisorName().isBlank() ? doc.getAdvisorName().trim() : null;
        String subject = doc.getSubject() != null && doc.getSubject().getName() != null ? doc.getSubject().getName().trim() : null;
        String major = doc.getMajor() != null && doc.getMajor().getName() != null ? doc.getMajor().getName().trim() : null;
        String url = frontendUrl + "/documents/" + doc.getId();

        String citationText = switch (citationFormat) {
            case "APA" -> formatApa(author, year, title, typeLabel, advisor, subject, major, url);
            case "IEEE" -> formatIeee(author, year, title, typeLabel, advisor, subject, url);
            case "BIBTEX" -> formatBibtex(doc.getId(), author, year, title, typeLabel, advisor, subject, major, url);
            default -> formatIeee(author, year, title, typeLabel, advisor, subject, url);
        };

        return new CitationResponseDTO(citationFormat, citationText);
    }

    private String formatApa(String author, String year, String title, String typeLabel, String advisor, String subject, String major, String url) {
        StringBuilder academicContext = new StringBuilder();
        academicContext.append(typeLabel);
        if (advisor != null) {
            academicContext.append(", GVHD: ").append(advisor);
        }
        if (subject != null) {
            academicContext.append(", Môn: ").append(subject);
        }
        if (major != null) {
            academicContext.append(", Ngành ").append(major);
        }
        academicContext.append(", Khoa Công nghệ Thông tin, Trường Đại học Giao thông Vận tải");

        return String.format("%s. (%s). %s [%s]. %s",
                author, year, title, academicContext, url);
    }

    private String formatIeee(String author, String year, String title, String typeLabel, String advisor, String subject, String url) {
        String abbreviated = abbreviateAuthor(author);
        StringBuilder typeAndAdvisor = new StringBuilder(typeLabel);
        if (advisor != null) {
            typeAndAdvisor.append(" (GVHD: ").append(advisor).append(")");
        }
        if (subject != null) {
            typeAndAdvisor.append(", Môn ").append(subject);
        }
        return String.format("%s, \"%s,\" %s, Khoa CNTT, ĐH Giao thông Vận tải, Hà Nội, %s. [Online]. Available: %s",
                abbreviated, title, typeAndAdvisor, year, url);
    }

    private String formatBibtex(Long docId, String author, String year, String title, String typeLabel, String advisor, String subject, String major, String url) {
        String citeKey = String.format("utc_fit_%d_%s", docId != null ? docId : 1L, year);
        StringBuilder noteBuilder = new StringBuilder();
        noteBuilder.append(typeLabel);
        if (advisor != null) noteBuilder.append(", GVHD: ").append(advisor);
        if (subject != null) noteBuilder.append(", Môn: ").append(subject);
        if (major != null) noteBuilder.append(", Ngành: ").append(major);

        return String.format(
                "@misc{%s,\n" +
                "  author = {%s},\n" +
                "  title = {%s},\n" +
                "  howpublished = {Khoa Công nghệ Thông tin, Trường Đại học Giao thông Vận tải (UTC)},\n" +
                "  year = {%s},\n" +
                "  note = {%s},\n" +
                "  url = {%s}\n" +
                "}",
                citeKey, author, title, year, noteBuilder, url
        );
    }

    private String abbreviateAuthor(String author) {
        if (author == null || author.isBlank()) return "Khoa CNTT - UTC";
        String[] parts = author.trim().split("\\s+");
        if (parts.length >= 2) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < parts.length - 1; i++) {
                sb.append(Character.toUpperCase(parts[i].charAt(0))).append(". ");
            }
            sb.append(parts[parts.length - 1]);
            return sb.toString();
        }
        return author;
    }
}
