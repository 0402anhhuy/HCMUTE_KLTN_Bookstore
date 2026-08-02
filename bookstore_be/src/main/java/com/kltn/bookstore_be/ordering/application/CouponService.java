package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.ordering.domain.Coupon;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    
    private final CouponRepository couponRepository;

    // Lấy coupon của hệ thống hoặc dành riêng cho 1 user (cho Frontend User Site)
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

    public void deleteCoupon(Long id) {
        if (!couponRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy mã giảm giá");
        }
        couponRepository.deleteById(id);
    }
}
