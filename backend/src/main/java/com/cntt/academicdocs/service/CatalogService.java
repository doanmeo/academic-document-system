package com.cntt.academicdocs.service;

import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final SubjectRepository subjectRepository;
    private final MajorRepository majorRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TechnologyRepository technologyRepository;
    private final LovValueRepository lovValueRepository;

    public CatalogService(
            SubjectRepository subjectRepository,
            MajorRepository majorRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository,
            LovValueRepository lovValueRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.majorRepository = majorRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
        this.lovValueRepository = lovValueRepository;
    }

    public List<SubjectDTO> getSubjects() {
        return subjectRepository.findAllByActiveTrueOrderByCodeAsc().stream()
                .map(SubjectDTO::fromEntity)
                .toList();
    }

    public List<MajorDTO> getMajors() {
        return majorRepository.findAllByActiveTrueOrderByCodeAsc().stream()
                .map(MajorDTO::fromEntity)
                .toList();
    }

    public List<AcademicYearDTO> getAcademicYears() {
        return academicYearRepository.findAllByActiveTrueOrderByStartYearDesc().stream()
                .map(AcademicYearDTO::fromEntity)
                .toList();
    }

    public List<TechnologyDTO> getTechnologies() {
        return technologyRepository.findAllByActiveTrueOrderByNameAsc().stream()
                .map(TechnologyDTO::fromEntity)
                .toList();
    }

    public List<LovValueDTO> getLovValues(String groupCode) {
        return lovValueRepository.findByGroupCodeAndActiveTrue(groupCode).stream()
                .map(LovValueDTO::fromEntity)
                .toList();
    }
}
