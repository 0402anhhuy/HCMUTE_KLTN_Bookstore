import { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useHome } from "@/components/user/home";

/**
 * Hook của trang Catalog.
 *
 * Phần tải/lọc sản phẩm được dùng chung với trang chủ (`useHome`) để tránh 2 nguồn
 * logic khác nhau: trang chủ lọc theo state cục bộ, còn Catalog đồng bộ bộ lọc lên URL.
 * Nhờ vậy, mọi lựa chọn ở bộ lọc (danh mục, giá, NXB) đều thực sự được gửi xuống API.
 */
export const useCatalog = () => {
    const { addToCart } = useApp();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        keyword,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedPublishers,
        setSelectedPublishers,
        products,
        page,
        setPage,
        totalPages,
        loading,
        categories,
        categoryTree,
        publishers,
        handleClearFilters: clearAllFilters,
        openProductDetail,
        formatPrice,
        getProductImage,
        fetchProducts,
    } = useHome({ syncFiltersWithUrl: true });

    // ===== Ô tìm kiếm trên trang =====
    // Chỉ là bản nháp của người dùng; khi URL đổi (bấm tìm kiếm ở navbar) thì khoá lại theo URL
    const [searchDraft, setSearchDraft] = useState(null);
    const searchInput = searchDraft ?? keyword;
    const setSearchInput = setSearchDraft;

    // ===== Danh sách toàn bộ NXB =====
    const availablePublishers = useMemo(() => {
        const list = (publishers || []).map((p) => p.name);
        if (list.length > 0) return list;
        const set = new Set();
        products.forEach((p) => {
            if (p.publisher) set.add(p.publisher.trim());
        });
        return Array.from(set);
    }, [publishers, products]);

    // ===== Khoảng giá dạng checkbox =====
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);

    const togglePriceRange = (min, max) => {
        setSelectedPriceRanges((prev) => {
            const exists = prev.some((r) => r.min === min && r.max === max);
            const updated = exists
                ? prev.filter((r) => !(r.min === min && r.max === max))
                : [...prev, { min, max }];

            // Gửi khoảng giá bao trùm các lựa chọn xuống API
            if (updated.length === 0) {
                setMinPrice("");
                setMaxPrice("");
            } else {
                const mins = updated.map((r) =>
                    r.min !== "" ? Number(r.min) : 0,
                );
                const overallMin = Math.min(...mins);
                const hasNoMax = updated.some((r) => r.max === "");
                const maxs = updated
                    .map((r) => (r.max !== "" ? Number(r.max) : 0))
                    .filter(Boolean);
                const overallMax =
                    hasNoMax || maxs.length === 0
                        ? ""
                        : String(Math.max(...maxs));
                setMinPrice(String(overallMin));
                setMaxPrice(overallMax);
            }

            return updated;
        });
        setPage(0);
    };

    // ===== NXB =====
    const togglePublisher = useCallback(
        (pub) => {
            setSelectedPublishers((prev) =>
                prev.includes(pub)
                    ? prev.filter((item) => item !== pub)
                    : [...prev, pub],
            );
            setPage(0);
        },
        [setSelectedPublishers, setPage],
    );

    // ===== Chip xoá từng bộ lọc =====
    const removeCategoryFilter = () => {
        setSelectedCategory("");
        setPage(0);
    };

    const removePriceFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        setSelectedPriceRanges([]);
        setPage(0);
    };

    const removeKeywordFilter = () => {
        setSearchDraft(null);
        setPage(0);
        // Xoá keyword khỏi URL nhưng giữ lại các bộ lọc khác
        const next = new URLSearchParams(searchParams);
        next.delete("keyword");
        setSearchParams(next, { replace: true });
    };

    // ===== Tìm kiếm theo từ khoá =====
    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setPage(0);
        // Đẩy từ khoá lên URL ngay để hook tự tải lại danh sách
        const next = new URLSearchParams(searchParams);
        next.delete("page");
        if (searchInput.trim()) next.set("keyword", searchInput.trim());
        else next.delete("keyword");
        setSearchParams(next);
    };

    const handleClearFilters = () => {
        setSelectedPriceRanges([]);
        setSearchDraft(null);
        clearAllFilters();
    };

    const [showMoreCategory, setShowMoreCategory] = useState(false);

    return {
        // Dữ liệu & trạng thái
        keyword,
        searchInput,
        setSearchInput,
        categories,
        categoryTree,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedPriceRanges,
        togglePriceRange,
        products,
        page,
        setPage,
        totalPages,
        loading,

        // Hành động
        handleSearch,
        handleClearFilters,
        openProductDetail,
        addToCart,
        formatPrice,
        getProductImage,
        fetchProducts,

        // Bộ lọc NXB
        availablePublishers,
        selectedPublishers,
        togglePublisher,

        // Chip bộ lọc
        removeCategoryFilter,
        removePriceFilter,
        removeKeywordFilter,

        showMoreCategory,
        setShowMoreCategory,
    };
};
