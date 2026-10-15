package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateQARequest {

    @NotBlank(message = "Nội dung câu hỏi hoặc thảo luận không được để trống")
    private String question;

    private Long parentId;
    private Integer pageNumber;

    public CreateQARequest() {}

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }

    public Integer getPageNumber() { return pageNumber; }
    public void setPageNumber(Integer pageNumber) { this.pageNumber = pageNumber; }
}
