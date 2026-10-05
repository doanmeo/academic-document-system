package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.DocumentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentReviewRepository extends JpaRepository<DocumentReview, Long> {

    List<DocumentReview> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
}
