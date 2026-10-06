package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.dto.UpdateUserRequest;
import com.cntt.academicdocs.dto.UserDTO;
import com.cntt.academicdocs.exception.AppException;
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

    public UserService(UserRepository userRepository, MajorRepository majorRepository) {
        this.userRepository = userRepository;
        this.majorRepository = majorRepository;
    }

    @Transactional
    public UserDTO updateProfile(Long userId, UpdateUserRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

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
        return UserDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<UserDTO> getAllUsers(String role, Boolean isActive, String keyword, Pageable pageable) {
        Page<User> page;
        if (keyword != null && !keyword.trim().isEmpty()) {
            page = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    keyword.trim(), keyword.trim(), pageable
            );
        } else {
            page = userRepository.findAll(pageable);
        }

        List<UserDTO> dtoList = page.getContent().stream()
                .filter(u -> role == null || role.isBlank() || "ALL".equalsIgnoreCase(role) || u.getRole().name().equalsIgnoreCase(role))
                .filter(u -> isActive == null || u.isActive() == isActive)
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());

        return PageResponse.of(page, dtoList);
    }

    @Transactional
    public UserDTO toggleUserActive(Long userId, Boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));

        user.setActive(isActive != null ? isActive : !user.isActive());
        User saved = userRepository.save(user);
        return UserDTO.fromEntity(saved);
    }
}
