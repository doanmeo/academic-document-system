package com.cntt.academicdocs.dto;

public class SignedUrlResponse {

    private Long fileId;
    private String fileName;
    private String signedUrl;
    private Integer expiresIn;

    public SignedUrlResponse() {
    }

    public SignedUrlResponse(Long fileId, String fileName, String signedUrl, Integer expiresIn) {
        this.fileId = fileId;
        this.fileName = fileName;
        this.signedUrl = signedUrl;
        this.expiresIn = expiresIn;
    }

    public Long getFileId() {
        return fileId;
    }

    public void setFileId(Long fileId) {
        this.fileId = fileId;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getSignedUrl() {
        return signedUrl;
    }

    public void setSignedUrl(String signedUrl) {
        this.signedUrl = signedUrl;
    }

    public Integer getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Integer expiresIn) {
        this.expiresIn = expiresIn;
    }
}
