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
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;
import com.kltn.bookstore_be.payment.infrastructure.VNPayUtil;
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
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final CouponRepository couponRepository;
    private final PromotionRepository promotionRepository;
    private final PaymentRepository paymentRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final ProductReviewRepository reviewRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;
    private final ShipperRepository shipperRepository;

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
        User dbUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
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
            Cart cart = cartService.getCartForUser(dbUser.getId());
            List<CartItem> allItems = cartService.getCartItems(cart.getId());
            if (allItems.isEmpty()) {
                throw new RuntimeException("Giỏ hàng của bạn đang trống");
            }
            if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
                for (CartItem item : allItems) {
                    if (request.getCartItemIds().contains(item.getId())) {
                        cartItems.add(item);
                    }
                }
                if (cartItems.isEmpty()) {
                    throw new RuntimeException("Không tìm thấy sản phẩm nào được chọn trong giỏ hàng");
                }
            } else {
                cartItems.addAll(allItems);
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
                BigDecimal currentDisc = BigDecimal.ZERO;
                if (p.getDiscountType() == Promotion.DiscountType.PERCENT) {
                    currentDisc = totalAmount.multiply(p.getDiscountValue()).divide(BigDecimal.valueOf(100));
                    if (p.getMaxDiscountAmount() != null && currentDisc.compareTo(p.getMaxDiscountAmount()) > 0) {
                        currentDisc = p.getMaxDiscountAmount();
                    }
                } else {
                    currentDisc = p.getDiscountValue();
                }

                if (currentDisc.compareTo(promotionDiscount) > 0) {
                    promotionDiscount = currentDisc;
                    activePromo = p;
                }
            }
        }

        // Apply Coupon Code
        BigDecimal couponDiscount = BigDecimal.ZERO;
        Coupon activeCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(request.getCouponCode().trim())
                    .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));

            if (couponWasChangedSinceSelection(coupon, request.getCouponSnapshot())) {
                throw new RuntimeException("Mã giảm giá đã được thay đổi. Vui lòng tải lại thông tin voucher và thực hiện đặt hàng lại.");
            }
            
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
            } else if (coupon.getDiscountType() == Coupon.DiscountType.FREESHIP) {
                couponDiscount = BigDecimal.ZERO;
            } else {
                couponDiscount = coupon.getDiscountValue();
            }

            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        String shippingAddress = request.getShippingAddress() != null && !request.getShippingAddress().isEmpty()
                ? request.getShippingAddress()
                : dbUser.getAddress();

        BigDecimal shippingFee = calculateShippingFee(shippingAddress, totalAmount);
        if (activeCoupon != null && activeCoupon.getDiscountType() == Coupon.DiscountType.FREESHIP) {
            BigDecimal freeshipReduction = (activeCoupon.getDiscountValue() != null && activeCoupon.getDiscountValue().compareTo(BigDecimal.ZERO) > 0)
                    ? activeCoupon.getDiscountValue().min(shippingFee)
                    : shippingFee;
            if (activeCoupon.getMaxDiscountAmount() != null && freeshipReduction.compareTo(activeCoupon.getMaxDiscountAmount()) > 0) {
                freeshipReduction = activeCoupon.getMaxDiscountAmount();
            }
            couponDiscount = freeshipReduction;
        }

        BigDecimal discountAmount = promotionDiscount.add(couponDiscount);

        BigDecimal finalAmountBeforePoints = totalAmount.subtract(discountAmount).add(shippingFee);
        if (finalAmountBeforePoints.compareTo(BigDecimal.ZERO) < 0) {
            finalAmountBeforePoints = BigDecimal.ZERO;
        }

        int pointsUsed = 0;
        BigDecimal pointsDiscount = BigDecimal.ZERO;
        if (Boolean.TRUE.equals(request.getUsePoints()) && dbUser.getRewardPoints() != null && dbUser.getRewardPoints() > 0) {
            BigDecimal userPointsValue = BigDecimal.valueOf(dbUser.getRewardPoints()).multiply(BigDecimal.valueOf(1000));
            if (userPointsValue.compareTo(finalAmountBeforePoints) >= 0) {
                pointsDiscount = finalAmountBeforePoints;
                pointsUsed = pointsDiscount.divide(BigDecimal.valueOf(1000), 0, java.math.RoundingMode.UP).intValue();
            } else {
                pointsDiscount = userPointsValue;
                pointsUsed = dbUser.getRewardPoints();
            }
            dbUser.setRewardPoints(dbUser.getRewardPoints() - pointsUsed);
            userRepository.save(dbUser);
        }

        BigDecimal finalAmount = finalAmountBeforePoints.subtract(pointsDiscount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        if (request.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            BigDecimal userBalance = BigDecimal.valueOf(dbUser.getWalletBalance() != null ? dbUser.getWalletBalance() : 0.0);
            if (userBalance.compareTo(finalAmount) < 0) {
                throw new RuntimeException("Số dư ví không đủ để thanh toán (cần: " + finalAmount + "đ, hiện có: " + userBalance + "đ)");
            }
            dbUser.setWalletBalance(dbUser.getWalletBalance() - finalAmount.doubleValue());
            userRepository.save(dbUser);
        }

        discountAmount = discountAmount.add(pointsDiscount);

        String recipientPhone = request.getRecipientPhone() != null && !request.getRecipientPhone().isEmpty()
                ? request.getRecipientPhone()
                : dbUser.getPhone();

        Order order = Order.builder()
                .user(dbUser)
                .promotion(activePromo)
                .coupon(activeCoupon)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .shippingFee(shippingFee)
                .finalAmount(finalAmount)
                .pointsUsed(pointsUsed)
                .pointsDiscount(pointsDiscount)
                .paymentMethod(request.getPaymentMethod())
                .shippingAddress(shippingAddress)
                .recipientPhone(recipientPhone)
                .status(Order.OrderStatus.pending)
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save order items
        if (singleProduct != null) {
            int requestedQty = request.getQuantity() != null ? request.getQuantity() : 1;
            BigDecimal origPrice = singleProduct.getPrice();
            BigDecimal sellingPrice = singleProduct.getPrice();
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(singleProduct)
                    .quantity(requestedQty)
                    .originalPrice(origPrice)
                    .unitPrice(sellingPrice)
                    .subtotal(totalAmount)
                    .build();
            orderItemRepository.save(orderItem);
        } else {
            for (CartItem item : cartItems) {
                BigDecimal origPrice = item.getProduct().getPrice();
                BigDecimal sellingPrice = (item.getQuantity() != null && item.getQuantity() > 0 && item.getSubtotal() != null)
                        ? item.getSubtotal().divide(BigDecimal.valueOf(item.getQuantity()), 2, java.math.RoundingMode.HALF_UP)
                        : origPrice;
                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .product(item.getProduct())
                        .quantity(item.getQuantity())
                        .originalPrice(origPrice)
                        .unitPrice(sellingPrice)
                        .subtotal(item.getSubtotal())
                        .build();
                orderItemRepository.save(orderItem);
            }
        }

        // Save Payment record
        Payment.PaymentMethod payMethod = Payment.PaymentMethod.COD;
        Payment.PaymentStatus payStatus = Payment.PaymentStatus.PENDING;
        LocalDateTime paidAt = null;

        if (request.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
            payMethod = Payment.PaymentMethod.VNPAY;
        } else if (request.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            payMethod = Payment.PaymentMethod.WALLET;
            payStatus = Payment.PaymentStatus.PAID;
            paidAt = LocalDateTime.now();
        }

        Payment payment = Payment.builder()
                .order(savedOrder)
                .paymentMethod(payMethod)
                .amount(finalAmount)
                .paymentStatus(payStatus)
                .paidAt(paidAt)
                .build();
        paymentRepository.save(payment);

        // Generate VNPAY payment link if method is VNPAY
        String paymentUrl = null;
        if (request.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
            paymentUrl = generateVNPayUrl(savedOrder, httpRequest);
        }

        // Clear user cart items (both for cart checkout and buy-now product if present in cart)
        if (singleProduct != null) {
            cartService.removeItemFromCart(dbUser.getId(), singleProduct.getId());
        } else {
            if (request.getCartItemIds() != null && !request.getCartItemIds().isEmpty()) {
                for (CartItem item : cartItems) {
                    cartService.removeItemFromCart(dbUser.getId(), item.getProduct().getId());
                }
            } else {
                Cart cart = cartService.getCartForUser(dbUser.getId());
                cartService.clearCart(cart.getId());
            }
        }

        // Audit Log and Notification
        auditLogService.log(dbUser, "CREATE_ORDER", "Khởi tạo đơn hàng #" + savedOrder.getId() + ", Tổng tiền: " + finalAmount + "đ");
        notificationService.createNotification(
                dbUser,
                "Đặt hàng thành công",
                "Đơn hàng #" + savedOrder.getId() + " đã được tạo thành công. Phương thức thanh toán: " + request.getPaymentMethod(),
                Notification.NotificationType.ORDER,
                "orders",
                savedOrder.getId()
        );
        notificationService.notifyManagersAndAdmins(
                "Đơn hàng mới #" + savedOrder.getId(),
                "Khách hàng " + dbUser.getFullName() + " đã đặt một đơn hàng mới trị giá " + finalAmount + "đ.",
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

    private boolean couponWasChangedSinceSelection(Coupon coupon, CheckoutRequest.CouponSnapshot snapshot) {
        if (snapshot == null) {
            return true;
        }
        return !Objects.equals(coupon.getId(), snapshot.getId())
                || !coupon.getDiscountType().name().equals(snapshot.getDiscountType())
                || differs(coupon.getDiscountValue(), snapshot.getDiscountValue())
                || differs(coupon.getMinOrderValue(), snapshot.getMinOrderValue())
                || differs(coupon.getMaxDiscountAmount(), snapshot.getMaxDiscountAmount());
    }

    private boolean differs(BigDecimal current, BigDecimal selected) {
        if (current == null || selected == null) {
            return current != selected;
        }
        return current.compareTo(selected) != 0;
    }

    private String generateVNPayUrl(Order order, HttpServletRequest httpRequest) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan don hang Bookstore #" + order.getId();
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

        ZoneId vnZone = ZoneId.of("Asia/Ho_Chi_Minh");
        ZonedDateTime nowVN = ZonedDateTime.now(vnZone);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(nowVN));
        
        // Expiration (15 minutes from creation)
        vnp_Params.put("vnp_ExpireDate", formatter.format(nowVN.plusMinutes(15)));

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
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
        order.setCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        // Restore inventory stock
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        for (OrderItem item : items) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productService.updateProduct(product.getId(), product);
        }

        // Update Payment status and refund to user's wallet if already paid (WALLET or VNPAY)
        paymentRepository.findByOrderId(orderId).ifPresent(p -> {
            if (p.getPaymentStatus() == Payment.PaymentStatus.PAID) {
                if (order.getPaymentMethod() == Order.PaymentMethod.WALLET || order.getPaymentMethod() == Order.PaymentMethod.VNPAY) {
                    User customer = order.getUser();
                    double refundAmount = order.getFinalAmount().doubleValue();
                    if (customer.getWalletBalance() == null) {
                        customer.setWalletBalance(0.0);
                    }
                    customer.setWalletBalance(customer.getWalletBalance() + refundAmount);
                    userRepository.save(customer);
                    auditLogService.log(user, "WALLET_REFUND", "Hủy đơn hàng #" + orderId + " (Thanh toán " + order.getPaymentMethod() + "), hoàn trả " + refundAmount + "đ vào ví của khách hàng " + customer.getEmail());
                }
                p.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
            } else {
                p.setPaymentStatus(Payment.PaymentStatus.FAILED);
            }
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
    public void updateOrderAddress(Long orderId, String newAddress, String newPhone, User user) {
        Order order = getOrderById(orderId);
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền sửa đổi đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.pending) {
            throw new RuntimeException("Chỉ có thể sửa đổi địa chỉ khi đơn hàng đang Chờ xác nhận.");
        }

        // Security check: Verify that new address has the exact same shipping fee to prevent fee evasion
        BigDecimal originalShippingFee = calculateShippingFee(order.getShippingAddress(), order.getTotalAmount());
        BigDecimal newShippingFee = calculateShippingFee(newAddress, order.getTotalAmount());
        if (originalShippingFee.compareTo(newShippingFee) != 0) {
            throw new RuntimeException("Không thể đổi sang địa chỉ thuộc khu vực có mức phí ship khác (Phí cũ: " 
                    + originalShippingFee.intValue() + "đ, Phí mới: " + newShippingFee.intValue() + "đ). Vui lòng hủy đơn và đặt lại đơn hàng mới.");
        }

        order.setShippingAddress(newAddress);
        if (newPhone != null && !newPhone.trim().isEmpty()) {
            order.setRecipientPhone(newPhone.trim());
        }
        orderRepository.save(order);

        auditLogService.log(user, "UPDATE_ORDER_ADDRESS", "Cập nhật địa chỉ đơn hàng #" + orderId + " sang: " + newAddress + (newPhone != null ? ", SĐT: " + newPhone : ""));
    }

    public BigDecimal calculateShippingFee(String shippingAddress, BigDecimal totalAmount) {
        BigDecimal shippingFee = BigDecimal.ZERO;
        if (totalAmount.compareTo(BigDecimal.valueOf(500000)) < 0) {
            if (shippingAddress == null || shippingAddress.trim().isEmpty()) {
                shippingFee = BigDecimal.valueOf(30000);
            } else {
                String addrLower = shippingAddress.toLowerCase();

                // 1. Nội tỉnh HCMC
                if (addrLower.contains("hồ chí minh") || addrLower.contains("hcm") 
                        || addrLower.contains("sài gòn") || addrLower.contains("sai gon")) {
                    shippingFee = BigDecimal.valueOf(15000);
                }
                // 2. Miền Nam & Lân cận
                else if (containsAny(addrLower, 
                        "bình dương", "binh duong", "bình phước", "binh phuoc", "tây ninh", "tay ninh", 
                        "đồng nai", "dong nai", "bà rịa", "ba ria", "vũng tàu", "vung tau", "brvt",
                        "long an", "tiền giang", "tien giang", "bến tre", "ben tre", "trà vinh", "tra vinh", 
                        "vĩnh long", "vinh long", "đồng tháp", "dong thap", "an giang", "kiên giang", "kien giang", 
                        "cần thơ", "can tho", "hậu giang", "hau giang", "sóc trăng", "soc trang", "bạc liêu", "bac lieu", 
                        "cà mau", "ca mau")) {
                    shippingFee = BigDecimal.valueOf(25000);
                }
                // 3. Miền Bắc
                else if (containsAny(addrLower, 
                        "hà nội", "ha noi", "hải phòng", "hai phong", "hải dương", "hai duong", "hưng yên", "hung yen",
                        "thái bình", "thai binh", "nam định", "nam dinh", "hà nam", "ha nam", "ninh bình", "ninh binh",
                        "vĩnh phúc", "vinh phuc", "bắc ninh", "bac ninh", "quảng ninh", "quang ninh", "lạng sơn", "lang son",
                        "cao bằng", "cao bang", "hà giang", "ha giang", "tuyên quang", "tuyen quang", "bắc kạn", "bac kan",
                        "thái nguyên", "thai nguyen", "phú thọ", "phu tho", "bắc giang", "bac giang", "lai châu", "lai chau",
                        "điện biên", "dien bien", "sơn la", "son la", "hòa bình", "hoa binh", "yên bái", "yen bai", "lào cai", "lao cai")) {
                    shippingFee = BigDecimal.valueOf(45000);
                }
                // 4. Miền Trung / Tây Nguyên
                else {
                    shippingFee = BigDecimal.valueOf(35000);
                }
            }
        }
        return shippingFee;
    }

    @Transactional
    public void requestReturn(Long orderId, String reason, String returnType, String evidenceImages, User user) {
        Order order = getOrderById(orderId);
        
        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền gửi yêu cầu đổi trả cho đơn hàng này");
        }

        if (order.getStatus() != Order.OrderStatus.delivered) {
            throw new RuntimeException("Chỉ có thể đổi trả cho đơn hàng đã giao thành công");
        }

        // Check if within 7 days
        if (order.getCreatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Đã quá thời hạn 07 ngày đổi trả kể từ khi nhận hàng");
        }

        // Check if already requested return
        Optional<ReturnRequest> existingOpt = returnRequestRepository.findByOrderId(orderId);
        if (existingOpt.isPresent()) {
            ReturnRequest existing = existingOpt.get();
            if (existing.getStatus() == ReturnRequest.ReturnStatus.REJECTED) {
                existing.setStatus(ReturnRequest.ReturnStatus.PENDING);
                existing.setReason(reason);
                existing.setEvidenceImages(evidenceImages);
                existing.setReturnType(returnType);
                existing.setRejectedReason(null);
                returnRequestRepository.save(existing);

                order.setStatus(Order.OrderStatus.cancel_requested);
                orderRepository.save(order);

                auditLogService.log(user, "RETURN_REQUEST_APPEAL", "Kháng nghị yêu cầu đổi trả đơn hàng #" + orderId + ", Loại: " + returnType + ", Lý do: " + reason);
                notificationService.createNotification(
                        user,
                        "Yêu cầu đổi trả đã được gửi lại (Kháng nghị)",
                        "Yêu cầu đổi trả đơn hàng #" + orderId + " đã được cập nhật thông tin và gửi lại để xem xét.",
                        Notification.NotificationType.RETURN,
                        "orders",
                        orderId
                );
                notificationService.notifyManagersAndAdmins(
                        "Kháng nghị yêu cầu đổi trả",
                        "Khách hàng đã gửi kháng nghị đổi trả cho đơn hàng #" + orderId,
                        Notification.NotificationType.RETURN,
                        "orders",
                        orderId
                );
                return;
            } else {
                throw new RuntimeException("Đơn hàng này đã gửi yêu cầu đổi trả trước đó");
            }
        }

        ReturnRequest returnRequest = ReturnRequest.builder()
                .order(order)
                .user(user)
                .reason(reason)
                .returnType(returnType)
                .evidenceImages(evidenceImages)
                .status(ReturnRequest.ReturnStatus.PENDING)
                .build();
        
        returnRequestRepository.save(returnRequest);

        order.setStatus(Order.OrderStatus.cancel_requested); // Or mapping to pending return request
        orderRepository.save(order);

        auditLogService.log(user, "RETURN_REQUEST", "Yêu cầu đổi trả đơn hàng #" + orderId + ", Loại: " + returnType + ", Lý do: " + reason);
        notificationService.createNotification(
                user,
                "Yêu cầu đổi trả đã được ghi nhận",
                "Yêu cầu đổi trả đơn hàng #" + orderId + " đang được xem xét xử lý.",
                Notification.NotificationType.RETURN,
                "orders",
                orderId
        );
        notificationService.notifyManagersAndAdmins(
                "Yêu cầu đổi trả mới",
                "Khách hàng đã gửi yêu cầu đổi trả cho đơn hàng #" + orderId,
                Notification.NotificationType.RETURN,
                "orders",
                orderId
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
            request.getOrder().setDeliveredAt(LocalDateTime.now());
        } else if (status == ReturnRequest.ReturnStatus.APPROVED) {
            request.getOrder().setStatus(Order.OrderStatus.refunded);
            request.getOrder().setRefundedAt(LocalDateTime.now());
            
            // Refund to user's wallet if returnType is RETURN_REFUND
            if ("RETURN_REFUND".equals(request.getReturnType())) {
                User user = request.getUser();
                double refundAmount = request.getOrder().getFinalAmount().doubleValue();
                if (user.getWalletBalance() == null) {
                    user.setWalletBalance(0.0);
                }
                user.setWalletBalance(user.getWalletBalance() + refundAmount);
                userRepository.save(user);
                auditLogService.log(manager, "WALLET_REFUND", "Hoàn tiền đơn hàng #" + request.getOrder().getId() + " số tiền: " + refundAmount + "đ vào ví của khách hàng " + user.getEmail());
                
                // Set payment status to REFUNDED
                paymentRepository.findByOrderId(request.getOrder().getId()).ifPresent(p -> {
                    p.setPaymentStatus(Payment.PaymentStatus.REFUNDED);
                    paymentRepository.save(p);
                });
            }

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
                "orders",
                request.getOrder().getId()
        );
        notificationService.notifyManagersAndAdmins(
                "Đã xử lý yêu cầu đổi trả",
                "Yêu cầu đổi trả đơn hàng #" + request.getOrder().getId() + " đã được xử lý sang: " + status,
                Notification.NotificationType.RETURN,
                "orders",
                request.getOrder().getId()
        );
    }

    public List<ReturnRequest> getAllReturnRequests() {
        return returnRequestRepository.findAll();
    }

    public List<ReturnRequest> getUserReturnRequests(Long userId) {
        return returnRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<ReturnRequest> getReturnRequestByOrderId(Long orderId) {
        return returnRequestRepository.findByOrderId(orderId);
    }

    public List<OrderItem> getOrderItems(Long orderId) {
        List<OrderItem> items = orderItemRepository.findByOrderId(orderId);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order != null && order.getUser() != null) {
            Long userId = order.getUser().getId();
            for (OrderItem item : items) {
                boolean isReviewed = reviewRepository.existsByUserIdAndProductIdAndOrderId(userId, item.getProduct().getId(), orderId);
                item.setReviewed(isReviewed);
            }
        }
        return items;
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional
    public void deliverOrder(Long orderId, User manager) {
        Order order = getOrderById(orderId);
        order.setStatus(Order.OrderStatus.delivered);
        order.setDeliveredAt(LocalDateTime.now());
        orderRepository.save(order);
        auditLogService.log(manager, "DELIVER_ORDER", "Đánh dấu đơn hàng #" + orderId + " đã giao hàng thành công.");
        
        notificationService.createNotification(
                order.getUser(),
                "Giao hàng thành công",
                "Đơn hàng #" + orderId + " đã được giao thành công.",
                Notification.NotificationType.ORDER,
                "orders",
                orderId
        );
        notificationService.notifyManagersAndAdmins(
                "Đơn hàng đã giao thành công",
                "Đơn hàng #" + orderId + " đã được giao thành công.",
                Notification.NotificationType.ORDER,
                "orders",
                orderId
        );
    }

    @Transactional
    public void assignShipper(Long orderId, Long shipperId, User manager) {
        Order order = getOrderById(orderId);
        Shipper shipper = shipperRepository.findById(shipperId)
                .orElseThrow(() -> new RuntimeException("Shipper không tồn tại"));
        order.setShipper(shipper);
        orderRepository.save(order);
        auditLogService.log(manager, "ASSIGN_SHIPPER", "Phân công shipper " + shipper.getFullName() + " cho đơn hàng #" + orderId);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, Order.OrderStatus status, User manager) {
        Order order = getOrderById(orderId);
        
        if (status == Order.OrderStatus.cancelled) {
            cancelOrder(orderId, "Hủy bởi quản trị viên", manager);
            return;
        }

        if (status == Order.OrderStatus.shipping && order.getShipper() == null) {
            throw new RuntimeException("Không thể chuyển sang trạng thái đang giao hàng khi chưa phân công shipper");
        }

        order.setStatus(status);
        if (status == Order.OrderStatus.confirmed) {
            order.setConfirmedAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.preparing) {
            order.setPreparingAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.shipping) {
            order.setShippingAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.delivered) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (status == Order.OrderStatus.refunded) {
            order.setRefundedAt(LocalDateTime.now());
        }
        orderRepository.save(order);
        auditLogService.log(manager, "UPDATE_ORDER_STATUS", "Cập nhật trạng thái đơn hàng #" + orderId + " sang: " + status);
        
        notificationService.createNotification(
                order.getUser(),
                "Cập nhật đơn hàng",
                "Đơn hàng #" + orderId + " đã thay đổi trạng thái sang: " + getStatusName(status),
                Notification.NotificationType.ORDER,
                "orders",
                orderId
        );
    }

    private String getStatusName(Order.OrderStatus status) {
        return switch (status) {
            case pending -> "Chờ xác nhận";
            case confirmed -> "Đã xác nhận";
            case preparing -> "Đang chuẩn bị";
            case shipping -> "Đang giao hàng";
            case delivered -> "Đã giao hàng";
            case cancelled -> "Đã hủy";
            case cancel_requested -> "Yêu cầu hủy";
            case refunded -> "Đã hoàn tiền";
        };
    }

    private boolean containsAny(String target, String... keywords) {
        if (target == null || keywords == null) {
            return false;
        }
        for (String keyword : keywords) {
            if (target.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
}
