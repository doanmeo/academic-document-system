package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {

    Page<Document> findByUploader_IdAndStatusIn(Long uploaderId, List<DocumentStatus> statuses, Pageable pageable);

    Page<Document> findByUploader_Id(Long uploaderId, Pageable pageable);

    Page<Document> findByStatus(DocumentStatus status, Pageable pageable);

    long countByStatus(DocumentStatus status);

    @Modifying
    @Transactional
    @Query("UPDATE Document d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Transactional
    @Query("UPDATE Document d SET d.downloadCount = d.downloadCount + 1 WHERE d.id = :id")
    void incrementDownloadCount(@Param("id") Long id);

    @Query("SELECT d.status, COUNT(d) FROM Document d GROUP BY d.status")
    List<Object[]> countByStatusGroup();

    List<Document> findTop5ByStatusOrderByViewCountDesc(DocumentStatus status);

    List<Document> findTop5ByStatusOrderByCreatedAtDesc(DocumentStatus status);
}
