package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Collection;
import com.cntt.academicdocs.domain.CollectionItem;
import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.AddCollectionItemRequest;
import com.cntt.academicdocs.dto.CollectionDTO;
import com.cntt.academicdocs.dto.CollectionItemDTO;
import com.cntt.academicdocs.dto.CreateCollectionRequest;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.CollectionItemRepository;
import com.cntt.academicdocs.repository.CollectionRepository;
import com.cntt.academicdocs.repository.DocumentRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final CollectionItemRepository collectionItemRepository;
    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public CollectionService(
            CollectionRepository collectionRepository,
            CollectionItemRepository collectionItemRepository,
            DocumentRepository documentRepository,
            UserRepository userRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.collectionItemRepository = collectionItemRepository;
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CollectionDTO> getUserCollections(Long userId) {
        return collectionRepository.findByUser_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toSummaryDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CollectionDTO getCollectionDetail(Long id, Long currentUserId) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getIsPublic() && (currentUserId == null || !collection.getUser().getId().equals(currentUserId))) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "COLLECTION_PRIVATE", "Bộ sưu tập này đang ở chế độ riêng tư");
        }

        return toDetailDTO(collection);
    }

    @Transactional(readOnly = true)
    public CollectionDTO getCollectionByShareToken(String shareToken) {
        Collection collection = collectionRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Liên kết bộ sưu tập không hợp lệ"));
        return toDetailDTO(collection);
    }

    @Transactional
    public CollectionDTO createCollection(Long userId, CreateCollectionRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Collection collection = new Collection();
        collection.setUser(user);
        collection.setTitle(req.getTitle().trim());
        collection.setDescription(req.getDescription());
        collection.setIsPublic(req.getIsPublic() != null ? req.getIsPublic() : true);
        collection.setShareToken(UUID.randomUUID().toString().substring(0, 12));
        collection.setCreatedAt(LocalDateTime.now());
        collection.setUpdatedAt(LocalDateTime.now());

        Collection saved = collectionRepository.save(collection);
        return toDetailDTO(saved);
    }

    @Transactional
    public CollectionDTO addItemToCollection(Long collectionId, Long userId, AddCollectionItemRequest req) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền sửa bộ sưu tập này");
        }

        Document document = documentRepository.findById(req.getDocumentId())
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "DOCUMENT_NOT_FOUND", "Không tìm thấy tài liệu"));

        if (!collectionItemRepository.existsByCollection_IdAndDocument_Id(collectionId, req.getDocumentId())) {
            CollectionItem item = new CollectionItem();
            item.setCollection(collection);
            item.setDocument(document);
            item.setNote(req.getNote());
            item.setSortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0);
            item.setCreatedAt(LocalDateTime.now());
            collectionItemRepository.save(item);
        }

        collection.setUpdatedAt(LocalDateTime.now());
        return toDetailDTO(collection);
    }

    @Transactional
    public void removeItemFromCollection(Long collectionId, Long documentId, Long userId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền sửa bộ sưu tập này");
        }

        collectionItemRepository.deleteByCollection_IdAndDocument_Id(collectionId, documentId);
        collection.setUpdatedAt(LocalDateTime.now());
    }

    @Transactional
    public void deleteCollection(Long id, Long userId) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền xóa bộ sưu tập này");
        }

        collectionRepository.delete(collection);
    }

    private CollectionDTO toSummaryDTO(Collection c) {
        CollectionDTO dto = new CollectionDTO();
        dto.setId(c.getId());
        dto.setUserId(c.getUser().getId());
        dto.setUserFullName(c.getUser().getFullName());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setIsPublic(c.getIsPublic());
        dto.setShareToken(c.getShareToken());
        dto.setItemCount(c.getItems() != null ? c.getItems().size() : 0);
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        return dto;
    }

    private CollectionDTO toDetailDTO(Collection c) {
        CollectionDTO dto = toSummaryDTO(c);
        List<CollectionItem> items = collectionItemRepository.findByCollection_IdOrderBySortOrderAscCreatedAtAsc(c.getId());
        dto.setItemCount(items.size());
        dto.setItems(items.stream().map(this::toItemDTO).collect(Collectors.toList()));
        return dto;
    }

    private CollectionItemDTO toItemDTO(CollectionItem item) {
        CollectionItemDTO dto = new CollectionItemDTO();
        dto.setId(item.getId());
        dto.setCollectionId(item.getCollection().getId());
        dto.setDocumentId(item.getDocument().getId());
        dto.setDocumentTitle(item.getDocument().getTitle());
        dto.setDocumentTypeCode(item.getDocument().getDocumentTypeCode());
        dto.setDocumentTypeLabel(item.getDocument().getDocumentTypeCode());
        dto.setSubjectName(item.getDocument().getSubject() != null ? item.getDocument().getSubject().getName() : "");
        dto.setNote(item.getNote());
        dto.setSortOrder(item.getSortOrder());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }
}
