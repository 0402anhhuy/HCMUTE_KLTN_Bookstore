package com.kltn.bookstore_be.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.time.Duration;
import java.util.function.Supplier;

@Slf4j
@Service
public class MailService {

    private final JavaMailSender mailSender;
    private final Supplier<RestClient> restClientSupplier;
    private RestClient restClient;
    private final String fromEmail;
    private final AppsScriptConfig appsScriptConfig;

    record AppsScriptConfig(String url, String secret) {}

    private record AppsScriptEmailRequest(
            String to,
            String subject,
            String body,
            String secret) {}

    @Autowired
    public MailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            ObjectProvider<RestClient.Builder> restClientBuilderProvider,
            @Value("${spring.mail.username:}") String fromEmail,
            @Value("${mail.apps-script.url:}") String appsScriptUrl,
            @Value("${mail.apps-script.secret:}") String appsScriptSecret) {
        this(
                mailSenderProvider != null ? mailSenderProvider.getIfAvailable() : null,
                () -> buildRestClient(restClientBuilderProvider != null
                        ? restClientBuilderProvider.getIfAvailable(RestClient::builder)
                        : RestClient.builder()),
                fromEmail,
                new AppsScriptConfig(appsScriptUrl, appsScriptSecret)
        );
    }

    MailService(
            JavaMailSender mailSender,
            RestClient restClient,
            String fromEmail,
            AppsScriptConfig appsScriptConfig) {
        this(mailSender, () -> restClient, fromEmail, appsScriptConfig);
        this.restClient = restClient;
    }

    private MailService(
            JavaMailSender mailSender,
            Supplier<RestClient> restClientSupplier,
            String fromEmail,
            AppsScriptConfig appsScriptConfig) {
        this.mailSender = mailSender;
        this.restClientSupplier = restClientSupplier;
        this.fromEmail = fromEmail;
        this.appsScriptConfig = appsScriptConfig;
    }

    private synchronized RestClient getRestClient() {
        if (restClient == null) {
            restClient = restClientSupplier.get();
        }
        return restClient;
    }

    private static RestClient buildRestClient(RestClient.Builder builder) {
        HttpClient httpClient = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NORMAL)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(Duration.ofSeconds(8));
        return builder.requestFactory(requestFactory).build();
    }

    @Async("mailTaskExecutor")
    public void sendOtpEmail(String toEmail, String otpCode, String type) {
        String subject = "Bookstore - Xác thực mã OTP của bạn";
        String body = buildOtpBody(otpCode, type);

        log.debug("Preparing OTP email (type={}) to {}", type, toEmail);

        if (StringUtils.hasText(appsScriptConfig.url()) && sendViaAppsScript(toEmail, subject, body)) {
            return;
        }

        sendViaSmtp(toEmail, subject, body);
    }

    private boolean sendViaAppsScript(String toEmail, String subject, String body) {
        String secret = appsScriptConfig.secret() != null ? appsScriptConfig.secret() : "";
        AppsScriptEmailRequest payload = new AppsScriptEmailRequest(toEmail, subject, body, secret);

        try {
            ResponseEntity<String> response = getRestClient().post()
                    .uri(appsScriptConfig.url().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);

            String responseBody = response.getBody();
            if (responseBody != null && (responseBody.contains("\"ok\":false") || responseBody.contains("\"ok\": false"))) {
                log.warn("Google Apps Script rejected email request: {}", responseBody);
                return false;
            }
            if (responseBody != null && responseBody.toLowerCase().contains("<html")) {
                log.warn("Google Apps Script returned HTML instead of JSON. Ensure Web App access is set to 'Anyone'.");
                return false;
            }
            log.info("Sent OTP email via Google Apps Script to {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("Could not send email via Google Apps Script: {}", e.getMessage());
            return false;
        }
    }

    private void sendViaSmtp(String toEmail, String subject, String body) {
        if (mailSender == null || !StringUtils.hasText(fromEmail)) {
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            log.error("Could not send real email via SMTP: {}", e.getMessage());
        }
    }

    private String buildOtpBody(String otpCode, String type) {
        return "Xin chào,\n\n"
                + "Bạn đã yêu cầu mã xác thực OTP cho việc " + type + " trên Bookstore.\n"
                + "Mã OTP của bạn là: " + otpCode + "\n"
                + "Mã này có hiệu lực trong vòng 5 phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ Bookstore";
    }
}