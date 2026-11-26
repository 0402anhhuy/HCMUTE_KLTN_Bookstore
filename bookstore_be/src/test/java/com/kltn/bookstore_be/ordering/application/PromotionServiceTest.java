package com.kltn.bookstore_be.ordering.application;

import com.kltn.bookstore_be.audit.application.AuditLogService;
import com.kltn.bookstore_be.catalog.domain.Product;
import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.identity.application.UserService;
import com.kltn.bookstore_be.ordering.domain.OrderRepository;
import com.kltn.bookstore_be.ordering.domain.Promotion;
import com.kltn.bookstore_be.ordering.domain.PromotionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @InjectMocks
    private PromotionService promotionService;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private UserService userService;

    @Test
    @DisplayName("Lấy danh sách CTKM - tự động chuyển EXPIRED khi quá endDate và ACTIVE khi PENDING đến giờ")
    void getAllPromotions_syncsExpiredAndPendingStatuses() {
        LocalDateTime now = LocalDateTime.now();

        Promotion overdueActive = Promotion.builder()
                .id(1L)
                .title("Flash Sale cũ")
                .discountType(Promotion.DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .minOrderValue(BigDecimal.ZERO)
                .maxDiscountAmount(BigDecimal.ZERO)
                .usageLimit(100)
                .usedCount(0)
                .startDate(now.minusDays(10))
                .endDate(now.minusDays(5))
                .status(Promotion.PromotionStatus.ACTIVE)
                .build();

        Promotion duePending = Promotion.builder()
                .id(2L)
                .title("Flash Sale đến giờ")
                .discountType(Promotion.DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .minOrderValue(BigDecimal.ZERO)
                .maxDiscountAmount(BigDecimal.ZERO)
                .usageLimit(100)
                .usedCount(0)
                .startDate(now.minusHours(1))
                .endDate(now.plusHours(2))
                .status(Promotion.PromotionStatus.PENDING)
                .build();

        when(promotionRepository.findAll()).thenReturn(List.of(overdueActive, duePending));
        when(orderRepository.findByPromotionId(any())).thenReturn(List.of());

        List<Promotion> result = promotionService.getAllPromotions();

        assertEquals(Promotion.PromotionStatus.EXPIRED, result.get(0).getStatus());
        assertEquals(Promotion.PromotionStatus.ACTIVE, result.get(1).getStatus());
        verify(promotionRepository).saveAll(anyList());
    }

    @Test
    @DisplayName("Tạo CTKM mới - bỏ qua CTKM cũ đã quá endDate dù status cũ vẫn là ACTIVE")
    void createPromotion_allowsProductFromOverduePromotion() {
        LocalDateTime now = LocalDateTime.now();
        Product book = Product.builder()
                .id(10L)
                .name("Clean Code")
                .price(BigDecimal.valueOf(100000))
                .stockQuantity(10)
                .status(Product.ProductStatus.ACTIVE)
                .build();

        Promotion overduePromo = Promotion.builder()
                .id(99L)
                .title("Sale tháng 8")
                .discountType(Promotion.DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .minOrderValue(BigDecimal.ZERO)
                .maxDiscountAmount(BigDecimal.ZERO)
                .usageLimit(100)
                .usedCount(0)
                .startDate(now.minusDays(30))
                .endDate(now.minusDays(29))
                .status(Promotion.PromotionStatus.ACTIVE)
                .applicableProducts(List.of(book))
                .build();

        AdminCreatePromotionRequest req = new AdminCreatePromotionRequest();
        req.setTitle("Sale mới");
        req.setDiscountType(Promotion.DiscountType.PERCENT);
        req.setDiscountValue(BigDecimal.valueOf(20));
        req.setStartDate(now);
        req.setEndDate(now.plusDays(1));
        req.setProductIds(List.of(10L));

        when(productRepository.findAllById(List.of(10L))).thenReturn(List.of(book));
        when(promotionRepository.findAll()).thenReturn(List.of(overduePromo));
        when(promotionRepository.save(any(Promotion.class))).thenAnswer(inv -> inv.getArgument(0));

        Promotion created = promotionService.createPromotion(req);

        assertNotNull(created);
        assertEquals(Promotion.PromotionStatus.EXPIRED, overduePromo.getStatus());
    }
}
