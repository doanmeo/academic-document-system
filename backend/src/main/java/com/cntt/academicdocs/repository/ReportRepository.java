package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.Report;
import com.cntt.academicdocs.domain.ReportStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    List<Report> findByReporterIdOrderByCreatedAtDesc(Long reporterId);

    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    List<Report> findAllByOrderByCreatedAtDesc();

    long countByStatus(ReportStatus status);
}
