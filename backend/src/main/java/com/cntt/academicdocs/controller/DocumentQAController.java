package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.CreateQARequest;
import com.cntt.academicdocs.dto.DocumentQADTO;
import com.cntt.academicdocs.service.DocumentQAService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentQAController {

    private final DocumentQAService documentQAService;

    public DocumentQAController(DocumentQAService documentQAService) {
        this.documentQAService = documentQAService;
    }

    @GetMapping("/{id}/qa")
    public ResponseEntity<List<DocumentQADTO>> getQuestions(@PathVariable("id") Long id) {
        return ResponseEntity.ok(documentQAService.getQuestionsByDocument(id));
    }

    @PostMapping("/{id}/qa")
    public ResponseEntity<DocumentQADTO> postQuestion(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody CreateQARequest req
    ) {
        // Fallback to userId 1 (student) if authentication principal is null in dev mode
        Long userId = currentUserId != null ? currentUserId : 1L;
        return ResponseEntity.ok(documentQAService.postQuestion(id, userId, req));
    }

    @PostMapping("/qa/{qaId}/upvote")
    public ResponseEntity<DocumentQADTO> upvoteQuestion(@PathVariable("qaId") Long qaId) {
        return ResponseEntity.ok(documentQAService.upvoteQA(qaId));
    }
}
