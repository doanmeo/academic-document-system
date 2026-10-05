package com.cntt.academicdocs.dto;

public class FileUploadResponse {

    private Long id;
    private String fileName;
    private String storageKey;
    private String mimeType;
    private Long fileSize;
    private Boolean isPrimary;
    private Long documentId;

    public FileUploadResponse() {
    }

    public FileUploadResponse(Long id, String fileName, String storageKey, String mimeType, Long fileSize, Boolean isPrimary, Long documentId) {
        this.id = id;
        this.fileName = fileName;
        this.storageKey = storageKey;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.isPrimary = isPrimary;
        this.documentId = documentId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getStorageKey() {
        return storageKey;
    }

    public void setStorageKey(String storageKey) {
        this.storageKey = storageKey;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean primary) {
        isPrimary = primary;
    }

    public Long getDocumentId() {
        return documentId;
    }

    public void setDocumentId(Long documentId) {
        this.documentId = documentId;
    }
}
