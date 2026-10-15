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

    @Query("SELECT COALESCE(SUM(d.downloadCount), 0) FROM Document d")
    Long sumDownloadCount();

    List<Document> findTop5ByStatusOrderByViewCountDesc(DocumentStatus status);

    List<Document> findTop5ByStatusOrderByCreatedAtDesc(DocumentStatus status);

    List<Document> findByStatus(DocumentStatus status);

    @Query("SELECT DISTINCT d.advisorName FROM Document d WHERE d.advisorName IS NOT NULL AND TRIM(d.advisorName) <> '' ORDER BY d.advisorName ASC")
    List<String> findDistinctAdvisors();

    @Query("SELECT s.name, COUNT(d) FROM Document d JOIN d.subject s GROUP BY s.name ORDER BY COUNT(d) DESC")
    List<Object[]> countBySubjectGroup();

    @Query("SELECT m.name, COUNT(d) FROM Document d JOIN d.major m GROUP BY m.name ORDER BY COUNT(d) DESC")
    List<Object[]> countByMajorGroup();

    @Query("SELECT d.documentTypeCode, COUNT(d) FROM Document d WHERE d.documentTypeCode IS NOT NULL GROUP BY d.documentTypeCode ORDER BY COUNT(d) DESC")
    List<Object[]> countByTypeGroup();

    @Query("SELECT y.name, COUNT(d) FROM Document d JOIN d.academicYear y GROUP BY y.name ORDER BY y.name DESC")
    List<Object[]> countByAcademicYearGroup();

    @Query("SELECT d.advisorName, COUNT(d), COALESCE(AVG(d.avgRating), 0.0) FROM Document d WHERE d.advisorName IS NOT NULL AND TRIM(d.advisorName) <> '' GROUP BY d.advisorName ORDER BY COUNT(d) DESC")
    List<Object[]> countByAdvisorGroup();

    // U3: Dashboard recent submissions
    List<Document> findTop10ByStatusInOrderByUpdatedAtDesc(List<DocumentStatus> statuses);

    // F1: Coverage Heatmap
    @Query("SELECT d.subject.id, d.subject.code, d.subject.name, d.documentTypeCode, COUNT(d.id) " +
           "FROM Document d WHERE d.status = 'APPROVED' AND d.subject IS NOT NULL " +
           "GROUP BY d.subject.id, d.subject.code, d.subject.name, d.documentTypeCode")
    List<Object[]> countCoverageMatrix();

    // F5: Personal Stats for user
    long countByUploader_IdAndStatus(Long uploaderId, DocumentStatus status);

    @Query("SELECT COALESCE(SUM(d.viewCount), 0) FROM Document d WHERE d.uploader.id = :userId")
    Long sumViewsByUploaderId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(d.downloadCount), 0) FROM Document d WHERE d.uploader.id = :userId")
    Long sumDownloadsByUploaderId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(AVG(d.avgRating), 0.0) FROM Document d WHERE d.uploader.id = :userId AND d.ratingCount > 0")
    Double avgRatingByUploaderId(@Param("userId") Long userId);

    @Query("SELECT d.subject.name FROM Document d WHERE d.uploader.id = :userId AND d.subject IS NOT NULL GROUP BY d.subject.name ORDER BY COUNT(d.id) DESC LIMIT 1")
    List<String> findTopSubjectByUploaderId(@Param("userId") Long userId);
}
