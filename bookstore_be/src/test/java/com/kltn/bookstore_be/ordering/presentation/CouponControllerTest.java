package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.application.CouponRequest;
import com.kltn.bookstore_be.ordering.application.CouponService;
import com.kltn.bookstore_be.ordering.domain.Coupon;
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

@WebMvcTest(CouponController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class CouponControllerTest {

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
    private CouponService couponService;

    @MockitoBean
    private UserService userService;

    private User buildUser(Long id, User.Role role) {
        return User.builder().id(id).email("u" + id + "@example.com").role(role).build();
    }

    private Coupon sampleCoupon() {
        return Coupon.builder()
                .id(1L)
                .code("SAVE10")
                .discountValue(BigDecimal.TEN)
                .build();
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/coupons trả danh sách theo vai trò ADMIN/MANAGER vs USER")
    void getCoupons_routesByRoleAndHandlesError() throws Exception {
        User regular = buildUser(1L, User.Role.USER);
        User admin = buildUser(2L, User.Role.ADMIN);
        Coupon coupon = sampleCoupon();

        when(userService.getAuthenticatedUser()).thenReturn(regular);
        when(couponService.getCouponsForUser(1L)).thenReturn(List.of(coupon));
        mockMvc.perform(get("/api/v1/coupons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("SAVE10"));

        when(userService.getAuthenticatedUser()).thenReturn(admin);
        when(couponService.getAllCoupons()).thenReturn(List.of(coupon));
        mockMvc.perform(get("/api/v1/coupons"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("SAVE10"));

        when(userService.getAuthenticatedUser()).thenThrow(new RuntimeException("Chưa đăng nhập"));
        mockMvc.perform(get("/api/v1/coupons"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Chưa đăng nhập"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("POST/PUT/DELETE /api/v1/coupons chặn USER (403), cho phép MANAGER/ADMIN và xử lý lỗi")
    void mutateCoupons_checksRoleAndHandlesCrud() throws Exception {
        User regular = buildUser(1L, User.Role.USER);
        User manager = buildUser(2L, User.Role.MANAGER);
        Coupon coupon = sampleCoupon();
        CouponRequest req = new CouponRequest();
        req.setCode("SAVE10");
        req.setDiscountPercentage(BigDecimal.TEN);

        when(userService.getAuthenticatedUser()).thenReturn(regular);
        mockMvc.perform(post("/api/v1/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/v1/coupons/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
        mockMvc.perform(delete("/api/v1/coupons/1"))
                .andExpect(status().isForbidden());

        when(userService.getAuthenticatedUser()).thenReturn(manager);
        when(couponService.createCoupon(any(CouponRequest.class))).thenReturn(coupon);
        mockMvc.perform(post("/api/v1/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("SAVE10"));

        when(couponService.updateCoupon(eq(1L), any(CouponRequest.class))).thenReturn(coupon);
        mockMvc.perform(put("/api/v1/coupons/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        doNothing().when(couponService).deleteCoupon(1L);
        mockMvc.perform(delete("/api/v1/coupons/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        when(couponService.createCoupon(any(CouponRequest.class))).thenThrow(new RuntimeException("Trùng mã"));
        mockMvc.perform(post("/api/v1/coupons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        when(couponService.updateCoupon(eq(99L), any(CouponRequest.class)))
                .thenThrow(new RuntimeException("Không tìm thấy"));
        mockMvc.perform(put("/api/v1/coupons/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());

        doThrow(new RuntimeException("Không tìm thấy")).when(couponService).deleteCoupon(99L);
        mockMvc.perform(delete("/api/v1/coupons/99"))
                .andExpect(status().isBadRequest());
    }
}
