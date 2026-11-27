package com.kltn.bookstore_be.common;

import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UploadController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class UploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private CloudinaryService cloudinaryService;

    @Test
    @DisplayName("POST /api/v1/upload từ chối file rỗng, upload Cloudinary và fallback lưu local")
    void uploadFile_handlesEmptyCloudinaryFallbackAndError() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "empty.png", "image/png", new byte[0]);
        mockMvc.perform(multipart("/api/v1/upload").file(emptyFile))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());

        MockMultipartFile image = new MockMultipartFile("file", "cover.png", "image/png", "img".getBytes(StandardCharsets.UTF_8));
        when(cloudinaryService.isCloudinaryConfigured()).thenReturn(true);
        when(cloudinaryService.uploadFile(any(), eq("bookstore_products"), isNull()))
                .thenReturn("https://cdn.example/cover.png");

        mockMvc.perform(multipart("/api/v1/upload").file(image))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("https://cdn.example/cover.png"));

        when(cloudinaryService.uploadFile(any(), eq("bookstore_products"), isNull()))
                .thenThrow(new RuntimeException("Upload lỗi"));
        mockMvc.perform(multipart("/api/v1/upload").file(image))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").exists());

        when(cloudinaryService.isCloudinaryConfigured()).thenReturn(false);
        String body = mockMvc.perform(multipart("/api/v1/upload").file(image))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").exists())
                .andReturn()
                .getResponse()
                .getContentAsString();
        String marker = "http://localhost:8081/uploads/";
        int idx = body.indexOf(marker);
        if (idx >= 0) {
            int end = body.indexOf('"', idx);
            String filename = body.substring(idx + marker.length(), end);
            Path created = Paths.get("uploads").resolve(filename);
            Files.deleteIfExists(created);
        }
    }
}
