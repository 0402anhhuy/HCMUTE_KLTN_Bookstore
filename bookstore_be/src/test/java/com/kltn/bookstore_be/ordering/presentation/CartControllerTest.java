package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.identity.infrastructure.CustomUserDetailsService;
import com.kltn.bookstore_be.identity.infrastructure.JwtTokenProvider;
import com.kltn.bookstore_be.identity.infrastructure.SecurityConfig;
import com.kltn.bookstore_be.ordering.application.CartService;
import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartItem;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CartController.class)
@Import(SecurityConfig.class)
@ActiveProfiles("test")
class CartControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JdbcTemplate jdbcTemplate;

    @MockitoBean
    private JwtTokenProvider tokenProvider;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @MockitoBean
    private CartService cartService;

    @MockitoBean
    private UserService userService;

    private User sampleUser() {
        return User.builder().id(10L).email("user@example.com").role(User.Role.USER).build();
    }

    private CartItem sampleCartItem() {
        Product product = Product.builder().id(5L).name("Clean Code").price(BigDecimal.valueOf(120000)).build();
        return CartItem.builder().id(100L).product(product).quantity(2).subtotal(BigDecimal.valueOf(240000)).build();
    }

    @Test
    @DisplayName("GET /api/v1/cart khi chưa đăng nhập trả về 401")
    void getCart_unauthenticated_returnsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("GET /api/v1/cart trả về cartId và danh sách items, và 400 khi lỗi")
    void getCart_authenticated_handlesSuccessAndFailure() throws Exception {
        User user = sampleUser();
        Cart cart = Cart.builder().id(1L).user(user).build();
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(cartService.getCartForUser(10L)).thenReturn(cart);
        when(cartService.getCartItems(1L)).thenReturn(List.of(sampleCartItem()));

        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cartId").value(1))
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        when(userService.getAuthenticatedUser()).thenThrow(new RuntimeException("User không hợp lệ"));
        mockMvc.perform(get("/api/v1/cart"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("User không hợp lệ"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("POST /api/v1/cart/add thêm sản phẩm thành công và xử lý lỗi tồn kho")
    void addItem_handlesSuccessAndFailure() throws Exception {
        User user = sampleUser();
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(cartService.addItemToCart(10L, 5L, 2)).thenReturn(sampleCartItem());

        mockMvc.perform(post("/api/v1/cart/add")
                        .param("productId", "5")
                        .param("quantity", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.item.quantity").value(2))
                .andExpect(jsonPath("$.message").exists());

        when(cartService.addItemToCart(10L, 5L, 999))
                .thenThrow(new RuntimeException("Số lượng vượt quá tồn kho"));
        mockMvc.perform(post("/api/v1/cart/add")
                        .param("productId", "5")
                        .param("quantity", "999"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Số lượng vượt quá tồn kho"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("PUT & PATCH /api/v1/cart/update cập nhật số lượng, xóa khi null và lỗi 400")
    void updateItem_putAndPatch_handleAllBranches() throws Exception {
        User user = sampleUser();
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(cartService.updateCartItemQuantity(10L, 5L, 3)).thenReturn(sampleCartItem());

        mockMvc.perform(put("/api/v1/cart/update")
                        .param("productId", "5")
                        .param("quantity", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists())
                .andExpect(jsonPath("$.item.id").value(100));

        when(cartService.updateCartItemQuantity(10L, 5L, 0)).thenReturn(null);
        mockMvc.perform(patch("/api/v1/cart/update")
                        .param("productId", "5")
                        .param("quantity", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.item").value("removed"));

        when(cartService.updateCartItemQuantity(10L, 5L, -1))
                .thenThrow(new RuntimeException("Số lượng không hợp lệ"));
        mockMvc.perform(patch("/api/v1/cart/update")
                        .param("productId", "5")
                        .param("quantity", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Số lượng không hợp lệ"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("DELETE & PATCH /api/v1/cart/remove/{productId} xóa item và xử lý lỗi")
    void removeItem_deleteAndPatch_handleSuccessAndFailure() throws Exception {
        User user = sampleUser();
        when(userService.getAuthenticatedUser()).thenReturn(user);
        doNothing().when(cartService).removeItemFromCart(10L, 5L);

        mockMvc.perform(delete("/api/v1/cart/remove/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(patch("/api/v1/cart/remove/5"))
                .andExpect(status().isOk());

        doThrow(new RuntimeException("Không tìm thấy sản phẩm"))
                .when(cartService).removeItemFromCart(10L, 99L);
        mockMvc.perform(delete("/api/v1/cart/remove/99"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Không tìm thấy sản phẩm"));
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("DELETE & PATCH /api/v1/cart/clear xóa toàn bộ giỏ hàng và xử lý lỗi")
    void clearCart_deleteAndPatch_handleSuccessAndFailure() throws Exception {
        User user = sampleUser();
        Cart cart = Cart.builder().id(1L).user(user).build();
        when(userService.getAuthenticatedUser()).thenReturn(user);
        when(cartService.getCartForUser(10L)).thenReturn(cart);
        doNothing().when(cartService).clearCart(1L);

        mockMvc.perform(delete("/api/v1/cart/clear"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        mockMvc.perform(patch("/api/v1/cart/clear"))
                .andExpect(status().isOk());

        doThrow(new RuntimeException("Lỗi xóa giỏ hàng")).when(cartService).clearCart(1L);
        mockMvc.perform(delete("/api/v1/cart/clear"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Lỗi xóa giỏ hàng"));
    }
}
