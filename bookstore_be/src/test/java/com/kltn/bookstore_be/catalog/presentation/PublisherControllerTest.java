package com.kltn.bookstore_be.catalog.presentation;

import com.kltn.bookstore_be.catalog.application.PublisherResponse;
import com.kltn.bookstore_be.catalog.application.PublisherService;
import com.kltn.bookstore_be.catalog.domain.Publisher;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublisherController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class PublisherControllerTest {

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
    private PublisherService publisherService;

    @Test
    @DisplayName("GET /api/v1/publishers và /{id} trả về dữ liệu và xử lý 400/404")
    void publicPublisherEndpoints_handleSuccessAndErrors() throws Exception {
        PublisherResponse resp = new PublisherResponse(1L, "NXB Kim Đồng", "KimDong", "kim-dong", null, null, null, true);
        when(publisherService.getPublishers()).thenReturn(List.of(resp));
        when(publisherService.getPublisherById(1L)).thenReturn(resp);
        when(publisherService.getPublisherById(99L)).thenThrow(new RuntimeException("Không tìm thấy"));

        mockMvc.perform(get("/api/v1/publishers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("NXB Kim Đồng"));
        mockMvc.perform(get("/api/v1/publishers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shortName").value("KimDong"));
        mockMvc.perform(get("/api/v1/publishers/99"))
                .andExpect(status().isNotFound());

        when(publisherService.getPublishers()).thenThrow(new RuntimeException("DB fail"));
        mockMvc.perform(get("/api/v1/publishers")).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST/PUT/DELETE /api/v1/publishers với role USER bị @PreAuthorize từ chối")
    void mutatePublisher_userRole_returnsAccessDenied() throws Exception {
        mockMvc.perform(post("/api/v1/publishers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(put("/api/v1/publishers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(delete("/api/v1/publishers/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("POST/PUT/DELETE /api/v1/publishers với role MANAGER thành công và xử lý lỗi")
    void mutatePublisher_managerRole_handlesCrudAndErrors() throws Exception {
        Publisher pub = Publisher.builder().id(1L).name("NXB Trẻ").active(true).build();
        PublisherResponse resp = new PublisherResponse(1L, "NXB Trẻ", "Tre", "nxb-tre", null, null, null, true);

        when(publisherService.createPublisher(any(Publisher.class))).thenReturn(resp);
        mockMvc.perform(post("/api/v1/publishers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pub)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("NXB Trẻ"));

        when(publisherService.updatePublisher(eq(1L), any(Publisher.class))).thenReturn(resp);
        mockMvc.perform(put("/api/v1/publishers/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pub)))
                .andExpect(status().isOk());

        doNothing().when(publisherService).deactivatePublisher(1L);
        mockMvc.perform(delete("/api/v1/publishers/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        when(publisherService.createPublisher(any(Publisher.class))).thenThrow(new RuntimeException("Trùng tên"));
        mockMvc.perform(post("/api/v1/publishers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pub)))
                .andExpect(status().isBadRequest());

        when(publisherService.updatePublisher(eq(99L), any(Publisher.class)))
                .thenThrow(new RuntimeException("Không tìm thấy"));
        mockMvc.perform(put("/api/v1/publishers/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(pub)))
                .andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Không tìm thấy")).when(publisherService).deactivatePublisher(99L);
        mockMvc.perform(delete("/api/v1/publishers/99"))
                .andExpect(status().isBadRequest());
    }
}
