package com.kltn.bookstore_be.common;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpInputMessage;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.lang.reflect.Method;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @SuppressWarnings("unused")
    private void dummyMethod(String sampleParam) {
    }

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

    @Test
    @DisplayName("handleMethodArgumentTypeMismatch xử lý quantity, page/size và tham số khác")
    void handleMethodArgumentTypeMismatch_formatsErrorByParamName() throws Exception {
        Method m = GlobalExceptionHandlerTest.class.getDeclaredMethod("dummyMethod", String.class);
        MethodParameter mp = new MethodParameter(m, 0);

        ResponseEntity<Map<String, String>> qtyRes = handler.handleMethodArgumentTypeMismatch(
                new MethodArgumentTypeMismatchException("abc", Integer.class, "quantity", mp, null));
        assertEquals(400, qtyRes.getStatusCode().value());
        assertTrue(qtyRes.getBody().get("error").contains("Số lượng"));

        ResponseEntity<Map<String, String>> pageRes = handler.handleMethodArgumentTypeMismatch(
                new MethodArgumentTypeMismatchException("abc", Integer.class, "page", mp, null));
        assertTrue(pageRes.getBody().get("error").contains("Số trang"));

        ResponseEntity<Map<String, String>> otherRes = handler.handleMethodArgumentTypeMismatch(
                new MethodArgumentTypeMismatchException("abc", Long.class, "productId", mp, null));
        assertTrue(otherRes.getBody().get("error").contains("productId"));
    }

    @Test
    @DisplayName("Xử lý HttpMessageNotReadable, MissingParam, IllegalArgument, Runtime, DataIntegrity, Validation và Generic")
    void handleRemainingExceptions_returnExpectedStatusesAndMessages() throws Exception {
        ResponseEntity<Map<String, String>> notReadable = handler.handleHttpMessageNotReadable(
                new HttpMessageNotReadableException("bad", mock(HttpInputMessage.class)));
        assertEquals(400, notReadable.getStatusCode().value());

        ResponseEntity<Map<String, String>> missing = handler.handleMissingServletRequestParameter(
                new MissingServletRequestParameterException("reason", "String"));
        assertEquals(400, missing.getStatusCode().value());
        assertTrue(missing.getBody().get("error").contains("reason"));

        assertEquals("Sai đối số", handler.handleIllegalArgumentException(new IllegalArgumentException("Sai đối số"))
                .getBody().get("error"));
        assertEquals("Yêu cầu không hợp lệ.", handler.handleIllegalArgumentException(new IllegalArgumentException())
                .getBody().get("error"));

        assertEquals("Lỗi nghiệp vụ", handler.handleRuntimeException(new RuntimeException("Lỗi nghiệp vụ"))
                .getBody().get("error"));

        assertEquals(400, handler.handleDataIntegrityViolation(new DataIntegrityViolationException("fk"))
                .getStatusCode().value());

        Method m = GlobalExceptionHandlerTest.class.getDeclaredMethod("dummyMethod", String.class);
        BeanPropertyBindingResult binding = new BeanPropertyBindingResult("target", "target");
        binding.addError(new FieldError("target", "email", "Email không hợp lệ"));
        ResponseEntity<Map<String, String>> validRes = handler.handleValidationExceptions(
                new MethodArgumentNotValidException(new MethodParameter(m, 0), binding));
        assertEquals(400, validRes.getStatusCode().value());
        assertEquals("Email không hợp lệ", validRes.getBody().get("error"));

        ResponseEntity<Map<String, String>> genericRes = handler.handleGenericException(new Exception("boom"));
        assertEquals(500, genericRes.getStatusCode().value());
    }
}
