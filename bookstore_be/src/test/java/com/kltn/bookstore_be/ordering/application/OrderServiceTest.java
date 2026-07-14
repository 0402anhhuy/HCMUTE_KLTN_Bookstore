package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.UserRepository;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.Payment;
import com.kltn.bookstore_be.payment.domain.PaymentRepository;
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
class OrderServiceTest {

    @InjectMocks
    private OrderService orderService;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private CartService cartService;

    @Mock
    private ProductService productService;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ReturnRequestRepository returnRequestRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ShipperRepository shipperRepository;

    private User sampleUser;
    private User managerUser;
    private Order sampleOrder;
    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("user@example.com")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .address("123 ABC Street")
                .rewardPoints(0)
                .build();

        managerUser = User.builder()
                .id(10L)
                .fullName("Manager")
                .email("manager@example.com")
                .role(User.Role.MANAGER)
                .status(User.UserStatus.ACTIVE)
                .build();

        sampleCategory = Category.builder().id(1L).name("Văn học").build();

        sampleProduct = Product.builder()
                .id(1L)
                .name("Doraemon Tập 1")
                .price(BigDecimal.valueOf(25000))
                .stockQuantity(100)
                .status(Product.ProductStatus.ACTIVE)
                .category(sampleCategory)
                .build();

        sampleOrder = Order.builder()
                .id(1L)
                .user(sampleUser)
                .totalAmount(BigDecimal.valueOf(75000))
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.valueOf(30000))
                .finalAmount(BigDecimal.valueOf(105000))
                .pointsUsed(0)
                .pointsDiscount(BigDecimal.ZERO)
                .paymentMethod(Order.PaymentMethod.COD)
                .shippingAddress("123 ABC Street")
                .status(Order.OrderStatus.pending)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("User - Hủy đơn hàng")
    class CancelOrderTests {

        @Test
        @DisplayName("User hủy đơn hàng ở trạng thái pending thành công")
        void cancelOrder_pendingStatus_success() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(
                    OrderItem.builder()
                            .id(1L)
                            .order(sampleOrder)
                            .product(sampleProduct)
                            .quantity(3)
                            .unitPrice(BigDecimal.valueOf(25000))
                            .subtotal(BigDecimal.valueOf(75000))
                            .build()
            ));
            when(productService.updateProduct(anyLong(), any(Product.class))).thenReturn(sampleProduct);
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.cancelOrder(1L, "Đổi ý", sampleUser);

            assertEquals(Order.OrderStatus.cancelled, sampleOrder.getStatus());
            assertEquals("Đổi ý", sampleOrder.getCancelledReason());
            assertEquals(103, sampleProduct.getStockQuantity()); // 100 + 3 restored
            verify(auditLogService).log(eq(sampleUser), eq("CANCEL_ORDER"), anyString());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("User hủy đơn hàng ở trạng thái confirmed thành công")
        void cancelOrder_confirmedStatus_success() {
            sampleOrder.setStatus(Order.OrderStatus.confirmed);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of());
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.cancelOrder(1L, "Không muốn mua nữa", sampleUser);

            assertEquals(Order.OrderStatus.cancelled, sampleOrder.getStatus());
        }

        @Test
        @DisplayName("User hủy đơn ở trạng thái shipping - ném exception")
        void cancelOrder_shippingStatus_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.shipping);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                orderService.cancelOrder(1L, "Muốn hủy", sampleUser);
            });

            assertTrue(exception.getMessage().contains("Không thể hủy đơn hàng"));
        }

        @Test
        @DisplayName("User hủy đơn hàng của người khác - ném exception")
        void cancelOrder_differentUser_throwsException() {
            User otherUser = User.builder()
                    .id(99L)
                    .fullName("Other User")
                    .role(User.Role.USER)
                    .build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                orderService.cancelOrder(1L, "Muốn hủy", otherUser);
            });

            assertTrue(exception.getMessage().contains("không có quyền"));
        }

        @Test
        @DisplayName("Manager hủy đơn hàng của bất kỳ user nào - thành công")
        void cancelOrder_byManager_success() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of());
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.cancelOrder(1L, "Vi phạm", managerUser);

            assertEquals(Order.OrderStatus.cancelled, sampleOrder.getStatus());
        }
    }

    @Nested
    @DisplayName("User - Cập nhật địa chỉ giao hàng")
    class UpdateOrderAddressTests {

        @Test
        @DisplayName("Cập nhật địa chỉ khi đơn hàng pending - thành công")
        void updateOrderAddress_pendingOrder_success() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.updateOrderAddress(1L, "456 New Street", sampleUser);

            assertEquals("456 New Street", sampleOrder.getShippingAddress());
            verify(auditLogService).log(eq(sampleUser), eq("UPDATE_ORDER_ADDRESS"), anyString());
        }

        @Test
        @DisplayName("Cập nhật địa chỉ khi đơn hàng confirmed - ném exception")
        void updateOrderAddress_confirmedOrder_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.confirmed);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                orderService.updateOrderAddress(1L, "456 New Street", sampleUser);
            });
        }

        @Test
        @DisplayName("Cập nhật địa chỉ đơn hàng của người khác - ném exception")
        void updateOrderAddress_differentUser_throwsException() {
            User otherUser = User.builder().id(99L).role(User.Role.USER).build();
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                orderService.updateOrderAddress(1L, "456 New Street", otherUser);
            });
        }
    }

    @Nested
    @DisplayName("User - Yêu cầu đổi trả")
    class ReturnRequestTests {

        @Test
        @DisplayName("Yêu cầu đổi trả đơn hàng đã giao trong 7 ngày - thành công")
        void requestReturn_deliveredWithin7Days_success() {
            sampleOrder.setStatus(Order.OrderStatus.delivered);
            sampleOrder.setCreatedAt(LocalDateTime.now().minusDays(3));

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(returnRequestRepository.findByOrderId(1L)).thenReturn(Optional.empty());
            when(returnRequestRepository.save(any(ReturnRequest.class))).thenAnswer(invocation -> {
                ReturnRequest req = invocation.getArgument(0);
                req.setId(1L);
                return req;
            });
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.requestReturn(1L, "Sách bị hư", sampleUser);

            assertEquals(Order.OrderStatus.cancel_requested, sampleOrder.getStatus());
            verify(returnRequestRepository).save(any(ReturnRequest.class));
            verify(auditLogService).log(eq(sampleUser), eq("RETURN_REQUEST"), anyString());
        }

        @Test
        @DisplayName("Yêu cầu đổi trả quá 7 ngày - ném exception")
        void requestReturn_after7Days_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.delivered);
            sampleOrder.setCreatedAt(LocalDateTime.now().minusDays(10));

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                orderService.requestReturn(1L, "Sách bị hư", sampleUser);
            });
        }

        @Test
        @DisplayName("Yêu cầu đổi trả đơn hàng chưa giao - ném exception")
        void requestReturn_notDelivered_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.shipping);
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            assertThrows(RuntimeException.class, () -> {
                orderService.requestReturn(1L, "Muốn trả", sampleUser);
            });
        }

        @Test
        @DisplayName("Yêu cầu đổi trả lần 2 - ném exception")
        void requestReturn_duplicateRequest_throwsException() {
            sampleOrder.setStatus(Order.OrderStatus.delivered);
            sampleOrder.setCreatedAt(LocalDateTime.now().minusDays(1));

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(returnRequestRepository.findByOrderId(1L)).thenReturn(
                    Optional.of(ReturnRequest.builder().id(1L).build()));

            assertThrows(RuntimeException.class, () -> {
                orderService.requestReturn(1L, "Trả lại", sampleUser);
            });
        }
    }

    @Nested
    @DisplayName("Manager - Xử lý yêu cầu đổi trả")
    class ProcessReturnRequestTests {

        @Test
        @DisplayName("Duyệt yêu cầu đổi trả - hoàn kho và cập nhật trạng thái")
        void processReturn_approve_restoresStockAndRefunds() {
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .user(sampleUser)
                    .reason("Sách hư")
                    .status(ReturnRequest.ReturnStatus.PENDING)
                    .build();
            sampleOrder.setStatus(Order.OrderStatus.cancel_requested);

            OrderItem item = OrderItem.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .product(sampleProduct)
                    .quantity(3)
                    .unitPrice(BigDecimal.valueOf(25000))
                    .subtotal(BigDecimal.valueOf(75000))
                    .build();

            when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of(item));
            when(productService.updateProduct(anyLong(), any(Product.class))).thenReturn(sampleProduct);
            when(returnRequestRepository.save(any(ReturnRequest.class))).thenReturn(returnRequest);
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.processReturnRequest(1L, ReturnRequest.ReturnStatus.APPROVED, null, managerUser);

            assertEquals(ReturnRequest.ReturnStatus.APPROVED, returnRequest.getStatus());
            assertEquals(Order.OrderStatus.refunded, sampleOrder.getStatus());
            assertEquals(103, sampleProduct.getStockQuantity()); // 100 + 3
        }

        @Test
        @DisplayName("Từ chối yêu cầu đổi trả - hoàn trạng thái đơn hàng về delivered")
        void processReturn_reject_restoresDeliveredStatus() {
            ReturnRequest returnRequest = ReturnRequest.builder()
                    .id(1L)
                    .order(sampleOrder)
                    .user(sampleUser)
                    .reason("Sách hư")
                    .status(ReturnRequest.ReturnStatus.PENDING)
                    .build();
            sampleOrder.setStatus(Order.OrderStatus.cancel_requested);

            when(returnRequestRepository.findById(1L)).thenReturn(Optional.of(returnRequest));
            when(returnRequestRepository.save(any(ReturnRequest.class))).thenReturn(returnRequest);
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.processReturnRequest(1L, ReturnRequest.ReturnStatus.REJECTED, "Không đủ điều kiện", managerUser);

            assertEquals(ReturnRequest.ReturnStatus.REJECTED, returnRequest.getStatus());
            assertEquals("Không đủ điều kiện", returnRequest.getRejectedReason());
            assertEquals(Order.OrderStatus.delivered, sampleOrder.getStatus());
        }
    }

    @Nested
    @DisplayName("Manager - Giao hàng và phân công shipper")
    class DeliveryManagementTests {

        @Test
        @DisplayName("Đánh dấu đơn hàng đã giao thành công")
        void deliverOrder_success() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.deliverOrder(1L, managerUser);

            assertEquals(Order.OrderStatus.delivered, sampleOrder.getStatus());
            verify(auditLogService).log(eq(managerUser), eq("DELIVER_ORDER"), anyString());
        }

        @Test
        @DisplayName("Phân công shipper cho đơn hàng pending - cập nhật sang shipping")
        void assignShipper_pendingOrder_changesStatusToShipping() {
            Shipper shipper = Shipper.builder()
                    .id(1L)
                    .fullName("Shipper A")
                    .build();

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(shipperRepository.findById(1L)).thenReturn(Optional.of(shipper));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.assignShipper(1L, 1L, managerUser);

            assertEquals(shipper, sampleOrder.getShipper());
            assertEquals(Order.OrderStatus.shipping, sampleOrder.getStatus());
            verify(auditLogService).log(eq(managerUser), eq("ASSIGN_SHIPPER"), anyString());
        }

        @Test
        @DisplayName("Phân công shipper không tồn tại - ném exception")
        void assignShipper_invalidShipper_throwsException() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(shipperRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                orderService.assignShipper(1L, 999L, managerUser);
            });
        }
    }

    @Nested
    @DisplayName("Manager - Cập nhật trạng thái đơn hàng")
    class UpdateOrderStatusTests {

        @Test
        @DisplayName("Cập nhật trạng thái sang confirmed thành công")
        void updateOrderStatus_toConfirmed_success() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.updateOrderStatus(1L, Order.OrderStatus.confirmed, managerUser);

            assertEquals(Order.OrderStatus.confirmed, sampleOrder.getStatus());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Cập nhật trạng thái sang cancelled - gọi cancelOrder")
        void updateOrderStatus_toCancelled_callsCancelOrder() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(orderItemRepository.findByOrderId(1L)).thenReturn(List.of());
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.empty());
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            orderService.updateOrderStatus(1L, Order.OrderStatus.cancelled, managerUser);

            assertEquals(Order.OrderStatus.cancelled, sampleOrder.getStatus());
        }
    }

    @Nested
    @DisplayName("User/Manager - Truy vấn đơn hàng")
    class QueryOrderTests {

        @Test
        @DisplayName("Lấy đơn hàng theo ID thành công")
        void getOrderById_existingId_returnsOrder() {
            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));

            Order result = orderService.getOrderById(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
        }

        @Test
        @DisplayName("Lấy đơn hàng không tồn tại - ném exception")
        void getOrderById_nonExisting_throwsException() {
            when(orderRepository.findById(999L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                orderService.getOrderById(999L);
            });
        }

        @Test
        @DisplayName("Lấy danh sách đơn hàng của user")
        void getUserOrders_returnsList() {
            when(orderRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(sampleOrder));

            List<Order> result = orderService.getUserOrders(1L);

            assertEquals(1, result.size());
        }

        @Test
        @DisplayName("Lấy tất cả đơn hàng (Manager)")
        void getAllOrders_returnsList() {
            when(orderRepository.findAll()).thenReturn(List.of(sampleOrder));

            List<Order> result = orderService.getAllOrders();

            assertEquals(1, result.size());
        }
    }
}
