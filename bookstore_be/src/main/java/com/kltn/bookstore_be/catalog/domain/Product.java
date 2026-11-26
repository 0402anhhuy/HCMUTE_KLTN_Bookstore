package com.kltn.bookstore_be.catalog.domain;

import com.kltn.bookstore_be.identity.domain.*;
import com.kltn.bookstore_be.ordering.domain.*;
import com.kltn.bookstore_be.payment.domain.*;
import com.kltn.bookstore_be.review.domain.*;
import com.kltn.bookstore_be.notification.domain.*;
import com.kltn.bookstore_be.audit.domain.*;
import com.kltn.bookstore_be.identity.application.*;
import com.kltn.bookstore_be.catalog.application.*;
import com.kltn.bookstore_be.ordering.application.*;
import com.kltn.bookstore_be.payment.application.*;
import com.kltn.bookstore_be.review.application.*;
import com.kltn.bookstore_be.notification.application.*;
import com.kltn.bookstore_be.audit.application.*;
import com.kltn.bookstore_be.identity.infrastructure.*;
import com.kltn.bookstore_be.payment.infrastructure.*;
import com.kltn.bookstore_be.common.*;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private String name;

    private String author;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "publisher_id")
    @JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Publisher publisherEntity;

    @Transient
    private String publisher;

    @Transient
    private Long publisherId;

    @JsonProperty("publisher")
    public String getPublisher() {
        return publisherEntity != null ? publisherEntity.getName() : publisher;
    }

    @JsonProperty("publisher")
    public void setPublisher(String publisherName) {
        this.publisher = publisherName;
    }

    @JsonProperty("publisherId")
    public Long getPublisherId() {
        return publisherEntity != null ? publisherEntity.getId() : publisherId;
    }

    @JsonProperty("publisherId")
    public void setPublisherId(Long publisherId) {
        this.publisherId = publisherId;
    }

    @JsonProperty("publisherInfo")
    public PublisherInfo getPublisherInfo() {
        return publisherEntity == null ? null : new PublisherInfo(
                publisherEntity.getId(),
                publisherEntity.getName(),
                publisherEntity.getShortName(),
                publisherEntity.getSlug(),
                publisherEntity.getLogoUrl()
        );
    }

    public record PublisherInfo(Long id, String name, String shortName, String slug, String logoUrl) {
    }

    private String translator;

    private String isbn;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(name = "publication_year")
    private Integer publicationYear;

    private Integer weight;

    private String dimensions;

    private String format;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private Integer page;

    @Column(nullable = false)
    private String language;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_images", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "image_url", length = 1000)
    @OrderBy("image_url ASC")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Transient
    @Builder.Default
    private Long soldCount = 0L;

    @Transient
    public String getImageUrl() {
        if (imageUrls != null && !imageUrls.isEmpty()) {
            return imageUrls.getFirst();
        }
        return null;
    }

    public void setImageUrl(String imageUrl) {
        if (imageUrl != null && !imageUrl.isBlank()) {
            if (this.imageUrls == null) {
                this.imageUrls = new ArrayList<>();
            }
            if (!this.imageUrls.contains(imageUrl)) {
                this.imageUrls.addFirst(imageUrl);
            }
        }
    }

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ProductStatus.PENDING;
        }
        if (stockQuantity == null) {
            stockQuantity = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProductStatus {
        PENDING, ACTIVE, REJECTED, INACTIVE
    }
}