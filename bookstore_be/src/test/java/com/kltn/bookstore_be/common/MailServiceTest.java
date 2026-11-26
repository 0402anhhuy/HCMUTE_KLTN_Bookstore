package com.kltn.bookstore_be.common;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.util.Objects;

import static org.hamcrest.Matchers.containsString;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

    private static final String APPS_SCRIPT_URL = "https://script.google.com/macros/s/test-deploy-id/exec";

    @Mock
    private JavaMailSender mailSender;

    private RestClient.Builder restClientBuilder;
    private MockRestServiceServer mockServer;
    private MailService mailService;

    @BeforeEach
    void setUp() {
        restClientBuilder = RestClient.builder();
        mockServer = MockRestServiceServer.bindTo(restClientBuilder).build();
        mailService = createMailService("noreply@bookstore.com", "", "");
    }

    private MailService createMailService(String fromEmail, String appsScriptUrl, String appsScriptSecret) {
        return new MailService(
                mailSender,
                restClientBuilder.build(),
                fromEmail,
                new MailService.AppsScriptConfig(appsScriptUrl, appsScriptSecret)
        );
    }

    @Test
    @DisplayName("Gửi OTP qua Google Apps Script HTTP Webhook khi có cấu hình URL")
    void sendOtpEmail_usesAppsScriptWhenUrlConfigured() {
        MailService appsScriptMailService = createMailService("noreply@bookstore.com", APPS_SCRIPT_URL, "my-secret");

        mockServer.expect(requestTo(APPS_SCRIPT_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.to").value("user@example.com"))
                .andExpect(jsonPath("$.subject").value(containsString("OTP")))
                .andExpect(jsonPath("$.body").value(containsString("777888")))
                .andExpect(jsonPath("$.secret").value("my-secret"))
                .andRespond(withSuccess("{\"ok\":true}", MediaType.APPLICATION_JSON));

        appsScriptMailService.sendOtpEmail("user@example.com", "777888", "Đăng ký tài khoản");

        mockServer.verify();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Fallback sang SMTP khi Google Apps Script trả về lỗi ok=false")
    void sendOtpEmail_fallsBackWhenAppsScriptReturnsErrorJson() {
        MailService appsScriptMailService = createMailService("noreply@bookstore.com", APPS_SCRIPT_URL, "wrong-secret");

        mockServer.expect(requestTo(APPS_SCRIPT_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"ok\":false,\"error\":\"Unauthorized\"}", MediaType.APPLICATION_JSON));

        assertDoesNotThrow(() -> appsScriptMailService.sendOtpEmail("user@example.com", "777888", "Đăng ký tài khoản"));

        mockServer.verify();
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Fallback sang SMTP khi Google Apps Script gặp lỗi HTTP 500")
    void sendOtpEmail_fallsBackToSmtpWhenAppsScriptHttpFails() {
        MailService appsScriptMailService = createMailService("noreply@bookstore.com", APPS_SCRIPT_URL, "my-secret");

        mockServer.expect(requestTo(APPS_SCRIPT_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        assertDoesNotThrow(() -> appsScriptMailService.sendOtpEmail("user@example.com", "112233", "Đăng ký tài khoản"));

        mockServer.verify();
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Gửi OTP thành công qua JavaMailSender khi chưa cấu hình Apps Script URL")
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

    @Test
    @DisplayName("Không gọi SMTP khi chưa cấu hình email người gửi")
    void sendOtpEmail_skipsSmtpWhenFromEmailBlank() {
        MailService unconfiguredMailService = createMailService("", "", "");

        assertDoesNotThrow(() -> unconfiguredMailService.sendOtpEmail("user@example.com", "112233", "Đăng ký tài khoản"));
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }
}
