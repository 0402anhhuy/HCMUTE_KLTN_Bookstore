package com.kltn.bookstore_be.payment.presentation;

import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.payment.application.PaymentService;
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

import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private PaymentService paymentService;

    @Test
    @DisplayName("GET /api/v1/payment/vnpay-callback chưa đăng nhập trả về 401")
    void vnpayCallback_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/payment/vnpay-callback")
                        .param("vnp_TxnRef", "ORD123"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/payment/vnpay-callback thành công trả về status success")
    void vnpayCallback_success_returnsOk() throws Exception {
        when(paymentService.processVNPayCallback(anyMap())).thenReturn(true);

        mockMvc.perform(get("/api/v1/payment/vnpay-callback")
                        .param("vnp_TxnRef", "ORD123")
                        .param("vnp_ResponseCode", "00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.orderId").value("ORD123"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/payment/vnpay-callback thất bại hoặc exception trả về 400")
    void vnpayCallback_failedOrException_returnsBadRequest() throws Exception {
        when(paymentService.processVNPayCallback(anyMap())).thenReturn(false);

        mockMvc.perform(get("/api/v1/payment/vnpay-callback")
                        .param("vnp_TxnRef", "ORD123")
                        .param("vnp_ResponseCode", "24"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("failed"))
                .andExpect(jsonPath("$.orderId").value("ORD123"));

        when(paymentService.processVNPayCallback(anyMap()))
                .thenThrow(new RuntimeException("Chữ ký không hợp lệ"));

        mockMvc.perform(get("/api/v1/payment/vnpay-callback")
                        .param("vnp_TxnRef", "ORD123"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Chữ ký không hợp lệ"));
    }
}
