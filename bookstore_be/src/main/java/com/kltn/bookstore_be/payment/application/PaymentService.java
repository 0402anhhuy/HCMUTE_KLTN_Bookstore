package com.kltn.bookstore_be.payment.application;

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
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;

import com.kltn.bookstore_be.payment.infrastructure.VNPayUtil;
import com.kltn.bookstore_be.ordering.domain.Order;
import com.kltn.bookstore_be.payment.domain.Payment;
import com.kltn.bookstore_be.ordering.domain.OrderRepository;
import com.kltn.bookstore_be.payment.domain.PaymentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    @Transactional
    public boolean processVNPayCallback(Map<String, String> queryParams) {
        String vnp_SecureHash = queryParams.get("vnp_SecureHash");
        if (vnp_SecureHash == null) {
            return false;
        }

        // Verify Signature
        queryParams.remove("vnp_SecureHash");
        queryParams.remove("vnp_SecureHashType");

        String signValue = VNPayUtil.hashAllFields(queryParams, vnp_HashSecret);
        if (!signValue.equals(vnp_SecureHash)) {
            return false; // Signature mismatch
        }

        String orderIdStr = queryParams.get("vnp_TxnRef");
        String responseCode = queryParams.get("vnp_ResponseCode");
        String transactionCode = queryParams.get("vnp_TransactionNo");

        Long orderId = Long.parseLong(orderIdStr);
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Đơn hàng không tồn tại"));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thanh toán"));

        payment.setTransactionCode(transactionCode);

        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(Payment.PaymentStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            
            paymentRepository.save(payment);

            // Audit & Notify
            auditLogService.log(order.getUser(), "PAYMENT_SUCCESS", "Thanh toán thành công qua VNPay cho đơn hàng #" + orderId + ", GD: " + transactionCode);
            notificationService.createNotification(
                    order.getUser(),
                    "Thanh toán thành công",
                    "Đơn hàng #" + orderId + " đã được thanh toán thành công qua cổng VNPay.",
                    Notification.NotificationType.ORDER,
                    "orders",
                    orderId
            );
            return true;
        } else {
            payment.setPaymentStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(payment);

            auditLogService.log(order.getUser(), "PAYMENT_FAILED", "Thanh toán thất bại qua VNPay cho đơn hàng #" + orderId + ", Mã lỗi: " + responseCode);
            notificationService.createNotification(
                    order.getUser(),
                    "Thanh toán thất bại",
                    "Giao dịch thanh toán qua VNPay cho đơn hàng #" + orderId + " không thành công.",
                    Notification.NotificationType.ORDER,
                    "orders",
                    orderId
            );
            return false;
        }
    }
}