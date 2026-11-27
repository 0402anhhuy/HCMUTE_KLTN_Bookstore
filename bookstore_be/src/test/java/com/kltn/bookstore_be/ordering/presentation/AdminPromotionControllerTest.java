package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.application.AdminCreatePromotionRequest;
import com.kltn.bookstore_be.ordering.application.PromotionReportResponse;
import com.kltn.bookstore_be.ordering.application.PromotionService;
import com.kltn.bookstore_be.ordering.domain.Promotion;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

@WebMvcTest(AdminPromotionController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class AdminPromotionControllerTest {

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
    private PromotionService promotionService;

    private AdminCreatePromotionRequest validRequest() {
        AdminCreatePromotionRequest req = new AdminCreatePromotionRequest();
        req.setTitle("Flash Sale");
        req.setDiscountType(Promotion.DiscountType.PERCENT);
        req.setDiscountValue(BigDecimal.valueOf(20));
        req.setStartDate(LocalDateTime.of(2026, 11, 1, 0, 0));
        req.setEndDate(LocalDateTime.of(2026, 12, 1, 0, 0));
        req.setProductIds(List.of(1L, 2L));
        return req;
    }

    private Promotion samplePromotion() {
        return Promotion.builder()
                .id(1L)
                .title("Flash Sale")
                .discountType(Promotion.DiscountType.PERCENT)
                .discountValue(BigDecimal.valueOf(20))
                .status(Promotion.PromotionStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("GET /api/v1/admin/promotions chưa đăng nhập trả về 401")
    void getAllPromotions_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/promotions"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/admin/promotions với role USER trả về 403")
    void getAllPromotions_userRole_returnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/promotions"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("CRUD & report khuyến mãi với role MANAGER xử lý thành công và lỗi")
    void promotionCrudAndReport_withManagerRole_handlesAllBranches() throws Exception {
        Promotion promo = samplePromotion();
        AdminCreatePromotionRequest req = validRequest();

        when(promotionService.getAllPromotions()).thenReturn(List.of(promo));
        mockMvc.perform(get("/api/v1/admin/promotions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Flash Sale"));

        when(promotionService.createPromotion(any(AdminCreatePromotionRequest.class))).thenReturn(promo);
        mockMvc.perform(post("/api/v1/admin/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promotion.id").value(1));

        mockMvc.perform(post("/api/v1/admin/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        when(promotionService.createPromotion(any(AdminCreatePromotionRequest.class)))
                .thenThrow(new RuntimeException("Trùng thời gian"));
        mockMvc.perform(post("/api/v1/admin/promotions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Trùng thời gian"));

        when(promotionService.updatePromotion(eq(1L), any(AdminCreatePromotionRequest.class))).thenReturn(promo);
        mockMvc.perform(put("/api/v1/admin/promotions/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.promotion.title").value("Flash Sale"));

        when(promotionService.updatePromotion(eq(99L), any(AdminCreatePromotionRequest.class)))
                .thenThrow(new RuntimeException("Không tìm thấy"));
        mockMvc.perform(put("/api/v1/admin/promotions/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        doNothing().when(promotionService).deletePromotion(1L);
        mockMvc.perform(delete("/api/v1/admin/promotions/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new RuntimeException("Không thể xóa")).when(promotionService).deletePromotion(99L);
        mockMvc.perform(delete("/api/v1/admin/promotions/99"))
                .andExpect(status().isBadRequest());

        PromotionReportResponse report = PromotionReportResponse.builder()
                .promotion(promo)
                .totalUses(12L)
                .totalRevenue(BigDecimal.valueOf(500000))
                .build();
        when(promotionService.getPromotionReport(1L)).thenReturn(report);
        mockMvc.perform(get("/api/v1/admin/promotions/1/report"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(500000));

        when(promotionService.getPromotionReport(99L)).thenThrow(new RuntimeException("Không tồn tại"));
        mockMvc.perform(get("/api/v1/admin/promotions/99/report"))
                .andExpect(status().isBadRequest());
    }
}
