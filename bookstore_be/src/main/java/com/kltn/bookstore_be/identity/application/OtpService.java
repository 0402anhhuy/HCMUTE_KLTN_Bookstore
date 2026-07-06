package com.kltn.bookstore_be.identity.application;

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


import com.kltn.bookstore_be.identity.domain.OtpToken;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.domain.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {

    @Autowired
    private OtpTokenRepository otpTokenRepository;

    @Autowired
    private MailService mailService;

    @Transactional
    public String generateAndSendOtp(User user, OtpToken.OtpType type) {
        // Generate a 6-digit numeric OTP
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        
        OtpToken otpToken = OtpToken.builder()
                .user(user)
                .otpCode(otpCode)
                .type(type)
                .expiresAt(LocalDateTime.now().plusMinutes(5)) // Valid for 5 minutes
                .verified(false)
                .build();
        
        otpTokenRepository.save(otpToken);

        // Send Email
        String actionType = type == OtpToken.OtpType.REGISTER ? "Đăng ký tài khoản" : "Khôi phục mật khẩu";
        mailService.sendOtpEmail(user.getEmail(), otpCode, actionType);

        return otpCode;
    }

    @Transactional
    public boolean verifyOtp(Long userId, String otpCode, OtpToken.OtpType type) {
        return otpTokenRepository.findByUserIdAndOtpCodeAndType(userId, otpCode, type)
                .map(token -> {
                    if (token.isVerified()) {
                        return false;
                    }
                    if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
                        return false; // Expired
                    }
                    token.setVerified(true);
                    otpTokenRepository.save(token);
                    return true;
                })
                .orElse(false);
    }
}