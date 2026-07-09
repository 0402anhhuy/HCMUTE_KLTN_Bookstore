package com.kltn.bookstore_be.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shippers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===========================
    // Columns
    // ===========================

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(length = 50)
    private String vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    // ===========================
    // Relationships
    // ===========================

    @OneToMany(mappedBy = "shipper", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();

    // ===========================
    // Enum
    // ===========================

    public enum Status {
        ACTIVE,
        INACTIVE
    }

}