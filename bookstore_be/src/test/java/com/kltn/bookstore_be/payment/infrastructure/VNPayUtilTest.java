package com.kltn.bookstore_be.payment.infrastructure;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VNPayUtilTest {

    @Mock
    private HttpServletRequest request;

    @Test
    @DisplayName("X-FORWARDED-FOR chứa nhiều IP qua proxy - chỉ lấy IPv4 đầu tiên")
    void getIpAddress_commaSeparatedHeader_returnsFirstValidIpv4() {
        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("14.241.120.5, 172.71.10.2, 10.0.0.1");

        assertEquals("14.241.120.5", VNPayUtil.getIpAddress(request));
    }

    @Test
    @DisplayName("X-FORWARDED-FOR dạng IPv6-mapped IPv4 hoặc kèm port - chuẩn hóa về IPv4 thuần")
    void getIpAddress_ipv6MappedOrPortSuffix_normalizesToIpv4() {
        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("::ffff:113.160.92.202, 10.0.0.1");
        assertEquals("113.160.92.202", VNPayUtil.getIpAddress(request));

        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("0:0:0:0:0:ffff:113.160.92.202");
        assertEquals("113.160.92.202", VNPayUtil.getIpAddress(request));

        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("14.241.120.5:54321, 10.0.0.1");
        assertEquals("14.241.120.5", VNPayUtil.getIpAddress(request));
    }

    @Test
    @DisplayName("IP là IPv6 thuần hoặc loopback IPv6 - fallback về 127.0.0.1")
    void getIpAddress_pureIpv6OrLoopback_fallsBackToIpv4Loopback() {
        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("2402:800:6105::1");
        assertEquals("127.0.0.1", VNPayUtil.getIpAddress(request));

        when(request.getHeader("X-FORWARDED-FOR")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("0:0:0:0:0:0:0:1");
        assertEquals("127.0.0.1", VNPayUtil.getIpAddress(request));
    }

    @Test
    @DisplayName("X-FORWARDED-FOR là unknown - ưu tiên X-Real-IP rồi remoteAddr IPv4")
    void getIpAddress_unknownHeader_fallsBackToRealIpOrRemoteAddr() {
        when(request.getHeader("X-FORWARDED-FOR")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn("203.113.152.10");
        assertEquals("203.113.152.10", VNPayUtil.getIpAddress(request));

        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("192.168.1.10");
        assertEquals("192.168.1.10", VNPayUtil.getIpAddress(request));
    }

    @Test
    @DisplayName("Request null - fallback an toàn về 127.0.0.1")
    void getIpAddress_nullRequest_returnsLoopback() {
        assertEquals("127.0.0.1", VNPayUtil.getIpAddress(null));
    }

    @Test
    @DisplayName("Cấu hình VNPay rỗng hoặc chỉ chứa khoảng trắng - ném IllegalStateException")
    void requireNonBlankConfig_blankOrTrimmed() {
        assertEquals("TEST_TMN", VNPayUtil.requireNonBlankConfig(" TEST_TMN ", "vnpay.tmn-code"));
        assertThrows(IllegalStateException.class, () -> VNPayUtil.requireNonBlankConfig("   ", "vnpay.tmn-code"));
        assertThrows(IllegalStateException.class, () -> VNPayUtil.requireNonBlankConfig(null, "vnpay.hash-secret"));
    }

    @Test
    @DisplayName("hmacSHA512 trả về chuỗi rỗng khi key hoặc data null và tính chữ ký 128 ký tự hex khi hợp lệ")
    void hmacSHA512_handlesNullAndValidInputs() {
        assertEquals("", VNPayUtil.hmacSHA512(null, "vnp_Amount=10000"));
        assertEquals("", VNPayUtil.hmacSHA512("secret", null));

        String signature = VNPayUtil.hmacSHA512("test-secret", "vnp_Amount=10000&vnp_TxnRef=1");
        assertEquals(128, signature.length());
        assertEquals(signature, VNPayUtil.hmacSHA512("test-secret", "vnp_Amount=10000&vnp_TxnRef=1"));
    }
}
