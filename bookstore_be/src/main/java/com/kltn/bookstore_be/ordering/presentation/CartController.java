package com.kltn.bookstore_be.ordering.presentation;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.application.CartService;
import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartItem;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            User user = userService.getAuthenticatedUser();
            Cart cart = cartService.getCartForUser(user.getId());
            List<CartItem> items = cartService.getCartItems(cart.getId());
            return ResponseEntity.ok(Map.of(
                    "cartId", cart.getId(),
                    "items", items
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addItem(@RequestParam Long productId, @RequestParam Integer quantity) {
        try {
            User user = userService.getAuthenticatedUser();
            CartItem item = cartService.addItemToCart(user.getId(), productId, quantity);
            return ResponseEntity.ok(Map.of(
                    "message", "Đã thêm sản phẩm vào giỏ hàng thành công",
                    "item", item
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateItem(@RequestParam Long productId, @RequestParam Integer quantity) {
        try {
            User user = userService.getAuthenticatedUser();
            CartItem item = cartService.updateCartItemQuantity(user.getId(), productId, quantity);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật số lượng thành công",
                    "item", item != null ? item : "removed"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeItem(@PathVariable Long productId) {
        try {
            User user = userService.getAuthenticatedUser();
            cartService.removeItemFromCart(user.getId(), productId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        try {
            User user = userService.getAuthenticatedUser();
            Cart cart = cartService.getCartForUser(user.getId());
            cartService.clearCart(cart.getId());
            return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
