package com.cntt.academicdocs.service;

import com.cntt.academicdocs.dto.GenerateAbstractRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api-key:FAKE_GEMINI_API_KEY_AI_DEV}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate;

    public GeminiService() {
        this.restTemplate = new RestTemplate();
    }

    public String generateAcademicAbstract(GenerateAbstractRequest req) {
        String title = req.getTitle() != null ? req.getTitle().trim() : "Học liệu CNTT";
        String docType = req.getDocumentTypeCode() != null ? req.getDocumentTypeCode().trim() : "Tài liệu học tập";
        String subject = req.getSubjectName() != null ? req.getSubjectName().trim() : "Công nghệ Thông tin";
        String keywords = req.getKeywords() != null ? req.getKeywords().trim() : "";

        // Nếu API key được thay thế bằng key thật (bắt đầu bằng AIza...)
        if (geminiApiKey != null && geminiApiKey.startsWith("AIza") && !geminiApiKey.contains("FAKE")) {
            try {
                String response = callGeminiApi(title, docType, subject, keywords);
                if (response != null && !response.isBlank()) {
                    return response;
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back to rule-based generator: {}", e.getMessage());
            }
        }

        // Fallback generator: Sinh tóm tắt học thuật chuẩn chỉnh ngữ cảnh Khoa CNTT UTC
        return generateRuleBasedAbstract(title, docType, subject, keywords);
    }

    @SuppressWarnings("unchecked")
    private String callGeminiApi(String title, String docType, String subject, String keywords) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey);

        String prompt = String.format(
                "Bạn là trợ lý học thuật chuyên ngành Công nghệ Thông tin tại Trường ĐH Giao thông Vận tải (UTC).\n" +
                "Hãy viết một đoạn tóm tắt học thuật (abstract) ngắn gọn, súc tích (khoảng 100 - 180 từ) bằng tiếng Việt cho học liệu sau:\n" +
                "- Tiêu đề: %s\n" +
                "- Thể loại: %s\n" +
                "- Môn học: %s\n" +
                "- Từ khóa: %s\n\n" +
                "Yêu cầu:\n" +
                "1. Nêu rõ bối cảnh và mục tiêu cốt lõi của tài liệu.\n" +
                "2. Tóm tắt nội dung trọng tâm và kiến thức lý thuyết / thực hành mang lại.\n" +
                "3. Khuyến nghị đối tượng sinh viên và cách áp dụng tài liệu để học tập hiệu quả.\n" +
                "Chỉ trả về nội dung tóm tắt, không thêm lời chào hay định dạng markdown thừa thãi.",
                title, docType, subject, keywords
        );

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contents = Map.of("parts", List.of(textPart));
        Map<String, Object> requestBody = Map.of("contents", List.of(contents));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            Map<String, Object> body = response.getBody();
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> candidate = candidates.get(0);
                Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                if (parts != null && !parts.isEmpty()) {
                    return (String) parts.get(0).get("text");
                }
            }
        }
        return null;
    }

    private String generateRuleBasedAbstract(String title, String docType, String subject, String keywords) {
        String typeDesc;
        switch (docType.toUpperCase()) {
            case "THESIS":
                typeDesc = "khóa luận tốt nghiệp chuyên sâu";
                break;
            case "CAPSTONE":
                typeDesc = "đồ án chuyên ngành / bài tập lớn";
                break;
            case "SLIDE":
                typeDesc = "hệ thống bài giảng và slide trực quan";
                break;
            case "EXAM":
                typeDesc = "tài liệu tổng hợp đề thi học kỳ và lời giải chi tiết";
                break;
            case "LAB":
                typeDesc = "hướng dẫn thực hành lab phòng máy chuẩn";
                break;
            default:
                typeDesc = "tài liệu học tập và nghiên cứu";
                break;
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Tài liệu \"").append(title).append("\" là ").append(typeDesc)
          .append(" thuộc học phần ").append(subject)
          .append(", phục vụ chương trình đào tạo Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải (UTC). ");

        sb.append("Nội dung tập trung phân tích và triển khai các kiến thức trọng tâm");
        if (keywords != null && !keywords.isBlank()) {
            sb.append(" xoay quanh các chủ đề cốt lõi như ").append(keywords).append(".");
        } else {
            sb.append(" gắn liền với các bài toán thực tiễn trong ngành kỹ thuật phần mềm và hệ thống thông tin.");
        }

        sb.append(" Học liệu cung cấp hệ thống giải pháp, sơ đồ kiến trúc, mã nguồn mẫu và phương pháp luận rõ ràng, ")
          .append("giúp sinh viên dễ dàng tra cứu, củng cố nền tảng lý thuyết và hoàn thành tốt các đề tài nghiên cứu liên quan.");

        return sb.toString();
    }
}
