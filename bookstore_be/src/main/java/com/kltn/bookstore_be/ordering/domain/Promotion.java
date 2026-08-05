package com.kltn.bookstore_be.ordering.domain;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.kltn.bookstore_be.catalog.domain.Product;

@Entity
@Table(name = "promotions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "max_discount_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "usage_limit", nullable = false)
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(50)")
    private PromotionStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "promotion_products",
        joinColumns = @JoinColumn(name = "promotion_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    @Builder.Default
    private List<Product> applicableProducts = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (usedCount == null) {
            usedCount = 0;
        }
        if (status == null) {
            status = PromotionStatus.ACTIVE;
        }
    }

    public enum DiscountType {
        PERCENT, FIXED
    }

    public enum PromotionStatus {
        PENDING, ACTIVE, INACTIVE, EXPIRED
    }
}