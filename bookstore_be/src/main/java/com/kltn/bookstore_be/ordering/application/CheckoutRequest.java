package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.ordering.domain.Order.PaymentMethod;
import lombok.Data;

@Data
public class CheckoutRequest {
    private String shippingAddress;
    private String recipientPhone;
    private PaymentMethod paymentMethod;
    private String couponCode;
    private Long productId;
    private Integer quantity;
    private Boolean usePoints;
    private java.util.List<Long> cartItemIds;
}