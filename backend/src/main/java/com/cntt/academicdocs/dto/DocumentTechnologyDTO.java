package com.cntt.academicdocs.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class DocumentTechnologyDTO {
    private Long id;
    private Long technologyId;
    private String technologyName;
    private String usageNote;

    public DocumentTechnologyDTO() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTechnologyId() { return technologyId; }
    public void setTechnologyId(Long technologyId) { this.technologyId = technologyId; }

    public String getTechnologyName() { return technologyName; }
    public void setTechnologyName(String technologyName) { this.technologyName = technologyName; }

    @JsonProperty("name")
    public String getName() { return technologyName; }
    public void setName(String name) { this.technologyName = name; }

    public String getUsageNote() { return usageNote; }
    public void setUsageNote(String usageNote) { this.usageNote = usageNote; }
}
