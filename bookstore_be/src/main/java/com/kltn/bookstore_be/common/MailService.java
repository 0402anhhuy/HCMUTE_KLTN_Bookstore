package com.kltn.bookstore_be.common;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
public class MailService {

    static final String DEFAULT_BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final RestClient restClient;
    private final String fromEmail;
    private final BrevoConfig brevoConfig;

    record BrevoConfig(String apiKey, String apiUrl, String senderEmail, String senderName) {}

    private record BrevoContact(String email, String name) {
        private BrevoContact(String email) {
            this(email, null);
        }
    }

    private record BrevoEmailRequest(
            BrevoContact sender,
            List<BrevoContact> to,
            String subject,
            String textContent) {}

    @Autowired
    public MailService(
            ObjectProvider<JavaMailSender> mailSenderProvider,
            ObjectProvider<RestClient.Builder> restClientBuilderProvider,
            @Value("${spring.mail.username:}") String fromEmail,
            @Value("${mail.brevo.api-key:}") String brevoApiKey,
            @Value("${mail.brevo.api-url:" + DEFAULT_BREVO_API_URL + "}") String brevoApiUrl,
            @Value("${mail.brevo.sender-email:}") String brevoSenderEmail,
            @Value("${mail.brevo.sender-name:Bookstore}") String brevoSenderName) {
        this(
                mailSenderProvider != null ? mailSenderProvider.getIfAvailable() : null,
                buildRestClient(restClientBuilderProvider != null
                        ? restClientBuilderProvider.getIfAvailable(RestClient::builder)
                        : RestClient.builder()),
                fromEmail,
                new BrevoConfig(brevoApiKey, brevoApiUrl, brevoSenderEmail, brevoSenderName)
        );
    }

    MailService(
            JavaMailSender mailSender,
            RestClient restClient,
            String fromEmail,
            BrevoConfig brevoConfig) {
        this.mailSender = mailSender;
        this.restClient = restClient;
        this.fromEmail = fromEmail;
        this.brevoConfig = brevoConfig;
    }

    private static RestClient buildRestClient(RestClient.Builder builder) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(5000);
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

        if (StringUtils.hasText(brevoConfig.apiKey()) && sendViaBrevo(toEmail, subject, body)) {
            return;
        }

        sendViaSmtp(toEmail, subject, body);
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
                new BrevoContact(senderEmail, senderName),
                List.of(new BrevoContact(toEmail)),
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