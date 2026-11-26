package com.kltn.bookstore_be.payment.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.notification.application.NotificationService;
import com.kltn.bookstore_be.ordering.domain.Order;
import com.kltn.bookstore_be.ordering.domain.OrderRepository;
import com.kltn.bookstore_be.payment.domain.Payment;
import com.kltn.bookstore_be.payment.domain.PaymentRepository;
import com.kltn.bookstore_be.payment.infrastructure.VNPayUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @InjectMocks
    private PaymentService paymentService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private com.kltn.bookstore_be.ordering.domain.OrderItemRepository orderItemRepository;

    @Mock
    private com.kltn.bookstore_be.catalog.application.ProductService productService;

    @Mock
    private com.kltn.bookstore_be.identity.domain.UserRepository userRepository;

    @Mock
    private com.kltn.bookstore_be.ordering.domain.CouponRepository couponRepository;

    private User sampleUser;
    private Order sampleOrder;
    private Payment samplePayment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "vnp_HashSecret", "TEST_HASH_SECRET");

        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("user@example.com")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        sampleOrder = Order.builder()
                .id(1L)
                .user(sampleUser)
                .totalAmount(BigDecimal.valueOf(100000))
                .discountAmount(BigDecimal.ZERO)
                .shippingFee(BigDecimal.valueOf(30000))
                .finalAmount(BigDecimal.valueOf(130000))
                .paymentMethod(Order.PaymentMethod.VNPAY)
                .shippingAddress("123 ABC Street")
                .status(Order.OrderStatus.pending)
                .createdAt(LocalDateTime.now())
                .build();

        samplePayment = Payment.builder()
                .id(1L)
                .order(sampleOrder)
                .paymentMethod(Payment.PaymentMethod.VNPAY)
                .amount(BigDecimal.valueOf(130000))
                .paymentStatus(Payment.PaymentStatus.PENDING)
                .build();
    }

    @Nested
    @DisplayName("Xử lý callback VNPay")
    class ProcessVNPayCallbackTests {

        @Test
        @DisplayName("Callback không có SecureHash - trả về false")
        void processCallback_noSecureHash_returnsFalse() {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "00");

            boolean result = paymentService.processVNPayCallback(params);

            assertFalse(result);
        }

        @Test
        @DisplayName("Thanh toán thành công (responseCode=00) - cập nhật PAID và confirmed")
        void processCallback_successfulPayment_updatesToPaidAndConfirmed() {
            // Build proper hash
            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_TransactionNo", "TXN123456");

            String hash = VNPayUtil.hashAllFields(new HashMap<>(params), "TEST_HASH_SECRET");
            params.put("vnp_SecureHash", hash);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(samplePayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(samplePayment);

            boolean result = paymentService.processVNPayCallback(params);

            assertTrue(result);
            assertEquals(Payment.PaymentStatus.PAID, samplePayment.getPaymentStatus());
            assertNotNull(samplePayment.getPaidAt());
            assertEquals(Order.OrderStatus.pending, sampleOrder.getStatus());
            assertEquals("TXN123456", samplePayment.getTransactionCode());
            verify(auditLogService).log(eq(sampleUser), eq("PAYMENT_SUCCESS"), anyString());
            verify(notificationService).createNotification(eq(sampleUser), anyString(), anyString(), any(), any(), any());
        }

        @Test
        @DisplayName("Thanh toán thất bại (responseCode != 00) - cập nhật FAILED và hủy đơn hàng")
        void processCallback_failedPayment_updatesToFailed() {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "24");
            params.put("vnp_TransactionNo", "TXN654321");

            String hash = VNPayUtil.hashAllFields(new HashMap<>(params), "TEST_HASH_SECRET");
            params.put("vnp_SecureHash", hash);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(samplePayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(samplePayment);
            when(orderRepository.save(any(Order.class))).thenReturn(sampleOrder);

            boolean result = paymentService.processVNPayCallback(params);

            assertFalse(result);
            assertEquals(Payment.PaymentStatus.FAILED, samplePayment.getPaymentStatus());
            assertEquals(Order.OrderStatus.cancelled, sampleOrder.getStatus());
            verify(orderRepository).save(sampleOrder);
            verify(auditLogService).log(eq(sampleUser), eq("PAYMENT_FAILED"), anyString());
        }

        @Test
        @DisplayName("HashSecret cấu hình có khoảng trắng thừa - vẫn xác thực chữ ký callback thành công")
        void processCallback_hashSecretWithWhitespace_verifiesSignature() {
            ReflectionTestUtils.setField(paymentService, "vnp_HashSecret", " TEST_HASH_SECRET ");

            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_TransactionNo", "TXN999999");

            String hash = VNPayUtil.hashAllFields(new HashMap<>(params), "TEST_HASH_SECRET");
            params.put("vnp_SecureHash", hash);

            when(orderRepository.findById(1L)).thenReturn(Optional.of(sampleOrder));
            when(paymentRepository.findByOrderId(1L)).thenReturn(Optional.of(samplePayment));
            when(paymentRepository.save(any(Payment.class))).thenReturn(samplePayment);

            boolean result = paymentService.processVNPayCallback(params);

            assertTrue(result);
        }

        @Test
        @DisplayName("Callback vnp_SecureHash rỗng - trả về false")
        void processCallback_blankSecureHash_returnsFalse() {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "   ");

            assertFalse(paymentService.processVNPayCallback(params));
        }

        @Test
        @DisplayName("HashSecret cấu hình rỗng - từ chối xác thực để tránh bypass chữ ký")
        void processCallback_blankHashSecret_throwsIllegalStateException() {
            ReflectionTestUtils.setField(paymentService, "vnp_HashSecret", "   ");

            Map<String, String> params = new HashMap<>();
            params.put("vnp_TxnRef", "1");
            params.put("vnp_ResponseCode", "00");
            params.put("vnp_SecureHash", "any-hash");

            assertThrows(IllegalStateException.class, () -> paymentService.processVNPayCallback(params));
        }
    }
}
