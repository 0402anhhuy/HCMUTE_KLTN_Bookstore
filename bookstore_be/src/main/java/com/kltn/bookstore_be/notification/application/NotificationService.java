package com.kltn.bookstore_be.notification.application;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.notification.domain.Notification;
import com.kltn.bookstore_be.notification.domain.NotificationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void notifyManagersAndAdmins(String title, String message,
            Notification.NotificationType type,
            String referenceType, Long referenceId) {
        List<User> staff = userRepository.findByRoleIn(List.of(User.Role.MANAGER, User.Role.ADMIN));
        for (User user : staff) {
            createNotification(user, title, message, type, referenceType, referenceId);
        }
    }

    @Transactional
    public void createNotification(User user, String title, String message,
            Notification.NotificationType type,
            String referenceType, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .read(false)
                .build();
        Notification savedNotification = notificationRepository.save(notification);

        try {
            String cleanTitle = savedNotification.getTitle().replace("\"", "\\\"");
            String cleanMessage = savedNotification.getMessage().replace("\"", "\\\"");
            String cleanRefType = savedNotification.getReferenceType() != null ? savedNotification.getReferenceType() : "";
            String dateStr = java.time.format.DateTimeFormatter.ISO_DATE_TIME.format(
                    savedNotification.getCreatedAt() != null ? savedNotification.getCreatedAt() : java.time.LocalDateTime.now()
            );

            String json = String.format(
                    "{\"id\":%d,\"userId\":%s,\"title\":\"%s\",\"message\":\"%s\",\"type\":\"%s\",\"referenceType\":\"%s\",\"referenceId\":%s,\"read\":%b,\"createdAt\":\"%s\"}",
                    savedNotification.getId(),
                    user != null ? user.getId().toString() : "null",
                    cleanTitle,
                    cleanMessage,
                    savedNotification.getType().name(),
                    cleanRefType,
                    savedNotification.getReferenceId() != null ? savedNotification.getReferenceId().toString() : "null",
                    savedNotification.isRead(),
                    dateStr
            );

            if (org.springframework.transaction.support.TransactionSynchronizationManager.isActualTransactionActive()) {
                org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                        new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        com.kltn.bookstore_be.notification.infrastructure.NotificationWebSocketHandler.broadcast(json);
                    }
                }
                );
            } else {
                com.kltn.bookstore_be.notification.infrastructure.NotificationWebSocketHandler.broadcast(json);
            }
        } catch (Exception e) {
            System.err.println("Failed to broadcast notification: " + e.getMessage());
        }
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }
}
