package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {
    List<Collection> findByUser_IdOrderByCreatedAtDesc(Long userId);
    Optional<Collection> findByShareToken(String shareToken);
}
