package com.kltn.bookstore_be.notification.application;

import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.notification.domain.Notification;
import com.kltn.bookstore_be.notification.domain.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @InjectMocks
    private NotificationService notificationService;

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    private User sampleUser;
    private Notification sampleNotification;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("user@example.com")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        sampleNotification = Notification.builder()
                .id(1L)
                .user(sampleUser)
                .title("Test Notification")
                .message("This is a test")
                .type(Notification.NotificationType.SYSTEM)
                .referenceType("test")
                .referenceId(1L)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("Tạo thông báo")
    class CreateNotificationTests {

        @Test
        @DisplayName("Tạo thông báo thành công")
        void createNotification_success() {
            when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
                Notification n = invocation.getArgument(0);
                n.setId(1L);
                n.setCreatedAt(LocalDateTime.now());
                return n;
            });

            notificationService.createNotification(
                    sampleUser,
                    "Đơn hàng mới",
                    "Bạn có đơn hàng mới #1",
                    Notification.NotificationType.ORDER,
                    "orders",
                    1L
            );

            ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
            verify(notificationRepository).save(captor.capture());
            Notification saved = captor.getValue();

            assertEquals(sampleUser, saved.getUser());
            assertEquals("Đơn hàng mới", saved.getTitle());
            assertEquals(Notification.NotificationType.ORDER, saved.getType());
            assertFalse(saved.isRead());
        }
    }

    @Nested
    @DisplayName("Gửi thông báo cho Manager/Admin")
    class NotifyManagersTests {

        @Test
        @DisplayName("Gửi thông báo cho tất cả Manager và Admin")
        void notifyManagersAndAdmins_sendsToAll() {
            User manager = User.builder()
                    .id(10L)
                    .fullName("Manager")
                    .role(User.Role.MANAGER)
                    .build();
            User admin = User.builder()
                    .id(11L)
                    .fullName("Admin")
                    .role(User.Role.ADMIN)
                    .build();

            when(userRepository.findByRoleIn(List.of(User.Role.MANAGER, User.Role.ADMIN)))
                    .thenReturn(List.of(manager, admin));
            when(notificationRepository.save(any(Notification.class))).thenAnswer(invocation -> {
                Notification n = invocation.getArgument(0);
                n.setId(100L);
                n.setCreatedAt(LocalDateTime.now());
                return n;
            });

            notificationService.notifyManagersAndAdmins(
                    "Đơn hàng mới",
                    "Có đơn hàng mới cần xử lý",
                    Notification.NotificationType.ORDER,
                    "orders",
                    1L
            );

            verify(notificationRepository, times(2)).save(any(Notification.class));
        }
    }

    @Nested
    @DisplayName("Lấy thông báo của user")
    class GetNotificationsTests {

        @Test
        @DisplayName("Lấy tất cả thông báo của user")
        void getNotificationsForUser_returnsList() {
            when(notificationRepository.findByUserIdOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(sampleNotification));

            List<Notification> result = notificationService.getNotificationsForUser(1L);

            assertEquals(1, result.size());
            assertEquals("Test Notification", result.get(0).getTitle());
        }

        @Test
        @DisplayName("Lấy thông báo chưa đọc")
        void getUnreadNotifications_returnsUnreadOnly() {
            when(notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(sampleNotification));

            List<Notification> result = notificationService.getUnreadNotificationsForUser(1L);

            assertEquals(1, result.size());
            assertFalse(result.get(0).isRead());
        }
    }

    @Nested
    @DisplayName("Đánh dấu đã đọc")
    class MarkAsReadTests {

        @Test
        @DisplayName("Đánh dấu 1 thông báo đã đọc")
        void markAsRead_existingNotification_setsReadTrue() {
            when(notificationRepository.findById(1L)).thenReturn(Optional.of(sampleNotification));
            when(notificationRepository.save(any(Notification.class))).thenReturn(sampleNotification);

            notificationService.markAsRead(1L);

            assertTrue(sampleNotification.isRead());
            verify(notificationRepository).save(sampleNotification);
        }

        @Test
        @DisplayName("Đánh dấu thông báo không tồn tại - không lỗi")
        void markAsRead_nonExisting_doesNothing() {
            when(notificationRepository.findById(999L)).thenReturn(Optional.empty());

            notificationService.markAsRead(999L);

            verify(notificationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Đánh dấu tất cả thông báo đã đọc")
        void markAllAsRead_setsAllReadTrue() {
            Notification unread1 = Notification.builder().id(1L).read(false).build();
            Notification unread2 = Notification.builder().id(2L).read(false).build();

            when(notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(1L))
                    .thenReturn(List.of(unread1, unread2));
            when(notificationRepository.saveAll(anyList())).thenReturn(List.of(unread1, unread2));

            notificationService.markAllAsRead(1L);

            assertTrue(unread1.isRead());
            assertTrue(unread2.isRead());
            verify(notificationRepository).saveAll(anyList());
        }
    }
}
