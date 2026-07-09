package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

    Page<ProductReview> findByProductId(Long productId, Pageable pageable);

    List<ProductReview> findByProductId(Long productId);

    Page<ProductReview> findByUserId(Long userId, Pageable pageable);
}
