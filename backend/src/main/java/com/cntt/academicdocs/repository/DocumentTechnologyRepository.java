package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.DocumentTechnology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentTechnologyRepository extends JpaRepository<DocumentTechnology, Long> {
    List<DocumentTechnology> findByDocument_Id(Long documentId);
    void deleteByDocument_Id(Long documentId);
}
