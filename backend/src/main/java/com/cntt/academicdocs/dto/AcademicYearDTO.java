package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.AcademicYear;

public class AcademicYearDTO {
    private Long id;
    private String code;
    private String name;
    private Short startYear;

    public AcademicYearDTO() {}

    public AcademicYearDTO(Long id, String code, String name, Short startYear) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.startYear = startYear;
    }

    public static AcademicYearDTO fromEntity(AcademicYear year) {
        return new AcademicYearDTO(year.getId(), year.getCode(), year.getName(), year.getStartYear());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Short getStartYear() { return startYear; }
    public void setStartYear(Short startYear) { this.startYear = startYear; }
}
