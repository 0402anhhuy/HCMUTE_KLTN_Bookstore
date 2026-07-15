package com.kltn.bookstore_be.identity.application;

import com.kltn.bookstore_be.common.MailService;
import com.kltn.bookstore_be.identity.domain.OtpToken;
import com.kltn.bookstore_be.identity.domain.OtpTokenRepository;
import com.kltn.bookstore_be.identity.domain.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @InjectMocks
    private OtpService otpService;

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private MailService mailService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("test@example.com")
                .build();
    }

    @Nested
    @DisplayName("Tạo và gửi OTP")
    class GenerateAndSendOtpTests {

        @Test
        @DisplayName("Tạo OTP đăng ký - tạo mã 6 chữ số và gửi email")
        void generateAndSendOtp_register_createsAndSendsEmail() {
            when(otpTokenRepository.save(any(OtpToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

            String otpCode = otpService.generateAndSendOtp(sampleUser, OtpToken.OtpType.REGISTER);

            assertNotNull(otpCode);
            assertEquals(6, otpCode.length());
            assertTrue(otpCode.matches("\\d{6}"));

            ArgumentCaptor<OtpToken> tokenCaptor = ArgumentCaptor.forClass(OtpToken.class);
            verify(otpTokenRepository).save(tokenCaptor.capture());
            OtpToken savedToken = tokenCaptor.getValue();

            assertEquals(sampleUser, savedToken.getUser());
            assertEquals(OtpToken.OtpType.REGISTER, savedToken.getType());
            assertFalse(savedToken.isVerified());
            assertNotNull(savedToken.getExpiresAt());

            verify(mailService).sendOtpEmail(eq("test@example.com"), eq(otpCode), eq("Đăng ký tài khoản"));
        }

        @Test
        @DisplayName("Tạo OTP khôi phục mật khẩu - gửi email đúng loại")
        void generateAndSendOtp_resetPassword_sendsCorrectType() {
            when(otpTokenRepository.save(any(OtpToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

            String otpCode = otpService.generateAndSendOtp(sampleUser, OtpToken.OtpType.RESET_PASSWORD);

            verify(mailService).sendOtpEmail(eq("test@example.com"), eq(otpCode), eq("Khôi phục mật khẩu"));
        }
    }

    @Nested
    @DisplayName("Xác thực OTP")
    class VerifyOtpTests {

        @Test
        @DisplayName("Xác thực OTP hợp lệ - trả về true và đánh dấu verified")
        void verifyOtp_valid_returnsTrueAndMarksVerified() {
            OtpToken token = OtpToken.builder()
                    .id(1L)
                    .user(sampleUser)
                    .otpCode("123456")
                    .type(OtpToken.OtpType.REGISTER)
                    .expiresAt(LocalDateTime.now().plusMinutes(5))
                    .verified(false)
                    .build();

            when(otpTokenRepository.findByUserIdAndOtpCodeAndType(1L, "123456", OtpToken.OtpType.REGISTER))
                    .thenReturn(Optional.of(token));
            when(otpTokenRepository.save(any(OtpToken.class))).thenReturn(token);

            boolean result = otpService.verifyOtp(1L, "123456", OtpToken.OtpType.REGISTER);

            assertTrue(result);
            assertTrue(token.isVerified());
            verify(otpTokenRepository).save(token);
        }

        @Test
        @DisplayName("Xác thực OTP đã hết hạn - trả về false")
        void verifyOtp_expired_returnsFalse() {
            OtpToken token = OtpToken.builder()
                    .id(1L)
                    .user(sampleUser)
                    .otpCode("123456")
                    .type(OtpToken.OtpType.REGISTER)
                    .expiresAt(LocalDateTime.now().minusMinutes(1))
                    .verified(false)
                    .build();

            when(otpTokenRepository.findByUserIdAndOtpCodeAndType(1L, "123456", OtpToken.OtpType.REGISTER))
                    .thenReturn(Optional.of(token));

            boolean result = otpService.verifyOtp(1L, "123456", OtpToken.OtpType.REGISTER);

            assertFalse(result);
            verify(otpTokenRepository, never()).save(any());
        }

        @Test
        @DisplayName("Xác thực OTP đã được sử dụng - trả về false")
        void verifyOtp_alreadyVerified_returnsFalse() {
            OtpToken token = OtpToken.builder()
                    .id(1L)
                    .user(sampleUser)
                    .otpCode("123456")
                    .type(OtpToken.OtpType.REGISTER)
                    .expiresAt(LocalDateTime.now().plusMinutes(5))
                    .verified(true)
                    .build();

            when(otpTokenRepository.findByUserIdAndOtpCodeAndType(1L, "123456", OtpToken.OtpType.REGISTER))
                    .thenReturn(Optional.of(token));

            boolean result = otpService.verifyOtp(1L, "123456", OtpToken.OtpType.REGISTER);

            assertFalse(result);
        }

        @Test
        @DisplayName("Xác thực OTP không tồn tại - trả về false")
        void verifyOtp_notFound_returnsFalse() {
            when(otpTokenRepository.findByUserIdAndOtpCodeAndType(1L, "999999", OtpToken.OtpType.REGISTER))
                    .thenReturn(Optional.empty());

            boolean result = otpService.verifyOtp(1L, "999999", OtpToken.OtpType.REGISTER);

            assertFalse(result);
        }
    }
}
