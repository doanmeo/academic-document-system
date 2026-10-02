package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.Major;

public class MajorDTO {
    private Long id;
    private String code;
    private String name;

    public MajorDTO() {}

    public MajorDTO(Long id, String code, String name) {
        this.id = id;
        this.code = code;
        this.name = name;
    }

    public static MajorDTO fromEntity(Major major) {
        return new MajorDTO(major.getId(), major.getCode(), major.getName());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
