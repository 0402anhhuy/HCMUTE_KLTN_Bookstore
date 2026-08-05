package com.kltn.bookstore_be.ordering.presentation;

import com.kltn.bookstore_be.ordering.application.AdminCreatePromotionRequest;
import com.kltn.bookstore_be.ordering.application.PromotionService;
import com.kltn.bookstore_be.ordering.domain.Promotion;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/promotions")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return ResponseEntity.ok(promotionService.getAllPromotions());
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@Valid @RequestBody AdminCreatePromotionRequest request) {
        try {
            Promotion promotion = promotionService.createPromotion(request);
            return ResponseEntity.ok(Map.of(
                    "message", "Thêm chương trình khuyến mãi thành công",
                    "promotion", promotion
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @Valid @RequestBody AdminCreatePromotionRequest request) {
        try {
            Promotion promotion = promotionService.updatePromotion(id, request);
            return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật chương trình khuyến mãi thành công",
                    "promotion", promotion
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        try {
            promotionService.deletePromotion(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Xóa chương trình khuyến mãi thành công"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<?> getPromotionReport(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(promotionService.getPromotionReport(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
