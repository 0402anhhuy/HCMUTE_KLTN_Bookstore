package com.kltn.bookstore_be.identity.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findByUserIdAndOtpCodeAndType(Long userId, String otpCode, OtpToken.OtpType type);
    Optional<OtpToken> findTopByUserIdAndTypeOrderByCreatedAtDesc(Long userId, OtpToken.OtpType type);
    void deleteByUserId(Long userId);
}