package com.kltn.bookstore_be.catalog.application;

import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.catalog.domain.Publisher;
import com.kltn.bookstore_be.catalog.domain.PublisherRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublisherServiceTest {

    @InjectMocks
    private PublisherService publisherService;

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private ProductRepository productRepository;

    @Test
    @DisplayName("getPublishers gộp danh sách NXB đã lưu và từ sản phẩm, loại bỏ trùng chuẩn hóa")
    void getPublishers_mergesAndDeduplicates() {
        Publisher p1 = Publisher.builder().id(1L).name("NXB Trẻ").shortName("TRE").slug("tre").active(true).build();
        Publisher blank = Publisher.builder().id(2L).name(" ").active(true).build();
        when(publisherRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(p1, blank));
        when(productRepository.findDistinctPublishers())
                .thenReturn(Arrays.asList(null, "  ", "nxb tre", "Kim Đồng"));

        List<PublisherResponse> result = publisherService.getPublishers();
        assertEquals(2, result.size());
        assertEquals("NXB Trẻ", result.get(0).name());
        assertEquals("Kim Đồng", result.get(1).name());
        assertEquals("KIM ĐỒNG", result.get(1).shortName());

        when(publisherRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(p1));
        assertEquals(1, publisherService.getManagedPublishers().size());
    }

    @Test
    @DisplayName("getPublisherById và createPublisher xử lý thành công và lỗi validate")
    void getAndCreatePublisher_handleSuccessAndValidation() {
        Publisher pub = Publisher.builder().id(1L).name("NXB Kim Đồng").active(true).build();
        when(publisherRepository.findById(1L)).thenReturn(Optional.of(pub));
        when(publisherRepository.findById(99L)).thenReturn(Optional.empty());

        assertEquals("NXB Kim Đồng", publisherService.getPublisherById(1L).name());
        assertThrows(RuntimeException.class, () -> publisherService.getPublisherById(99L));

        assertThrows(RuntimeException.class, () -> publisherService.createPublisher(Publisher.builder().name("  ").build()));

        when(publisherRepository.existsByNameIgnoreCase("NXB Kim Đồng")).thenReturn(true);
        assertThrows(RuntimeException.class,
                () -> publisherService.createPublisher(Publisher.builder().name("NXB Kim Đồng").build()));

        Publisher req = Publisher.builder()
                .name("NXB Dân Trí")
                .logoUrl("  ")
                .websiteUrl(" https://dantri.example ")
                .build();
        when(publisherRepository.existsByNameIgnoreCase("NXB Dân Trí")).thenReturn(false);
        when(publisherRepository.save(any(Publisher.class))).thenAnswer(inv -> {
            Publisher saved = inv.getArgument(0);
            saved.setId(5L);
            return saved;
        });

        PublisherResponse created = publisherService.createPublisher(req);
        assertEquals("nxb-dan-tri", created.slug());
        assertEquals("DÂN TRÍ", created.shortName());
        assertNull(created.logoUrl());
        assertEquals("https://dantri.example", created.websiteUrl());
    }

    @Test
    @DisplayName("updatePublisher và deactivatePublisher xử lý đầy đủ nhánh")
    void updateAndDeactivatePublisher_handleAllBranches() {
        Publisher existing = Publisher.builder().id(1L).name("NXB Cũ").active(true).build();
        when(publisherRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> publisherService.updatePublisher(99L, new Publisher()));
        assertThrows(RuntimeException.class, () -> publisherService.deactivatePublisher(99L));

        when(publisherRepository.findById(1L)).thenReturn(Optional.of(existing));
        Publisher other = Publisher.builder().id(2L).name("NXB Trẻ").build();
        when(publisherRepository.findByNameIgnoreCase("NXB Trẻ")).thenReturn(Optional.of(other));
        assertThrows(RuntimeException.class,
                () -> publisherService.updatePublisher(1L, Publisher.builder().name("NXB Trẻ").build()));

        when(publisherRepository.findByNameIgnoreCase("NXB Mới")).thenReturn(Optional.empty());
        when(publisherRepository.save(any(Publisher.class))).thenAnswer(inv -> inv.getArgument(0));

        Publisher patch = Publisher.builder()
                .name("NXB Mới")
                .slug("  ")
                .shortName("MOI")
                .logoUrl("logo.png")
                .websiteUrl("https://site.vn")
                .description("Mô tả")
                .active(true)
                .build();
        PublisherResponse updated = publisherService.updatePublisher(1L, patch);
        assertEquals("NXB Mới", updated.name());
        assertEquals("nxb-moi", updated.slug());
        assertEquals("MOI", updated.shortName());

        publisherService.deactivatePublisher(1L);
        assertFalse(existing.getActive());
    }

    @Test
    @DisplayName("shortNameOf và slugify xử lý null, tiền tố NXB và ký tự đặc biệt")
    void staticHelpers_handleNullAndPrefixes() {
        assertEquals("", PublisherService.shortNameOf(null));
        assertEquals("NXB", PublisherService.shortNameOf("NXB"));
        assertNull(PublisherService.slugify(null));
        assertNull(PublisherService.slugify("!!!"));
        assertEquals("nha-xuat-ban", PublisherService.slugify("Nhà xuất bản"));
    }
}
