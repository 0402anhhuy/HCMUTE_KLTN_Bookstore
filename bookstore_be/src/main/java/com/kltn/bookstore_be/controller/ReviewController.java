package com.kltn.bookstore_be.controller;

import com.kltn.bookstore_be.entity.ProductReview;
import com.kltn.bookstore_be.service.ProductReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ProductReviewService productReviewService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ProductReview> reviews = productReviewService.findByProductId(productId, pageable);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ProductReview review) {
        try {
            ProductReview saved = productReviewService.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        try {
            productReviewService.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
