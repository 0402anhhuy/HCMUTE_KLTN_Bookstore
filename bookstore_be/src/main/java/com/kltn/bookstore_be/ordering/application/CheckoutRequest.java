package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.ordering.domain.Order.PaymentMethod;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CheckoutRequest {
    private String shippingAddress;
    private String recipientPhone;
    private PaymentMethod paymentMethod;
    private String couponCode;
    private CouponSnapshot couponSnapshot;
    private Long productId;
    private Integer quantity;
    private Boolean usePoints;
    private java.util.List<Long> cartItemIds;

    @Data
    public static class CouponSnapshot {
        private Long id;
        private String discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderValue;
        private BigDecimal maxDiscountAmount;
    }
}
