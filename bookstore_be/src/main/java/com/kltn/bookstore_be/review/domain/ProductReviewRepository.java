package com.kltn.bookstore_be.review.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    List<ProductReview> findByProductIdAndStatusOrderByReviewedAtDesc(Long productId, ProductReview.ReviewStatus status);
    boolean existsByUserIdAndProductIdAndOrderId(Long userId, Long productId, Long orderId);
    boolean existsByUserId(Long userId);
}