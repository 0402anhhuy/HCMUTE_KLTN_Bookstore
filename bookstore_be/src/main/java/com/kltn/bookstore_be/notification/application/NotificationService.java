package com.kltn.bookstore_be.notification.application;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;


import com.kltn.bookstore_be.notification.domain.Notification;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.notification.domain.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private com.kltn.bookstore_be.identity.domain.UserRepository userRepository;

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
            
            com.kltn.bookstore_be.notification.infrastructure.NotificationWebSocketHandler.broadcast(json);
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