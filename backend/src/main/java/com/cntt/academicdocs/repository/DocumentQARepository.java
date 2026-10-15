package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.DocumentQA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentQARepository extends JpaRepository<DocumentQA, Long> {
    List<DocumentQA> findByDocument_IdAndParentIsNullOrderByCreatedAtDesc(Long documentId);
    List<DocumentQA> findByParent_IdOrderByCreatedAtAsc(Long parentId);
}
