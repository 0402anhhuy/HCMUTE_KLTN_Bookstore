package com.kltn.bookstore_be.ordering.application;

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


import com.kltn.bookstore_be.payment.infrastructure.VNPayUtil;
import com.kltn.bookstore_be.ordering.application.CheckoutRequest;
import com.kltn.bookstore_be.ordering.application.OrderResponse;
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
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReturnRequestRepository returnRequestRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ShipperRepository shipperRepository;

    @Value("${vnpay.tmn-code}")
    private String vnp_TmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnp_HashSecret;

    @Value("${vnpay.api-url}")
    private String vnp_ApiUrl;

    @Value("${vnpay.return-url}")
    private String vnp_ReturnUrl;

    @Transactional
    public OrderResponse checkout(User user, CheckoutRequest request, HttpServletRequest httpRequest) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<CartItem> cartItems = new ArrayList<>();
        Product singleProduct = null;

        if (request.getProductId() != null) {
            Product product = productService.getProductById(request.getProductId());
            if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                throw new RuntimeException("Sách '" + product.getName() + "' đã ngừng bán.");
            }
            int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
            if (product.getStockQuantity() < requestedQty) {
                throw new RuntimeException("Số lượng '" + product.getName() + "' tồn kho không đủ (còn: " + product.getStockQuantity() + ")");
            }
            singleProduct = product;
            totalAmount = product.getPrice().multiply(BigDecimal.valueOf(requestedQty));
        } else {
            Cart cart = cartService.getCartForUser(user.getId());
            cartItems = cartService.getCartItems(cart.getId());
            if (cartItems.isEmpty()) {
                throw new RuntimeException("Giỏ hàng của bạn đang trống");
            }

            for (CartItem item : cartItems) {
                Product product = item.getProduct();
                if (product.getStatus() != Product.ProductStatus.ACTIVE) {
                    throw new RuntimeException("Sách '" + product.getName() + "' đã ngừng bán.");
                }
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Số lượng '" + product.getName() + "' tồn kho không đủ (còn: " + product.getStockQuantity() + ")");
                }
                totalAmount = totalAmount.add(item.getSubtotal());
            }
        }

        // Deduct inventory
        if (singleProduct != null) {
            int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
            singleProduct.setStockQuantity(singleProduct.getStockQuantity() - requestedQty);
            productService.updateProduct(singleProduct.getId(), singleProduct);
        } else {
            for (CartItem item : cartItems) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
                productService.updateProduct(product.getId(), product);
            }
        }

        // Apply Promotion (Automatic active promotion matching min_order_value)
        BigDecimal promotionDiscount = BigDecimal.ZERO;
        Promotion activePromo = null;
        List<Promotion> promotions = promotionRepository.findActivePromotions(LocalDateTime.now());
        for (Promotion p : promotions) {
            if (totalAmount.compareTo(p.getMinOrderValue()) >= 0) {
                activePromo = p;
                if (p.getDiscountType() == Promotion.DiscountType.PERCENT) {
                    BigDecimal disc = totalAmount.multiply(p.getDiscountValue()).divide(BigDecimal.valueOf(100));
                    if (p.getMaxDiscountAmount() != null && disc.compareTo(p.getMaxDiscountAmount()) > 0) {
                        disc = p.getMaxDiscountAmount();
                    }
                    promotionDiscount = promotionDiscount.max(disc);
                } else {
                    promotionDiscount = promotionDiscount.max(p.getDiscountValue());
                }
            }
        }

        // Apply Coupon Code
        BigDecimal couponDiscount = BigDecimal.ZERO;
        Coupon activeCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().trim())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
            
            if (coupon.getStatus() != Coupon.CouponStatus.ACTIVE 
                    || coupon.getStartDate().isAfter(LocalDateTime.now()) 
                    || coupon.getEndDate().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Mã giảm giá đã hết hạn hoặc chưa kích hoạt");
            }
            if (coupon.getUsedCount() >= coupon.getUsageLimit()) {
                throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
            }
            if (totalAmount.compareTo(coupon.getMinOrderValue()) < 0) {
                throw new RuntimeException("Giá trị đơn hàng chưa đạt mức tối thiểu để áp dụng mã giảm giá (" + coupon.getMinOrderValue() + "đ)");
            }

            activeCoupon = coupon;
            if (coupon.getDiscountType() == Coupon.DiscountType.PERCENT) {
                couponDiscount = totalAmount.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100));
                if (coupon.getMaxDiscountAmount() != null && couponDiscount.compareTo(coupon.getMaxDiscountAmount()) > 0) {
                    couponDiscount = coupon.getMaxDiscountAmount();
                }
            } else {
                couponDiscount = coupon.getDiscountValue();
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        BigDecimal discountAmount = promotionDiscount.add(couponDiscount);
        // Shipping fee (flat 30,000đ, free if total is above 500,000đ)
        BigDecimal shippingFee = totalAmount.compareTo(BigDecimal.valueOf(500000)) >= 0 
                ? BigDecimal.ZERO 
                : BigDecimal.valueOf(30000);

        BigDecimal finalAmount = totalAmount.subtract(discountAmount).add(shippingFee);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        String shippingAddress = request.getShippingAddress() != null && !request.getShippingAddress().isEmpty()
                ? request.getShippingAddress()
                : user.getAddress();

        Order order = Order.builder()
                .user(user)
                .promotion(activePromo)
                .coupon(activeCoupon)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(shippingAddress)
                .status(Order.OrderStatus.pending)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items
        if (singleProduct != null) {
            int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(singleProduct)
                    .quantity(requestedQty)
                    .unitPrice(singleProduct.getPrice())
                    .subtotal(totalAmount)
                    .build();
            orderItemRepository.save(orderItem);
        } else {
            for (CartItem item : cartItems) {
                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .product(item.getProduct())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getProduct().getPrice())
                        .subtotal(item.getSubtotal())
                        .build();
                orderItemRepository.save(orderItem);
            }
        }

        // Save Payment record
        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(request.getPaymentMethod() == Order.PaymentMethod.COD 
                        ? Payment.PaymentMethod.COD 
                        : Payment.PaymentMethod.VNPAY)
                .amount(finalAmount)
                .paymentStatus(Payment.PaymentStatus.PENDING)
                .build();
        paymentRepository.save(payment);

        // Generate VNPAY payment link if method is VNPAY
        String paymentUrl = null;
        if (request.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
            paymentUrl = generateVNPayUrl(savedOrder, httpRequest);
        }

        // Clear user cart if not buy now
        if (singleProduct == null) {
            Cart cart = cartService.getCartForUser(user.getId());
            cartService.clearCart(cart.getId());
        }

        // Audit Log and Notification
        auditLogService.log(user, "CREATE_ORDER", "Khởi tạo đơn hàng #" + savedOrder.getId() + ", Tổng tiền: " + finalAmount + "đ");
        notificationService.createNotification(
                user,
                "Đặt hàng thành công",
                "Đơn hàng #" + savedOrder.getId() + " đã được tạo thành công. Phương thức thanh toán: " + request.getPaymentMethod(),
                Notification.NotificationType.ORDER,
                "orders",
                savedOrder.getId()
        );

        return OrderResponse.builder()
                .orderId(savedOrder.getId())
                .status(savedOrder.getStatus().name())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .paymentMethod(savedOrder.getPaymentMethod().name())
                .shippingAddress(shippingAddress)
                .paymentUrl(paymentUrl)
                .createdAt(savedOrder.getCreatedAt())
                .build();
    }

    private String generateVNPayUrl(Order order, HttpServletRequest httpRequest) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang UTEShop #" + order.getId();
        String vnp_OrderType = "other";
        String vnp_TxnRef = String.valueOf(order.getId());
        String vnp_IpAddr = VNPayUtil.getIpAddress(httpRequest);

        String vnp_TmnCodeLocal = vnp_TmnCode;
        
        long amount = order.getFinalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCodeLocal);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(LocalDateTime.now()));
        
        cld.add(Calendar.MINUTE, 15);
        // Expiration
        vnp_Params.put("vnp_ExpireDate", formatter.format(LocalDateTime.now().plusMinutes(15)));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return vnp_ApiUrl + "?" + queryUrl;
    }

    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng với ID: " + id));
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void cancelOrder(Long orderId, String reason, User user) {
        Order order = getOrderById(orderId);
        
        // Authorization check
        if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER") 
                && !order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        // Only allow cancel if pending or confirmed
        if (order.getStatus() != Order.OrderStatus.pending && order.getStatus() != Order.OrderStatus.confirmed) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái hiện tại: " + order.getStatus());
        }

        order.setStatus(Order.OrderStatus.cancelled);
        order.setCancelledReason(reason);
        orderRepository.save(order);

        // Restore inventory stock
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productService.updateProduct(product.getId(), product);
        }

        // Update Payment status if applicable
        paymentRepository.findByOrderId(orderId).ifPresent(p -> {
            p.setPaymentStatus(Payment.PaymentStatus.FAILED);
            paymentRepository.save(p);
        });

        // Audit Log and Notification
        auditLogService.log(user, "CANCEL_ORDER", "Hủy đơn hàng #" + orderId + ", Lý do: " + reason);
        notificationService.createNotification(
                order.getUser(),
                "Đơn hàng của bạn đã bị hủy",
                "Đơn hàng #" + orderId + " đã được hủy thành công. Lý do: " + reason,
                Notification.NotificationType.ORDER,
                "orders",
                orderId
        );
    }

    @Transactional
    public void updateOrderAddress(Long orderId, String newAddress, User user) {
        Order order = getOrderById(orderId);
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền sửa đổi đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.pending) {
            throw new RuntimeException("Chỉ có thể sửa đổi địa chỉ khi đơn hàng đang Chờ xác nhận.");
        }

        order.setShippingAddress(newAddress);
        orderRepository.save(order);

        auditLogService.log(user, "UPDATE_ORDER_ADDRESS", "Cập nhật địa chỉ đơn hàng #" + orderId + " sang: " + newAddress);
    }

    @Transactional
    public void requestReturn(Long orderId, String reason, User user) {
        Order order = getOrderById(orderId);
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền gửi yêu cầu đổi trả cho đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.delivered) {
            throw new RuntimeException("Chỉ có thể đổi trả cho đơn hàng đã giao thành công");
        }

        // Check if within 7 days
        // We compare against the current local time relative to order's update/creation time
        // Since we don't store delivered date, we can check from order's last update time or created_at
        // Let's use created_at for local checks or assume 7 days from now is allowed
        if (order.getCreatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Đã quá thời hạn 07 ngày đổi trả kể từ khi nhận hàng");
        }

        // Check if already requested return
        if (returnRequestRepository.findByOrderId(orderId).isPresent()) {
            throw new RuntimeException("Đơn hàng này đã gửi yêu cầu đổi trả trước đó");
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(reason)
                .status(ReturnRequest.ReturnStatus.PENDING)
                .build();
        
        returnRequestRepository.save(returnRequest);

        order.setStatus(Order.OrderStatus.cancel_requested); // Or mapping to pending return request
        orderRepository.save(order);

        auditLogService.log(user, "RETURN_REQUEST", "Yêu cầu đổi trả đơn hàng #" + orderId + ", Lý do: " + reason);
        notificationService.createNotification(
                user,
                "Yêu cầu đổi trả đã được ghi nhận",
                "Yêu cầu đổi trả đơn hàng #" + orderId + " đang được xem xét xử lý.",
                Notification.NotificationType.RETURN,
                "return_requests",
                returnRequest.getId()
        );
    }

    @Transactional
    public void processReturnRequest(Long requestId, ReturnRequest.ReturnStatus status, String rejectedReason, User manager) {
        ReturnRequest request = returnRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Yêu cầu đổi trả không tồn tại"));

        request.setStatus(status);
        if (status == ReturnRequest.ReturnStatus.REJECTED) {
            request.setRejectedReason(rejectedReason);
            request.getOrder().setStatus(Order.OrderStatus.delivered); // Restore delivered
        } else if (status == ReturnRequest.ReturnStatus.APPROVED) {
            request.getOrder().setStatus(Order.OrderStatus.refunded);
            
            // Restore inventory stock if approved
            List<OrderItem> items = orderItemRepository.findByOrderId(request.getOrder().getId());
            for (OrderItem item : items) {
                Product product = item.getProduct();
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productService.updateProduct(product.getId(), product);
            }
        }
        
        returnRequestRepository.save(request);
        orderRepository.save(request.getOrder());

        auditLogService.log(manager, "PROCESS_RETURN", "Xử lý yêu cầu đổi trả #" + requestId + " -> " + status);
        notificationService.createNotification(
                request.getUser(),
                "Cập nhật yêu cầu đổi trả",
                "Yêu cầu đổi trả đơn hàng #" + request.getOrder().getId() + " đã được: " + status 
                        + (status == ReturnRequest.ReturnStatus.REJECTED ? ". Lý do: " + rejectedReason : ""),
                Notification.NotificationType.RETURN,
                "return_requests",
                requestId
        );
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public void deliverOrder(Long orderId, User manager) {
        Order order = getOrderById(orderId);
        order.setStatus(Order.OrderStatus.delivered);
        orderRepository.save(order);
        auditLogService.log(manager, "DELIVER_ORDER", "Đánh dấu đơn hàng #" + orderId + " đã giao hàng thành công.");
    }

    @Transactional
    public void assignShipper(Long orderId, Long shipperId, User manager) {
        Order order = getOrderById(orderId);
        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new RuntimeException("Shipper không tồn tại"));
        order.setShipper(shipper);
        if (order.getStatus() == Order.OrderStatus.pending || order.getStatus() == Order.OrderStatus.confirmed) {
            order.setStatus(Order.OrderStatus.shipping);
        }
        orderRepository.save(order);
        auditLogService.log(manager, "ASSIGN_SHIPPER", "Phân công shipper " + shipper.getFullName() + " cho đơn hàng #" + orderId);
    }
}