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
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuditLogService auditLogService;

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

        auditLogService.log(user, "ADD_REVIEW", "Thêm đánh giá sách " + product.getName() + " (" + request.getRating() + " sao)");

        return savedReview;
    }

    @Transactional
    public void deleteReview(Long reviewId, User manager) {
        ProductReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Đánh giá không tồn tại"));
        reviewRepository.delete(review);
        auditLogService.log(manager, "DELETE_REVIEW", "Xóa đánh giá của " + review.getUser().getFullName() + " trên sách " + review.getProduct().getName());
    }

    public List<ProductReview> getAllReviews() {
        return reviewRepository.findAll();
    }
}