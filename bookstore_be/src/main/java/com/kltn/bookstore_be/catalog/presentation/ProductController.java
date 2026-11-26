package com.kltn.bookstore_be.catalog.presentation;

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
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.StockMovement;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.identity.application.UserService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductService productService;
    private final PublisherService publisherService;
    private final UserService userService;
    private final FavoriteProductRepository favoriteProductRepository;

    @GetMapping
    public ResponseEntity<?> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<String> publisher,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        try {
            String[] sortParams = sort.split(",");
            Sort sorting = Sort.by(sortParams[0]);
            if (sortParams.length > 1 && "desc".equalsIgnoreCase(sortParams[1])) {
                sorting = sorting.descending();
            } else {
                sorting = sorting.ascending();
            }

            Pageable pageable = PageRequest.of(page, size, sorting);
            Page<Product> productPage = productService.searchProducts(keyword, categoryId, publisher, language, minPrice, maxPrice,
                    pageable);
            return ResponseEntity.ok(productPage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/publishers")
    public ResponseEntity<?> getPublishers() {
        try {
            return ResponseEntity.ok(publisherService.getPublishers());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bestsellers")
    public ResponseEntity<?> getBestsellers(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Product> bestsellers = productService.getBestsellers(categoryId, limit);
            return ResponseEntity.ok(bestsellers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            Product product = productService.getProductById(id);
            return ResponseEntity.ok(product);
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getProductsByStatus(@PathVariable String status) {
        try {
            Product.ProductStatus productStatus = Product.ProductStatus.valueOf(status.toUpperCase());
            List<Product> products = productService.getProductsByStatus(productStatus);
            return ResponseEntity.ok(products);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Trạng thái không hợp lệ"));
        } catch (Exception e) {
            log.error("Failed to load products with status={}", status, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/count/status/{status}")
    public ResponseEntity<?> countProductsByStatus(@PathVariable String status) {
        try {
            Product.ProductStatus productStatus = Product.ProductStatus.valueOf(status.toUpperCase());
            long count = productService.countProductsByStatus(productStatus);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Trạng thái không hợp lệ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stock-movements")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllStockMovements() {
        try {
            List<StockMovement> movements = productService.getAllStockMovements();
            return ResponseEntity.ok(movements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/adjust-stock")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> adjustStock(
            @PathVariable Long id,
            @RequestParam Integer quantity,
            @RequestParam StockMovement.MovementType movementType,
            @RequestParam String note) {
        try {
            User manager = userService.getAuthenticatedUser();
            productService.adjustStock(id, quantity, movementType, note, manager);
            return ResponseEntity.ok(Map.of("message", "Điều chỉnh kho thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> createProduct(
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId) {
        try {
            Long targetCatId = categoryId != null ? categoryId
                    : (product.getCategory() != null ? product.getCategory().getId() : null);
            if (targetCatId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Danh mục không được để trống"));
            }
            Product created = productService.createProduct(product, targetCatId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestParam(required = false) Long categoryId) {
        try {
            Long targetCatId = categoryId != null ? categoryId
                    : (product.getCategory() != null ? product.getCategory().getId() : null);
            Product updated;
            if (targetCatId != null) {
                updated = productService.updateProduct(id, product, targetCatId);
            } else {
                updated = productService.updateProduct(id, product);
            }
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Xóa sản phẩm thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<?> getFavorites() {
        try {
            User user = userService.getAuthenticatedUser();
            List<FavoriteProduct> list = favoriteProductRepository.findByUserId(user.getId());
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/favorites")
    public ResponseEntity<?> addFavorite(@RequestParam Long productId) {
        try {
            User user = userService.getAuthenticatedUser();
            Product product = productService.getProductById(productId);

            java.util.Optional<FavoriteProduct> existing = favoriteProductRepository
                    .findByUserIdAndProductId(user.getId(), productId);
            if (existing.isPresent()) {
                return ResponseEntity.ok(Map.of("message", "Sản phẩm đã có trong danh sách yêu thích"));
            }

            FavoriteProduct fp = FavoriteProduct.builder()
                    .user(user)
                    .product(product)
                    .build();
            favoriteProductRepository.save(fp);
            return ResponseEntity.ok(Map.of("message", "Đã thêm vào danh sách yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/favorites")
    @Transactional
    public ResponseEntity<?> removeFavorite(@RequestParam Long productId) {
        try {
            User user = userService.getAuthenticatedUser();
            favoriteProductRepository.deleteByUserIdAndProductId(user.getId(), productId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khỏi danh sách yêu thích"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}