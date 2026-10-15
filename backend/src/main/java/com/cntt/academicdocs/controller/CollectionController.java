package com.cntt.academicdocs.controller;

import com.cntt.academicdocs.dto.AddCollectionItemRequest;
import com.cntt.academicdocs.dto.CollectionDTO;
import com.cntt.academicdocs.dto.CreateCollectionRequest;
import com.cntt.academicdocs.service.CollectionService;
import jakarta.validation.Valid;
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

    @GetMapping
    public ResponseEntity<List<CollectionDTO>> getMyCollections(@AuthenticationPrincipal Long currentUserId) {
        Long userId = currentUserId != null ? currentUserId : 1L;
        return ResponseEntity.ok(collectionService.getUserCollections(userId));
    }

    @PostMapping
    public ResponseEntity<CollectionDTO> createCollection(
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody CreateCollectionRequest req
    ) {
        Long userId = currentUserId != null ? currentUserId : 1L;
        return ResponseEntity.ok(collectionService.createCollection(userId, req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CollectionDTO> getCollectionDetail(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        return ResponseEntity.ok(collectionService.getCollectionDetail(id, currentUserId));
    }

    @PostMapping("/{id}/items")
    public ResponseEntity<CollectionDTO> addItem(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId,
            @Valid @RequestBody AddCollectionItemRequest req
    ) {
        Long userId = currentUserId != null ? currentUserId : 1L;
        return ResponseEntity.ok(collectionService.addItemToCollection(id, userId, req));
    }

    @DeleteMapping("/{id}/items/{documentId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable("id") Long id,
            @PathVariable("documentId") Long documentId,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = currentUserId != null ? currentUserId : 1L;
        collectionService.removeItemFromCollection(id, documentId, userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(
            @PathVariable("id") Long id,
            @AuthenticationPrincipal Long currentUserId
    ) {
        Long userId = currentUserId != null ? currentUserId : 1L;
        collectionService.deleteCollection(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/public/{shareToken}")
    public ResponseEntity<CollectionDTO> getPublicCollection(@PathVariable("shareToken") String shareToken) {
        return ResponseEntity.ok(collectionService.getCollectionByShareToken(shareToken));
    }
}
