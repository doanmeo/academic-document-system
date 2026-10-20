package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.domain.AcademicYear;
import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.Subject;
import com.cntt.academicdocs.domain.Technology;
import com.cntt.academicdocs.dto.ApiResponse;
import com.cntt.academicdocs.service.AdminCatalogService;
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

    private final AdminCatalogService adminCatalogService;

    public AdminCatalogController(AdminCatalogService adminCatalogService) {
        this.adminCatalogService = adminCatalogService;
    }

    // ─── Subjects ─────────────────────────────────────────────────────────────

    @PostMapping("/subjects")
    @Operation(summary = "Thêm mới môn học")
    public ResponseEntity<ApiResponse<Subject>> createSubject(@RequestBody Map<String, String> body) {
        Subject created = adminCatalogService.createSubject(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/subjects/{id}")
    @Operation(summary = "Cập nhật môn học")
    public ResponseEntity<ApiResponse<Subject>> updateSubject(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Subject updated = adminCatalogService.updateSubject(id, body);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/subjects/{id}")
    @Operation(summary = "Vô hiệu hóa môn học (Soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteSubject(@PathVariable Long id) {
        adminCatalogService.deleteSubject(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa môn học"));
    }

    // ─── Majors ───────────────────────────────────────────────────────────────

    @PostMapping("/majors")
    @Operation(summary = "Thêm mới chuyên ngành")
    public ResponseEntity<ApiResponse<Major>> createMajor(@RequestBody Map<String, String> body) {
        Major created = adminCatalogService.createMajor(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/majors/{id}")
    @Operation(summary = "Cập nhật chuyên ngành")
    public ResponseEntity<ApiResponse<Major>> updateMajor(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Major updated = adminCatalogService.updateMajor(id, body);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/majors/{id}")
    @Operation(summary = "Vô hiệu hóa chuyên ngành")
    public ResponseEntity<ApiResponse<Void>> deleteMajor(@PathVariable Long id) {
        adminCatalogService.deleteMajor(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa chuyên ngành"));
    }

    // ─── Academic Years ───────────────────────────────────────────────────────

    @PostMapping("/academic-years")
    @Operation(summary = "Thêm mới năm học / khóa học")
    public ResponseEntity<ApiResponse<AcademicYear>> createAcademicYear(@RequestBody Map<String, Object> body) {
        AcademicYear created = adminCatalogService.createAcademicYear(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/academic-years/{id}")
    @Operation(summary = "Cập nhật năm học")
    public ResponseEntity<ApiResponse<AcademicYear>> updateAcademicYear(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        AcademicYear updated = adminCatalogService.updateAcademicYear(id, body);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/academic-years/{id}")
    @Operation(summary = "Vô hiệu hóa năm học")
    public ResponseEntity<ApiResponse<Void>> deleteAcademicYear(@PathVariable Long id) {
        adminCatalogService.deleteAcademicYear(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa năm học"));
    }

    // ─── Technologies ─────────────────────────────────────────────────────────

    @PostMapping("/technologies")
    @Operation(summary = "Thêm mới công nghệ")
    public ResponseEntity<ApiResponse<Technology>> createTechnology(@RequestBody Map<String, String> body) {
        Technology created = adminCatalogService.createTechnology(body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    @PutMapping("/technologies/{id}")
    @Operation(summary = "Cập nhật công nghệ")
    public ResponseEntity<ApiResponse<Technology>> updateTechnology(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        Technology updated = adminCatalogService.updateTechnology(id, body);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/technologies/{id}")
    @Operation(summary = "Vô hiệu hóa công nghệ")
    public ResponseEntity<ApiResponse<Void>> deleteTechnology(@PathVariable Long id) {
        adminCatalogService.deleteTechnology(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hóa công nghệ"));
    }
}
