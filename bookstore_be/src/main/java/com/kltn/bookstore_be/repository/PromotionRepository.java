package com.kltn.bookstore_be.repository;

import com.kltn.bookstore_be.entity.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {

    Page<Promotion> findByStatus(Promotion.Status status, Pageable pageable);
}
