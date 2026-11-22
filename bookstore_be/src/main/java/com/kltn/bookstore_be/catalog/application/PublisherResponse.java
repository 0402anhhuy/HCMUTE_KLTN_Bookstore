package com.kltn.bookstore_be.catalog.application;

import com.kltn.bookstore_be.catalog.domain.Publisher;

public record PublisherResponse(
        Long id,
        String name,
        String shortName,
        String slug,
        String logoUrl,
        String websiteUrl,
        String description,
        Boolean active
) {
    public static PublisherResponse from(Publisher publisher) {
        return new PublisherResponse(
                publisher.getId(),
                publisher.getName(),
                publisher.getShortName(),
                publisher.getSlug(),
                publisher.getLogoUrl(),
                publisher.getWebsiteUrl(),
                publisher.getDescription(),
                publisher.getActive()
        );
    }
}
