package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.DocumentMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentMemberRepository extends JpaRepository<DocumentMember, Long> {
    List<DocumentMember> findByDocument_IdOrderByMemberOrderAsc(Long documentId);
    void deleteByDocument_Id(Long documentId);
}
