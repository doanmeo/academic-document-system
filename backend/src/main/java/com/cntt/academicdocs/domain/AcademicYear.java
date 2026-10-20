package com.cntt.academicdocs.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_years")
public class AcademicYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "start_year")
    private Short startYear;

    @Column(name = "end_year")
    private Short endYear;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public AcademicYear() {}

    public AcademicYear(String code, String name, Short startYear) {
        this.code = code;
        this.name = name;
        this.startYear = startYear != null ? startYear : 2025;
        this.endYear = (short) (this.startYear + 1);
        this.active = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Short getStartYear() { return startYear; }
    public void setStartYear(Short startYear) {
        this.startYear = startYear;
        if (this.endYear == null && startYear != null) {
            this.endYear = (short) (startYear + 1);
        }
    }

    public Short getEndYear() { return endYear; }
    public void setEndYear(Short endYear) { this.endYear = endYear; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @PrePersist
    public void onCreate() {
        if (this.startYear == null) {
            this.startYear = 2025;
        }
        if (this.endYear == null) {
            this.endYear = (short) (this.startYear + 1);
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        if (this.startYear == null) {
            this.startYear = 2025;
        }
        if (this.endYear == null) {
            this.endYear = (short) (this.startYear + 1);
        }
        this.updatedAt = LocalDateTime.now();
    }
}
