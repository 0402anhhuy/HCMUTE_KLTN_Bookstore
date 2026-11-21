package com.kltn.bookstore_be.catalog.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.status = 'ACTIVE' " +
            "AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.author) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(p.publisher) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:categoryIds IS NULL OR p.category.id IN :categoryIds) " +
            "AND (:publishers IS NULL OR p.publisher IN :publishers) " +
            "AND (:language IS NULL OR LOWER(p.language) = LOWER(:language)) " +
            "AND (:minPrice IS NULL OR p.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR p.price <= :maxPrice)")
    Page<Product> searchProducts(
            @Param("keyword") String keyword,
            @Param("categoryIds") List<Long> categoryIds,
            @Param("publishers") List<String> publishers,
            @Param("language") String language,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    @Query("SELECT DISTINCT p.publisher FROM Product p WHERE p.status = 'ACTIVE' AND p.publisher IS NOT NULL AND TRIM(p.publisher) != '' ORDER BY p.publisher ASC")
    List<String> findDistinctPublishers();

    // Eager-fetch category để serialize bestseller không sinh N+1 query
    // (images đã là @ElementCollection EAGER nên không cần khai báo trong graph)
    @EntityGraph(attributePaths = {"category"})
    List<Product> findByStatusAndIdIn(Product.ProductStatus status, Collection<Long> ids);

    List<Product> findByStatusOrderByIdDesc(Product.ProductStatus status);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByStatusOrderByIdDesc(Product.ProductStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"category"})
    List<Product> findByStatusAndCategoryIdInOrderByIdDesc(Product.ProductStatus status, List<Long> categoryIds, Pageable pageable);
    long countByStatus(Product.ProductStatus status);
}