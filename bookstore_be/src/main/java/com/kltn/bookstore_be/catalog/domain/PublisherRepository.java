package com.kltn.bookstore_be.catalog.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublisherRepository extends JpaRepository<Publisher, Long> {

    List<Publisher> findByActiveTrueOrderByNameAsc();

    Optional<Publisher> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);

    Optional<Publisher> findBySlugIgnoreCase(String slug);

    @Query("SELECT p.name FROM Publisher p")
    List<String> findAllNames();
}
