package com.kltn.bookstore_be.catalog.presentation;

import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.catalog.application.PublisherResponse;
import com.kltn.bookstore_be.catalog.application.PublisherService;
import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.catalog.domain.FavoriteProduct;
import com.kltn.bookstore_be.catalog.domain.FavoriteProductRepository;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.StockMovement;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.mockito.ArgumentMatchers;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private ProductService productService;

    @MockitoBean
    private PublisherService publisherService;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private FavoriteProductRepository favoriteProductRepository;

    private Product sampleProduct() {
        return Product.builder()
                .id(1L)
                .name("Domain-Driven Design")
                .price(BigDecimal.valueOf(250000))
                .stockQuantity(10)
                .status(Product.ProductStatus.ACTIVE)
                .category(Category.builder().id(2L).name("Software").build())
                .build();
    }

    private User sampleUser(User.Role role) {
        return User.builder().id(7L).email("tester@example.com").role(role).build();
    }

    @Test
    @DisplayName("GET /api/v1/products, /publishers, /bestsellers và /{id} hoạt động cho công khai và xử lý lỗi")
    void publicProductEndpoints_handleSuccessAndFailure() throws Exception {
        Product p = sampleProduct();
        when(productService.searchProducts(any(), any(), ArgumentMatchers.<List<String>>any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p)));

        mockMvc.perform(get("/api/v1/products").param("sort", "price,asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Domain-Driven Design"));

        when(productService.searchProducts(any(), any(), ArgumentMatchers.<List<String>>any(), any(), any(), any(), any(Pageable.class)))
                .thenThrow(new RuntimeException("Lỗi truy vấn"));
        mockMvc.perform(get("/api/v1/products").param("sort", "id,desc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Lỗi truy vấn"));

        PublisherResponse pub = new PublisherResponse(1L, "NXB Trẻ", "Tre", "nxb-tre", null, null, null, true);
        when(publisherService.getPublishers()).thenReturn(List.of(pub));
        mockMvc.perform(get("/api/v1/products/publishers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("NXB Trẻ"));

        when(productService.getBestsellers(isNull(), eq(10))).thenReturn(List.of(p));
        mockMvc.perform(get("/api/v1/products/bestsellers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));

        when(productService.getProductById(1L)).thenReturn(p);
        mockMvc.perform(get("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Domain-Driven Design"));

        when(productService.getProductById(999L)).thenThrow(new RuntimeException("Không tìm thấy"));
        mockMvc.perform(get("/api/v1/products/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Không tìm thấy"));
    }

    @Test
    @DisplayName("GET /status/{status} và /count/status/{status} xử lý hợp lệ, sai enum (400) và lỗi hệ thống (500)")
    void statusEndpoints_handleValidInvalidAndErrors() throws Exception {
        when(productService.getProductsByStatus(Product.ProductStatus.ACTIVE)).thenReturn(List.of(sampleProduct()));
        mockMvc.perform(get("/api/v1/products/status/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));

        mockMvc.perform(get("/api/v1/products/status/UNKNOWN"))
                .andExpect(status().isBadRequest());

        when(productService.getProductsByStatus(Product.ProductStatus.PENDING))
                .thenThrow(new RuntimeException("DB fail"));
        mockMvc.perform(get("/api/v1/products/status/PENDING"))
                .andExpect(status().isInternalServerError());

        when(productService.countProductsByStatus(Product.ProductStatus.ACTIVE)).thenReturn(5L);
        mockMvc.perform(get("/api/v1/products/count/status/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));

        mockMvc.perform(get("/api/v1/products/count/status/BAD"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("Các endpoint quản trị kho và CRUD sản phẩm từ chối role USER")
    void managerEndpoints_withUserRole_returnAccessDenied() throws Exception {
        mockMvc.perform(get("/api/v1/products/stock-movements"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(post("/api/v1/products/1/adjust-stock")
                        .param("quantity", "5")
                        .param("movementType", "IMPORT")
                        .param("note", "Nhập"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Test\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Access Denied"));
    }

    @Test
    @WithMockUser(roles = "MANAGER")
    @DisplayName("Các endpoint quản trị kho và CRUD sản phẩm hoạt động với role MANAGER")
    void managerEndpoints_withManagerRole_handleCrudAndErrors() throws Exception {
        User manager = sampleUser(User.Role.MANAGER);
        Product created = sampleProduct();
        StockMovement mv = StockMovement.builder()
                .id(1L)
                .movementType(StockMovement.MovementType.IMPORT)
                .quantity(5)
                .note("Nhập thêm")
                .build();

        when(productService.getAllStockMovements()).thenReturn(List.of(mv));
        mockMvc.perform(get("/api/v1/products/stock-movements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].quantity").value(5));

        when(userService.getAuthenticatedUser()).thenReturn(manager);
        doNothing().when(productService).adjustStock(1L, 5, StockMovement.MovementType.IMPORT, "Nhập", manager);
        mockMvc.perform(post("/api/v1/products/1/adjust-stock")
                        .param("quantity", "5")
                        .param("movementType", "IMPORT")
                        .param("note", "Nhập"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "No Cat", "price", 10000))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Danh mục không được để trống"));

        when(productService.createProduct(any(Product.class), eq(2L))).thenReturn(created);
        mockMvc.perform(post("/api/v1/products")
                        .param("categoryId", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "DDD", "price", 250000))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));

        when(productService.updateProduct(eq(1L), any(Product.class), eq(2L))).thenReturn(created);
        mockMvc.perform(put("/api/v1/products/1")
                        .param("categoryId", "2")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "DDD v2"))))
                .andExpect(status().isOk());

        when(productService.updateProduct(eq(1L), any(Product.class))).thenReturn(created);
        mockMvc.perform(put("/api/v1/products/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "DDD v3"))))
                .andExpect(status().isOk());

        doNothing().when(productService).deleteProduct(1L);
        mockMvc.perform(delete("/api/v1/products/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        doThrow(new RuntimeException("Đang có đơn hàng")).when(productService).deleteProduct(2L);
        mockMvc.perform(delete("/api/v1/products/2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Đang có đơn hàng"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET/POST/DELETE /api/v1/products/favorites hoạt động đầy đủ nhánh")
    void favoritesEndpoints_handleAllCases() throws Exception {
        User user = sampleUser(User.Role.USER);
        Product product = sampleProduct();
        FavoriteProduct fav = FavoriteProduct.builder().id(9L).user(user).product(product).build();

        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(favoriteProductRepository.findByUserId(7L)).thenReturn(List.of(fav));

        mockMvc.perform(get("/api/v1/products/favorites"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(9));

        when(productService.getProductById(1L)).thenReturn(product);
        when(favoriteProductRepository.findByUserIdAndProductId(7L, 1L)).thenReturn(Optional.of(fav));
        mockMvc.perform(post("/api/v1/products/favorites").param("productId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Sản phẩm đã có trong danh sách yêu thích"));

        when(favoriteProductRepository.findByUserIdAndProductId(7L, 1L)).thenReturn(Optional.empty());
        mockMvc.perform(post("/api/v1/products/favorites").param("productId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã thêm vào danh sách yêu thích"));

        doNothing().when(favoriteProductRepository).deleteByUserIdAndProductId(7L, 1L);
        mockMvc.perform(delete("/api/v1/products/favorites").param("productId", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã xóa khỏi danh sách yêu thích"));
    }
}
