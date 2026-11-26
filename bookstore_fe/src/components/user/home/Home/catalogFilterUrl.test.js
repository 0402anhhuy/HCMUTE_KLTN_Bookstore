import test from "node:test";
import assert from "node:assert/strict";
import {
    buildCatalogSearchParams,
    buildProductsRequestUrl,
    hasActiveCatalogFilters,
    shouldSyncCatalogUrl,
} from "./catalogFilterUrl.js";

test("hasActiveCatalogFilters detects active filters while ignoring blank keyword", () => {
    assert.equal(
        hasActiveCatalogFilters({
            keyword: "   ",
            selectedCategory: "",
            minPrice: "",
            maxPrice: "",
            selectedPublishers: [],
        }),
        false,
    );
    assert.equal(
        hasActiveCatalogFilters({ minPrice: "300000", maxPrice: "500000" }),
        true,
    );
    assert.equal(
        hasActiveCatalogFilters({ selectedPublishers: ["3"] }),
        true,
    );
});

test("buildProductsRequestUrl uses size 30 without filters and size 12 when price/category filters are active", () => {
    const unfiltered = buildProductsRequestUrl({
        page: 0,
        keyword: "",
        selectedCategory: "",
        minPrice: "",
        maxPrice: "",
        selectedPublishers: [],
    });
    assert.equal(unfiltered, "/products?page=0&size=30");

    const filtered = buildProductsRequestUrl({
        page: 0,
        keyword: "  ",
        selectedCategory: "12",
        minPrice: "300000",
        maxPrice: "500000",
        selectedPublishers: ["3", "7"],
    });
    assert.equal(
        filtered,
        "/products?page=0&size=12&categoryId=12&minPrice=300000&maxPrice=500000&publisher=3&publisher=7",
    );
});

test("buildCatalogSearchParams omits page=0 and trims keyword", () => {
    const params = buildCatalogSearchParams({
        page: 0,
        keyword: " doraemon ",
        selectedCategory: "5",
        minPrice: "300000",
        maxPrice: "500000",
        selectedPublishers: ["2"],
    });
    assert.equal(
        params.toString(),
        "keyword=doraemon&categoryId=5&minPrice=300000&maxPrice=500000&publisher=2",
    );

    const pagedParams = buildCatalogSearchParams({
        page: 2,
        keyword: "",
        selectedCategory: "",
        minPrice: "150000",
        maxPrice: "",
        selectedPublishers: [],
    });
    assert.equal(pagedParams.toString(), "minPrice=150000&page=2");
});

test("shouldSyncCatalogUrl only returns true when syncFiltersWithUrl is enabled and serialized params differ", () => {
    const next = new URLSearchParams("categoryId=5&minPrice=300000&maxPrice=500000");
    assert.equal(
        shouldSyncCatalogUrl(false, next, new URLSearchParams()),
        false,
    );
    assert.equal(
        shouldSyncCatalogUrl(true, next, new URLSearchParams("categoryId=5")),
        true,
    );
    assert.equal(
        shouldSyncCatalogUrl(
            true,
            next,
            new URLSearchParams("categoryId=5&minPrice=300000&maxPrice=500000"),
        ),
        false,
    );
});
