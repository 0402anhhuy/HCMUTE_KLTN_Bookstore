package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.ordering.domain.Promotion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AdminCreatePromotionRequest {

    @NotBlank(message = "Tên chương trình không được để trống")
    private String title;

    @NotNull(message = "Loại khuyến mãi không được để trống")
    private Promotion.DiscountType discountType;

    @NotNull(message = "Giá trị khuyến mãi không được để trống")
    private BigDecimal discountValue;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endDate;

    @NotNull(message = "Vui lòng chọn ít nhất 1 sản phẩm áp dụng")
    private List<Long> productIds;
}
