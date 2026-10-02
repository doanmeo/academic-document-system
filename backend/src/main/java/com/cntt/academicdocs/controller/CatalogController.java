package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.service.CatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalog")
@Tag(name = "Catalog", description = "Endpoints for academic metadata catalogs (Subjects, Majors, Academic Years, Technologies, LOV)")
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/subjects")
    @Operation(summary = "Get all active subjects")
    public ResponseEntity<ApiResponse<List<SubjectDTO>>> getSubjects() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getSubjects()));
    }

    @GetMapping("/majors")
    @Operation(summary = "Get all active majors")
    public ResponseEntity<ApiResponse<List<MajorDTO>>> getMajors() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getMajors()));
    }

    @GetMapping("/academic-years")
    @Operation(summary = "Get all active academic years")
    public ResponseEntity<ApiResponse<List<AcademicYearDTO>>> getAcademicYears() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getAcademicYears()));
    }

    @GetMapping("/technologies")
    @Operation(summary = "Get all active technologies")
    public ResponseEntity<ApiResponse<List<TechnologyDTO>>> getTechnologies() {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getTechnologies()));
    }

    @GetMapping("/lov/{groupCode}")
    @Operation(summary = "Get LOV values by group code (DOCUMENT_TYPE, FILE_TYPE, VISIBILITY, REPORT_REASON, REPORT_STATUS)")
    public ResponseEntity<ApiResponse<List<LovValueDTO>>> getLovValues(@PathVariable String groupCode) {
        return ResponseEntity.ok(ApiResponse.success(catalogService.getLovValues(groupCode)));
    }
}
