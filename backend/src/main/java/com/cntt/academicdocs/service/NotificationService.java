package com.cntt.academicdocs.service;

import com.cntt.academicdocs.domain.Notification;
import com.cntt.academicdocs.domain.User;
import com.cntt.academicdocs.dto.NotificationDTO;
import com.cntt.academicdocs.dto.PageResponse;
import com.cntt.academicdocs.repository.NotificationRepository;
import com.cntt.academicdocs.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void notifyUser(Long userId, String type, String title, String body, String link) {
        if (userId == null) return;
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                Notification notification = new Notification(user, type, title, body, link);
                notificationRepository.save(notification);
            }
        } catch (Exception e) {
            log.warn("Failed to create notification for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationDTO> getUserNotifications(Long userId, Boolean unreadOnly, Pageable pageable) {
        Page<Notification> page;
        if (Boolean.TRUE.equals(unreadOnly)) {
            page = notificationRepository.findByUser_IdAndIsReadOrderByCreatedAtDesc(userId, false, pageable);
        } else {
            page = notificationRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        }

        List<NotificationDTO> dtos = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageResponse.of(page, dtos);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUser_IdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.markAsRead(notificationId, userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    private NotificationDTO toDTO(Notification n) {
        return new NotificationDTO(
                n.getId(),
                n.getType(),
                n.getTitle(),
                n.getBody(),
                n.getLink(),
                n.getIsRead(),
                n.getCreatedAt()
        );
    }
}
