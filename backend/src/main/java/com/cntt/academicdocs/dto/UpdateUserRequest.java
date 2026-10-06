package com.cntt.academicdocs.dto;

public class UpdateUserRequest {
    private String fullName;
    private Long majorId;
    private String avatarUrl;

    public UpdateUserRequest() {}

    public UpdateUserRequest(String fullName, Long majorId, String avatarUrl) {
        this.fullName = fullName;
        this.majorId = majorId;
        this.avatarUrl = avatarUrl;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Long getMajorId() {
        return majorId;
    }

    public void setMajorId(Long majorId) {
        this.majorId = majorId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}
