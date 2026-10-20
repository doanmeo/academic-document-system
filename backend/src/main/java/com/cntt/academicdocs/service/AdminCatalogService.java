package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.AcademicYear;
import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.Subject;
import com.cntt.academicdocs.domain.Technology;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.AcademicYearRepository;
import com.cntt.academicdocs.repository.MajorRepository;
import com.cntt.academicdocs.repository.SubjectRepository;
import com.cntt.academicdocs.repository.TechnologyRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class AdminCatalogService {

    private final SubjectRepository subjectRepository;
    private final MajorRepository majorRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TechnologyRepository technologyRepository;

    public AdminCatalogService(
            SubjectRepository subjectRepository,
            MajorRepository majorRepository,
            AcademicYearRepository academicYearRepository,
            TechnologyRepository technologyRepository
    ) {
        this.subjectRepository = subjectRepository;
        this.majorRepository = majorRepository;
        this.academicYearRepository = academicYearRepository;
        this.technologyRepository = technologyRepository;
    }

    // ─── Subjects ─────────────────────────────────────────────────────────────

    public Subject createSubject(Map<String, String> body) {
        String code = body != null ? body.get("code") : null;
        String name = body != null ? body.get("name") : null;
        String desc = body != null ? body.get("description") : null;

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên môn học là bắt buộc");
        }
        if (subjectRepository.findByCode(code.trim()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã môn học đã tồn tại");
        }

        Subject subject = new Subject();
        subject.setCode(code.trim().toUpperCase());
        subject.setName(name.trim());
        subject.setDescription(desc != null ? desc.trim() : null);
        subject.setActive(true);
        return subjectRepository.save(subject);
    }

    public Subject updateSubject(Long id, Map<String, String> body) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));

        if (body != null) {
            if (body.get("name") != null) subject.setName(body.get("name").trim());
            if (body.get("description") != null) subject.setDescription(body.get("description").trim());
        }
        return subjectRepository.save(subject);
    }

    public void deleteSubject(Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));
        subject.setActive(false);
        subjectRepository.save(subject);
    }

    // ─── Majors ───────────────────────────────────────────────────────────────

    public Major createMajor(Map<String, String> body) {
        String code = body != null ? body.get("code") : null;
        String name = body != null ? body.get("name") : null;

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên chuyên ngành là bắt buộc");
        }
        if (majorRepository.findByCode(code.trim()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã chuyên ngành đã tồn tại");
        }

        Major major = new Major();
        major.setCode(code.trim().toUpperCase());
        major.setName(name.trim());
        major.setActive(true);
        return majorRepository.save(major);
    }

    public Major updateMajor(Long id, Map<String, String> body) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));

        if (body != null && body.get("name") != null) {
            major.setName(body.get("name").trim());
        }
        return majorRepository.save(major);
    }

    public void deleteMajor(Long id) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));
        major.setActive(false);
        majorRepository.save(major);
    }

    // ─── Academic Years ───────────────────────────────────────────────────────

    public AcademicYear createAcademicYear(Map<String, Object> body) {
        String code = body != null ? (String) body.get("code") : null;
        String name = body != null ? (String) body.get("name") : null;

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên năm học là bắt buộc");
        }
        if (academicYearRepository.findByCode(code.trim()).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã năm học đã tồn tại");
        }

        AcademicYear year = new AcademicYear();
        year.setCode(code.trim());
        year.setName(name.trim());
        if (body != null && body.get("startYear") != null) {
            year.setStartYear(Short.parseShort(body.get("startYear").toString()));
        }
        year.setActive(true);
        return academicYearRepository.save(year);
    }

    public AcademicYear updateAcademicYear(Long id, Map<String, Object> body) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));

        if (body != null) {
            if (body.get("code") != null && !body.get("code").toString().isBlank()) {
                String newCode = body.get("code").toString().trim();
                if (!newCode.equalsIgnoreCase(year.getCode()) && academicYearRepository.findByCode(newCode).isPresent()) {
                    throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã năm học đã tồn tại");
                }
                year.setCode(newCode);
            }
            if (body.get("name") != null && !body.get("name").toString().isBlank()) {
                year.setName(body.get("name").toString().trim());
            }
            if (body.get("startYear") != null) {
                year.setStartYear(Short.parseShort(body.get("startYear").toString()));
            }
        }
        return academicYearRepository.save(year);
    }

    public void deleteAcademicYear(Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));
        year.setActive(false);
        academicYearRepository.save(year);
    }

    // ─── Technologies ─────────────────────────────────────────────────────────

    public Technology createTechnology(Map<String, String> body) {
        String name = body != null ? body.get("name") : null;
        String slug = body != null ? body.get("slug") : null;

        if (name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Tên công nghệ là bắt buộc");
        }
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().replaceAll("[^a-z0-9]", "-");
        }

        Technology tech = new Technology();
        tech.setName(name.trim());
        tech.setSlug(slug.trim());
        tech.setActive(true);
        return technologyRepository.save(tech);
    }

    public Technology updateTechnology(Long id, Map<String, String> body) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));

        if (body != null) {
            if (body.get("name") != null && !body.get("name").isBlank()) {
                tech.setName(body.get("name").trim());
            }
            if (body.get("slug") != null && !body.get("slug").isBlank()) {
                tech.setSlug(body.get("slug").trim());
            }
        }
        return technologyRepository.save(tech);
    }

    public void deleteTechnology(Long id) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));
        tech.setActive(false);
        technologyRepository.save(tech);
    }
}
