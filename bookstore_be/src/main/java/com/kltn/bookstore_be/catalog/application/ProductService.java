package com.kltn.bookstore_be.catalog.application;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.catalog.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;
import com.kltn.bookstore_be.catalog.domain.Category;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.StockMovement;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.catalog.domain.CategoryRepository;
import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.catalog.domain.StockMovementRepository;

import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public Page<Product> searchProducts(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        List<Long> categoryIds = null;
        if (categoryId != null) {
            categoryIds = getAllCategoryAndDescendantIds(categoryId);
            if (categoryIds.isEmpty()) {
                categoryIds = null;
            }
        }
        return productRepository.searchProducts(keyword, categoryIds, minPrice, maxPrice, pageable);
    }

    public List<Long> getAllCategoryAndDescendantIds(Long rootCategoryId) {
        List<Long> allIds = new ArrayList<>();
        if (rootCategoryId == null) {
            return allIds;
        }
        collectDescendantIds(rootCategoryId, allIds);
        return allIds;
    }

    private void collectDescendantIds(Long currentId, List<Long> result) {
        result.add(currentId);
        List<Category> children = categoryRepository.findByParentCategoryId(currentId);
        for (Category child : children) {
            collectDescendantIds(child.getId(), result);
        }
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public List<Category> getRootCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }

    public List<Category> getChildCategories(Long parentId) {
        return categoryRepository.findByParentCategoryId(parentId);
    }

    @Transactional
    public Category createCategory(String name) {
        return createCategory(name, null);
    }

    @Transactional
    public Category createCategory(String name, Long parentId) {
        if (categoryRepository.findByName(name).isPresent()) {
            throw new RuntimeException("Danh mục đã tồn tại");
        }

        Category.CategoryBuilder builder = Category.builder().name(name);
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại"));
            int parentDepth = getCategoryDepth(parent);
            if (parentDepth >= 3) {
                throw new RuntimeException("Cây danh mục chỉ hỗ trợ tối đa 3 cấp");
            }
            builder.parentCategory(parent);
        }

        return categoryRepository.save(builder.build());
    }

    private int getCategoryDepth(Category category) {
        int depth = 0;
        Category current = category;
        while (current.getParentCategory() != null) {
            depth++;
            current = current.getParentCategory();
        }
        return depth;
    }

    @Transactional
    public Product createProduct(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new RuntimeException("Sản phẩm chỉ nên gắn vào category cấp lá (segment 3)");
        }
        product.setCategory(category);
        product.setImageUrls(normalizeImageUrls(product));
        Product saved = productRepository.save(product);
        if (saved.getStatus() == Product.ProductStatus.ACTIVE) {
            notificationService.notifyManagersAndAdmins(
                    "Sản phẩm mới hoạt động",
                    "Sách '" + saved.getName() + "' đã được tạo và kích hoạt (ACTIVE).",
                    Notification.NotificationType.SYSTEM,
                    "products",
                    saved.getId()
            );
        }
        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedDetails, Long categoryId) {
        Product product = getProductById(id);
        Product.ProductStatus oldStatus = product.getStatus();
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            throw new RuntimeException("Sản phẩm chỉ nên gắn vào category cấp lá (segment 3)");
        }
        product.setCategory(category);
        return getProduct(updatedDetails, product, oldStatus);
    }

    @Transactional
    public Product updateProduct(Long id, Product updatedDetails) {
        Product product = getProductById(id);
        Product.ProductStatus oldStatus = product.getStatus();
        return getProduct(updatedDetails, product, oldStatus);
    }

    @NonNull
    private Product getProduct(Product updatedDetails, Product product, Product.ProductStatus oldStatus) {
        product.setName(updatedDetails.getName());
        product.setAuthor(updatedDetails.getAuthor());
        product.setPublisher(updatedDetails.getPublisher());
        product.setTranslator(updatedDetails.getTranslator());
        product.setIsbn(updatedDetails.getIsbn());
        product.setSupplierName(updatedDetails.getSupplierName());
        product.setPublicationYear(updatedDetails.getPublicationYear());
        product.setWeight(updatedDetails.getWeight());
        product.setDimensions(updatedDetails.getDimensions());
        product.setFormat(updatedDetails.getFormat());
        product.setDescription(updatedDetails.getDescription());
        product.setPrice(updatedDetails.getPrice());
        product.setPage(updatedDetails.getPage());
        product.setLanguage(updatedDetails.getLanguage());
        product.setImageUrls(normalizeImageUrls(updatedDetails));
        product.setStatus(updatedDetails.getStatus());
        product.setStockQuantity(updatedDetails.getStockQuantity());
        Product saved = productRepository.save(product);
        if (saved.getStatus() == Product.ProductStatus.ACTIVE && oldStatus != Product.ProductStatus.ACTIVE) {
            notificationService.notifyManagersAndAdmins(
                    "Sản phẩm đã duyệt",
                    "Sách '" + saved.getName() + "' đã được duyệt và hoạt động (ACTIVE).",
                    Notification.NotificationType.SYSTEM,
                    "products",
                    saved.getId()
            );
        }
        return saved;
    }

    private List<String> normalizeImageUrls(Product source) {
        List<String> normalized = new ArrayList<>();
        if (source.getImageUrls() == null) {
            return normalized;
        }
        for (String imageUrl : source.getImageUrls()) {
            if (imageUrl == null) {
                continue;
            }
            String candidate = imageUrl.trim();
            if (!candidate.isBlank() && !normalized.contains(candidate)) {
                normalized.add(candidate);
            }
        }
        return normalized;
    }

    @Transactional
    public void deleteProduct(Long id) {
        try {
            productRepository.deleteById(id);
            productRepository.flush();
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw new RuntimeException("Không thể xóa sản phẩm này vì đã tồn tại trong lịch sử mua hàng. Hãy chuyển trạng thái sản phẩm sang ẩn hoặc ngừng bán.");
        }
    }

    @Transactional
    public void adjustStock(Long productId, Integer quantity, StockMovement.MovementType type, String note, User manager) {
        Product product = getProductById(productId);
        int currentStock = product.getStockQuantity();
        int newStock = currentStock;

        if (type == StockMovement.MovementType.IMPORT) {
            newStock += quantity;
        } else if (type == StockMovement.MovementType.EXPORT) {
            if (currentStock < quantity) {
                throw new RuntimeException("Số lượng tồn kho không đủ để xuất");
            }
            newStock -= quantity;
        } else if (type == StockMovement.MovementType.ADJUST) {
            newStock = quantity;
        }

        product.setStockQuantity(newStock);
        productRepository.save(product);

        StockMovement movement = StockMovement.builder()
                .product(product)
                .manager(manager)
                .movementType(type)
                .quantity(quantity)
                .note(note)
                .build();
        stockMovementRepository.save(movement);

        auditLogService.log(manager, "STOCK_MOVEMENT",
                "Điều chỉnh tồn kho sản phẩm: " + product.getName() +
                        ", Loại: " + type.name() +
                        ", Số lượng: " + quantity +
                        ", Tồn cũ: " + currentStock +
                        ", Tồn mới: " + newStock);
    }

    public List<StockMovement> getAllStockMovements() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Product> getProductsByStatus(Product.ProductStatus status) {
        return productRepository.findByStatusOrderByIdDesc(status);
    }

    public long countProductsByStatus(Product.ProductStatus status) {
        return productRepository.countByStatus(status);
    }
}