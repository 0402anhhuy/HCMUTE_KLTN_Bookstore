package com.kltn.bookstore_be.ordering.domain;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.product.id AS productId, SUM(oi.quantity) AS totalSold " +
           "FROM OrderItem oi " +
           "WHERE oi.order.status != com.kltn.bookstore_be.ordering.domain.Order.OrderStatus.cancelled " +
           "AND oi.product.status = com.kltn.bookstore_be.catalog.domain.Product.ProductStatus.ACTIVE " +
           "GROUP BY oi.product.id " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<ProductSalesProjection> findTopSellingProducts(Pageable pageable);

    @Query("SELECT oi.product.id AS productId, SUM(oi.quantity) AS totalSold " +
           "FROM OrderItem oi " +
           "WHERE oi.order.status != com.kltn.bookstore_be.ordering.domain.Order.OrderStatus.cancelled " +
           "AND oi.product.category.id IN :categoryIds " +
           "AND oi.product.status = com.kltn.bookstore_be.catalog.domain.Product.ProductStatus.ACTIVE " +
           "GROUP BY oi.product.id " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<ProductSalesProjection> findTopSellingProductsByCategoryIds(@Param("categoryIds") List<Long> categoryIds, Pageable pageable);
}