package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Major;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MajorRepository extends JpaRepository<Major, Long> {
    List<Major> findAllByActiveTrueOrderByCodeAsc();
    Optional<Major> findByCode(String code);
    boolean existsByCode(String code);
}
