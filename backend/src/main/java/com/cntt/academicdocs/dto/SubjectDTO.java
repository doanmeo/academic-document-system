package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.Subject;

public class SubjectDTO {
    private Long id;
    private String code;
    private String name;

    public SubjectDTO() {}

    public SubjectDTO(Long id, String code, String name) {
        this.id = id;
        this.code = code;
        this.name = name;
    }

    public static SubjectDTO fromEntity(Subject subject) {
        return new SubjectDTO(subject.getId(), subject.getCode(), subject.getName());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
