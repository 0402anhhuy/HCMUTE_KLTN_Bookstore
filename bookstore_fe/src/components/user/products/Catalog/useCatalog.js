import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { buildCategoryTree } from "@/utils/categoryTree";

export const useCatalog = () => {
    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy query param từ URL
    const keyword = searchParams.get("keyword") || "";
    const categoryFromUrl = searchParams.get("categoryId") || "";

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [customMinPrice, setCustomMinPrice] = useState("");
    const [customMaxPrice, setCustomMaxPrice] = useState("");
    const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
    const [searchInput, setSearchInput] = useState(keyword);

    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [allPublishers, setAllPublishers] = useState([]);

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Đồng bộ khi URL thay đổi
    useEffect(() => {
        const catId = searchParams.get("categoryId") || "";
        const kw = searchParams.get("keyword") || "";
        const pub = searchParams.get("publisher") || "";
        setSelectedCategory(catId);
        setSearchInput(kw);
        if (pub) {
            setSelectedPublishers([pub]);
        } else {
            setSelectedPublishers([]);
        }
        setPage(0);
    }, [searchParams]);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data || []);
        } catch (e) {
            console.error("Lỗi lấy danh mục:", e);
        }
    };

    const fetchPublishers = async () => {
        try {
            const response = await api.get("/products/publishers");
            if (Array.isArray(response.data) && response.data.length > 0) {
                setAllPublishers(response.data);
            }
        } catch (e) {
            console.error("Lỗi lấy danh sách NXB:", e);
        }
    };

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/products?page=${page}&size=12`;
            if (keyword.trim())
                url += `&keyword=${encodeURIComponent(keyword)}`;
            if (selectedCategory) url += `&categoryId=${selectedCategory}`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;
            if (selectedPublishers && selectedPublishers.length > 0) {
                selectedPublishers.forEach((pub) => {
                    url += `&publisher=${encodeURIComponent(pub)}`;
                });
            }

            const response = await api.get(url);
            setProducts(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 1);
        } catch (e) {
            console.error("Lỗi lấy sản phẩm:", e);
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [page, selectedCategory, keyword, minPrice, maxPrice, selectedPublishers]);

    useEffect(() => {
        fetchCategories();
        fetchPublishers();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Danh sách toàn bộ NXB có trong hệ thống
    const availablePublishers = useMemo(() => {
        if (allPublishers.length > 0) {
            return allPublishers;
        }
        const set = new Set();
        products.forEach((p) => {
            if (p.publisher) set.add(p.publisher.trim());
        });
        return Array.from(set);
    }, [allPublishers, products]);

    // Lọc theo NXB & Các khoảng giá đã chọn trên tập dữ liệu
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (
                selectedPublishers.length > 0 &&
                !selectedPublishers.includes(p.publisher)
            ) {
                return false;
            }
            if (selectedPriceRanges.length > 0) {
                const price = Number(p.price || 0);
                const matches = selectedPriceRanges.some((r) => {
                    const min = r.min !== "" ? Number(r.min) : 0;
                    const max = r.max !== "" ? Number(r.max) : Infinity;
                    return price >= min && price <= max;
                });
                if (!matches) return false;
            }
            return true;
        });
    }, [products, selectedPublishers, selectedPriceRanges]);

    const handleSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setPage(0);
        const params = {};
        if (searchInput.trim()) params.keyword = searchInput.trim();
        if (selectedCategory) params.categoryId = selectedCategory;
        if (selectedPublishers.length > 0) params.publisher = selectedPublishers[0];
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setSearchParams({});
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setCustomMinPrice("");
        setCustomMaxPrice("");
        setSelectedPriceRanges([]);
        setSearchInput("");
        setSelectedPublishers([]);
        setPage(0);
    };

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        })
            .format(price || 0)
            .replace("₫", "đ");
    };

    const getProductImage = (product) => {
        if (!product) return null;
        if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            return product.imageUrls[0];
        }
        if (typeof product.imageUrl === "string" && product.imageUrl) {
            const splitImgs = product.imageUrl
                .split("||")
                .map((s) => s.trim())
                .filter(Boolean);
            return splitImgs[0] || product.imageUrl;
        }
        return null;
    };

    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories],
    );

    const [showMoreCategory, setShowMoreCategory] = useState(false);

    const togglePriceRange = (min, max) => {
        setCustomMinPrice("");
        setCustomMaxPrice("");
        setSelectedPriceRanges((prev) => {
            const exists = prev.some((r) => r.min === min && r.max === max);
            let updated;
            if (exists) {
                updated = prev.filter((r) => !(r.min === min && r.max === max));
            } else {
                updated = [...prev, { min, max }];
            }

            if (updated.length === 0) {
                setMinPrice("");
                setMaxPrice("");
            } else if (updated.length === 1) {
                setMinPrice(updated[0].min);
                setMaxPrice(updated[0].max);
            } else {
                // Multi range selected: compute overall min and max for API call
                const mins = updated.map((r) => (r.min !== "" ? Number(r.min) : 0));
                const overallMin = Math.min(...mins);
                const hasNoMax = updated.some((r) => r.max === "");
                const maxs = updated
                    .map((r) => (r.max !== "" ? Number(r.max) : 0))
                    .filter(Boolean);
                const overallMax = hasNoMax || maxs.length === 0 ? "" : String(Math.max(...maxs));
                setMinPrice(String(overallMin));
                setMaxPrice(overallMax);
            }

            return updated;
        });
        setPage(0);
    };

    const togglePublisher = (pub) => {
        setSelectedPublishers((prev) =>
            prev.includes(pub)
                ? prev.filter((item) => item !== pub)
                : [...prev, pub],
        );
        setPage(0);
    };

    const removeCategoryFilter = () => {
        setSelectedCategory("");
        setPage(0);
        const params = {};
        if (keyword) params.keyword = keyword;
        if (selectedPublishers.length > 0) params.publisher = selectedPublishers[0];
        setSearchParams(params);
    };

    const removePriceFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        setCustomMinPrice("");
        setCustomMaxPrice("");
        setSelectedPriceRanges([]);
        setPage(0);
    };

    const handleMinPriceChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setCustomMinPrice(raw ? Number(raw).toLocaleString("vi-VN") : "");
    };

    const handleMaxPriceChange = (e) => {
        const raw = e.target.value.replace(/\D/g, "");
        setCustomMaxPrice(raw ? Number(raw).toLocaleString("vi-VN") : "");
    };

    const applyCustomPrice = useCallback(() => {
        const rawMin = customMinPrice.replace(/\D/g, "");
        const rawMax = customMaxPrice.replace(/\D/g, "");

        if (!rawMin && !rawMax) {
            setMinPrice("");
            setMaxPrice("");
            setSelectedPriceRanges([]);
            setPage(0);
            return;
        }

        let minVal = rawMin ? Number(rawMin) : 0;
        let maxVal = rawMax ? Number(rawMax) : null;

        if (maxVal !== null && minVal > maxVal) {
            const temp = minVal;
            minVal = maxVal;
            maxVal = temp;
            setCustomMinPrice(minVal.toLocaleString("vi-VN"));
            setCustomMaxPrice(maxVal.toLocaleString("vi-VN"));
        }

        setSelectedPriceRanges([]);
        setMinPrice(String(minVal));
        setMaxPrice(maxVal !== null ? String(maxVal) : "");
        setPage(0);
    }, [customMinPrice, customMaxPrice]);

    const handlePriceKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            applyCustomPrice();
        }
    };

    const removeKeywordFilter = () => {
        setSearchInput("");
        setPage(0);
        const params = {};
        if (selectedCategory) params.categoryId = selectedCategory;
        if (selectedPublishers.length > 0) params.publisher = selectedPublishers[0];
        setSearchParams(params);
    };

    return {
        keyword,
        searchInput,
        setSearchInput,
        categories,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        selectedPriceRanges,
        togglePriceRange,
        products: filteredProducts,
        page,
        setPage,
        totalPages,
        loading,
        categoryTree,
        handleSearch,
        handleClearFilters,
        openProductDetail,
        addToCart,
        formatPrice,
        getProductImage,
        showMoreCategory,
        setShowMoreCategory,
        availablePublishers,
        selectedPublishers,
        togglePublisher,
        removeCategoryFilter,
        removePriceFilter,
        removeKeywordFilter,
        customMinPrice,
        customMaxPrice,
        handleMinPriceChange,
        handleMaxPriceChange,
        applyCustomPrice,
        handlePriceKeyDown,
    };
};
