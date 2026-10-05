package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    boolean existsByUserIdAndDocumentId(Long userId, Long documentId);

    Optional<Bookmark> findByUserIdAndDocumentId(Long userId, Long documentId);

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(Long userId);

    void deleteByUserIdAndDocumentId(Long userId, Long documentId);
}
