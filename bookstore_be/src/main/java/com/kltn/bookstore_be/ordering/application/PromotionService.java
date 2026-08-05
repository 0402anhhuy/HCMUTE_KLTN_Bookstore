package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.identity.domain.User;
import com.kltn.bookstore_be.ordering.domain.Order;
import com.kltn.bookstore_be.ordering.domain.OrderRepository;
import com.kltn.bookstore_be.ordering.domain.Promotion;
import com.kltn.bookstore_be.ordering.domain.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final AuditLogService auditLogService;
    private final UserService userService;

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    @Transactional
    public Promotion createPromotion(AdminCreatePromotionRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("Thời gian kết thúc phải lớn hơn thời gian bắt đầu");
        }

        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new RuntimeException("Phải chọn ít nhất một sản phẩm để áp dụng ưu đãi");
        }

        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.isEmpty()) {
            throw new RuntimeException("Không tìm thấy sản phẩm nào hợp lệ. IDs được gửi: " + request.getProductIds());
        }

        Promotion.PromotionStatus status = Promotion.PromotionStatus.PENDING;
        if (request.getStartDate().isBefore(LocalDateTime.now()) || request.getStartDate().isEqual(LocalDateTime.now())) {
            status = Promotion.PromotionStatus.ACTIVE;
        }
        if (request.getEndDate().isBefore(LocalDateTime.now())) {
            status = Promotion.PromotionStatus.EXPIRED;
        }

        Promotion promotion = Promotion.builder()
                .title(request.getTitle())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .minOrderValue(BigDecimal.ZERO)
                .maxDiscountAmount(BigDecimal.ZERO)
                .usageLimit(999999) // Infinite limit for product-wise promos conceptually unless configured
                .usedCount(0)
                .status(status)
                .applicableProducts(products)
                .build();

        Promotion saved = promotionRepository.save(promotion);

        try {
            User admin = userService.getAuthenticatedUser();
            auditLogService.log(admin, "CREATE_PROMOTION", "Tạo chương trình ưu đãi mới: " + saved.getTitle());
        } catch (Exception e) {
            // Ignore if no admin context found strictly
        }

        return saved;
    }   

    @Transactional
    public Promotion updatePromotion(Long id, AdminCreatePromotionRequest request) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new RuntimeException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        if (request.getProductIds() == null || request.getProductIds().isEmpty()) {
            throw new RuntimeException("Phải chọn ít nhất một sản phẩm để áp dụng ưu đãi");
        }

        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương trình khuyến mãi"));

        List<Product> products = productRepository.findAllById(request.getProductIds());
        if (products.isEmpty()) {
            throw new RuntimeException("Không tìm thấy sản phẩm nào hợp lệ trong hệ thống. IDs được gửi: " + request.getProductIds());
        }

        Promotion.PromotionStatus status = Promotion.PromotionStatus.PENDING;
        if (!request.getStartDate().isAfter(LocalDateTime.now())) {
            status = Promotion.PromotionStatus.ACTIVE;
        }
        if (request.getEndDate().isBefore(LocalDateTime.now())) {
            status = Promotion.PromotionStatus.EXPIRED;
        }

        promotion.setTitle(request.getTitle());
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setStatus(status);
        promotion.setApplicableProducts(products);

        Promotion saved = promotionRepository.save(promotion);

        try {
            User admin = userService.getAuthenticatedUser();
            auditLogService.log(admin, "UPDATE_PROMOTION", "Cập nhật chương trình ưu đãi: " + saved.getTitle());
        } catch (Exception e) {
            // Ignore
        }

        return saved;
    }

    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương trình khuyến mãi"));

        promotionRepository.delete(promotion);

        try {
            User admin = userService.getAuthenticatedUser();
            auditLogService.log(admin, "DELETE_PROMOTION", "Xóa chương trình ưu đãi: " + promotion.getTitle());
        } catch (Exception e) {
            // Ignore
        }
    }

    public PromotionReportResponse getPromotionReport(Long id) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chương trình khuyến mãi"));

        List<Order> orders = orderRepository.findByPromotionId(id);
        
        long totalUses = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        for (Order order : orders) {
            // Only count successful orders, not cancelled or pending
            if (order.getStatus() != Order.OrderStatus.cancelled &&
                order.getStatus() != Order.OrderStatus.cancel_requested &&
                order.getStatus() != Order.OrderStatus.refunded) {
                totalUses++;
                totalRevenue = totalRevenue.add(order.getFinalAmount() != null ? order.getFinalAmount() : BigDecimal.ZERO);
            }
        }

        return PromotionReportResponse.builder()
                .promotion(promotion)
                .totalUses(totalUses)
                .totalRevenue(totalRevenue)
                .build();
    }
}
