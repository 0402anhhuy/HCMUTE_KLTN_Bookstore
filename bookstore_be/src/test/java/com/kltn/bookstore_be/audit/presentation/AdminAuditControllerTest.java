package com.kltn.bookstore_be.audit.presentation;

import com.kltn.bookstore_be.audit.application.AuditLogResponse;
import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminAuditController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class AdminAuditControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private AuditLogService auditLogService;

    @Test
    @DisplayName("GET /api/v1/admin/audit-logs chưa đăng nhập trả về 401")
    void getAllAuditLogs_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/admin/audit-logs với role USER trả về 403")
    void getAllAuditLogs_userRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("GET /api/v1/admin/audit-logs với role ADMIN trả về danh sách hoặc 400 khi lỗi")
    void getAllAuditLogs_adminRole_handlesSuccessAndFailure() throws Exception {
        AuditLogResponse log = AuditLogResponse.builder().id(1L).action("CREATE_PRODUCT").description("Created book").build();
        when(auditLogService.getAllLogs()).thenReturn(List.of(log));

        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("CREATE_PRODUCT"));

        when(auditLogService.getAllLogs()).thenThrow(new RuntimeException("DB error"));
        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("DB error"));
    }
}
