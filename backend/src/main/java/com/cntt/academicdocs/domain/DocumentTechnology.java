package com.cntt.academicdocs.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "document_technologies", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "technology_id"})
})
public class DocumentTechnology {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technology_id", nullable = false)
    private Technology technology;

    @Column(name = "usage_note", length = 300)
    private String usageNote;

    public DocumentTechnology() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public Technology getTechnology() { return technology; }
    public void setTechnology(Technology technology) { this.technology = technology; }

    public String getUsageNote() { return usageNote; }
    public void setUsageNote(String usageNote) { this.usageNote = usageNote; }
}
