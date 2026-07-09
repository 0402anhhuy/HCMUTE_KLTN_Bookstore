package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.Payment;
import com.kltn.bookstore_be.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;

    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán với ID: " + id));
    }

    public Payment findByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thanh toán cho đơn hàng: " + orderId));
    }

    @Transactional
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deleteById(Long id) {
        paymentRepository.deleteById(id);
    }
}
