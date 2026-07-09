package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.Shipper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, Long> {

    Optional<Shipper> findByPhone(String phone);

    Page<Shipper> findByStatus(Shipper.Status status, Pageable pageable);
}
