package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.dto.UpdateUserRequest;
import com.cntt.academicdocs.dto.UserDTO;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.MajorRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final MajorRepository majorRepository;
    private final com.cntt.academicdocs.repository.DocumentRepository documentRepository;
    private final com.cntt.academicdocs.repository.BookmarkRepository bookmarkRepository;

    public UserService(
            UserRepository userRepository,
            MajorRepository majorRepository,
            com.cntt.academicdocs.repository.DocumentRepository documentRepository,
            com.cntt.academicdocs.repository.BookmarkRepository bookmarkRepository
    ) {
        this.userRepository = userRepository;
        this.majorRepository = majorRepository;
        this.documentRepository = documentRepository;
        this.bookmarkRepository = bookmarkRepository;
    }

    @Transactional(readOnly = true)
    public com.cntt.academicdocs.dto.UserStatsDTO getUserStats(Long userId) {
        long approved = documentRepository.countByUploader_IdAndStatus(userId, com.cntt.academicdocs.domain.DocumentStatus.APPROVED);
        long pending = documentRepository.countByUploader_IdAndStatus(userId, com.cntt.academicdocs.domain.DocumentStatus.PENDING);
        long views = documentRepository.sumViewsByUploaderId(userId);
        long downloads = documentRepository.sumDownloadsByUploaderId(userId);
        double rating = documentRepository.avgRatingByUploaderId(userId);
        double roundRating = Math.round(rating * 10.0) / 10.0;
        long bookmarks = bookmarkRepository.countByUser_Id(userId);

        List<String> topSubs = documentRepository.findTopSubjectByUploaderId(userId);
        String topSubject = (topSubs != null && !topSubs.isEmpty()) ? topSubs.get(0) : "Chưa có";

        // Calculate badges & rank
        List<String> badges = new java.util.ArrayList<>();
        if (approved >= 5) badges.add("Học giả Tích cực Khoa CNTT");
        if (approved >= 1) badges.add("Người đóng góp Tri thức");
        if (downloads >= 100) badges.add("Tác giả Học liệu Phổ biến");
        if (views >= 500) badges.add("Top Lượt xem Tài liệu");
        if (roundRating >= 4.5 && approved >= 2) badges.add("Chất lượng 5 Sao");
        if (badges.isEmpty()) badges.add("Thành viên Mới Khoa CNTT");

        String rank = approved >= 5 ? "Top 5% Tác giả Đóng góp Xuất sắc"
                    : approved >= 2 ? "Top 15% Đóng góp Tích cực"
                    : approved >= 1 ? "Top 30% Đóng góp Khoa CNTT"
                    : "Đang tích lũy đóng góp";

        return new com.cntt.academicdocs.dto.UserStatsDTO(
                approved, pending, views, downloads, roundRating, bookmarks, topSubject, rank, badges
        );
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));
        return toDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        if (req.getFullName() != null && !req.getFullName().isBlank()) {
            user.setFullName(req.getFullName().trim());
        }

        if (req.getMajorId() != null) {
            Major major = majorRepository.findById(req.getMajorId()).orElse(null);
            user.setMajor(major);
        }

        if (req.getAvatarUrl() != null) {
            user.setAvatarUrl(req.getAvatarUrl());
        }

        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDTO> getAllUsers(String role, Boolean isActive, String keyword, Pageable pageable) {
        Page<User> page;
        if (keyword != null && !keyword.trim().isEmpty()) {
            page = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(keyword.trim(), keyword.trim(), pageable);
        } else {
            page = userRepository.findAll(pageable);
        }

        List<UserDTO> dtoList = page.getContent().stream()
                .filter(u -> role == null || role.isBlank() || "ALL".equalsIgnoreCase(role) || u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> isActive == null || u.isActive() == isActive)
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.of(page, dtoList);
    }

    @Transactional
    public UserDTO toggleUserActive(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        user.setActive(isActive != null ? isActive : !user.isActive());
        User saved = userRepository.save(user);
        return toDTO(saved);
    }

    public UserDTO toDTO(User user) {
        return UserDTO.fromEntity(user);
    }
}
