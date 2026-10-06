package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {
    Optional<Rating> findByUser_IdAndDocument_Id(Long userId, Long documentId);

    void deleteByUser_IdAndDocument_Id(Long userId, Long documentId);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.document.id = :docId")
    Double getAverageScoreByDocumentId(@Param("docId") Long docId);

    @Query("SELECT COUNT(r) FROM Rating r WHERE r.document.id = :docId")
    Integer getCountByDocumentId(@Param("docId") Long docId);
}
