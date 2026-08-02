package com.kltn.bookstore_be.ordering.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    private Long orderId;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String shippingAddress;
    private String paymentUrl; // VNPAY payment redirect URL
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime preparingAt;
    private LocalDateTime shippingAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime refundedAt;
}