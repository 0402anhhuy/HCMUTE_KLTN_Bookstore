package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.StockMovement;
import com.kltn.bookstore_be.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    public List<StockMovement> findAll() {
        return stockMovementRepository.findAllByOrderByCreatedAtDesc();
    }

    public Page<StockMovement> findByProductId(Long productId, Pageable pageable) {
        return stockMovementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    public StockMovement findById(Long id) {
        return stockMovementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu kho với ID: " + id));
    }

    @Transactional
    public StockMovement save(StockMovement stockMovement) {
        return stockMovementRepository.save(stockMovement);
    }
}
