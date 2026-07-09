package com.kltn.bookstore_be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(unique = true, length = 20)
    private String phone;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(length = 500)
    private String address;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(name = "locked_at")
    private LocalDateTime lockedAt;

    @Column(name = "locked_reason", length = 500)
    private String lockedReason;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===========================
    // Relationships
    // ===========================

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<OtpToken> otpTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<AuditLog> auditLogs = new ArrayList<>();

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private Cart cart;

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ProductReview> productReviews = new ArrayList<>();

    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ReturnRequest> returnRequests = new ArrayList<>();

    @OneToMany(mappedBy = "manager", fetch = FetchType.LAZY)
    @Builder.Default
    private List<StockMovement> stockMovements = new ArrayList<>();

    public enum Role {
        USER,
        MANAGER,
        ADMIN
    }

    public enum Status {
        ACTIVE,
        LOCKED
    }
}