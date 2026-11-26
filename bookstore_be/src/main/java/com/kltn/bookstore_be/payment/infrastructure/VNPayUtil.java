package com.kltn.bookstore_be.payment.infrastructure;

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
import com.kltn.bookstore_be.common.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;
import java.util.*;
import java.util.regex.Pattern;

public class VNPayUtil {

    private static final Pattern IPV4_PATTERN = Pattern.compile(
            "^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$");

    public static String hmacSHA512(final String key, final String data) {
        try {
            if (key == null || data == null) {
                throw new NullPointerException();
            }
            final Mac hmac512 = Mac.getInstance("HmacSHA512");
            byte[] hmacKeyBytes = key.getBytes(StandardCharsets.UTF_8);
            final SecretKeySpec secretKey = new SecretKeySpec(hmacKeyBytes, "HmacSHA512");
            hmac512.init(secretKey);
            byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);
            byte[] result = hmac512.doFinal(dataBytes);
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            return "";
        }
    }
    
    /**
     * Trims a required VNPay configuration property and fails fast if null or blank.
     */
    public static String requireNonBlankConfig(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Thiếu cấu hình VNPay bắt buộc: " + propertyName);
        }
        return value.trim();
    }

    /**
     * Extract a single valid IPv4 address for VNPay vnp_IpAddr, handling reverse-proxy
     * comma-separated headers, optional IPv4 ports, and IPv6/IPv6-mapped addresses.
     */
    public static String getIpAddress(jakarta.servlet.http.HttpServletRequest request) {
        if (request == null) {
            return "127.0.0.1";
        }
        try {
            String[] candidates = {
                    request.getHeader("X-FORWARDED-FOR"),
                    request.getHeader("X-Real-IP"),
                    request.getRemoteAddr()
            };
            for (String candidate : candidates) {
                String ipv4 = extractValidIpv4(candidate);
                if (ipv4 != null) {
                    return ipv4;
                }
            }
        } catch (Exception ignored) {
            // Fallback below when servlet headers cannot be read
        }
        return "127.0.0.1";
    }

    private static String extractValidIpv4(String rawHeader) {
        if (rawHeader == null || rawHeader.isBlank()) {
            return null;
        }
        for (String part : rawHeader.split(",")) {
            String ip = normalizeIpv4Candidate(part.trim());
            if (ip != null && IPV4_PATTERN.matcher(ip).matches()) {
                return ip;
            }
        }
        return null;
    }

    private static String normalizeIpv4Candidate(String candidate) {
        if (candidate.isEmpty() || "unknown".equalsIgnoreCase(candidate)) {
            return null;
        }
        String normalized = candidate;
        if (normalized.regionMatches(true, 0, "::ffff:", 0, 7)) {
            normalized = normalized.substring(7);
        } else if (normalized.regionMatches(true, 0, "0:0:0:0:0:ffff:", 0, 15)) {
            normalized = normalized.substring(15);
        }
        int colonIdx = normalized.indexOf(':');
        if (colonIdx > 0 && normalized.indexOf(':', colonIdx + 1) < 0) {
            String portPart = normalized.substring(colonIdx + 1);
            if (!portPart.isEmpty() && portPart.chars().allMatch(Character::isDigit)) {
                normalized = normalized.substring(0, colonIdx);
            }
        }
        return normalized;
    }

    public static String hashAllFields(Map<String, String> fields, String secretKey) {
        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);
        StringBuilder sb = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = fields.get(fieldName);
            if ((fieldValue != null) && (!fieldValue.isEmpty())) {
                sb.append(fieldName);
                sb.append("=");
                try {
                    sb.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                } catch (Exception e) {
                    sb.append(fieldValue);
                }
                if (itr.hasNext()) {
                    sb.append("&");
                }
            }
        }
        return hmacSHA512(secretKey, sb.toString());
    }
}