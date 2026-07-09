package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.CouponCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponCodeRepository extends JpaRepository<CouponCode, Long> {

    Optional<CouponCode> findByCode(String code);

    Page<CouponCode> findByStatus(CouponCode.Status status, Pageable pageable);
}
