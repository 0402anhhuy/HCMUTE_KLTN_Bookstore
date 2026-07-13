package com.kltn.bookstore_be.controller;

import com.kltn.bookstore_be.entity.ReturnRequest;
import com.kltn.bookstore_be.service.ReturnRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/returns")
@RequiredArgsConstructor
public class ReturnRequestController {

    private final ReturnRequestService returnRequestService;

    @GetMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> getAllReturnRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ReturnRequest> returns = returnRequestService.findAll(pageable);
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getReturnsByOrderId(@PathVariable Long orderId) {
        try {
            List<ReturnRequest> returns = returnRequestService.findByOrderId(orderId);
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReturnsByUserId(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ReturnRequest> returns = returnRequestService.findByUserId(userId, pageable);
            return ResponseEntity.ok(returns);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createReturnRequest(@RequestBody ReturnRequest returnRequest) {
        try {
            ReturnRequest saved = returnRequestService.save(returnRequest);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> updateReturnStatus(
            @PathVariable Long id,
            @RequestParam ReturnRequest.Status status
    ) {
        try {
            ReturnRequest updated = returnRequestService.updateStatus(id, status);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
