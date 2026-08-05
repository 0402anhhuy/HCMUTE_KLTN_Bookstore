package com.kltn.bookstore_be.review.domain;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "product_reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;

    @Column(name = "reply", columnDefinition = "TEXT")
    private String reply;

    @Column(name = "replied_at")
    private LocalDateTime repliedAt;

    @Column(name = "reviewed_at", updatable = false)
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        reviewedAt = LocalDateTime.now();
        if (status == null) {
            status = ReviewStatus.VISIBLE;
        }
    }

    public enum ReviewStatus {
        VISIBLE, HIDDEN
    }
}