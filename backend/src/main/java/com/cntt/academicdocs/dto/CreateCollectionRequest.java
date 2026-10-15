package com.cntt.academicdocs.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateCollectionRequest {

    @NotBlank(message = "Tên bộ sưu tập không được để trống")
    private String title;

    private String description;
    private Boolean isPublic = true;

    public CreateCollectionRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
}
