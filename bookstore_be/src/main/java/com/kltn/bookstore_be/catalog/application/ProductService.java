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
import com.kltn.bookstore_be.ordering.domain.OrderItemRepository;
import com.kltn.bookstore_be.ordering.domain.ProductSalesProjection;
import org.springframework.data.domain.PageRequest;

import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    // Cache kết quả bestseller trong bộ nhớ (mỗi tab 1 entry), TTL ngắn để vẫn cập nhật theo đơn hàng
    private static final long BESTSELLERS_CACHE_TTL_MS = 60_000L;
    private final Map<String, CachedBestsellers> bestsellersCache = new ConcurrentHashMap<>();

    private record CachedBestsellers(List<Product> products, long timestamp) {}

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final OrderItemRepository orderItemRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    public Page<Product> searchProducts(String keyword, Long categoryId, List<String> publishers, String language, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        List<Long> categoryIds = null;
        if (categoryId != null) {
            categoryIds = getAllCategoryAndDescendantIds(categoryId);
            if (categoryIds.isEmpty()) {
                categoryIds = null;
            }
        }
        if (publishers != null && publishers.isEmpty()) {
            publishers = null;
        }
        return productRepository.searchProducts(keyword, categoryIds, publishers, language, minPrice, maxPrice, pageable);
    }

    public Page<Product> searchProducts(String keyword, Long categoryId, String language, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return searchProducts(keyword, categoryId, null, language, minPrice, maxPrice, pageable);
    }

    public List<String> getDistinctPublishers() {
        return productRepository.findDistinctPublishers();
    }

    public List<Product> getBestsellers(Long categoryId, int limit) {
        int targetLimit = (limit <= 0) ? 10 : limit;

        // Cache ngắn hạn: endpoint này được gọi ở navbar + trang chủ + mỗi lần đổi tab,
        // trong khi dữ liệu bán chạy chỉ thay đổi khi có đơn hàng mới -> 60s là đủ tươi.
        String cacheKey = categoryId + ":" + targetLimit;
        CachedBestsellers cached = bestsellersCache.get(cacheKey);
        if (cached != null && System.currentTimeMillis() - cached.timestamp() < BESTSELLERS_CACHE_TTL_MS) {
            return new ArrayList<>(cached.products());
        }

        List<Product> results = new ArrayList<>();
        Set<Long> seenProductIds = new HashSet<>();

        List<ProductSalesProjection> salesList;
        if (categoryId != null) {
            List<Long> categoryIds = getAllCategoryAndDescendantIds(categoryId);
            salesList = orderItemRepository.findTopSellingProductsByCategoryIds(
                    categoryIds, PageRequest.of(0, targetLimit)
            );
        } else {
            salesList = orderItemRepository.findTopSellingProducts(
                    PageRequest.of(0, targetLimit)
            );
        }

        // Lấy toàn bộ sản phẩm bán chạy bằng 1 query thay vì N query findById (N+1)
        if (salesList != null && !salesList.isEmpty()) {
            List<Long> orderedIds = salesList.stream()
                    .map(ProductSalesProjection::getProductId)
                    .filter(Objects::nonNull)
                    .toList();

            Map<Long, Product> productById = orderedIds.isEmpty()
                    ? Collections.emptyMap()
                    : productRepository.findByStatusAndIdIn(Product.ProductStatus.ACTIVE, orderedIds)
                            .stream()
                            .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

            for (ProductSalesProjection proj : salesList) {
                Long pId = proj.getProductId();
                Product product = productById.get(pId);
                if (product == null || !seenProductIds.add(pId)) continue;
                product.setSoldCount(proj.getTotalSold() != null ? proj.getTotalSold() : 0L);
                results.add(product);
            }
        }

        // Cold start / fallback: if we haven't reached targetLimit, fill with active products with soldCount = 0
        if (results.size() < targetLimit) {
            List<Product> fallbackList;
            if (categoryId != null) {
                List<Long> categoryIds = getAllCategoryAndDescendantIds(categoryId);
                fallbackList = productRepository.findByStatusAndCategoryIdInOrderByIdDesc(
                        Product.ProductStatus.ACTIVE, categoryIds, PageRequest.of(0, targetLimit)
                );
            } else {
                fallbackList = productRepository.findByStatusOrderByIdDesc(
                        Product.ProductStatus.ACTIVE, PageRequest.of(0, targetLimit)
                );
            }

            if (fallbackList != null) {
                for (Product fb : fallbackList) {
                    if (seenProductIds.add(fb.getId())) {
                        fb.setSoldCount(0L);
                        results.add(fb);
                        if (results.size() >= targetLimit) {
                            break;
                        }
                    }
                }
            }
        }

        List<Product> toReturn = new ArrayList<>(results);
        bestsellersCache.put(cacheKey, new CachedBestsellers(toReturn, System.currentTimeMillis()));
        return toReturn;
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
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("Số lượng điều chỉnh phải lớn hơn 0");
        }
        if (quantity > 1_000_000) {
            throw new RuntimeException("Số lượng điều chỉnh không được vượt quá 1.000.000");
        }

        Product product = getProductById(productId);
        int currentStock = product.getStockQuantity();
        int newStock = currentStock;

        if (type == StockMovement.MovementType.IMPORT) {
            if ((long) currentStock + quantity > 10_000_000L) {
                throw new RuntimeException("Số lượng tồn kho sau khi nhập vượt quá giới hạn tối đa (10.000.000)");
            }
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