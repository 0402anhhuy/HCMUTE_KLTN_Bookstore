package com.kltn.bookstore_be.controller;

import com.kltn.bookstore_be.entity.Cart;
import com.kltn.bookstore_be.entity.CartItem;
import com.kltn.bookstore_be.service.CartItemService;
import com.kltn.bookstore_be.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final CartItemService cartItemService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCartByUser(@PathVariable Long userId) {
        try {
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{cartId}/items")
    public ResponseEntity<?> getCartItems(@PathVariable Long cartId) {
        try {
            List<CartItem> items = cartItemService.getItemsByCartId(cartId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<?> addItemToCart(
            @PathVariable Long cartId,
            @RequestParam Long productId,
            @RequestParam(defaultValue = "1") int quantity
    ) {
        try {
            CartItem item = cartItemService.addItemToCart(cartId, productId, quantity);
            return ResponseEntity.ok(item);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateItemQuantity(
            @PathVariable Long itemId,
            @RequestParam int quantity
    ) {
        try {
            CartItem updated = cartItemService.updateItemQuantity(itemId, quantity);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<?> removeItem(@PathVariable Long itemId) {
        try {
            cartItemService.removeItem(itemId);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm khỏi giỏ hàng thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cartId}")
    public ResponseEntity<?> clearCart(@PathVariable Long cartId) {
        try {
            cartService.clearCart(cartId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
