package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Technology;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnologyRepository extends JpaRepository<Technology, Long> {
    List<Technology> findAllByActiveTrueOrderByNameAsc();
    Optional<Technology> findBySlug(String slug);
    boolean existsByName(String name);
    boolean existsBySlug(String slug);
}
