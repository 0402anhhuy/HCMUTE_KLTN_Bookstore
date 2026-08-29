package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.domain.Coupon;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    
    private final CouponRepository couponRepository;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public List<Coupon> getCouponsForUser(Long userId) {
        return couponRepository.findByUserIdOrUserIsNull(userId);
    }

    // Lấy toàn bộ coupon (Dành riêng cho Admin Dashboard)
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public Coupon createCoupon(CouponRequest request) {
        if (couponRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã giảm giá đã tồn tại");
        }
        
        if (request.getValidTo() != null && request.getValidFrom() != null && request.getValidTo().isBefore(request.getValidFrom())) {
            throw new RuntimeException("Ngày hết hạn không được nhỏ hơn ngày bắt đầu");
        }

        if ((request.getDiscountPercentage() != null && request.getDiscountPercentage().compareTo(java.math.BigDecimal.ZERO) < 0) || 
            (request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) < 0) ||
            (request.getUsageLimit() != null && request.getUsageLimit() < 0)) {
            throw new RuntimeException("Các giá trị giảm giá hoặc số lượng mã không được âm");
        }

        Coupon coupon = Coupon.builder()
                .code(request.getCode())
                .minOrderValue(request.getMinOrderAmount())
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .startDate(request.getValidFrom())
                .endDate(request.getValidTo())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .status((request.getActive() != null && request.getActive()) ? Coupon.CouponStatus.ACTIVE : Coupon.CouponStatus.INACTIVE)
                .build();

        if (request.getDiscountPercentage() != null) {
            coupon.setDiscountType(Coupon.DiscountType.PERCENT);
            coupon.setDiscountValue(request.getDiscountPercentage());
        } else if (request.getDiscountAmount() != null) {
            coupon.setDiscountType(Coupon.DiscountType.FIXED);
            coupon.setDiscountValue(request.getDiscountAmount());
        } else {
            throw new RuntimeException("Phải cung cấp discountPercentage hoặc discountAmount");
        }

        return couponRepository.save(coupon);
    }

    // Cập nhật thẻ coupon
    public Coupon updateCoupon(Long id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá"));
                
        // Chỉ cập nhật mã code nếu code đó chưa bị trùng với coupon khác
        if (!coupon.getCode().equals(request.getCode()) && couponRepository.findByCode(request.getCode()).isPresent()) {
             throw new RuntimeException("Mã giảm giá mới đã bị trùng với một mã khác trong hệ thống");
        }

        if (request.getValidTo() != null && request.getValidFrom() != null && request.getValidTo().isBefore(request.getValidFrom())) {
            throw new RuntimeException("Ngày hết hạn không được nhỏ hơn ngày bắt đầu");
        }

        if ((request.getDiscountPercentage() != null && request.getDiscountPercentage().compareTo(java.math.BigDecimal.ZERO) < 0) || 
            (request.getDiscountAmount() != null && request.getDiscountAmount().compareTo(java.math.BigDecimal.ZERO) < 0) ||
            (request.getUsageLimit() != null && request.getUsageLimit() < 0)) {
            throw new RuntimeException("Các giá trị giảm giá hoăc số lượng mã không được âm");
        }

        coupon.setCode(request.getCode());
        coupon.setMinOrderValue(request.getMinOrderAmount());
        coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        coupon.setStartDate(request.getValidFrom());
        coupon.setEndDate(request.getValidTo());
        coupon.setUsageLimit(request.getUsageLimit());
        if (request.getActive() != null) {
             coupon.setStatus(request.getActive() ? Coupon.CouponStatus.ACTIVE : Coupon.CouponStatus.INACTIVE);
        }

        if (request.getDiscountPercentage() != null) {
            coupon.setDiscountType(Coupon.DiscountType.PERCENT);
            coupon.setDiscountValue(request.getDiscountPercentage());
        } else if (request.getDiscountAmount() != null) {
            coupon.setDiscountType(Coupon.DiscountType.FIXED);
            coupon.setDiscountValue(request.getDiscountAmount());
        }

        return couponRepository.save(coupon);
    }

    @Transactional
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id).orElseThrow(
            () -> new RuntimeException("Không tìm thấy mã giảm giá")
        );
        String code = coupon.getCode();
        couponRepository.deleteById(id);

        try {
            User admin = userService.getAuthenticatedUser();
            auditLogService.log(admin, "DELETE_COUPON", "Xóa mã giảm giá: " + code);
        } catch (Exception e) {
            // Ignore
        }
    }
}
