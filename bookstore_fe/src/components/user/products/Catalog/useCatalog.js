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
    const [searchInput, setSearchInput] = useState(keyword);

    const [selectedPublishers, setSelectedPublishers] = useState([]);
    const [selectedLanguages, setSelectedLanguages] = useState([]);

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    // Đồng bộ khi URL thay đổi
    useEffect(() => {
        const catId = searchParams.get("categoryId") || "";
        const kw = searchParams.get("keyword") || "";
        setSelectedCategory(catId);
        setSearchInput(kw);
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

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/products?page=${page}&size=12`;
            if (keyword.trim())
                url += `&keyword=${encodeURIComponent(keyword)}`;
            if (selectedCategory) url += `&categoryId=${selectedCategory}`;
            if (minPrice) url += `&minPrice=${minPrice}`;
            if (maxPrice) url += `&maxPrice=${maxPrice}`;

            const response = await api.get(url);
            setProducts(response.data?.content || []);
            setTotalPages(response.data?.totalPages || 1);
        } catch (e) {
            console.error("Lỗi lấy sản phẩm:", e);
        } finally {
            setLoading(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [page, selectedCategory, keyword, minPrice, maxPrice]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Trích xuất danh sách NXB & Ngôn ngữ từ dữ liệu thật
    const availablePublishers = useMemo(() => {
        const set = new Set();
        products.forEach((p) => {
            if (p.publisher) set.add(p.publisher.trim());
        });
        return Array.from(set);
    }, [products]);

    const availableLanguages = useMemo(() => {
        const set = new Set();
        products.forEach((p) => {
            if (p.language) set.add(p.language.trim());
        });
        return Array.from(set);
    }, [products]);

    // Lọc theo NXB và Ngôn ngữ trên tập dữ liệu trả về
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            if (
                selectedPublishers.length > 0 &&
                !selectedPublishers.includes(p.publisher)
            ) {
                return false;
            }
            if (
                selectedLanguages.length > 0 &&
                !selectedLanguages.includes(p.language)
            ) {
                return false;
            }
            return true;
        });
    }, [products, selectedPublishers, selectedLanguages]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        const params = {};
        if (searchInput.trim()) params.keyword = searchInput.trim();
        if (selectedCategory) params.categoryId = selectedCategory;
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setSearchParams({});
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSearchInput("");
        setSelectedPublishers([]);
        setSelectedLanguages([]);
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

    const handlePriceRangeSelect = (min, max) => {
        setMinPrice(min);
        setMaxPrice(max);
        setPage(0);
    };

    const togglePublisher = (pub) => {
        setSelectedPublishers((prev) =>
            prev.includes(pub)
                ? prev.filter((item) => item !== pub)
                : [...prev, pub],
        );
    };

    const toggleLanguage = (lang) => {
        setSelectedLanguages((prev) =>
            prev.includes(lang)
                ? prev.filter((item) => item !== lang)
                : [...prev, lang],
        );
    };

    // Thêm các hàm xóa từng field lọc riêng lẻ vào useCatalog.js
    const removeCategoryFilter = () => {
        setSelectedCategory("");
        setPage(0);
        const params = {};
        if (keyword) params.keyword = keyword;
        setSearchParams(params);
    };

    const removePriceFilter = () => {
        setMinPrice("");
        setMaxPrice("");
        setPage(0);
    };

    const removeKeywordFilter = () => {
        setSearchInput("");
        setPage(0);
        const params = {};
        if (selectedCategory) params.categoryId = selectedCategory;
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
        availableLanguages,
        selectedPublishers,
        togglePublisher,
        selectedLanguages,
        toggleLanguage,
        handlePriceRangeSelect,
        removeCategoryFilter,
        removePriceFilter,
        removeKeywordFilter,
    };
};
