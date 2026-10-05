package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByCreatedBy(Long createdBy);

    Page<Document> findByCreatedBy(Long createdBy, Pageable pageable);

    Page<Document> findByStatus(DocumentStatus status, Pageable pageable);

    @Modifying
    @Query("UPDATE Document d SET d.downloadCount = d.downloadCount + 1 WHERE d.id = :id")
    void incrementDownloadCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Document d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
