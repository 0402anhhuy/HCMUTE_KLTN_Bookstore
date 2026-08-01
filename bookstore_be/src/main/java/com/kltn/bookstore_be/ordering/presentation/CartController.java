package com.kltn.bookstore_be.ordering.presentation;

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
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;


import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartItem;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.application.CartService;
import com.kltn.bookstore_be.identity.application.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final UserService userService;

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails) {
            String email = ((org.springframework.security.core.userdetails.UserDetails) principal).getUsername();
            return userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Người dùng chưa được xác thực"));
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }

    @GetMapping
    public ResponseEntity<?> getCart() {
        try {
            User user = getAuthenticatedUser();
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
            User user = getAuthenticatedUser();
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
            User user = getAuthenticatedUser();
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
            User user = getAuthenticatedUser();
            cartService.removeItemFromCart(user.getId(), productId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart() {
        try {
            User user = getAuthenticatedUser();
            Cart cart = cartService.getCartForUser(user.getId());
            cartService.clearCart(cart.getId());
            return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ sản phẩm khỏi giỏ hàng"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}