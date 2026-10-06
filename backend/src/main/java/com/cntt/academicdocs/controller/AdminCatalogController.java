package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.AcademicYear;
import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.Subject;
import com.cntt.academicdocs.domain.Technology;
import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.AcademicYearRepository;
import com.cntt.academicdocs.repository.MajorRepository;
import com.cntt.academicdocs.repository.SubjectRepository;
import com.cntt.academicdocs.repository.TechnologyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Catalog", description = "Quản lý danh mục môn học, ngành, năm học, công nghệ")
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
    @Operation(summary = "Thêm mới môn học")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");
        String desc = body.get("description");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên môn học là bắt buộc");
        }
        if (subjectRepository.findByCode(code).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã môn học đã tồn tại");
        }

        Subject subject = new Subject();
        subject.setCode(code.trim().toUpperCase());
        subject.setName(name.trim());
        subject.setDescription(desc);
        subject.setActive(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(subjectRepository.save(subject)));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Cập nhật môn học")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));

        if (body.get("name") != null) subject.setName(body.get("name").trim());
        if (body.get("description") != null) subject.setDescription(body.get("description").trim());
        return ResponseEntity.ok(ApiResponse.success(subjectRepository.save(subject)));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Vô hiệu hóa môn học (Soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        Subject subject = subjectRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy môn học"));
        subject.setActive(false);
        subjectRepository.save(subject);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa môn học"));
    }

    // --- Majors ---
    @PostMapping("/majors")
    @Operation(summary = "Thêm mới chuyên ngành")
    public ResponseEntity<ApiResponse<Major>> createMajor(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String name = body.get("name");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên chuyên ngành là bắt buộc");
        }
        if (majorRepository.findByCode(code).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã chuyên ngành đã tồn tại");
        }

        Major major = new Major();
        major.setCode(code.trim().toUpperCase());
        major.setName(name.trim());
        major.setActive(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(majorRepository.save(major)));
    }

    @PutMapping("/majors/{id}")
    @Operation(summary = "Cập nhật chuyên ngành")
    public ResponseEntity<ApiResponse<Major>> updateMajor(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));

        if (body.get("name") != null) major.setName(body.get("name").trim());
        return ResponseEntity.ok(ApiResponse.success(majorRepository.save(major)));
    }

    @DeleteMapping("/majors/{id}")
    @Operation(summary = "Vô hiệu hóa chuyên ngành")
    public ResponseEntity<ApiResponse<Void>> deleteMajor(@PathVariable Long id) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy chuyên ngành"));
        major.setActive(false);
        majorRepository.save(major);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa chuyên ngành"));
    }

    // --- Academic Years ---
    @PostMapping("/academic-years")
    @Operation(summary = "Thêm mới năm học / khóa học")
    public ResponseEntity<ApiResponse<AcademicYear>> createAcademicYear(@RequestBody Map<String, Object> body) {
        String code = (String) body.get("code");
        String name = (String) body.get("name");

        if (code == null || code.isBlank() || name == null || name.isBlank()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", "Mã và tên năm học là bắt buộc");
        }
        if (academicYearRepository.findByCode(code).isPresent()) {
            throw new BusinessException(HttpStatus.CONFLICT, "CODE_EXISTS", "Mã năm học đã tồn tại");
        }

        AcademicYear year = new AcademicYear();
        year.setCode(code.trim());
        year.setName(name.trim());
        if (body.get("startYear") != null) {
            year.setStartYear(Short.parseShort(body.get("startYear").toString()));
        }
        year.setActive(true);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(academicYearRepository.save(year)));
    }

    @PutMapping("/academic-years/{id}")
    @Operation(summary = "Cập nhật năm học")
    public ResponseEntity<ApiResponse<AcademicYear>> updateAcademicYear(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));

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
        return ResponseEntity.ok(ApiResponse.success(academicYearRepository.save(year)));
    }

    @DeleteMapping("/academic-years/{id}")
    @Operation(summary = "Vô hiệu hóa năm học")
    public ResponseEntity<ApiResponse<Void>> deleteAcademicYear(@PathVariable Long id) {
        AcademicYear year = academicYearRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy năm học"));
        year.setActive(false);
        academicYearRepository.save(year);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa năm học"));
    }

    // --- Technologies ---
    @PostMapping("/technologies")
    @Operation(summary = "Thêm mới công nghệ")
    public ResponseEntity<ApiResponse<Technology>> createTechnology(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        String slug = body.get("slug");

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
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(technologyRepository.save(tech)));
    }

    @PutMapping("/technologies/{id}")
    @Operation(summary = "Cập nhật công nghệ")
    public ResponseEntity<ApiResponse<Technology>> updateTechnology(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));

        if (body.get("name") != null && !body.get("name").isBlank()) {
            tech.setName(body.get("name").trim());
        }
        if (body.get("slug") != null && !body.get("slug").isBlank()) {
            tech.setSlug(body.get("slug").trim());
        }
        return ResponseEntity.ok(ApiResponse.success(technologyRepository.save(tech)));
    }

    @DeleteMapping("/technologies/{id}")
    @Operation(summary = "Vô hiệu hóa công nghệ")
    public ResponseEntity<ApiResponse<Void>> deleteTechnology(@PathVariable Long id) {
        Technology tech = technologyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "NOT_FOUND", "Không tìm thấy công nghệ"));
        tech.setActive(false);
        technologyRepository.save(tech);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa công nghệ"));
    }
}
