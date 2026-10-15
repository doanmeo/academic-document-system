package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.CollectionItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long> {
    List<CollectionItem> findByCollection_IdOrderBySortOrderAscCreatedAtAsc(Long collectionId);
    Optional<CollectionItem> findByCollection_IdAndDocument_Id(Long collectionId, Long documentId);
    boolean existsByCollection_IdAndDocument_Id(Long collectionId, Long documentId);
    void deleteByCollection_IdAndDocument_Id(Long collectionId, Long documentId);
}
