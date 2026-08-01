package com.kltn.bookstore_be.review.presentation;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.review.application.ReviewRequest;
import com.kltn.bookstore_be.review.application.ReviewService;
import com.kltn.bookstore_be.review.domain.ProductReview;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import static com.kltn.bookstore_be.catalog.presentation.ProductController.getUser;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    private User getAuthenticatedUser() {
        return getUser(userService);
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
