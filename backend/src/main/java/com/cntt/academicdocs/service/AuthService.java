package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Major;
import com.cntt.academicdocs.domain.RefreshToken;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.domain.UserRole;
import com.cntt.academicdocs.dto.*;
import com.cntt.academicdocs.exception.BusinessException;
import com.cntt.academicdocs.repository.MajorRepository;
import com.cntt.academicdocs.repository.RefreshTokenRepository;
import com.cntt.academicdocs.repository.UserRepository;
import com.cntt.academicdocs.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MajorRepository majorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            MajorRepository majorRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.majorRepository = majorRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BusinessException(HttpStatus.CONFLICT, "EMAIL_ALREADY_EXISTS", "Email này đã được sử dụng");
        }

        if (StringUtils.hasText(request.getStudentCode())
                && userRepository.existsByStudentCode(request.getStudentCode().trim())) {
            throw new BusinessException(HttpStatus.CONFLICT, "STUDENT_CODE_EXISTS", "Mã sinh viên này đã tồn tại trong hệ thống");
        }

        User user = new User();
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        if (StringUtils.hasText(request.getStudentCode())) {
            user.setStudentCode(request.getStudentCode().trim());
        }
        user.setRole(UserRole.STUDENT);
        user.setActive(true);

        if (request.getMajorId() != null) {
            Major major = majorRepository.findById(request.getMajorId()).orElse(null);
            user.setMajor(major);
        }

        user = userRepository.save(user);

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không chính xác");
        }

        if (!user.isActive()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "USER_INACTIVE", "Tài khoản của bạn đã bị khóa");
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Phiên đăng nhập không hợp lệ hoặc đã hết hạn"));

        if (refreshToken.isRevoked() || refreshToken.isExpired()) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = refreshToken.getUser();
        if (!user.isActive()) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "USER_INACTIVE", "Tài khoản của bạn đã bị khóa");
        }

        String newAccessToken = jwtUtil.generateAccessToken(user);
        long expiresInSeconds = jwtUtil.getExpirationMs() / 1000;

        return new AuthResponse(
                newAccessToken,
                refreshToken.getToken(),
                expiresInSeconds,
                UserDTO.fromEntity(user)
        );
    }

    @Transactional
    public void logout(String refreshToken, Long currentUserId) {
        if (StringUtils.hasText(refreshToken)) {
            refreshTokenRepository.revokeToken(refreshToken);
        } else if (currentUserId != null) {
            userRepository.findById(currentUserId).ifPresent(refreshTokenRepository::deleteAllByUser);
        }
    }

    @Transactional(readOnly = true)
    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "Không tìm thấy người dùng"));
        return UserDTO.fromEntity(user);
    }

    private AuthResponse createAuthResponse(User user) {
        String accessToken = jwtUtil.generateAccessToken(user);
        String rawRefreshToken = UUID.randomUUID().toString();

        LocalDateTime expiresAt = LocalDateTime.now().plusDays(7);
        RefreshToken refreshToken = new RefreshToken(rawRefreshToken, user, expiresAt);
        refreshTokenRepository.save(refreshToken);

        long expiresInSeconds = jwtUtil.getExpirationMs() / 1000;
        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                expiresInSeconds,
                UserDTO.fromEntity(user)
        );
    }
}
