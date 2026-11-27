package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.application.PromotionService;
import com.kltn.bookstore_be.ordering.domain.Promotion;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PromotionController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class PromotionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PromotionService promotionService;

    @Test
    @DisplayName("GET /api/v1/promotions/active trả về danh sách khuyến mãi đang hoạt động")
    void getActivePromotions_returnsOk() throws Exception {
        Promotion p = Promotion.builder()
                .id(1L)
                .title("Weekend Sale")
                .discountType(Promotion.DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .status(Promotion.PromotionStatus.ACTIVE)
                .build();
        when(promotionService.getActivePromotions()).thenReturn(List.of(p));

        mockMvc.perform(get("/api/v1/promotions/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Weekend Sale"));
    }
}
