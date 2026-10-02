package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.AcademicYear;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicYearRepository extends JpaRepository<AcademicYear, Long> {
    List<AcademicYear> findAllByActiveTrueOrderByStartYearDesc();
    Optional<AcademicYear> findByCode(String code);
    boolean existsByCode(String code);
}
