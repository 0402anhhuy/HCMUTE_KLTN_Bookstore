package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;
import com.kltn.bookstore_be.ordering.domain.Cart;
import com.kltn.bookstore_be.ordering.domain.CartItem;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.ordering.domain.CartItemRepository;
import com.kltn.bookstore_be.ordering.domain.CartRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final UserRepository userRepository;

    @Transactional
    public Cart getCartForUser(Long userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại"));
                    return cartRepository.save(Cart.builder().user(user).build());
                });
    }

    public List<CartItem> getCartItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    @Transactional
    public CartItem addItemToCart(Long userId, Long productId, Integer quantity) {
        Cart cart = getCartForUser(userId);
        
        Product product = productService.getProductById(productId);
        if (product.getStatus() != Product.ProductStatus.ACTIVE) {
            throw new RuntimeException("Sách này hiện tại đã ngừng kinh doanh");
        }

        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Số lượng sách trong kho không đủ (Hiện còn: " + product.getStockQuantity() + ")");
        }

        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .map(item -> {
                    int newQty = item.getQuantity() + quantity;
                    if (product.getStockQuantity() < newQty) {
                        throw new RuntimeException("Số lượng sách trong kho không đủ (Hiện còn: " + product.getStockQuantity() + ")");
                    }
                    item.setQuantity(newQty);
                    item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(newQty)));
                    return item;
                })
                .orElseGet(() -> CartItem.builder()
                        .cart(cart)
                        .product(product)
                        .quantity(quantity)
                        .subtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)))
                        .build());

        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateCartItemQuantity(Long userId, Long productId, Integer quantity) {
        if (quantity <= 0) {
            removeItemFromCart(userId, productId);
            return null;
        }

        Cart cart = getCartForUser(userId);
        
        Product product = productService.getProductById(productId);
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Số lượng sách trong kho không đủ (Hiện còn: " + product.getStockQuantity() + ")");
        }

        CartItem item = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ hàng"));

        item.setQuantity(quantity);
        item.setSubtotal(product.getPrice().multiply(BigDecimal.valueOf(quantity)));
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeItemFromCart(Long userId, Long productId) {
        Cart cart = getCartForUser(userId);
        cartItemRepository.deleteByCartIdAndProductId(cart.getId(), productId);
    }

    @Transactional
    public void clearCart(Long cartId) {
        cartItemRepository.deleteByCartId(cartId);
    }
}
