/**
 * Pure helpers for building catalog product API URLs and syncing filter state
 * with browser search params without re-triggering product fetches.
 */

function appendFilterSearchParams(params, {
    keyword = "",
    selectedCategory = "",
    minPrice = "",
    maxPrice = "",
    selectedPublishers = [],
}) {
    const trimmedKeyword = keyword ? keyword.trim() : "";
    if (trimmedKeyword) params.set("keyword", trimmedKeyword);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (Array.isArray(selectedPublishers)) {
        selectedPublishers.forEach((pubId) => {
            if (pubId) params.append("publisher", pubId);
        });
    }
    return params;
}

export function hasActiveCatalogFilters({
    keyword = "",
    selectedCategory = "",
    minPrice = "",
    maxPrice = "",
    selectedPublishers = [],
}) {
    return (
        Boolean(keyword && keyword.trim()) ||
        Boolean(selectedCategory) ||
        Boolean(minPrice) ||
        Boolean(maxPrice) ||
        (Array.isArray(selectedPublishers) && selectedPublishers.length > 0)
    );
}

export function buildProductsRequestUrl(filters) {
    const page = filters?.page ?? 0;
    const size = hasActiveCatalogFilters(filters) ? 12 : 30;
    const params = new URLSearchParams({
        page: String(page),
        size: String(size),
    });
    appendFilterSearchParams(params, filters);
    return `/products?${params.toString()}`;
}

export function buildCatalogSearchParams(filters) {
    const params = appendFilterSearchParams(new URLSearchParams(), filters);
    const page = filters?.page ?? 0;
    if (page > 0) params.set("page", String(page));
    return params;
}

export function shouldSyncCatalogUrl(
    syncFiltersWithUrl,
    nextParams,
    currentParams,
) {
    if (!syncFiltersWithUrl) return false;
    const nextStr = nextParams ? nextParams.toString() : "";
    const currentStr = currentParams ? currentParams.toString() : "";
    return nextStr !== currentStr;
}
