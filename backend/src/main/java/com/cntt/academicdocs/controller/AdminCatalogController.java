package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.AcademicYear;
import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.Subject;
import com.cntt.academicdocs.domain.Technology;
import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.AppException;
import com.cntt.academicdocs.repository.AcademicYearRepository;
import com.cntt.academicdocs.repository.MajorRepository;
import com.cntt.academicdocs.repository.SubjectRepository;
import com.cntt.academicdocs.repository.TechnologyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Catalog", description = "Endpoints for administrator catalog management (Subjects, Majors, Years, Technologies)")
public class AdminCatalogController {

    private final SubjectRepository subjectRepository;
    private final MajorRepository majorRepository;
    private final AcademicYearRepository academicYearRepository;
    private final TechnologyRepository technologyRepository;

    public AdminCatalogController(
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

    // --- Subjects ---
    @PostMapping("/subjects")
    @Operation(summary = "Create a new subject (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<SubjectDTO>> createSubject(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");
        String description = body.get("description");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã môn học và tên môn học là bắt buộc");
        }
        if (subjectRepository.existsByCode(code.trim())) {
            throw new AppException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã môn học đã tồn tại");
        }

        Subject subject = new Subject();
        subject.setCode(code.trim().toUpperCase());
        subject.setName(name.trim());
        subject.setDescription(description != null ? description.trim() : null);
        subject.setActive(true);

        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm môn học thành công", SubjectDTO.fromEntity(saved)));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Update an existing subject (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<SubjectDTO>> updateSubject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));

        if (body.get("name") != null && !body.get("name").isBlank()) {
            subject.setName(body.get("name").trim());
        }
        if (body.get("description") != null) {
            subject.setDescription(body.get("description").trim());
        }

        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật môn học thành công", SubjectDTO.fromEntity(saved)));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Soft delete / deactivate a subject (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));
        subject.setActive(false);
        subjectRepository.save(subject);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa môn học", null));
    }

    // --- Majors ---
    @PostMapping("/majors")
    @Operation(summary = "Create a new major (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<MajorDTO>> createMajor(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã chuyên ngành và tên chuyên ngành là bắt buộc");
        }
        if (majorRepository.existsByCode(code.trim())) {
            throw new AppException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã chuyên ngành đã tồn tại");
        }

        Major major = new Major();
        major.setCode(code.trim().toUpperCase());
        major.setName(name.trim());
        major.setActive(true);

        Major saved = majorRepository.save(major);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm chuyên ngành thành công", MajorDTO.fromEntity(saved)));
    }

    @PutMapping("/majors/{id}")
    @Operation(summary = "Update an existing major (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<MajorDTO>> updateMajor(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));

        if (body.get("name") != null && !body.get("name").isBlank()) {
            major.setName(body.get("name").trim());
        }

        Major saved = majorRepository.save(major);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chuyên ngành thành công", MajorDTO.fromEntity(saved)));
    }

    @DeleteMapping("/majors/{id}")
    @Operation(summary = "Soft delete / deactivate a major (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteMajor(@PathVariable Long id) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));
        major.setActive(false);
        majorRepository.save(major);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa chuyên ngành", null));
    }

    // --- Academic Years ---
    @PostMapping("/academic-years")
    @Operation(summary = "Create a new academic year (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<AcademicYearDTO>> createAcademicYear(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        String name = (String) body.get("name");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã năm học và tên năm học là bắt buộc");
        }
        if (academicYearRepository.existsByCode(code.trim())) {
            throw new AppException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã năm học đã tồn tại");
        }

        AcademicYear year = new AcademicYear();
        year.setCode(code.trim());
        year.setName(name.trim());
        if (body.get("startYear") != null) {
            year.setStartYear(Short.parseShort(body.get("startYear").toString()));
        }
        year.setActive(true);

        AcademicYear saved = academicYearRepository.save(year);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm năm học thành công", AcademicYearDTO.fromEntity(saved)));
    }

    @PutMapping("/academic-years/{id}")
    @Operation(summary = "Update an existing academic year (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<AcademicYearDTO>> updateAcademicYear(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));

        if (body.get("name") != null && !body.get("name").toString().isBlank()) {
            year.setName(body.get("name").toString().trim());
        }
        if (body.get("startYear") != null) {
            year.setStartYear(Short.parseShort(body.get("startYear").toString()));
        }

        AcademicYear saved = academicYearRepository.save(year);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật năm học thành công", AcademicYearDTO.fromEntity(saved)));
    }

    @DeleteMapping("/academic-years/{id}")
    @Operation(summary = "Soft delete / deactivate an academic year (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteAcademicYear(@PathVariable Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));
        year.setActive(false);
        academicYearRepository.save(year);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa năm học", null));
    }

    // --- Technologies ---
    @PostMapping("/technologies")
    @Operation(summary = "Create a new technology (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<TechnologyDTO>> createTechnology(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String slug = body.get("slug");

        if (name == null || name.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Tên công nghệ là bắt buộc");
        }
        if (slug == null || slug.isBlank()) {
            slug = name.toLowerCase().replaceAll("[^a-z0-9]", "-");
        }
        if (technologyRepository.existsBySlug(slug.trim())) {
            throw new AppException(HttpStatus.CONFLICT, "SLUG_EXISTS", "Slug công nghệ đã tồn tại");
        }

        Technology tech = new Technology();
        tech.setName(name.trim());
        tech.setSlug(slug.trim());
        tech.setActive(true);

        Technology saved = technologyRepository.save(tech);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Thêm công nghệ thành công", TechnologyDTO.fromEntity(saved)));
    }

    @PutMapping("/technologies/{id}")
    @Operation(summary = "Update an existing technology (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<TechnologyDTO>> updateTechnology(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));

        if (body.get("name") != null && !body.get("name").isBlank()) {
            tech.setName(body.get("name").trim());
        }
        if (body.get("slug") != null && !body.get("slug").isBlank()) {
            tech.setSlug(body.get("slug").trim());
        }

        Technology saved = technologyRepository.save(tech);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật công nghệ thành công", TechnologyDTO.fromEntity(saved)));
    }

    @DeleteMapping("/technologies/{id}")
    @Operation(summary = "Soft delete / deactivate a technology (ADMIN only)")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteTechnology(@PathVariable Long id) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));
        tech.setActive(false);
        technologyRepository.save(tech);
        return ResponseEntity.ok(ApiResponse.success("Đã vô hiệu hóa công nghệ", null));
    }
}
