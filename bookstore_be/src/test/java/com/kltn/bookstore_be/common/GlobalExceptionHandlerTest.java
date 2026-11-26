package com.kltn.bookstore_be.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    @DisplayName("Trả về 413 với thông báo tiếng Việt khi file upload vượt dung lượng")
    void handleMaxUploadSizeExceeded_returnsPayloadTooLarge() {
        MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(1024L * 1024L);

        ResponseEntity<Map<String, String>> response = handler.handleMaxUploadSizeExceeded(ex);

        assertEquals(413, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().containsKey("error"));
        assertTrue(response.getBody().get("error").toLowerCase().contains("dung lượng"));
    }
}
