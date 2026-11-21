package com.kltn.bookstore_be.ordering.presentation;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.application.CouponRequest;
import com.kltn.bookstore_be.ordering.application.CouponService;
import com.kltn.bookstore_be.ordering.domain.Coupon;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getCoupons() {
        try {
            User user = userService.getAuthenticatedUser();
            List<Coupon> coupons;

            // Nếu là Admin hoặc Manager thì cho phép lấy toàn bộ danh sách Coupons
            if (user.getRole() != null
                    && (user.getRole().name().equals("ADMIN") || user.getRole().name().equals("MANAGER"))) {
                coupons = couponService.getAllCoupons();
            } else {
                // Người dùng thông thường chỉ lấy các coupon gán riêng họ, hoặc coupon chung (null user)
                coupons = couponService.getCouponsForUser(user.getId());
            }

            return ResponseEntity.ok(coupons);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody CouponRequest request) {
        try {
            User user = userService.getAuthenticatedUser();
            if (user.getRole() == null || (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Chỉ Admin/Manager mới có quyền tạo mã giảm giá"));
            }

            Coupon newCoupon = couponService.createCoupon(request);
            return ResponseEntity.ok(newCoupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody CouponRequest request) {
        try {
            User user = userService.getAuthenticatedUser();
            if (user.getRole() == null || (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Chỉ Admin/Manager mới có quyền cập nhật mã giảm giá"));
            }

            Coupon updatedCoupon = couponService.updateCoupon(id, request);
            return ResponseEntity.ok(updatedCoupon);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoupon(@PathVariable Long id) {
        try {
            User user = userService.getAuthenticatedUser();
            if (user.getRole() == null || (!user.getRole().name().equals("ADMIN") && !user.getRole().name().equals("MANAGER"))) {
                return ResponseEntity.status(403).body(Map.of("error", "Chỉ Admin/Manager mới có quyền xóa mã giảm giá"));
            }

            couponService.deleteCoupon(id);
            return ResponseEntity.ok(Map.of("message", "Xóa mã giảm giá thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
