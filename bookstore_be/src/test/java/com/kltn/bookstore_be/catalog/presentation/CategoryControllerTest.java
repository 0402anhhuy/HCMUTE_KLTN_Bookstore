package com.kltn.bookstore_be.catalog.presentation;

import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.catalog.domain.Category;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/v1/categories, /roots, /children trả về danh sách và 400 khi lỗi")
    void publicCategoryEndpoints_handleSuccessAndFailure() throws Exception {
        Category cat = Category.builder().id(1L).name("Kỹ năng").build();
        when(productService.getAllCategories()).thenReturn(List.of(cat));
        when(productService.getRootCategories()).thenReturn(List.of(cat));
        when(productService.getChildCategories(1L)).thenReturn(List.of(cat));

        mockMvc.perform(get("/api/v1/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Kỹ năng"));
        mockMvc.perform(get("/api/v1/categories/roots"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
        mockMvc.perform(get("/api/v1/categories/children").param("parentId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        when(productService.getAllCategories()).thenThrow(new RuntimeException("DB error"));
        when(productService.getRootCategories()).thenThrow(new RuntimeException("DB error"));
        when(productService.getChildCategories(99L)).thenThrow(new RuntimeException("DB error"));
        mockMvc.perform(get("/api/v1/categories")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/categories/roots")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/v1/categories/children").param("parentId", "99")).andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/categories với role USER bị @PreAuthorize từ chối (GlobalExceptionHandler trả 400)")
    void createCategory_userRole_returnsAccessDenied() throws Exception {
        mockMvc.perform(post("/api/v1/categories").param("name", "Văn học"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("POST /api/v1/categories với role ADMIN tạo thành công và xử lý lỗi")
    void createCategory_adminRole_handlesSuccessAndFailure() throws Exception {
        Category created = Category.builder().id(2L).name("Văn học").build();
        when(productService.createCategory("Văn học", null)).thenReturn(created);

        mockMvc.perform(post("/api/v1/categories").param("name", "Văn học"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Văn học"));

        when(productService.createCategory("Trùng", null))
                .thenThrow(new RuntimeException("Danh mục đã tồn tại"));
        mockMvc.perform(post("/api/v1/categories").param("name", "Trùng"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Danh mục đã tồn tại"));
    }
}
