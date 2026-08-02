package com.kltn.bookstore_be.ordering.domain;

import com.kltn.bookstore_be.identity.domain.*;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "return_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReturnRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "return_type", length = 50)
    private String returnType; // e.g., RETURN_REFUND or EXCHANGE

    @Column(name = "evidence_images", length = 1000)
    private String evidenceImages; // Comma-separated list of image URLs

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnStatus status;

    @Column(name = "rejected_reason", length = 500)
    private String rejectedReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = ReturnStatus.PENDING;
        }
    }

    public enum ReturnStatus {
        PENDING, APPROVED, REJECTED, COMPLETED
    }
}