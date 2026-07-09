package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.OrderItem;
import com.kltn.bookstore_be.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderItemService {

    private final OrderItemRepository orderItemRepository;

    public List<OrderItem> findByOrderId(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    public OrderItem findById(Long id) {
        return orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chi tiết đơn hàng với ID: " + id));
    }

    @Transactional
    public OrderItem save(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public void deleteById(Long id) {
        orderItemRepository.deleteById(id);
    }
}
