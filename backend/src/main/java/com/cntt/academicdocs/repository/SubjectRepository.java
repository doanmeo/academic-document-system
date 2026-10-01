package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findAllByActiveTrueOrderByCodeAsc();
    Optional<Subject> findByCode(String code);
    boolean existsByCode(String code);
}
