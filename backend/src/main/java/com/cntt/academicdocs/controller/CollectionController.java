package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.service.CollectionService;
import com.cntt.academicdocs.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    private Long resolveUserId(Long currentUserId) {
        if (currentUserId != null) return currentUserId;
        Long secId = SecurityUtils.getCurrentUserId();
        return secId != null ? secId : 1L;
    }

    @GetMapping
    public ResponseEntity<List<CollectionDTO>> getMyCollections(@AuthenticationPrincipal Long currentUserId) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.getUserCollections(userId));
    }

    @PostMapping
    public ResponseEntity<CollectionDTO> createCollection(
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody CreateCollectionRequest req
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.createCollection(userId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDTO> getCollectionDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.getCollectionDetail(id, userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CollectionDTO> updateCollection(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody UpdateCollectionRequest req
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.updateCollection(id, userId, req));
    }

    @PostMapping("/{id}/regenerate-token")
    public ResponseEntity<CollectionDTO> regenerateShareToken(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.regenerateShareToken(id, userId));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<CollectionDTO> addItem(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody AddCollectionItemRequest req
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.addItemToCollection(id, userId, req));
    }

    @PutMapping("/{id}/items/{documentId}")
    public ResponseEntity<CollectionItemDTO> updateItem(
            @PathVariable("id") Long id,
            @PathVariable("documentId") Long documentId,
            @AuthenticationPrincipal Long currentUserId,
            @RequestBody UpdateCollectionItemRequest req
    ) {
        Long userId = resolveUserId(currentUserId);
        return ResponseEntity.ok(collectionService.updateCollectionItem(id, documentId, userId, req));
    }

    @DeleteMapping("/{id}/items/{documentId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable("id") Long id,
            @PathVariable("documentId") Long documentId,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = resolveUserId(currentUserId);
        collectionService.removeItemFromCollection(id, documentId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = resolveUserId(currentUserId);
        collectionService.deleteCollection(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/{shareToken}")
    public ResponseEntity<CollectionDTO> getPublicCollection(@PathVariable("shareToken") String shareToken) {
        return ResponseEntity.ok(collectionService.getCollectionByShareToken(shareToken));
    }

    @PostMapping("/public/{shareToken}/clone")
    public ResponseEntity<CollectionDTO> cloneCollection(
            @PathVariable("shareToken") String shareToken,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = currentUserId != null ? currentUserId : SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Vui lòng đăng nhập để lưu bản sao bộ sưu tập vào tài khoản của bạn");
        }
        return ResponseEntity.ok(collectionService.cloneCollection(shareToken, userId));
    }
}
