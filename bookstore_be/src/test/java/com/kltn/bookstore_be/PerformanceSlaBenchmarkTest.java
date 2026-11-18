package com.kltn.bookstore_be;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kltn.bookstore_be.identity.application.RegisterRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class PerformanceSlaBenchmarkTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private MockMvc mockMvc;

    private static final long SLA_MAX_LIMIT_MS = 5000; // Hard SLA limit: 5 seconds
    private static final long SLA_TARGET_LIMIT_MS = 3000; // Ideal target: 3 seconds

    private static final List<BenchmarkResult> results = new ArrayList<>();
    private static String jwtToken;
    private static Long sampleProductId = 1L;

    public record BenchmarkResult(String feature, String endpoint, long durationMs, boolean passedSla) {}

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    private void recordBenchmark(String feature, String endpoint, long duration) {
        boolean passed = duration <= SLA_TARGET_LIMIT_MS;
        results.add(new BenchmarkResult(feature, endpoint, duration, passed));

        System.out.printf("[BENCHMARK] %-35s %-40s => %4d ms (SLA <= %dms: %s)%n",
                feature, endpoint, duration, SLA_TARGET_LIMIT_MS, passed ? "PASS" : "WARN");

        assertTrue(duration <= SLA_MAX_LIMIT_MS,
                String.format("Feature '%s' (%s) exceeded max SLA limit of %dms (actual: %dms)",
                        feature, endpoint, SLA_MAX_LIMIT_MS, duration));
    }

    @Test
    @Order(1)
    @DisplayName("Catalog - Lấy danh sách sản phẩm phân trang")
    void testCatalogProductList() throws Exception {
        long start = System.currentTimeMillis();
        MvcResult res = mockMvc.perform(get("/api/products?page=0&size=12"))
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        long duration = System.currentTimeMillis() - start;

        // Parse first product ID for product detail test
        try {
            JsonNode root = objectMapper.readTree(res.getResponse().getContentAsString());
            JsonNode content = root.path("content");
            if (content.isArray() && !content.isEmpty()) {
                sampleProductId = content.get(0).path("id").asLong(1L);
            }
        } catch (Exception ignored) {}

        recordBenchmark("Danh sách sản phẩm Catalog", "/api/products?page=0&size=12", duration);
    }

    @Test
    @Order(2)
    @DisplayName("Catalog - Tìm kiếm theo từ khóa")
    void testCatalogSearchKeyword() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/products?keyword=sach&page=0&size=12"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Tìm kiếm từ khóa", "/api/products?keyword=sach", duration);
    }

    @Test
    @Order(3)
    @DisplayName("Catalog - Lọc theo khoảng giá")
    void testCatalogFilterPriceRange() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/products?minPrice=50000&maxPrice=200000&page=0&size=12"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Lọc khoảng giá", "/api/products?minPrice=...&maxPrice=...", duration);
    }

    @Test
    @Order(4)
    @DisplayName("Catalog - Lấy danh sách Nhà xuất bản")
    void testGetPublishers() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/products/publishers"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Danh sách Nhà xuất bản", "/api/products/publishers", duration);
    }

    @Test
    @Order(5)
    @DisplayName("Chi tiết sản phẩm - Lấy chi tiết sách theo ID")
    void testGetProductDetail() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/products/" + sampleProductId))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Chi tiết sản phẩm", "/api/products/" + sampleProductId, duration);
    }

    @Test
    @Order(6)
    @DisplayName("Điều hướng - Lấy tất cả danh mục")
    void testGetAllCategories() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Danh mục sản phẩm", "/api/categories", duration);
    }

    @Test
    @Order(7)
    @DisplayName("Điều hướng - Danh mục gốc (Root Categories)")
    void testGetRootCategories() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/categories/roots"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Danh mục gốc (Roots)", "/api/categories/roots", duration);
    }

    @Test
    @Order(8)
    @DisplayName("Khuyến mãi - Danh sách chương trình sale")
    void testGetActivePromotions() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/promotions/active"))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Chương trình khuyến mãi", "/api/promotions/active", duration);
    }

    @Test
    @Order(9)
    @DisplayName("Đánh giá - Danh sách đánh giá theo sản phẩm")
    void testGetProductReviews() throws Exception {
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/reviews/product/" + sampleProductId))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Đánh giá sản phẩm", "/api/reviews/product/" + sampleProductId, duration);
    }

    @Test
    @Order(10)
    @DisplayName("Xác thực - Đăng nhập tài khoản")
    void testLoginLatency() throws Exception {
        String loginPayload = "{\"email\":\"user@gmail.com\",\"password\":\"password\"}";
        long start = System.currentTimeMillis();
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginPayload))
                .andExpect(status().is2xxSuccessful())
                .andReturn();
        long duration = System.currentTimeMillis() - start;

        try {
            JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
            jwtToken = root.path("token").asText();
        } catch (Exception ignored) {}

        recordBenchmark("Đăng nhập tài khoản", "/api/auth/login", duration);
    }

    @Test
    @Order(11)
    @DisplayName("Người dùng - Hồ sơ tài khoản (Authenticated)")
    void testUserProfileLatency() throws Exception {
        if (jwtToken == null || jwtToken.isEmpty()) return;
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/users/profile")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Thông tin hồ sơ cá nhân", "/api/users/profile", duration);
    }

    @Test
    @Order(12)
    @DisplayName("Giỏ hàng - Xem giỏ hàng cá nhân (Authenticated)")
    void testGetCartLatency() throws Exception {
        if (jwtToken == null || jwtToken.isEmpty()) return;
        long start = System.currentTimeMillis();
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().is2xxSuccessful());
        long duration = System.currentTimeMillis() - start;
        recordBenchmark("Xem giỏ hàng người dùng", "/api/cart", duration);
    }

    @Test
    @Order(13)
    @DisplayName("Đăng ký - Gửi OTP và tạo tài khoản (Async Email)")
    void testRegisterOtpLatency() throws Exception {
        String testEmail = "test_sla_" + System.currentTimeMillis() + "@gmail.com";
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test SLA User");
        req.setEmail(testEmail);
        req.setPhone("0988776655");
        req.setPassword("Password123");
        req.setAddress("123 Test Street");

        long start = System.currentTimeMillis();
        ResultActions actions = mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
        long duration = System.currentTimeMillis() - start;

        actions.andExpect(status().is2xxSuccessful());
        recordBenchmark("Đăng ký & Gửi OTP", "/api/auth/register", duration);
    }

    @AfterAll
    static void printSummaryReport() {
        System.out.println("\n=========================================================================================");
        System.out.println("                        BÁO CÁO ĐO LƯỜNG SLA PHẢN HỒI HỆ THỐNG                          ");
        System.out.println("=========================================================================================");
        System.out.printf("%-30s | %-38s | %-12s | %-8s%n", "Tính năng", "API Endpoint", "Thời gian", "SLA <= 3s");
        System.out.println("-------------------------------+----------------------------------------+--------------+---------");
        for (BenchmarkResult res : results) {
            System.out.printf("%-30s | %-38s | %8d ms | %-8s%n",
                    res.feature(), res.endpoint(), res.durationMs(), res.passedSla() ? "PASS" : "WARN");
        }
        System.out.println("=========================================================================================\n");
    }
}
