package com.kltn.bookstore_be.review.application;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    @NotNull(message = "Mã sách không được để trống")
    private Long productId;

    @Min(value = 1, message = "Số sao đánh giá phải từ 1 đến 5")
    @Max(value = 5, message = "Số sao đánh giá phải từ 1 đến 5")
    @NotNull(message = "Số sao không được để trống")
    private Integer rating;

    @NotBlank(message = "Nội dung nhận xét không được để trống")
    private String comment;
}