package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.DocumentFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentFileRepository extends JpaRepository<DocumentFile, Long> {

    List<DocumentFile> findByDocumentId(Long documentId);

    List<DocumentFile> findByCreatedBy(Long createdBy);
}
