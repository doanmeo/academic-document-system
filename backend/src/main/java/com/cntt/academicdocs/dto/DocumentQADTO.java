package com.cntt.academicdocs.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class DocumentQADTO {
    private Long id;
    private Long documentId;
    private Long userId;
    private String userFullName;
    private String userStudentCode;
    private Long parentId;
    private String question;
    private String answer;
    private Integer pageNumber;
    private Integer upvotes;
    private LocalDateTime createdAt;
    private List<DocumentQADTO> replies = new ArrayList<>();

    public DocumentQADTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserStudentCode() { return userStudentCode; }
    public void setUserStudentCode(String userStudentCode) { this.userStudentCode = userStudentCode; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<DocumentQADTO> getReplies() { return replies; }
    public void setReplies(List<DocumentQADTO> replies) { this.replies = replies; }
}
