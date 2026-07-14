package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @InjectMocks
    private CartService cartService;

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductService productService;

    private User sampleUser;
    private Cart sampleCart;
    private Product sampleProduct;
    private Category sampleCategory;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .fullName("Nguyen Van A")
                .email("test@example.com")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();

        sampleCart = Cart.builder()
                .id(1L)
                .user(sampleUser)
                .build();

        sampleCategory = Category.builder().id(1L).name("Văn học").build();

        sampleProduct = Product.builder()
                .id(1L)
                .name("Doraemon Tập 1")
                .price(BigDecimal.valueOf(25000))
                .stockQuantity(100)
                .status(Product.ProductStatus.ACTIVE)
                .category(sampleCategory)
                .build();
    }

    @Nested
    @DisplayName("User - Xem giỏ hàng")
    class GetCartTests {

        @Test
        @DisplayName("Lấy giỏ hàng của user thành công")
        void getCartForUser_existingCart_returnsCart() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));

            Cart result = cartService.getCartForUser(1L);

            assertNotNull(result);
            assertEquals(1L, result.getId());
        }

        @Test
        @DisplayName("User chưa có giỏ hàng - ném exception")
        void getCartForUser_noCart_throwsException() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.empty());

            assertThrows(RuntimeException.class, () -> {
                cartService.getCartForUser(1L);
            });
        }
    }

    @Nested
    @DisplayName("User - Thêm sản phẩm vào giỏ hàng")
    class AddItemTests {

        @Test
        @DisplayName("Thêm sản phẩm mới vào giỏ hàng thành công")
        void addItemToCart_newItem_success() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);
            when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.empty());
            when(cartItemRepository.save(any(CartItem.class))).thenAnswer(invocation -> {
                CartItem item = invocation.getArgument(0);
                item.setId(1L);
                return item;
            });

            CartItem result = cartService.addItemToCart(1L, 1L, 2);

            assertNotNull(result);
            assertEquals(2, result.getQuantity());
            assertEquals(BigDecimal.valueOf(50000), result.getSubtotal());
        }

        @Test
        @DisplayName("Thêm sản phẩm đã có trong giỏ - cộng dồn số lượng")
        void addItemToCart_existingItem_incrementsQuantity() {
            CartItem existingItem = CartItem.builder()
                    .id(1L)
                    .cart(sampleCart)
                    .product(sampleProduct)
                    .quantity(3)
                    .subtotal(BigDecimal.valueOf(75000))
                    .build();

            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);
            when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.of(existingItem));
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(existingItem);

            CartItem result = cartService.addItemToCart(1L, 1L, 2);

            assertEquals(5, result.getQuantity());
            assertEquals(BigDecimal.valueOf(125000), result.getSubtotal());
        }

        @Test
        @DisplayName("Thêm sản phẩm INACTIVE - ném exception")
        void addItemToCart_inactiveProduct_throwsException() {
            sampleProduct.setStatus(Product.ProductStatus.INACTIVE);

            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                cartService.addItemToCart(1L, 1L, 1);
            });

            assertTrue(exception.getMessage().contains("ngừng kinh doanh"));
        }

        @Test
        @DisplayName("Thêm sản phẩm vượt quá tồn kho - ném exception")
        void addItemToCart_exceedsStock_throwsException() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);

            RuntimeException exception = assertThrows(RuntimeException.class, () -> {
                cartService.addItemToCart(1L, 1L, 150);
            });

            assertTrue(exception.getMessage().contains("không đủ"));
        }

        @Test
        @DisplayName("Cộng dồn vượt tồn kho - ném exception")
        void addItemToCart_incrementExceedsStock_throwsException() {
            CartItem existingItem = CartItem.builder()
                    .id(1L)
                    .cart(sampleCart)
                    .product(sampleProduct)
                    .quantity(95)
                    .subtotal(BigDecimal.valueOf(2375000))
                    .build();

            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);
            when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.of(existingItem));

            assertThrows(RuntimeException.class, () -> {
                cartService.addItemToCart(1L, 1L, 10);
            });
        }
    }

    @Nested
    @DisplayName("User - Cập nhật số lượng trong giỏ")
    class UpdateCartItemTests {

        @Test
        @DisplayName("Cập nhật số lượng sản phẩm trong giỏ thành công")
        void updateCartItemQuantity_validQuantity_success() {
            CartItem existingItem = CartItem.builder()
                    .id(1L)
                    .cart(sampleCart)
                    .product(sampleProduct)
                    .quantity(3)
                    .subtotal(BigDecimal.valueOf(75000))
                    .build();

            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);
            when(cartItemRepository.findByCartIdAndProductId(1L, 1L)).thenReturn(Optional.of(existingItem));
            when(cartItemRepository.save(any(CartItem.class))).thenReturn(existingItem);

            CartItem result = cartService.updateCartItemQuantity(1L, 1L, 5);

            assertEquals(5, result.getQuantity());
            assertEquals(BigDecimal.valueOf(125000), result.getSubtotal());
        }

        @Test
        @DisplayName("Cập nhật số lượng <= 0 - xóa sản phẩm khỏi giỏ")
        void updateCartItemQuantity_zeroQuantity_removesItem() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));

            CartItem result = cartService.updateCartItemQuantity(1L, 1L, 0);

            assertNull(result);
            verify(cartItemRepository).deleteByCartIdAndProductId(1L, 1L);
        }

        @Test
        @DisplayName("Cập nhật vượt quá tồn kho - ném exception")
        void updateCartItemQuantity_exceedsStock_throwsException() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));
            when(productService.getProductById(1L)).thenReturn(sampleProduct);

            assertThrows(RuntimeException.class, () -> {
                cartService.updateCartItemQuantity(1L, 1L, 200);
            });
        }
    }

    @Nested
    @DisplayName("User - Xóa sản phẩm khỏi giỏ")
    class RemoveItemTests {

        @Test
        @DisplayName("Xóa sản phẩm khỏi giỏ thành công")
        void removeItemFromCart_success() {
            when(cartRepository.findByUserId(1L)).thenReturn(Optional.of(sampleCart));

            cartService.removeItemFromCart(1L, 1L);

            verify(cartItemRepository).deleteByCartIdAndProductId(1L, 1L);
        }
    }

    @Nested
    @DisplayName("User - Xóa toàn bộ giỏ hàng")
    class ClearCartTests {

        @Test
        @DisplayName("Xóa toàn bộ giỏ hàng thành công")
        void clearCart_success() {
            cartService.clearCart(1L);

            verify(cartItemRepository).deleteByCartId(1L);
        }
    }
}
