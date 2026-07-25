package com.kltn.bookstore_be.ordering.presentation;

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


import com.kltn.bookstore_be.ordering.application.CheckoutRequest;
import com.kltn.bookstore_be.ordering.application.OrderResponse;
import com.kltn.bookstore_be.ordering.domain.Order;
import com.kltn.bookstore_be.ordering.domain.OrderItem;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.application.OrderService;
import com.kltn.bookstore_be.identity.application.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private CouponRepository couponRepository;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng chưa được xác thực"));
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@Valid @RequestBody CheckoutRequest request, HttpServletRequest httpRequest) {
        try {
            User user = getAuthenticatedUser();
            OrderResponse response = orderService.checkout(user, request, httpRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getMyOrders() {
        try {
            User user = getAuthenticatedUser();
            List<Order> orders = orderService.getUserOrders(user.getId());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            Order order = orderService.getOrderById(id);
            
            // Check authorization
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER") 
                    && !order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xem đơn hàng này"));
            }

            List<OrderItem> items = orderService.getOrderItems(id);
            return ResponseEntity.ok(Map.of(
                    "order", order,
                    "items", items
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id, @RequestParam String reason) {
        try {
            User user = getAuthenticatedUser();
            orderService.cancelOrder(id, reason, user);
            return ResponseEntity.ok(Map.of("message", "Đơn hàng đã được hủy thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/address")
    public ResponseEntity<?> updateAddress(
            @PathVariable Long id, 
            @RequestParam String address,
            @RequestParam(required = false) String phone) {
        try {
            User user = getAuthenticatedUser();
            orderService.updateOrderAddress(id, address, phone, user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật địa chỉ nhận hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<?> requestReturn(
            @PathVariable Long id, 
            @RequestParam String reason,
            @RequestParam(required = false, defaultValue = "RETURN_REFUND") String returnType,
            @RequestParam(required = false) String evidenceImages) {
        try {
            User user = getAuthenticatedUser();
            orderService.requestReturn(id, reason, returnType, evidenceImages, user);
            return ResponseEntity.ok(Map.of("message", "Yêu cầu đổi trả đã được gửi thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/returns/my")
    public ResponseEntity<?> getMyReturnRequests() {
        try {
            User user = getAuthenticatedUser();
            List<ReturnRequest> returns = orderService.getUserReturnRequests(user.getId());
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/returns")
    public ResponseEntity<?> getAllReturnRequests() {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            List<ReturnRequest> returns = orderService.getAllReturnRequests();
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/returns/{requestId}/process")
    public ResponseEntity<?> processReturnRequest(
            @PathVariable Long requestId,
            @RequestParam ReturnRequest.ReturnStatus status,
            @RequestParam(required = false) String rejectedReason) {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            orderService.processReturnRequest(requestId, status, rejectedReason, user);
            return ResponseEntity.ok(Map.of("message", "Xử lý yêu cầu đổi trả thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/return")
    public ResponseEntity<?> getOrderReturnRequest(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            Order order = orderService.getOrderById(id);
            
            // Check authorization
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER") 
                    && !order.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền xem thông tin đổi trả của đơn hàng này"));
            }

            ReturnRequest returnRequest = orderService.getReturnRequestByOrderId(id).orElse(null);
            return ResponseEntity.ok(returnRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllOrders() {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            List<Order> orders = orderService.getAllOrders();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/deliver")
    public ResponseEntity<?> deliverOrder(@PathVariable Long id) {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            orderService.deliverOrder(id, user);
            return ResponseEntity.ok(Map.of("message", "Đơn hàng đã được đánh dấu giao hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/assign-shipper")
    public ResponseEntity<?> assignShipper(@PathVariable Long id, @RequestParam Long shipperId) {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            orderService.assignShipper(id, shipperId, user);
            return ResponseEntity.ok(Map.of("message", "Đã phân công shipper thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam Order.OrderStatus status) {
        try {
            User user = getAuthenticatedUser();
            if (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER")) {
                return ResponseEntity.status(403).body(Map.of("error", "Bạn không có quyền thực hiện chức năng này"));
            }
            orderService.updateOrderStatus(id, status, user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái đơn hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/coupons")
    public ResponseEntity<?> getCoupons() {
        try {
            User user = getAuthenticatedUser();
            List<Coupon> coupons = couponRepository.findByUserIdOrUserIsNull(user.getId());
            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}