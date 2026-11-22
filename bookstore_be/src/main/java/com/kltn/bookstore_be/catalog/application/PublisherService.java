package com.kltn.bookstore_be.catalog.application;

import com.kltn.bookstore_be.catalog.domain.ProductRepository;
import com.kltn.bookstore_be.catalog.domain.Publisher;
import com.kltn.bookstore_be.catalog.domain.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PublisherService {

    private static final Pattern PREFIX = Pattern.compile("^(NXB|NHA XUAT BAN)\\s+");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final Pattern NON_ALNUM = Pattern.compile("[^a-z0-9]+");

    private final PublisherRepository publisherRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<PublisherResponse> getPublishers() {
        Map<String, PublisherResponse> byKey = new LinkedHashMap<>();

        for (Publisher publisher : publisherRepository.findByActiveTrueOrderByNameAsc()) {
            String key = normalize(publisher.getName());
            if (key.isEmpty() || byKey.containsKey(key)) {
                continue;
            }
            byKey.put(key, PublisherResponse.from(publisher));
        }

        for (String productPublisher : productRepository.findDistinctPublishers()) {
            if (productPublisher == null || productPublisher.isBlank()) {
                continue;
            }
            String trimmed = productPublisher.trim();
            String key = normalize(trimmed);
            if (key.isEmpty() || byKey.containsKey(key)) {
                continue;
            }
            byKey.put(key, new PublisherResponse(
                    null,
                    trimmed,
                    shortNameOf(trimmed),
                    slugify(trimmed),
                    null,
                    null,
                    null,
                    true
            ));
        }

        return new ArrayList<>(byKey.values());
    }

    @Transactional(readOnly = true)
    public List<PublisherResponse> getManagedPublishers() {
        return publisherRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(PublisherResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PublisherResponse getPublisherById(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với ID: " + id));
        return PublisherResponse.from(publisher);
    }

    @Transactional
    public PublisherResponse createPublisher(Publisher requested) {
        String name = requireName(requested.getName());
        if (publisherRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Nhà xuất bản đã tồn tại: " + name);
        }
        Publisher publisher = Publisher.builder()
                .name(name)
                .slug(fallback(requested.getSlug(), slugify(name)))
                .logoUrl(normalizeOptional(requested.getLogoUrl()))
                .websiteUrl(normalizeOptional(requested.getWebsiteUrl()))
                .description(normalizeOptional(requested.getDescription()))
                .shortName(fallback(requested.getShortName(), shortNameOf(name)))
                .active(requested.getActive() == null ? Boolean.TRUE : requested.getActive())
                .build();
        return PublisherResponse.from(publisherRepository.save(publisher));
    }

    @Transactional
    public PublisherResponse updatePublisher(Long id, Publisher requested) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với ID: " + id));

        if (requested.getName() != null) {
            String name = requireName(requested.getName());
            Optional<Publisher> duplicated = publisherRepository.findByNameIgnoreCase(name);
            if (duplicated.isPresent() && !duplicated.get().getId().equals(id)) {
                throw new RuntimeException("Nhà xuất bản đã tồn tại: " + name);
            }
            publisher.setName(name);
        }
        if (requested.getSlug() != null) {
            publisher.setSlug(requested.getSlug().isBlank()
                    ? slugify(publisher.getName())
                    : requested.getSlug().trim());
        }
        if (requested.getLogoUrl() != null) publisher.setLogoUrl(normalizeOptional(requested.getLogoUrl()));
        if (requested.getWebsiteUrl() != null) publisher.setWebsiteUrl(normalizeOptional(requested.getWebsiteUrl()));
        if (requested.getDescription() != null) publisher.setDescription(normalizeOptional(requested.getDescription()));
        if (requested.getShortName() != null) publisher.setShortName(normalizeOptional(requested.getShortName()));
        if (requested.getActive() != null) publisher.setActive(requested.getActive());

        return PublisherResponse.from(publisherRepository.save(publisher));
    }

    @Transactional
    public void deactivatePublisher(Long id) {
        Publisher publisher = publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với ID: " + id));
        publisher.setActive(false);
        publisherRepository.save(publisher);
    }

    public static String shortNameOf(String name) {
        if (name == null) return "";
        String cleaned = name.trim().replaceFirst("(?i)^(NXB|Nhà xuất bản)\\s+", "").trim();
        String result = cleaned.isEmpty() ? name.trim() : cleaned;
        return result.toUpperCase(Locale.ROOT);
    }

    public static String slugify(String value) {
        if (value == null) return null;
        String key = normalize(value).replace(' ', '-');
        key = NON_ALNUM.matcher(key).replaceAll("-").replaceAll("(^-+|-+$)", "");
        return key.isEmpty() ? null : key;
    }

    static String normalize(String value) {
        if (value == null) return "";
        String lower = value.trim().toLowerCase(Locale.ROOT).replace('đ', 'd');
        String noAccent = DIACRITICS
                .matcher(Normalizer.normalize(lower, Normalizer.Form.NFD))
                .replaceAll("");
        noAccent = PREFIX.matcher(noAccent).replaceFirst("");
        return noAccent.replaceAll("\\s+", " ").trim();
    }

    private static String requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new RuntimeException("Tên nhà xuất bản không được để trống");
        }
        return name.trim();
    }

    private static String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private static String fallback(String value, String defaultValue) {
        String normalized = normalizeOptional(value);
        return normalized == null ? defaultValue : normalized;
    }
}
