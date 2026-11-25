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
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {

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

    private MailService createMailService(String fromEmail, String apiKey, String senderEmail) {
        return createMailService(fromEmail, apiKey, senderEmail, "", "");
    }

    private MailService createMailService(
            String fromEmail,
            String apiKey,
            String senderEmail,
            String appsScriptUrl,
            String appsScriptSecret) {
        return new MailService(
                mailSender,
                restClientBuilder.build(),
                fromEmail,
                new MailService.BrevoConfig(apiKey, MailService.DEFAULT_BREVO_API_URL, senderEmail, "Bookstore"),
                new MailService.AppsScriptConfig(appsScriptUrl, appsScriptSecret)
        );
    }

    @Test
    @DisplayName("Gửi OTP qua Google Apps Script HTTP Webhook khi có cấu hình URL")
    void sendOtpEmail_usesAppsScriptWhenUrlConfigured() {
        String appsScriptUrl = "https://script.google.com/macros/s/test-deploy-id/exec";
        MailService appsScriptMailService = createMailService(
                "noreply@bookstore.com",
                "",
                "",
                appsScriptUrl,
                "my-secret"
        );

        mockServer.expect(requestTo(appsScriptUrl))
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
        String appsScriptUrl = "https://script.google.com/macros/s/test-deploy-id/exec";
        MailService appsScriptMailService = createMailService(
                "noreply@bookstore.com",
                "",
                "",
                appsScriptUrl,
                "wrong-secret"
        );

        mockServer.expect(requestTo(appsScriptUrl))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("{\"ok\":false,\"error\":\"Unauthorized\"}", MediaType.APPLICATION_JSON));

        assertDoesNotThrow(() -> appsScriptMailService.sendOtpEmail("user@example.com", "777888", "Đăng ký tài khoản"));

        mockServer.verify();
        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Gửi OTP qua Brevo HTTP API khi có cấu hình API key")
    void sendOtpEmail_usesBrevoHttpApiWhenApiKeyConfigured() {
        MailService brevoMailService = createMailService("noreply@bookstore.com", "xkeysib-test-key", "sender@bookstore.com");

        mockServer.expect(requestTo(MailService.DEFAULT_BREVO_API_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(header("api-key", "xkeysib-test-key"))
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.sender.email").value("sender@bookstore.com"))
                .andExpect(jsonPath("$.sender.name").value("Bookstore"))
                .andExpect(jsonPath("$.to[0].email").value("user@example.com"))
                .andExpect(content().string(not(containsString("\"name\":null"))))
                .andExpect(jsonPath("$.subject").value(containsString("OTP")))
                .andExpect(jsonPath("$.textContent").value(containsString("654321")))
                .andRespond(withSuccess("{\"messageId\":\"<test@brevo>\"}", MediaType.APPLICATION_JSON));

        brevoMailService.sendOtpEmail("user@example.com", "654321", "Đăng ký tài khoản");

        mockServer.verify();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Gửi OTP thành công qua JavaMailSender khi chưa cấu hình Brevo API key")
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
    @DisplayName("Brevo dùng spring.mail.username làm sender khi chưa cấu hình brevo.sender-email")
    void sendOtpEmail_brevoFallsBackToFromEmailWhenSenderEmailBlank() {
        MailService brevoMailService = createMailService("fallback-sender@bookstore.com", "xkeysib-test-key", "");

        mockServer.expect(requestTo(MailService.DEFAULT_BREVO_API_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(jsonPath("$.sender.email").value("fallback-sender@bookstore.com"))
                .andRespond(withSuccess("{\"messageId\":\"<test@brevo>\"}", MediaType.APPLICATION_JSON));

        brevoMailService.sendOtpEmail("user@example.com", "999888", "Khôi phục mật khẩu");

        mockServer.verify();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    @DisplayName("Fallback sang SMTP khi Brevo HTTP API lỗi và không ném ngoại lệ")
    void sendOtpEmail_fallsBackToSmtpWhenBrevoFails() {
        MailService brevoMailService = createMailService("noreply@bookstore.com", "xkeysib-test-key", "sender@bookstore.com");

        mockServer.expect(requestTo(MailService.DEFAULT_BREVO_API_URL))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withServerError());

        assertDoesNotThrow(() -> brevoMailService.sendOtpEmail("user@example.com", "112233", "Đăng ký tài khoản"));

        mockServer.verify();
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
