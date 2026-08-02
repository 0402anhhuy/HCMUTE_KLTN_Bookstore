package com.kltn.bookstore_be.ordering.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "shippers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = true)
    private String vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShipperStatus status;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = ShipperStatus.ACTIVE;
        }
    }

    public enum ShipperStatus {
        ACTIVE, INACTIVE
    }
}