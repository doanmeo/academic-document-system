package com.cntt.academicdocs.dto;

import com.cntt.academicdocs.domain.Technology;

public class TechnologyDTO {
    private Long id;
    private String name;
    private String slug;

    public TechnologyDTO() {}

    public TechnologyDTO(Long id, String name, String slug) {
        this.id = id;
        this.name = name;
        this.slug = slug;
    }

    public static TechnologyDTO fromEntity(Technology tech) {
        return new TechnologyDTO(tech.getId(), tech.getName(), tech.getSlug());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
}
