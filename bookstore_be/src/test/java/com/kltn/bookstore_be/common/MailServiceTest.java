package com.kltn.bookstore_be.common;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private MailService mailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(mailService, "fromEmail", "noreply@bookstore.com");
    }

    @Test
    @DisplayName("Gửi OTP thành công qua JavaMailSender")
    void sendOtpEmail_success() {
        mailService.sendOtpEmail("user@example.com", "123456", "Đăng ký tài khoản");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, times(1)).send(captor.capture());

        SimpleMailMessage sentMessage = captor.getValue();
        assertEquals("user@example.com", Objects.requireNonNull(sentMessage.getTo())[0]);
        assertEquals("noreply@bookstore.com", sentMessage.getFrom());
        assertTrue(Objects.requireNonNull(sentMessage.getSubject()).contains("OTP"));
        assertTrue(Objects.requireNonNull(sentMessage.getText()).contains("123456"));
    }

    @Test
    @DisplayName("Bắt ngoại lệ an toàn khi JavaMailSender gặp lỗi gửi thư")
    void sendOtpEmail_handlesMailExceptionGracefully() {
        doThrow(new MailSendException("SMTP connection timed out")).when(mailSender).send(any(SimpleMailMessage.class));

        assertDoesNotThrow(() -> mailService.sendOtpEmail("user@example.com", "123456", "Đăng ký tài khoản"));
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
