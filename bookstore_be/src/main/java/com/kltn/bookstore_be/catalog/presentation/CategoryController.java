package com.kltn.bookstore_be.catalog.presentation;

import com.kltn.bookstore_be.catalog.application.ProductService;
import com.kltn.bookstore_be.catalog.domain.Category;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/categories")
public class CategoryController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> getAllCategories() {
        try {
            List<Category> categories = productService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
