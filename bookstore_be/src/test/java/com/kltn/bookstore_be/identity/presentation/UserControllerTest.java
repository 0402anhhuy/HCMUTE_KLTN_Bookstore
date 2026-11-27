package com.kltn.bookstore_be.identity.presentation;

import com.kltn.bookstore_be.identity.application.ChangePasswordRequest;
import com.kltn.bookstore_be.identity.application.UpdateProfileRequest;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.notification.domain.Notification;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private NotificationService notificationService;

    private User sampleUser() {
        return User.builder()
                .id(1L)
                .email("user@example.com")
                .fullName("Nguyen Van A")
                .phone("0901234567")
                .address("HCM")
                .role(User.Role.USER)
                .rewardPoints(100)
                .walletBalance(50000.0)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/users/profile chưa đăng nhập trả về 401")
    void getProfile_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET/PUT /profile và POST /change-password hoạt động đầy đủ nhánh")
    void profileAndPasswordEndpoints_handleSuccessAndErrors() throws Exception {
        User user = sampleUser();
        when(userService.getAuthenticatedUser()).thenReturn(user);

        mockMvc.perform(get("/api/v1/users/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"))
                .andExpect(jsonPath("$.rewardPoints").value(100));

        UpdateProfileRequest updateReq = new UpdateProfileRequest();
        updateReq.setFullName("Updated Name");
        updateReq.setPhone("0912345678");
        when(userService.updateProfile(eq(user), any(UpdateProfileRequest.class))).thenReturn(user);

        mockMvc.perform(put("/api/v1/users/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Nguyen Van A"));

        ChangePasswordRequest pwdReq = new ChangePasswordRequest();
        pwdReq.setOldPassword("old123456");
        pwdReq.setNewPassword("new123456");
        doNothing().when(userService).changePassword(eq(user), any(ChangePasswordRequest.class));

        mockMvc.perform(post("/api/v1/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pwdReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new RuntimeException("Mật khẩu cũ sai"))
                .when(userService).changePassword(eq(user), any(ChangePasswordRequest.class));
        mockMvc.perform(post("/api/v1/users/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pwdReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Mật khẩu cũ sai"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Các endpoint notifications, /total và /api/v1/users hoạt động và xử lý lỗi")
    void notificationsAndListingEndpoints_handleSuccessAndErrors() throws Exception {
        User user = sampleUser();
        Notification notif = Notification.builder()
                .id(11L)
                .title("Đơn hàng")
                .message("Đã xác nhận")
                .type(Notification.NotificationType.ORDER)
                .build();

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(notificationService.getNotificationsForUser(1L)).thenReturn(List.of(notif));
        mockMvc.perform(get("/api/v1/users/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(11));

        doNothing().when(notificationService).markAsRead(11L);
        mockMvc.perform(put("/api/v1/users/notifications/11/read"))
                .andExpect(status().isOk());

        doThrow(new RuntimeException("Không tìm thấy")).when(notificationService).markAsRead(99L);
        mockMvc.perform(put("/api/v1/users/notifications/99/read"))
                .andExpect(status().isBadRequest());

        doNothing().when(notificationService).markAllAsRead(1L);
        mockMvc.perform(put("/api/v1/users/notifications/read-all"))
                .andExpect(status().isOk());

        when(userService.getAllUsers()).thenReturn(List.of(user));
        mockMvc.perform(get("/api/v1/users/total"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value(1));

        mockMvc.perform(get("/api/v1/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].email").value("user@example.com"));

        when(userService.getAllUsers()).thenThrow(new RuntimeException("DB error"));
        mockMvc.perform(get("/api/v1/users")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/users/total")).andExpect(status().isBadRequest());
    }
}
