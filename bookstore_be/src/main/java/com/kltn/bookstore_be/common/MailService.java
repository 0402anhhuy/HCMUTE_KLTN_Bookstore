package com.kltn.bookstore_be.common;

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
import java.util.List;

@Service
public class MailService {

    static final String DEFAULT_BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final String fromEmail;
    private final BrevoConfig brevoConfig;
    private final AppsScriptConfig appsScriptConfig;

    record BrevoConfig(String apiKey, String apiUrl, String senderEmail, String senderName) {}

    record AppsScriptConfig(String url, String secret) {}

    private record BrevoSender(String email, String name) {}

    private record BrevoRecipient(String email) {}

    private record BrevoEmailRequest(
            BrevoSender sender,
            List<BrevoRecipient> to,
            String subject,
            String textContent) {}

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
            @Value("${mail.brevo.api-key:}") String brevoApiKey,
            @Value("${mail.brevo.api-url:" + DEFAULT_BREVO_API_URL + "}") String brevoApiUrl,
            @Value("${mail.brevo.sender-email:}") String brevoSenderEmail,
            @Value("${mail.brevo.sender-name:Bookstore}") String brevoSenderName,
            @Value("${mail.apps-script.url:}") String appsScriptUrl,
            @Value("${mail.apps-script.secret:}") String appsScriptSecret) {
        this(
                mailSenderProvider != null ? mailSenderProvider.getIfAvailable() : null,
                buildRestClient(restClientBuilderProvider != null
                        ? restClientBuilderProvider.getIfAvailable(RestClient::builder)
                        : RestClient.builder()),
                fromEmail,
                new BrevoConfig(brevoApiKey, brevoApiUrl, brevoSenderEmail, brevoSenderName),
                new AppsScriptConfig(appsScriptUrl, appsScriptSecret)
        );
    }

    MailService(
            JavaMailSender mailSender,
            RestClient restClient,
            String fromEmail,
            BrevoConfig brevoConfig,
            AppsScriptConfig appsScriptConfig) {
        this.mailSender = mailSender;
        this.restClient = restClient;
        this.fromEmail = fromEmail;
        this.brevoConfig = brevoConfig;
        this.appsScriptConfig = appsScriptConfig;
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

        System.out.println("\n==================================================");
        System.out.println("SENDING EMAIL TO: " + toEmail);
        System.out.println("OTP CODE: [" + otpCode + "]");
        System.out.println("TYPE: " + type);
        System.out.println("==================================================\n");

        if (StringUtils.hasText(appsScriptConfig.url()) && sendViaAppsScript(toEmail, subject, body)) {
            return;
        }

        if (StringUtils.hasText(brevoConfig.apiKey()) && sendViaBrevo(toEmail, subject, body)) {
            return;
        }

        sendViaSmtp(toEmail, subject, body);
    }

    private boolean sendViaAppsScript(String toEmail, String subject, String body) {
        String secret = appsScriptConfig.secret() != null ? appsScriptConfig.secret() : "";
        AppsScriptEmailRequest payload = new AppsScriptEmailRequest(toEmail, subject, body, secret);

        try {
            ResponseEntity<String> response = restClient.post()
                    .uri(appsScriptConfig.url().trim())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);

            String responseBody = response.getBody();
            if (responseBody != null && (responseBody.contains("\"ok\":false") || responseBody.contains("\"ok\": false"))) {
                System.err.println("Google Apps Script rejected email request: " + responseBody);
                return false;
            }
            if (responseBody != null && responseBody.toLowerCase().contains("<html")) {
                System.err.println("Google Apps Script returned HTML instead of JSON. Ensure Web App access is set to 'Anyone'.");
                return false;
            }
            System.out.println("Sent OTP email via Google Apps Script to: " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("Could not send email via Google Apps Script: " + e.getMessage());
            return false;
        }
    }

    private boolean sendViaBrevo(String toEmail, String subject, String body) {
        String senderEmail = StringUtils.hasText(brevoConfig.senderEmail()) ? brevoConfig.senderEmail() : fromEmail;
        if (!StringUtils.hasText(senderEmail)) {
            System.err.println("Could not send email via Brevo: sender email is not configured.");
            return false;
        }
        String senderName = StringUtils.hasText(brevoConfig.senderName()) ? brevoConfig.senderName() : "Bookstore";
        String targetUrl = StringUtils.hasText(brevoConfig.apiUrl()) ? brevoConfig.apiUrl() : DEFAULT_BREVO_API_URL;

        BrevoEmailRequest payload = new BrevoEmailRequest(
                new BrevoSender(senderEmail, senderName),
                List.of(new BrevoRecipient(toEmail)),
                subject,
                body
        );

        try {
            restClient.post()
                    .uri(targetUrl)
                    .header("api-key", brevoConfig.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .accept(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();
            System.out.println("Sent OTP email via Brevo HTTP API to: " + toEmail);
            return true;
        } catch (Exception e) {
            System.err.println("Could not send email via Brevo HTTP API: " + e.getMessage());
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
            System.err.println("Could not send real email via SMTP: " + e.getMessage());
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