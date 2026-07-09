package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.ReturnRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, Long> {

    List<ReturnRequest> findByOrderId(Long orderId);

    Page<ReturnRequest> findByUserId(Long userId, Pageable pageable);

    Page<ReturnRequest> findByStatus(ReturnRequest.Status status, Pageable pageable);
}
