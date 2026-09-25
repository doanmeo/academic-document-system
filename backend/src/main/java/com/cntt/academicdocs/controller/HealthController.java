package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Health Check", description = "Endpoints for service health status")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend service health", description = "Public health endpoint returning UP status")
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> status = Map.of(
                "status", "UP",
                "service", "academic-docs"
        );
        return ResponseEntity.ok(ApiResponse.success("OK", status));
    }
}
