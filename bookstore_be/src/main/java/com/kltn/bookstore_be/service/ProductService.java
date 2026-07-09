package com.kltn.bookstore_be.service;

import com.kltn.bookstore_be.entity.Category;
import com.kltn.bookstore_be.entity.Product;
import com.kltn.bookstore_be.repository.CategoryRepository;
import com.kltn.bookstore_be.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<Product> searchProducts(String keyword, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        return productRepository.searchProducts(keyword, categoryId, minPrice, maxPrice, pageable);
    }

    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Product findById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + id));
    }

    @Transactional
    public Product save(Product product, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + categoryId));
        product.setCategory(category);
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Long id, Product updatedProduct, Long categoryId) {
        Product existing = findById(id);
        if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với ID: " + categoryId));
            existing.setCategory(category);
        }
        existing.setName(updatedProduct.getName());
        existing.setAuthor(updatedProduct.getAuthor());
        existing.setPublisher(updatedProduct.getPublisher());
        existing.setIsbn(updatedProduct.getIsbn());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        existing.setImageUrl(updatedProduct.getImageUrl());
        existing.setStatus(updatedProduct.getStatus());
        return productRepository.save(existing);
    }

    @Transactional
    public void deleteById(Long id) {
        productRepository.deleteById(id);
    }
}
