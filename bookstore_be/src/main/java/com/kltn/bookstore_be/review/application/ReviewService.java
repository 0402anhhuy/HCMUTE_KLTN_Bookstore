package com.kltn.bookstore_be.review.application;

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
import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ProductReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    public List<ProductReview> getProductReviews(Long productId) {
        return reviewRepository.findByProductIdAndStatusOrderByReviewedAtDesc(productId, ProductReview.ReviewStatus.VISIBLE);
    }

    @Transactional
    public ProductReview addReview(User user, ReviewRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        // Check if order belongs to user
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không thể đánh giá sản phẩm trong đơn hàng của người khác");
        }

        // Check if order is delivered
        if (order.getStatus() != Order.OrderStatus.delivered) {
            throw new RuntimeException("Bạn chỉ có thể đánh giá sản phẩm khi đơn hàng đã được giao thành công");
        }

        // Check if product is in the order
        List<OrderItem> items = orderItemRepository.findByOrderId(request.getOrderId());
        boolean hasProduct = items.stream().anyMatch(item -> item.getProduct().getId().equals(request.getProductId()));
        if (!hasProduct) {
            throw new RuntimeException("Sách này không có trong đơn hàng của bạn");
        }

        // Check if already reviewed
        if (reviewRepository.existsByUserIdAndProductIdAndOrderId(user.getId(), request.getProductId(), request.getOrderId())) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này cho đơn hàng này rồi");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        ProductReview review = ProductReview.builder()
                .user(user)
                .product(product)
                .order(order)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ProductReview.ReviewStatus.VISIBLE)
                .build();

        ProductReview savedReview = reviewRepository.save(review);

        // 1. Award reward points (10 points)
        user.setRewardPoints((user.getRewardPoints() != null ? user.getRewardPoints() : 0) + 10);
        userRepository.save(user);

        // 2. Generate personalized coupon code for the user
        String randomCode = "DG-" + java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        Coupon coupon = Coupon.builder()
                .code(randomCode)
                .description("Mã giảm giá 20k tri ân khách hàng đánh giá sách \"" + product.getName() + "\"")
                .discountType(Coupon.DiscountType.FIXED)
                .discountValue(new java.math.BigDecimal("20000.00"))
                .minOrderValue(new java.math.BigDecimal("100000.00"))
                .maxDiscountAmount(new java.math.BigDecimal("20000.00"))
                .usageLimit(1)
                .usedCount(0)
                .startDate(java.time.LocalDateTime.now())
                .endDate(java.time.LocalDateTime.now().plusDays(30))
                .status(Coupon.CouponStatus.ACTIVE)
                .user(user)
                .build();
        couponRepository.save(coupon);

        auditLogService.log(user, "ADD_REVIEW", "Thêm đánh giá sách " + product.getName() + " (" + request.getRating() + " sao). Cộng 10 điểm, tặng mã giảm giá " + randomCode);

        // 3. Notify user
        notificationService.createNotification(
                user,
                "Nhận điểm thưởng & Mã giảm giá mới",
                "Bạn đã được cộng 10 điểm thưởng (1đ = 10k VND) và nhận mã giảm giá 20k: " + randomCode + " nhờ đánh giá sản phẩm!",
                Notification.NotificationType.ACCOUNT,
                "coupons",
                coupon.getId()
        );

        notificationService.notifyManagersAndAdmins(
                "Đánh giá mới cho sách " + product.getName(),
                "Khách hàng " + user.getFullName() + " đã đánh giá " + request.getRating() + " sao: \"" + request.getComment() + "\"",
                Notification.NotificationType.SYSTEM,
                "reviews",
                savedReview.getId()
        );

        return savedReview;
    }

    @Transactional
    public void deleteReview(Long reviewId, String reason, User manager) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
                
        notificationService.createNotification(
                review.getUser(),
                "Đánh giá của bạn đã bị gỡ",
                "Đánh giá cho sách \"" + review.getProduct().getName() + "\" đã bị quản trị viên gỡ bỏ. Lý do: \"" + reason + "\"",
                Notification.NotificationType.SYSTEM,
                "reviews",
                null
        );

        reviewRepository.delete(review);
        auditLogService.log(manager, "DELETE_REVIEW", "Xóa đánh giá của " + review.getUser().getFullName() + " trên sách " + review.getProduct().getName() + ". Lý do: " + reason);
    }

    public List<ProductReview> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Transactional
    public ProductReview replyReview(Long reviewId, String reply, User manager) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        review.setReply(reply);
        review.setRepliedAt(java.time.LocalDateTime.now());
        
        notificationService.createNotification(
                review.getUser(),
                "Phản hồi từ cửa hàng",
                "Cửa hàng đã phản hồi đánh giá của bạn về sách \"" + review.getProduct().getName() + "\": \"" + reply + "\"",
                Notification.NotificationType.SYSTEM,
                "reviews",
                reviewId
        );
        
        auditLogService.log(manager, "REPLY_REVIEW", "Phản hồi đánh giá của " + review.getUser().getFullName() + " trên sách " + review.getProduct().getName());
        return reviewRepository.save(review);
    }
}