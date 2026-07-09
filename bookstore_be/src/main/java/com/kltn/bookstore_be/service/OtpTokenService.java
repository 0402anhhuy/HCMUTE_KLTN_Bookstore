package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.OtpToken;
import com.kltn.bookstore_be.entity.User;
import com.kltn.bookstore_be.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpTokenService {

    private final OtpTokenRepository otpTokenRepository;

    public Optional<OtpToken> findByOtpCode(String otpCode) {
        return otpTokenRepository.findByOtpCodeAndVerifiedFalse(otpCode);
    }

    @Transactional
    public OtpToken createToken(User user, String otpCode, OtpToken.Type type, int expiryMinutes) {
        OtpToken otpToken = OtpToken.builder()
                .user(user)
                .otpCode(otpCode)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
                .verified(false)
                .build();
        return otpTokenRepository.save(otpToken);
    }

    @Transactional
    public boolean validateToken(String otpCode) {
        return otpTokenRepository.findByOtpCodeAndVerifiedFalse(otpCode)
                .filter(otp -> otp.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(otp -> {
                    otp.setVerified(true);
                    otpTokenRepository.save(otp);
                    return true;
                })
                .orElse(false);
    }
}
