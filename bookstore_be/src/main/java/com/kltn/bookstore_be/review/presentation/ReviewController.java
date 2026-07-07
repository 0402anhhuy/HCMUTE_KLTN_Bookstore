package com.kltn.bookstore_be.review.presentation;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;


import com.kltn.bookstore_be.review.application.ReviewRequest;
import com.kltn.bookstore_be.review.domain.ProductReview;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.review.application.ReviewService;
import com.kltn.bookstore_be.identity.application.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng chưa được xác thực"));
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(@PathVariable Long productId) {
        try {
            List<ProductReview> reviews = reviewService.getProductReviews(productId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addReview(@Valid @RequestBody ReviewRequest request) {
        try {
            User user = getAuthenticatedUser();
            ProductReview review = reviewService.addReview(user, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Cảm ơn bạn đã đánh giá sản phẩm!",
                    "review", review
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            List<ProductReview> reviews = reviewService.getAllReviews();
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id, @RequestParam String reason) {
        try {
            User user = getAuthenticatedUser();
            if (reason == null || reason.trim().isEmpty()) {
                throw new RuntimeException("Lý do xóa không được để trống");
            }
            reviewService.deleteReview(id, reason.trim(), user);
            return ResponseEntity.ok(Map.of("message", "Xóa đánh giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/reply")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> replyReview(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            User user = getAuthenticatedUser();
            String reply = body.get("reply");
            if (reply == null || reply.trim().isEmpty()) {
                throw new RuntimeException("Nội dung phản hồi không được để trống");
            }
            ProductReview updated = reviewService.replyReview(id, reply.trim(), user);
            return ResponseEntity.ok(Map.of(
                "message", "Phản hồi đánh giá thành công",
                "review", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}