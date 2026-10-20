package com.cntt.academicdocs.service;

import com.cntt.academicdocs.dto.GenerateAbstractRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-3.8-flash}")
    private String geminiModel;

    @Value("${app.openrouter.api-key:}")
    private String openrouterApiKey;

    @Value("${app.openrouter.base-url:https://openrouter.ai/api/v1}")
    private String openrouterBaseUrl;

    @Value("${app.openrouter.model:nvidia/nemotron-3-ultra-550b-a55b:free}")
    private String openrouterModel;

    private final RestTemplate restTemplate;

    public GeminiService() {
        org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(6000);
        factory.setReadTimeout(12000);
        this.restTemplate = new RestTemplate(factory);
    }

    @jakarta.annotation.PostConstruct
    public void init() {
        // Load GEMINI_API_KEY & MODEL if not configured in properties
        if (geminiApiKey == null || geminiApiKey.isBlank() || geminiApiKey.contains("FAKE") || geminiApiKey.contains("your_gemini")) {
            String envKey = System.getenv("GEMINI_API_KEY");
            if (envKey != null && !envKey.isBlank()) {
                this.geminiApiKey = envKey.trim();
            }
        }
        String envGeminiModel = System.getenv("GEMINI_MODEL");
        if (envGeminiModel != null && !envGeminiModel.isBlank()) {
            this.geminiModel = envGeminiModel.trim();
        }

        // Load OPENROUTER_API_KEY & MODEL if not configured in properties
        if (openrouterApiKey == null || openrouterApiKey.isBlank() || openrouterApiKey.contains("FAKE") || openrouterApiKey.contains("your_openrouter")) {
            String envOpenRouter = System.getenv("OPENROUTER_API_KEY");
            if (envOpenRouter != null && !envOpenRouter.isBlank()) {
                this.openrouterApiKey = envOpenRouter.trim();
            }
        }
        String envModel = System.getenv("OPENROUTER_MODEL");
        if (envModel != null && !envModel.isBlank()) {
            this.openrouterModel = envModel.trim();
        }

        // Fallback check in .env files
        for (String pathStr : List.of(".env", "backend/.env", "../backend/.env")) {
            try {
                java.nio.file.Path p = java.nio.file.Paths.get(pathStr);
                if (java.nio.file.Files.exists(p)) {
                    for (String line : java.nio.file.Files.readAllLines(p)) {
                        String trimmed = line.trim();
                        if (trimmed.startsWith("GEMINI_API_KEY=") && !trimmed.startsWith("#")) {
                            String val = trimmed.substring("GEMINI_API_KEY=".length()).trim();
                            if (!val.isBlank() && !val.contains("your_gemini")) {
                                this.geminiApiKey = val;
                                log.info("Loaded Gemini API key from {}", pathStr);
                            }
                        }
                        if (trimmed.startsWith("GEMINI_MODEL=") && !trimmed.startsWith("#")) {
                            String val = trimmed.substring("GEMINI_MODEL=".length()).trim();
                            if (!val.isBlank()) {
                                this.geminiModel = val;
                                log.info("Loaded Gemini Model from {}: {}", pathStr, val);
                            }
                        }
                        if (trimmed.startsWith("OPENROUTER_API_KEY=") && !trimmed.startsWith("#")) {
                            String val = trimmed.substring("OPENROUTER_API_KEY=".length()).trim();
                            if (!val.isBlank() && !val.contains("your_openrouter")) {
                                this.openrouterApiKey = val;
                                log.info("Loaded OpenRouter API key from {}", pathStr);
                            }
                        }
                        if (trimmed.startsWith("OPENROUTER_MODEL=") && !trimmed.startsWith("#")) {
                            String val = trimmed.substring("OPENROUTER_MODEL=".length()).trim();
                            if (!val.isBlank()) {
                                this.openrouterModel = val;
                                log.info("Loaded OpenRouter Model from {}: {}", pathStr, val);
                            }
                        }
                    }
                }
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * Trích xuất văn bản từ tài liệu tải lên (PDF, DOCX Word, TXT, MD)
     * Đọc 2-5 trang đầu hoặc tối đa 3500 ký tự đầu tiên để nắm trọn mục tiêu và giải pháp của đề tài.
     */
    public String extractTextFromFile(byte[] fileBytes, String fileName) {
        if (fileBytes == null || fileBytes.length == 0) return "";
        String lowerName = (fileName != null) ? fileName.toLowerCase() : "";

        // 1. Định dạng PPTX (PowerPoint Presentation OpenXML)
        if (lowerName.endsWith(".pptx")) {
            String pptxText = extractPptxText(fileBytes, 3500);
            if (!pptxText.isBlank()) return pptxText;
        }

        // 2. Định dạng PPT (Legacy PowerPoint Binary)
        if (lowerName.endsWith(".ppt")) {
            String pptText = extractLegacyPptText(fileBytes, 3000);
            if (!pptText.isBlank()) return pptText;
        }

        // 3. Định dạng DOCX (Word OpenXML)
        if (lowerName.endsWith(".docx")) {
            String docxText = extractDocxText(fileBytes, 3500);
            if (!docxText.isBlank()) return docxText;
        }

        // 4. Định dạng DOC (Legacy Word Binary)
        if (lowerName.endsWith(".doc")) {
            String docText = extractLegacyPptText(fileBytes, 3000);
            if (!docText.isBlank()) return docText;
        }

        // 5. Định dạng PDF
        if (lowerName.endsWith(".pdf")) {
            String pdfText = extractPdfText(fileBytes, 5);
            if (!pdfText.isBlank()) return pdfText;
        }

        // 6. Định dạng Plain text hoặc Markdown
        if (lowerName.endsWith(".txt") || lowerName.endsWith(".md") || lowerName.endsWith(".json")) {
            try {
                String text = new String(fileBytes, java.nio.charset.StandardCharsets.UTF_8).trim();
                return text.length() > 3000 ? text.substring(0, 3000) : text;
            } catch (Exception ignored) {}
        }

        // Thử phát hiện theo header bytes (magic numbers) nếu tên file không có đuôi chuẩn
        if (fileBytes.length >= 4) {
            // PDF magic: %PDF
            if (fileBytes[0] == '%' && fileBytes[1] == 'P' && fileBytes[2] == 'D' && fileBytes[3] == 'F') {
                return extractPdfText(fileBytes, 5);
            }
            // ZIP/DOCX/PPTX magic: PK\x03\x04
            if (fileBytes[0] == 0x50 && fileBytes[1] == 0x4B && fileBytes[2] == 0x03 && fileBytes[3] == 0x04) {
                String docx = extractDocxText(fileBytes, 3500);
                if (!docx.isBlank()) return docx;
                String pptx = extractPptxText(fileBytes, 3500);
                if (!pptx.isBlank()) return pptx;
            }
        }

        return "";
    }

    /**
     * Trích xuất văn bản từ Word .docx (đọc các node <w:t> trong word/document.xml)
     */
    private String extractDocxText(byte[] bytes, int maxChars) {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(bytes))) {
            java.util.zip.ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equalsIgnoreCase(entry.getName())) {
                    byte[] buffer = zis.readAllBytes();
                    String xml = new String(buffer, java.nio.charset.StandardCharsets.UTF_8);

                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("<w:t[^>]*>(.*?)</w:t>");
                    java.util.regex.Matcher matcher = pattern.matcher(xml);
                    StringBuilder text = new StringBuilder();
                    while (matcher.find()) {
                        String piece = matcher.group(1);
                        piece = piece.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"");
                        text.append(piece).append(" ");
                        if (text.length() >= maxChars) break;
                    }
                    String result = text.toString().replaceAll("\\s+", " ").trim();
                    log.info("Extracted {} characters from DOCX document", result.length());
                    return result;
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract text from DOCX file: {}", e.getMessage());
        }
        return "";
    }
    /**
     * Trích xuất văn bản từ PowerPoint .pptx (đọc các node <a:t> trong ppt/slides/slide1.xml, slide2.xml, ...)
     * Đọc các slide đầu tiên (tối đa 8 slide, tối đa maxChars ký tự)
     */
    private String extractPptxText(byte[] bytes, int maxChars) {
        try (java.util.zip.ZipInputStream zis = new java.util.zip.ZipInputStream(new java.io.ByteArrayInputStream(bytes))) {
            java.util.zip.ZipEntry entry;
            Map<Integer, String> slideTexts = new TreeMap<>();
            java.util.regex.Pattern slideNumPattern = java.util.regex.Pattern.compile("ppt/slides/slide(\\d+)\\.xml", java.util.regex.Pattern.CASE_INSENSITIVE);
            java.util.regex.Pattern textPattern = java.util.regex.Pattern.compile("<a:t[^>]*>(.*?)</a:t>");

            while ((entry = zis.getNextEntry()) != null) {
                String name = entry.getName();
                java.util.regex.Matcher m = slideNumPattern.matcher(name);
                if (m.matches()) {
                    int slideNum = Integer.parseInt(m.group(1));
                    if (slideNum <= 10) {
                        byte[] buffer = zis.readAllBytes();
                        String xml = new String(buffer, java.nio.charset.StandardCharsets.UTF_8);
                        java.util.regex.Matcher tm = textPattern.matcher(xml);
                        StringBuilder sb = new StringBuilder();
                        while (tm.find()) {
                            String piece = tm.group(1);
                            piece = piece.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"");
                            sb.append(piece).append(" ");
                        }
                        slideTexts.put(slideNum, sb.toString().trim());
                    }
                }
            }

            StringBuilder fullText = new StringBuilder();
            for (Map.Entry<Integer, String> entrySlide : slideTexts.entrySet()) {
                if (!entrySlide.getValue().isBlank()) {
                    fullText.append("[Slide ").append(entrySlide.getKey()).append("]: ")
                            .append(entrySlide.getValue()).append("\n");
                    if (fullText.length() >= maxChars) break;
                }
            }

            String result = fullText.toString().trim();
            log.info("Extracted {} characters from {} PPTX slides", result.length(), slideTexts.size());
            return result;
        } catch (Exception e) {
            log.warn("Could not extract text from PPTX file: {}", e.getMessage());
        }
        return "";
    }

    /**
     * Trích xuất văn bản từ tệp nhị phân legacy .ppt / .doc
     */
    private String extractLegacyPptText(byte[] bytes, int maxChars) {
        try {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < bytes.length - 1; i += 2) {
                char c = (char) ((bytes[i] & 0xFF) | ((bytes[i + 1] & 0xFF) << 8));
                if ((c >= 32 && c <= 126) || (c >= 0x00C0 && c <= 0x1EF9)) {
                    sb.append(c);
                    if (sb.length() >= maxChars) break;
                } else if (sb.length() > 0 && sb.charAt(sb.length() - 1) != ' ') {
                    sb.append(' ');
                }
            }
            String res = sb.toString().replaceAll("\\s+", " ").trim();
            if (res.length() > 80) {
                return res.length() > maxChars ? res.substring(0, maxChars) : res;
            }
        } catch (Exception ignored) {}
        return "";
    }

    /**
     * Trích xuất văn bản từ PDF bằng Apache PDFBox
     */
    public String extractFirstPagesText(byte[] pdfBytes, int maxPages) {
        return extractPdfText(pdfBytes, maxPages);
    }

    private String extractPdfText(byte[] pdfBytes, int maxPages) {
        if (pdfBytes == null || pdfBytes.length == 0) return "";
        try (org.apache.pdfbox.pdmodel.PDDocument document = org.apache.pdfbox.Loader.loadPDF(pdfBytes)) {
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            stripper.setStartPage(1);
            int pagesToExtract = Math.min(Math.max(1, maxPages), document.getNumberOfPages());
            stripper.setEndPage(pagesToExtract);

            String text = stripper.getText(document);
            if (text == null) return "";
            text = text.replaceAll("\\s+", " ").trim();
            if (text.length() > 3500) {
                text = text.substring(0, 3500);
            }
            log.info("Extracted {} characters from first {} pages of PDF", text.length(), pagesToExtract);
            return text;
        } catch (Exception e) {
            log.warn("Could not extract text from PDF via PDFBox: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Sinh tóm tắt học thuật ngắn gọn, đúng trọng tâm:
     * 1. Ưu tiên gọi Gemini API.
     * 2. Nếu Gemini gặp lỗi (rate limit, 429, quota, ...), tự động chuyển tiếp sang OpenRouter API.
     * 3. Nếu cả 2 đều không khả dụng, sử dụng bộ sinh tóm tắt quy chuẩn (Rule-based) súc tích.
     */
    public String generateAcademicAbstract(GenerateAbstractRequest req) {
        String title = req.getTitle() != null ? req.getTitle().trim() : "Học liệu CNTT";
        String docType = req.getDocumentTypeCode() != null ? req.getDocumentTypeCode().trim() : "Tài liệu học tập";
        String subject = req.getSubjectName() != null ? req.getSubjectName().trim() : "Công nghệ Thông tin";
        String keywords = req.getKeywords() != null ? req.getKeywords().trim() : "";
        String documentExcerpt = req.getDraftDescription() != null ? req.getDraftDescription().trim() : "";

        // 1. Thử gọi Gemini API (chỉ khi có API key Google AI Studio hợp lệ)
        if (geminiApiKey != null && !geminiApiKey.isBlank() && geminiApiKey.startsWith("AIzaSy")) {
            try {
                String response = callGeminiApi(title, docType, subject, keywords, documentExcerpt);
                if (response != null && !response.isBlank()) {
                    log.info("Generated abstract successfully via Gemini API");
                    return response.trim();
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed (rate limit or quota exceeded: {}). Switching immediately to OpenRouter API...", e.getMessage());
            }
        }

        // 2. Chuyển tiếp sang OpenRouter API (Fallback 1)
        if (openrouterApiKey != null && !openrouterApiKey.isBlank() && !openrouterApiKey.contains("FAKE") && !openrouterApiKey.contains("your_openrouter")) {
            try {
                String response = callOpenRouterApi(title, docType, subject, keywords, documentExcerpt);
                if (response != null && !response.isBlank()) {
                    log.info("Generated abstract successfully via OpenRouter API fallback");
                    return response.trim();
                }
            } catch (Exception e) {
                log.warn("OpenRouter API call failed ({}). Falling back to rule-based abstract generator...", e.getMessage());
            }
        }

        // 3. Fallback generator: Sinh tóm tắt học thuật súc tích ngữ cảnh UTC
        return generateRuleBasedAbstract(title, docType, subject, keywords, documentExcerpt);
    }

    public Map<String, Object> generateAbstractFromFile(
            MultipartFile file,
            String title,
            String documentTypeCode,
            String subjectName
    ) {
        String extractedExcerpt = "";
        if (file != null && !file.isEmpty()) {
            try {
                extractedExcerpt = extractTextFromFile(file.getBytes(), file.getOriginalFilename());
            } catch (Exception e) {
                // If parsing fails, fallback to title
            }
        }

        GenerateAbstractRequest req = new GenerateAbstractRequest();
        String effectiveTitle = (title != null && !title.isBlank())
                ? title.trim()
                : (file != null ? file.getOriginalFilename().replaceFirst("[.][^.]+$", "") : "Tài liệu");
        req.setTitle(effectiveTitle);
        req.setDocumentTypeCode(documentTypeCode);
        req.setSubjectName(subjectName);
        req.setDraftDescription(extractedExcerpt);

        String generated;
        try {
            generated = generateAcademicAbstract(req);
        } catch (Exception e) {
            generated = "Tài liệu học tập và nghiên cứu thực hiện tại Khoa Công nghệ Thông tin - Trường Đại học Giao thông Vận tải (UTC).";
        }
        Map<String, Object> result = new HashMap<>();
        result.put("abstractText", generated);
        result.put("extractedExcerptLength", extractedExcerpt.length());
        result.put("suggestedTargetYear", "2026-2027");
        return result;
    }

    private String buildPrompt(String title, String docType, String subject, String keywords, String documentExcerpt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Bạn là chuyên gia học thuật ngành Công nghệ Thông tin tại Trường ĐH Giao thông Vận tải (UTC).\n");
        sb.append("Nhiệm vụ: Viết đoạn TÓM TẮT HỌC THUẬT (ABSTRACT) súc tích, chính xác (khoảng 60 - 95 từ, từ 2 đến 3 câu) bằng tiếng Việt cho tài liệu học tập sau:\n\n");
        
        sb.append("- Tên đề tài / Tiêu đề: ").append(title).append("\n");
        sb.append("- Thể loại học liệu: ").append(docType).append("\n");
        sb.append("- Học phần / Môn học: ").append(subject).append("\n");
        if (keywords != null && !keywords.isBlank()) {
            sb.append("- Từ khóa công nghệ: ").append(keywords).append("\n");
        }

        if (documentExcerpt != null && !documentExcerpt.isBlank()) {
            sb.append("\n--- ĐOẠN TRÍCH TỪ NỘI DUNG TÀI LIỆU (CÁC TRANG ĐẦU / ĐẶC TẢ / TÓM TẮT) ---\n\"\"\"\n")
              .append(documentExcerpt.length() > 3000 ? documentExcerpt.substring(0, 3000) : documentExcerpt)
              .append("\n\"\"\"\n");
        }

        sb.append("\nQUY TẮC BẮT BUỘC:\n");
        sb.append("1. Bám sát nội dung đoạn trích phía trên để nêu rõ bài toán, ca sử dụng (Use Case), giải pháp kỹ thuật và kết quả đạt được.\n");
        sb.append("2. Nếu tài liệu là Use Case/Đặc tả yêu cầu (như UC131415), hãy tóm tắt các luồng chức năng, tác nhân và mục tiêu hệ thống được mô tả trong đoạn trích.\n");
        sb.append("3. Nếu tài liệu là Slide bài giảng / Slide thuyết trình (PPT, PPTX), hãy tóm lược chủ đề buổi báo cáo, các luận điểm cốt lõi và kiến trúc/kết quả được trình bày qua các slide.\n");
        sb.append("4. Tuyệt đối KHÔNG viết câu mở đầu sáo rỗng ('Tài liệu này là...', 'Chào bạn...'). KHÔNG bịa đặt thông tin. Trả về trực tiếp 2-3 câu tóm tắt chuyên môn.");
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String callGeminiApi(String title, String docType, String subject, String keywords, String documentExcerpt) {
        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                geminiModel, geminiApiKey);

        String prompt = buildPrompt(title, docType, subject, keywords, documentExcerpt);

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
                if (content != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null) {
                        for (Map<String, Object> part : parts) {
                            Object textObj = part.get("text");
                            if (textObj instanceof String && !((String) textObj).isBlank()) {
                                return (String) textObj;
                            }
                        }
                    }
                }
            }
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private String callOpenRouterApi(String title, String docType, String subject, String keywords, String documentExcerpt) {
        String baseUrl = openrouterBaseUrl.endsWith("/") ? openrouterBaseUrl.substring(0, openrouterBaseUrl.length() - 1) : openrouterBaseUrl;
        String url = baseUrl + "/chat/completions";

        String prompt = buildPrompt(title, docType, subject, keywords, documentExcerpt);

        Map<String, Object> systemMessage = Map.of(
                "role", "system",
                "content", "Bạn là trợ lý học thuật chuyên sâu ngành CNTT UTC. Hãy tóm tắt học thuật súc tích, ngắn gọn (50-90 từ), tập trung vào mục tiêu và công nghệ."
        );
        Map<String, Object> userMessage = Map.of(
                "role", "user",
                "content", prompt
        );

        List<String> modelsToTry = new ArrayList<>();
        if (openrouterModel != null && !openrouterModel.isBlank()) {
            modelsToTry.add(openrouterModel.trim());
        }
        if (!modelsToTry.contains("nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free")) {
            modelsToTry.add("nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free");
        }
        if (!modelsToTry.contains("nvidia/nemotron-3-super-120b-a12b:free")) {
            modelsToTry.add("nvidia/nemotron-3-super-120b-a12b:free");
        }
        if (!modelsToTry.contains("liquid/lfm-2.5-2.6b:free")) {
            modelsToTry.add("liquid/lfm-2.5-2.6b:free");
        }

        for (String currentModel : modelsToTry) {
            try {
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", currentModel);
                requestBody.put("messages", List.of(systemMessage, userMessage));
                requestBody.put("temperature", 0.3);
                requestBody.put("max_tokens", 250);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(openrouterApiKey);
                headers.set("HTTP-Referer", "http://localhost:8080");
                headers.set("X-Title", "UTC Academic Docs");

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) body.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> choice = choices.get(0);
                        Map<String, Object> message = (Map<String, Object>) choice.get("message");
                        if (message != null && message.get("content") != null) {
                            log.info("Successfully generated abstract via OpenRouter using model: {}", currentModel);
                            return message.get("content").toString().trim();
                        }
                    } else if (body.containsKey("error")) {
                        log.warn("OpenRouter model {} returned error payload: {}. Trying fallback model...", currentModel, body.get("error"));
                        continue;
                    }
                }
            } catch (Exception e) {
                log.warn("OpenRouter model {} failed ({}), trying next model...", currentModel, e.getMessage());
            }
        }
        return null;
    }

    private String generateRuleBasedAbstract(String title, String docType, String subject, String keywords, String documentExcerpt) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tài liệu nghiên cứu và triển khai đề tài \"").append(title).append("\"");
        if (subject != null && !subject.isBlank()) {
            sb.append(" trong khuôn khổ học phần ").append(subject);
        }
        sb.append(". Công trình tập trung phân tích bài toán thực tế, đặc tả kiến trúc kỹ thuật và đề xuất giải pháp ứng dụng tại Khoa Công nghệ Thông tin - Trường ĐH Giao thông Vận tải (UTC).");

        if (documentExcerpt != null && documentExcerpt.length() > 50) {
            String clean = documentExcerpt
                    .replaceAll("(?i)(TRƯỜNG ĐẠI HỌC GIAO THÔNG VẬN TẢI|KHOA CÔNG NGHỆ THÔNG TIN|BỘ MÔN|GIẢNG VIÊN HƯỚNG DẪN|SINH VIÊN THỰC HIỆN|MÃ SINH VIÊN|HÀ NỘI|BÁO CÁO|TIỂU LUẬN|ĐỒ ÁN|KHÓA LUẬN)[^\n.;:]*", "")
                    .replaceAll("\\s+", " ")
                    .trim();

            if (clean.length() > 60) {
                int endIdx = clean.indexOf(". ");
                if (endIdx > 40 && endIdx < 280) {
                    sb.append(" Nội dung trọng tâm: ").append(clean.substring(0, endIdx + 1));
                } else {
                    int limit = Math.min(220, clean.length());
                    sb.append(" Nội dung tóm lược: ").append(clean.substring(0, limit)).append("...");
                }
            }
        }
        return sb.toString();
    }
}
