package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.ReturnRequest;
import com.kltn.bookstore_be.repository.ReturnRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnRequestService {

    private final ReturnRequestRepository returnRequestRepository;

    public Page<ReturnRequest> findAll(Pageable pageable) {
        return returnRequestRepository.findAll(pageable);
    }

    public List<ReturnRequest> findByOrderId(Long orderId) {
        return returnRequestRepository.findByOrderId(orderId);
    }

    public Page<ReturnRequest> findByUserId(Long userId, Pageable pageable) {
        return returnRequestRepository.findByUserId(userId, pageable);
    }

    public ReturnRequest findById(Long id) {
        return returnRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu hoàn trả với ID: " + id));
    }

    @Transactional
    public ReturnRequest save(ReturnRequest returnRequest) {
        return returnRequestRepository.save(returnRequest);
    }

    @Transactional
    public ReturnRequest updateStatus(Long id, ReturnRequest.Status status) {
        ReturnRequest request = findById(id);
        request.setStatus(status);
        return returnRequestRepository.save(request);
    }
}
