package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.ordering.domain.Promotion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionReportResponse {
    private Promotion promotion;
    private Long totalUses;
    private BigDecimal totalRevenue;
}
