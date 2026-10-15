package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentQA;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.CreateQARequest;
import com.cntt.academicdocs.dto.DocumentQADTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.DocumentQARepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentQAService {

    private final DocumentQARepository documentQARepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public DocumentQAService(
            DocumentQARepository documentQARepository,
            DocumentRepository documentRepository,
            UserRepository userRepository
    ) {
        this.documentQARepository = documentQARepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<DocumentQADTO> getQuestionsByDocument(Long documentId) {
        List<DocumentQA> topLevel = documentQARepository.findByDocument_IdAndParentIsNullOrderByCreatedAtDesc(documentId);
        return topLevel.stream().map(this::toDTOWithReplies).collect(Collectors.toList());
    }

    @Transactional
    public DocumentQADTO postQuestion(Long documentId, Long userId, CreateQARequest req) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        DocumentQA qa = new DocumentQA();
        qa.setDocument(document);
        qa.setUser(user);
        qa.setQuestion(req.getQuestion().trim());
        qa.setPageNumber(req.getPageNumber());
        qa.setUpvotes(0);
        qa.setCreatedAt(LocalDateTime.now());
        qa.setUpdatedAt(LocalDateTime.now());

        if (req.getParentId() != null) {
            DocumentQA parent = documentQARepository.findById(req.getParentId())
                    .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "PARENT_QA_NOT_FOUND", "Không tìm thấy câu hỏi cha"));
            qa.setParent(parent);
        }

        DocumentQA saved = documentQARepository.save(qa);
        return toDTO(saved);
    }

    @Transactional
    public DocumentQADTO upvoteQA(Long qaId) {
        DocumentQA qa = documentQARepository.findById(qaId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "QA_NOT_FOUND", "Không tìm thấy câu hỏi / thảo luận"));
        qa.setUpvotes(qa.getUpvotes() == null ? 1 : qa.getUpvotes() + 1);
        DocumentQA saved = documentQARepository.save(qa);
        return toDTO(saved);
    }

    private DocumentQADTO toDTOWithReplies(DocumentQA qa) {
        DocumentQADTO dto = toDTO(qa);
        List<DocumentQA> replies = documentQARepository.findByParent_IdOrderByCreatedAtAsc(qa.getId());
        dto.setReplies(replies.stream().map(this::toDTO).collect(Collectors.toList()));
        return dto;
    }

    private DocumentQADTO toDTO(DocumentQA qa) {
        DocumentQADTO dto = new DocumentQADTO();
        dto.setId(qa.getId());
        dto.setDocumentId(qa.getDocument().getId());
        dto.setUserId(qa.getUser().getId());
        dto.setUserFullName(qa.getUser().getFullName());
        dto.setUserStudentCode(qa.getUser().getStudentCode());
        dto.setParentId(qa.getParent() != null ? qa.getParent().getId() : null);
        dto.setQuestion(qa.getQuestion());
        dto.setAnswer(qa.getAnswer());
        dto.setPageNumber(qa.getPageNumber());
        dto.setUpvotes(qa.getUpvotes() != null ? qa.getUpvotes() : 0);
        dto.setCreatedAt(qa.getCreatedAt());
        return dto;
    }
}
