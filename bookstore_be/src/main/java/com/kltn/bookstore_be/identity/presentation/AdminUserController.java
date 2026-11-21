package com.kltn.bookstore_be.identity.presentation;

import com.kltn.bookstore_be.identity.application.AdminCreateUserRequest;
import com.kltn.bookstore_be.identity.application.UpdateUserRequest;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    @PostMapping("")
    public ResponseEntity<?> createUser(
            @Valid @RequestBody AdminCreateUserRequest request
    ) {
        try {
            User newUser = userService.createUserByAdmin(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Thêm người dùng mới thành công",
                    "user", newUser
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest request
    ) {
        try {
            User updatedUser = userService.updateUserByAdmin(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật thông tin người dùng thành công",
                    "user", updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam User.UserStatus status
    ) {
        try {
            userService.updateUserStatusByAdmin(id, status);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUserByAdmin(id);
            return ResponseEntity.ok(Map.of("message", "Thêm thao tác xóa người dùng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
