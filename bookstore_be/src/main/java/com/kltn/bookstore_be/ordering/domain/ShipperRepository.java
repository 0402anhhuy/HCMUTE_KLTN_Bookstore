package com.kltn.bookstore_be.ordering.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShipperRepository extends JpaRepository<Shipper, Long> {
    List<Shipper> findByStatus(Shipper.ShipperStatus status);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, Long id);
}