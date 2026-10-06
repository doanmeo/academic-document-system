package com.cntt.academicdocs.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "document_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"document_id", "user_id"})
})
public class DocumentMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "member_order", nullable = false)
    private Integer memberOrder = 0;

    @Column(name = "is_leader", nullable = false)
    private Boolean isLeader = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DocumentMember() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getMemberOrder() { return memberOrder; }
    public void setMemberOrder(Integer memberOrder) { this.memberOrder = memberOrder; }

    public Boolean getIsLeader() { return isLeader; }
    public void setIsLeader(Boolean leader) { isLeader = leader; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
