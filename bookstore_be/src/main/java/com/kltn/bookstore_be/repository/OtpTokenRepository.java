package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    Optional<OtpToken> findByOtpCodeAndVerifiedFalse(String otpCode);

    Optional<OtpToken> findByOtpCode(String otpCode);
}
