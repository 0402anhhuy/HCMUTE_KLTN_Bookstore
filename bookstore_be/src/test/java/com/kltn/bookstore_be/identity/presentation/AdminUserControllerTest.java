package com.kltn.bookstore_be.identity.presentation;

import com.kltn.bookstore_be.identity.application.AdminCreateUserRequest;
import com.kltn.bookstore_be.identity.application.UpdateUserRequest;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminUserController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class AdminUserControllerTest {

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

    private AdminCreateUserRequest validCreateReq() {
        AdminCreateUserRequest req = new AdminCreateUserRequest();
        req.setFullName("Tran Van B");
        req.setEmail("newuser@example.com");
        req.setPhone("0901234567");
        req.setPassword("secret123");
        req.setRole(User.Role.USER);
        return req;
    }

    private UpdateUserRequest validUpdateReq() {
        UpdateUserRequest req = new UpdateUserRequest();
        req.setFullName("Tran Van B Updated");
        req.setEmail("newuser@example.com");
        req.setPhone("0901234567");
        req.setRole(User.Role.MANAGER);
        req.setStatus(User.UserStatus.ACTIVE);
        return req;
    }

    @Test
    @DisplayName("POST /api/v1/admin/users chưa đăng nhập trả về 401")
    void createUser_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateReq())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Các endpoint AdminUserController từ chối USER ở tầng SecurityConfig với 403")
    void adminUserEndpoints_userRole_returnsForbidden() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateReq())))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/admin/users/5"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("Các endpoint AdminUserController từ chối MANAGER qua @PreAuthorize")
    void adminUserEndpoints_managerRole_returnsAccessDenied() throws Exception {
        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateReq())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(delete("/api/v1/admin/users/5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("CRUD người dùng và đổi trạng thái với role ADMIN thành công và xử lý lỗi")
    void adminUserCrud_withAdminRole_handlesSuccessAndErrors() throws Exception {
        User created = User.builder().id(5L).email("newuser@example.com").role(User.Role.USER).build();
        when(userService.createUserByAdmin(any(AdminCreateUserRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateReq())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.user.id").value(5));

        when(userService.createUserByAdmin(any(AdminCreateUserRequest.class)))
                .thenThrow(new RuntimeException("Email đã tồn tại"));
        mockMvc.perform(post("/api/v1/admin/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validCreateReq())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email đã tồn tại"));

        when(userService.updateUserByAdmin(eq(5L), any(UpdateUserRequest.class))).thenReturn(created);
        mockMvc.perform(put("/api/v1/admin/users/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateReq())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        when(userService.updateUserByAdmin(eq(99L), any(UpdateUserRequest.class)))
                .thenThrow(new RuntimeException("Không tìm thấy user"));
        mockMvc.perform(put("/api/v1/admin/users/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validUpdateReq())))
                .andExpect(status().isBadRequest());

        when(userService.updateUserStatusByAdmin(5L, User.UserStatus.LOCKED)).thenReturn(created);
        mockMvc.perform(put("/api/v1/admin/users/5/status").param("status", "LOCKED"))
                .andExpect(status().isOk());

        when(userService.updateUserStatusByAdmin(99L, User.UserStatus.LOCKED))
                .thenThrow(new RuntimeException("Không tìm thấy user"));
        mockMvc.perform(put("/api/v1/admin/users/99/status").param("status", "LOCKED"))
                .andExpect(status().isBadRequest());

        doNothing().when(userService).deleteUserByAdmin(5L);
        mockMvc.perform(delete("/api/v1/admin/users/5"))
                .andExpect(status().isOk());

        doThrow(new RuntimeException("Không thể xóa"))
                .when(userService).deleteUserByAdmin(99L);
        mockMvc.perform(delete("/api/v1/admin/users/99"))
                .andExpect(status().isBadRequest());
    }
}
