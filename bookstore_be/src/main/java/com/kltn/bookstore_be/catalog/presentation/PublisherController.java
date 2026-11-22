package com.kltn.bookstore_be.catalog.presentation;

import com.kltn.bookstore_be.catalog.application.PublisherResponse;
import com.kltn.bookstore_be.catalog.application.PublisherService;
import com.kltn.bookstore_be.catalog.domain.Publisher;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/publishers")
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping
    public ResponseEntity<?> getPublishers() {
        try {
            List<PublisherResponse> publishers = publisherService.getPublishers();
            return ResponseEntity.ok(publishers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPublisherById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(publisherService.getPublisherById(id));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> createPublisher(@RequestBody Publisher publisher) {
        try {
            return ResponseEntity.ok(publisherService.createPublisher(publisher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> updatePublisher(@PathVariable Long id, @RequestBody Publisher publisher) {
        try {
            return ResponseEntity.ok(publisherService.updatePublisher(id, publisher));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> deletePublisher(@PathVariable Long id) {
        try {
            publisherService.deactivatePublisher(id);
            return ResponseEntity.ok(Map.of("message", "Đã ngừng hoạt động nhà xuất bản"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
