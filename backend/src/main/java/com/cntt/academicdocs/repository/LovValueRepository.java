package com.cntt.academicdocs.repository;

import com.cntt.academicdocs.domain.LovValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LovValueRepository extends JpaRepository<LovValue, Long> {

    @Query("SELECT v FROM LovValue v JOIN v.group g WHERE g.code = :groupCode AND v.active = true ORDER BY v.displayOrder ASC")
    List<LovValue> findByGroupCodeAndActiveTrue(@Param("groupCode") String groupCode);

    Optional<LovValue> findByGroup_CodeAndCode(String groupCode, String code);
}
