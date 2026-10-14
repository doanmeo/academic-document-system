package com.cntt.academicdocs.dto;

public class CitationResponseDTO {
    private String format;
    private String citation;

    public CitationResponseDTO() {}

    public CitationResponseDTO(String format, String citation) {
        this.format = format;
        this.citation = citation;
    }

    public String getFormat() {
        return format;
    }

    public void setFormat(String format) {
        this.format = format;
    }

    public String getCitation() {
        return citation;
    }

    public void setCitation(String citation) {
        this.citation = citation;
    }
}
