package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.domain.Coupon;
import com.kltn.bookstore_be.ordering.domain.CouponRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {

    @InjectMocks
    private CouponService couponService;

    @Mock
    private CouponRepository couponRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private UserService userService;

    private CouponRequest baseRequest(String code) {
        CouponRequest req = new CouponRequest();
        req.setCode(code);
        req.setMinOrderAmount(BigDecimal.valueOf(100000));
        req.setMaxDiscountAmount(BigDecimal.valueOf(50000));
        req.setValidFrom(LocalDateTime.of(2026, 11, 1, 0, 0));
        req.setValidTo(LocalDateTime.of(2026, 12, 1, 0, 0));
        req.setUsageLimit(100);
        req.setActive(true);
        return req;
    }

    @Test
    @DisplayName("Truy vấn danh sách coupon theo user và tất cả coupon")
    void queryCoupons_returnsExpectedLists() {
        Coupon coupon = Coupon.builder().id(1L).code("SALE10").build();
        when(couponRepository.findByUserIdOrUserIsNull(5L)).thenReturn(List.of(coupon));
        when(couponRepository.findAll()).thenReturn(List.of(coupon));

        assertEquals(1, couponService.getCouponsForUser(5L).size());
        assertEquals(1, couponService.getAllCoupons().size());
    }

    @Test
    @DisplayName("createCoupon tạo thành công mã giảm theo % và theo số tiền cố định")
    void createCoupon_percentAndFixed_succeeds() {
        CouponRequest percentReq = baseRequest("PCT10");
        percentReq.setDiscountPercentage(BigDecimal.TEN);
        when(couponRepository.findByCode("PCT10")).thenReturn(Optional.empty());
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        Coupon createdPct = couponService.createCoupon(percentReq);
        assertEquals(Coupon.DiscountType.PERCENT, createdPct.getDiscountType());
        assertEquals(Coupon.CouponStatus.ACTIVE, createdPct.getStatus());

        CouponRequest fixedReq = baseRequest("FIX20K");
        fixedReq.setDiscountAmount(BigDecimal.valueOf(20000));
        fixedReq.setActive(false);
        when(couponRepository.findByCode("FIX20K")).thenReturn(Optional.empty());

        Coupon createdFixed = couponService.createCoupon(fixedReq);
        assertEquals(Coupon.DiscountType.FIXED, createdFixed.getDiscountType());
        assertEquals(Coupon.CouponStatus.INACTIVE, createdFixed.getStatus());
    }

    @Test
    @DisplayName("createCoupon ném lỗi khi trùng mã, sai khoảng ngày, âm giá trị hoặc thiếu mức giảm")
    void createCoupon_invalidInputs_throwExceptions() {
        CouponRequest dup = baseRequest("DUP");
        when(couponRepository.findByCode("DUP")).thenReturn(Optional.of(Coupon.builder().build()));
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(dup));

        CouponRequest badDate = baseRequest("DATE");
        badDate.setValidTo(badDate.getValidFrom().minusDays(1));
        when(couponRepository.findByCode("DATE")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(badDate));

        CouponRequest negPct = baseRequest("NEG1");
        negPct.setDiscountPercentage(BigDecimal.valueOf(-5));
        when(couponRepository.findByCode("NEG1")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(negPct));

        CouponRequest negAmt = baseRequest("NEG2");
        negAmt.setDiscountAmount(BigDecimal.valueOf(-100));
        when(couponRepository.findByCode("NEG2")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(negAmt));

        CouponRequest negLimit = baseRequest("NEG3");
        negLimit.setUsageLimit(-1);
        when(couponRepository.findByCode("NEG3")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(negLimit));

        CouponRequest missingValue = baseRequest("EMPTY");
        when(couponRepository.findByCode("EMPTY")).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.createCoupon(missingValue));
    }

    @Test
    @DisplayName("updateCoupon cập nhật các trường và kiểm tra trùng mã, ngày, giá trị âm")
    void updateCoupon_handlesAllBranches() {
        Coupon existing = Coupon.builder()
                .id(1L)
                .code("OLD")
                .discountType(Coupon.DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .status(Coupon.CouponStatus.ACTIVE)
                .build();

        when(couponRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.updateCoupon(99L, baseRequest("X")));

        when(couponRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(couponRepository.findByCode("TAKEN")).thenReturn(Optional.of(Coupon.builder().id(2L).code("TAKEN").build()));
        assertThrows(RuntimeException.class, () -> couponService.updateCoupon(1L, baseRequest("TAKEN")));

        CouponRequest badDate = baseRequest("OLD");
        badDate.setValidTo(badDate.getValidFrom().minusDays(2));
        assertThrows(RuntimeException.class, () -> couponService.updateCoupon(1L, badDate));

        CouponRequest negReq = baseRequest("OLD");
        negReq.setUsageLimit(-5);
        assertThrows(RuntimeException.class, () -> couponService.updateCoupon(1L, negReq));

        CouponRequest validFixed = baseRequest("NEWCODE");
        validFixed.setDiscountAmount(BigDecimal.valueOf(30000));
        validFixed.setActive(false);
        when(couponRepository.findByCode("NEWCODE")).thenReturn(Optional.empty());
        when(couponRepository.save(any(Coupon.class))).thenAnswer(inv -> inv.getArgument(0));

        Coupon updated = couponService.updateCoupon(1L, validFixed);
        assertEquals("NEWCODE", updated.getCode());
        assertEquals(Coupon.DiscountType.FIXED, updated.getDiscountType());
        assertEquals(Coupon.CouponStatus.INACTIVE, updated.getStatus());

        CouponRequest sameCodePct = baseRequest("NEWCODE");
        sameCodePct.setDiscountPercentage(BigDecimal.valueOf(15));
        sameCodePct.setActive(null);
        Coupon updatedPct = couponService.updateCoupon(1L, sameCodePct);
        assertEquals(Coupon.DiscountType.PERCENT, updatedPct.getDiscountType());
    }

    @Test
    @DisplayName("deleteCoupon xóa thành công kể cả khi audit user không khả dụng và ném lỗi khi không tìm thấy")
    void deleteCoupon_handlesSuccessAuditFallbackAndNotFound() {
        when(couponRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> couponService.deleteCoupon(99L));

        Coupon existing = Coupon.builder().id(1L).code("DEL1").build();
        User admin = User.builder().id(10L).email("admin@example.com").build();
        when(couponRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(userService.getAuthenticatedUser()).thenReturn(admin);

        couponService.deleteCoupon(1L);
        verify(couponRepository).deleteById(1L);
        verify(auditLogService).log(admin, "DELETE_COUPON", "Xóa mã giảm giá: DEL1");

        when(userService.getAuthenticatedUser()).thenThrow(new RuntimeException("No auth"));
        couponService.deleteCoupon(1L);
    }
}
