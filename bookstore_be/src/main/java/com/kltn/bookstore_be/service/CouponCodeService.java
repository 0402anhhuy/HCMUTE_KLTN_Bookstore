package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.CouponCode;
import com.kltn.bookstore_be.repository.CouponCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CouponCodeService {

    private final CouponCodeRepository couponCodeRepository;

    public Page<CouponCode> findAll(Pageable pageable) {
        return couponCodeRepository.findAll(pageable);
    }

    public CouponCode findByCode(String code) {
        return couponCodeRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá: " + code));
    }

    public CouponCode findById(Long id) {
        return couponCodeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mã giảm giá với ID: " + id));
    }

    @Transactional
    public CouponCode save(CouponCode couponCode) {
        return couponCodeRepository.save(couponCode);
    }

    @Transactional
    public void deleteById(Long id) {
        couponCodeRepository.deleteById(id);
    }
}
