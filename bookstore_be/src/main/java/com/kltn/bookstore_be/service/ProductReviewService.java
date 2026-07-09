package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.ProductReview;
import com.kltn.bookstore_be.repository.ProductReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductReviewService {

    private final ProductReviewRepository productReviewRepository;

    public Page<ProductReview> findByProductId(Long productId, Pageable pageable) {
        return productReviewRepository.findByProductId(productId, pageable);
    }

    public List<ProductReview> findByProductId(Long productId) {
        return productReviewRepository.findByProductId(productId);
    }

    public ProductReview findById(Long id) {
        return productReviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá với ID: " + id));
    }

    @Transactional
    public ProductReview save(ProductReview review) {
        return productReviewRepository.save(review);
    }

    @Transactional
    public void deleteById(Long id) {
        productReviewRepository.deleteById(id);
    }
}
