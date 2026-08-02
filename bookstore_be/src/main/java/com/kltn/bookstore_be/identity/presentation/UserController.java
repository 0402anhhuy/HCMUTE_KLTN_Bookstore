package com.kltn.bookstore_be.identity.presentation;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kltn.bookstore_be.identity.application.ChangePasswordRequest;
import com.kltn.bookstore_be.identity.application.UpdateProfileRequest;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.notification.domain.Notification;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final NotificationService notificationService;


    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            User user = userService.getAuthenticatedUser();
            return ResponseEntity.ok(Map.of(
                    "email", user.getEmail(),
                    "fullName", user.getFullName(),
                    "phone", user.getPhone() != null ? user.getPhone() : "",
                    "address", user.getAddress() != null ? user.getAddress() : "",
                    "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                    "role", user.getRole().name(),
                    "rewardPoints", user.getRewardPoints() != null ? user.getRewardPoints() : 0,
                    "walletBalance", user.getWalletBalance() != null ? user.getWalletBalance() : 0.0
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        try {
            User user = userService.getAuthenticatedUser();
            User updated = userService.updateProfile(user, request);
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("message", "Cập nhật hồ sơ cá nhân thành công");
            response.put("fullName", updated.getFullName());
            response.put("phone", updated.getPhone() != null ? updated.getPhone() : "");
            response.put("address", updated.getAddress() != null ? updated.getAddress() : "");
            response.put("avatarUrl", updated.getAvatarUrl() != null ? updated.getAvatarUrl() : "");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        try {
            User user = userService.getAuthenticatedUser();
            userService.changePassword(user, request);
            return ResponseEntity.ok(Map.of("message", "Thay đổi mật khẩu thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications() {
        try {
            User user = userService.getAuthenticatedUser();
            List<Notification> list = notificationService.getNotificationsForUser(user.getId());
            // Map to avoid lazy initialization issues with User object inside Notification if any
            // We can return a simplified projection or list directly
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> readNotification(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(Map.of("message", "Đã đọc thông báo"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/notifications/read-all")
    public ResponseEntity<?> readAllNotifications() {
        try {
            User user = userService.getAuthenticatedUser();
            notificationService.markAllAsRead(user.getId());
            return ResponseEntity.ok(Map.of("message", "Đã đọc tất cả thông báo"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/total")
    public ResponseEntity<?> countUsers() {
        try {
            long count = userService.getAllUsers().size();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
