package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Collection;
import com.cntt.academicdocs.domain.CollectionItem;
import com.cntt.academicdocs.domain.Document;
import com.cntt.academicdocs.domain.DocumentFile;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.AddCollectionItemRequest;
import com.cntt.academicdocs.dto.CollectionDTO;
import com.cntt.academicdocs.dto.CollectionItemDTO;
import com.cntt.academicdocs.dto.CreateCollectionRequest;
import com.cntt.academicdocs.dto.UpdateCollectionRequest;
import com.cntt.academicdocs.dto.UpdateCollectionItemRequest;
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

    @Transactional
    public CollectionDTO updateCollection(Long id, Long userId, UpdateCollectionRequest req) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền chỉnh sửa bộ sưu tập này");
        }

        collection.setTitle(req.getTitle().trim());
        collection.setDescription(req.getDescription());
        if (req.getIsPublic() != null) {
            collection.setIsPublic(req.getIsPublic());
        }
        collection.setUpdatedAt(LocalDateTime.now());
        return toDetailDTO(collection);
    }

    @Transactional
    public CollectionDTO regenerateShareToken(Long id, Long userId) {
        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền chỉnh sửa bộ sưu tập này");
        }

        collection.setShareToken(UUID.randomUUID().toString().substring(0, 12));
        collection.setUpdatedAt(LocalDateTime.now());
        return toDetailDTO(collection);
    }

    @Transactional
    public CollectionItemDTO updateCollectionItem(Long collectionId, Long documentId, Long userId, UpdateCollectionItemRequest req) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập"));

        if (!collection.getUser().getId().equals(userId)) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "NOT_COLLECTION_OWNER", "Bạn không có quyền chỉnh sửa bộ sưu tập này");
        }

        CollectionItem item = collectionItemRepository.findByCollection_IdAndDocument_Id(collectionId, documentId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "ITEM_NOT_FOUND", "Tài liệu không có trong bộ sưu tập"));

        if (req.getNote() != null) {
            item.setNote(req.getNote().trim());
        }
        if (req.getSortOrder() != null) {
            item.setSortOrder(req.getSortOrder());
        }
        collection.setUpdatedAt(LocalDateTime.now());
        return toItemDTO(item);
    }

    @Transactional
    public CollectionDTO cloneCollection(String shareToken, Long userId) {
        Collection source = collectionRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "COLLECTION_NOT_FOUND", "Không tìm thấy bộ sưu tập để sao chép"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        Collection target = new Collection();
        target.setUser(user);
        target.setTitle(source.getTitle() + " (Bản sao)");
        target.setDescription(source.getDescription() != null ? source.getDescription() : "Sao chép từ bộ sưu tập của " + source.getUser().getFullName());
        target.setIsPublic(true);
        target.setShareToken(UUID.randomUUID().toString().substring(0, 12));
        target.setCreatedAt(LocalDateTime.now());
        target.setUpdatedAt(LocalDateTime.now());
        Collection savedTarget = collectionRepository.save(target);

        List<CollectionItem> sourceItems = collectionItemRepository.findByCollection_IdOrderBySortOrderAscCreatedAtAsc(source.getId());
        for (CollectionItem si : sourceItems) {
            CollectionItem newItem = new CollectionItem();
            newItem.setCollection(savedTarget);
            newItem.setDocument(si.getDocument());
            newItem.setNote(si.getNote());
            newItem.setSortOrder(si.getSortOrder());
            newItem.setCreatedAt(LocalDateTime.now());
            collectionItemRepository.save(newItem);
        }

        return toDetailDTO(savedTarget);
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

        String typeCode = item.getDocument().getDocumentTypeCode();
        String label = switch (typeCode != null ? typeCode.toUpperCase() : "") {
            case "SLIDE", "LECTURE" -> "Slide Bài giảng";
            case "EXAM", "DE_THI" -> "Đề thi & Lời giải";
            case "LAB", "EXERCISE" -> "Hướng dẫn Lab & Thực hành";
            case "CAPSTONE", "PROJECT", "BTL", "DO_AN" -> "Đồ án / Bài tập lớn";
            case "THESIS" -> "Khóa luận tốt nghiệp";
            case "NOTE" -> "Ghi chú ôn tập";
            case "REFERENCE", "TAI_LIEU_THAM_KHAO", "GIAO_TRINH" -> "Tài liệu tham khảo";
            default -> typeCode != null ? typeCode : "Tài liệu học thuật";
        };
        dto.setDocumentTypeLabel(label);

        if (item.getDocument().getSubject() != null) {
            dto.setSubjectCode(item.getDocument().getSubject().getCode());
            dto.setSubjectName(item.getDocument().getSubject().getName());
        } else {
            dto.setSubjectCode("");
            dto.setSubjectName("");
        }

        dto.setAdvisorName(item.getDocument().getAdvisorName());
        if (item.getDocument().getAcademicYear() != null) {
            dto.setAcademicYearName(item.getDocument().getAcademicYear().getName());
        }
        dto.setAvgRating(item.getDocument().getAvgRating() != null ? item.getDocument().getAvgRating() : 0.0);
        dto.setViewCount(item.getDocument().getViewCount() != null ? item.getDocument().getViewCount() : 0);
        dto.setDownloadCount(item.getDocument().getDownloadCount() != null ? item.getDocument().getDownloadCount() : 0);

        if (item.getDocument().getFiles() != null && !item.getDocument().getFiles().isEmpty()) {
            DocumentFile primaryOrFirst = item.getDocument().getFiles().stream()
                    .filter(DocumentFile::getIsPrimary)
                    .findFirst()
                    .orElse(item.getDocument().getFiles().get(0));
            dto.setFileId(primaryOrFirst.getId());
            dto.setFileName(primaryOrFirst.getFileName());
        }

        dto.setNote(item.getNote());
        dto.setSortOrder(item.getSortOrder());
        dto.setCreatedAt(item.getCreatedAt());
        return dto;
    }
}
