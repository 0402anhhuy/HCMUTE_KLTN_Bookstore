package com.kltn.bookstore_be.review.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.review.domain.ProductReview;
import com.kltn.bookstore_be.review.domain.ProductReviewRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @InjectMocks
    private ReviewService reviewService;

    @Mock
    private ProductReviewRepository reviewRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    private User sampleUser;
    private User managerUser;
    private Product sampleProduct;
    private Order sampleOrder;
    private ProductReview sampleReview;
    private ReviewRequest sampleReviewRequest;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("user@example.com")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .rewardPoints(0)
                .build();

        managerUser = User.builder()
                .id(10L)
                .fullName("Manager")
                .email("manager@example.com")
                .role(User.Role.MANAGER)
                .status(User.UserStatus.ACTIVE)
                .build();

        Category category = Category.builder().id(1L).name("Văn học").build();

        sampleProduct = Product.builder()
                .id(1L)
                .name("Doraemon Tập 1")
                .price(BigDecimal.valueOf(25000))
                .stockQuantity(100)
                .status(Product.ProductStatus.ACTIVE)
                .category(category)
                .build();

        sampleOrder = Order.builder()
                .id(1L)
                .user(sampleUser)
                .status(Order.OrderStatus.delivered)
                .totalAmount(BigDecimal.valueOf(75000))
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.valueOf(30000))
                .finalAmount(BigDecimal.valueOf(105000))
                .paymentMethod(Order.PaymentMethod.COD)
                .shippingAddress("123 ABC Street")
                .createdAt(LocalDateTime.now())
                .build();

        sampleReview = ProductReview.builder()
                .id(1L)
                .user(sampleUser)
                .product(sampleProduct)
                .order(sampleOrder)
                .rating(5)
                .comment("Sách rất hay")
                .status(ProductReview.ReviewStatus.VISIBLE)
                .reviewedAt(LocalDateTime.now())
                .build();

        sampleReviewRequest = new ReviewRequest();
        sampleReviewRequest.setOrderId(1L);
        sampleReviewRequest.setProductId(1L);
        sampleReviewRequest.setRating(5);
        sampleReviewRequest.setComment("Sách rất hay");
    }

    // ============================================================
    // GUEST FUNCTIONS - Xem đánh giá sản phẩm
    // ============================================================
    @Nested
    @DisplayName("Guest - Xem đánh giá sản phẩm")
    class GetReviewsTests {

        @Test
        @DisplayName("Lấy danh sách đánh giá của sản phẩm")
        void getProductReviews_returnsVisibleReviews() {
            when(reviewRepository.findByProductIdAndStatusOrderByReviewedAtDesc(1L, ProductReview.ReviewStatus.VISIBLE))
                    .thenReturn(List.of(sampleReview));

            List<ProductReview> result = reviewService.getProductReviews(1L);

            assertEquals(1, result.size());
            assertEquals(5, result.get(0).getRating());
            assertEquals("Sách rất hay", result.get(0).getComment());
        }

        @Test
        @DisplayName("Sản phẩm chưa có đánh giá - trả về list rỗng")
        void getProductReviews_noReviews_returnsEmptyList() {
            when(reviewRepository.findByProductIdAndStatusOrderByReviewedAtDesc(999L, ProductReview.ReviewStatus.VISIBLE))
                    .thenReturn(List.of());

            List<ProductReview> result = reviewService.getProductReviews(999L);

            assertTrue(result.isEmpty());
        }
    }

    // ============================================================
    // USER FUNCTIONS - Thêm đánh giá sản phẩm
    // ============================================================
    @Nested
    @DisplayName("User - Thêm đánh giá")
    class AddReviewTests {

        @Test
        @DisplayName("Đánh giá sản phẩm thành công - cộng 10 điểm và tạo mã giảm giá")
        void addReview_validRequest_createsReviewAndRewards() {
            OrderItem item = OrderItem.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .product(sampleProduct)
                    .quantity(3)
                    .build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(item));
            when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 1L, 1L)).thenReturn(false);
            when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
            when(reviewRepository.save(any(ProductReview.class))).thenAnswer(invocation -> {
                ProductReview review = invocation.getArgument(0);
                review.setId(1L);
                return review;
            });
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);
            when(couponRepository.save(any(Coupon.class))).thenAnswer(invocation -> {
                Coupon c = invocation.getArgument(0);
                c.setId(1L);
                return c;
            });

            ProductReview result = reviewService.addReview(sampleUser, sampleReviewRequest);

            assertNotNull(result);
            assertEquals(5, result.getRating());
            assertEquals("Sách rất hay", result.getComment());
            assertEquals(10, sampleUser.getRewardPoints()); // 0 + 10

            verify(couponRepository).save(any(Coupon.class));
            verify(auditLogService).log(eq(sampleUser), eq("ADD_REVIEW"), anyString());
            verify(notificationService).createNotification(any(), anyString(), anyString(), any(), any(), any());
            verify(notificationService).notifyManagersAndAdmins(anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Đánh giá đơn hàng của người khác - ném exception")
        void addReview_differentUser_throwsException() {
            User otherUser = User.builder().id(99L).role(User.Role.USER).build();
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                reviewService.addReview(otherUser, sampleReviewRequest);
            });
        }

        @Test
        @DisplayName("Đánh giá đơn hàng chưa giao - ném exception")
        void addReview_notDelivered_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.shipping);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                reviewService.addReview(sampleUser, sampleReviewRequest);
            });
        }

        @Test
        @DisplayName("Đánh giá sản phẩm không có trong đơn hàng - ném exception")
        void addReview_productNotInOrder_throwsException() {
            Product otherProduct = Product.builder().id(999L).name("Sách khác").build();
            OrderItem item = OrderItem.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .product(otherProduct)
                    .quantity(1)
                    .build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(item));

            assertThrows(RuntimeException.class, () -> {
                reviewService.addReview(sampleUser, sampleReviewRequest);
            });
        }

        @Test
        @DisplayName("Đánh giá lặp lại cùng sản phẩm cùng đơn hàng - ném exception")
        void addReview_duplicate_throwsException() {
            OrderItem item = OrderItem.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .product(sampleProduct)
                    .quantity(1)
                    .build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(item));
            when(reviewRepository.existsByUserIdAndProductIdAndOrderId(1L, 1L, 1L)).thenReturn(true);

            assertThrows(RuntimeException.class, () -> {
                reviewService.addReview(sampleUser, sampleReviewRequest);
            });
        }
    }

    // ============================================================
    // MANAGER FUNCTIONS - Xóa đánh giá, Phản hồi đánh giá
    // ============================================================
    @Nested
    @DisplayName("Manager - Xóa đánh giá")
    class DeleteReviewTests {

        @Test
        @DisplayName("Xóa đánh giá thành công - thông báo cho user")
        void deleteReview_success_notifiesUser() {
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(sampleReview));

            reviewService.deleteReview(1L, "Vi phạm quy định", managerUser);

            verify(reviewRepository).delete(sampleReview);
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
            verify(auditLogService).log(eq(managerUser), eq("DELETE_REVIEW"), anyString());
        }

        @Test
        @DisplayName("Xóa đánh giá không tồn tại - ném exception")
        void deleteReview_notFound_throwsException() {
            when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                reviewService.deleteReview(999L, "Lý do", managerUser);
            });
        }
    }

    @Nested
    @DisplayName("Manager - Phản hồi đánh giá")
    class ReplyReviewTests {

        @Test
        @DisplayName("Phản hồi đánh giá thành công - thông báo cho user")
        void replyReview_success() {
            when(reviewRepository.findById(1L)).thenReturn(Optional.of(sampleReview));
            when(reviewRepository.save(any(ProductReview.class))).thenReturn(sampleReview);

            ProductReview result = reviewService.replyReview(1L, "Cảm ơn bạn đã đánh giá!", managerUser);

            assertEquals("Cảm ơn bạn đã đánh giá!", result.getReply());
            assertNotNull(result.getRepliedAt());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
            verify(auditLogService).log(eq(managerUser), eq("REPLY_REVIEW"), anyString());
        }

        @Test
        @DisplayName("Phản hồi đánh giá không tồn tại - ném exception")
        void replyReview_notFound_throwsException() {
            when(reviewRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                reviewService.replyReview(999L, "Reply", managerUser);
            });
        }
    }

    @Nested
    @DisplayName("Manager - Xem tất cả đánh giá")
    class GetAllReviewsTests {

        @Test
        @DisplayName("Lấy tất cả đánh giá")
        void getAllReviews_returnsList() {
            when(reviewRepository.findAll()).thenReturn(List.of(sampleReview));

            List<ProductReview> result = reviewService.getAllReviews();

            assertEquals(1, result.size());
        }
    }
}
