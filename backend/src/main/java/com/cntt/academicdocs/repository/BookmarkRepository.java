package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Bookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    Optional<Bookmark> findByUser_IdAndDocument_Id(Long userId, Long documentId);
    boolean existsByUser_IdAndDocument_Id(Long userId, Long documentId);
    void deleteByUser_IdAndDocument_Id(Long userId, Long documentId);
    Page<Bookmark> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
