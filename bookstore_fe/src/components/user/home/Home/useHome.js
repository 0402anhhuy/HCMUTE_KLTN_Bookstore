import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { buildCategoryTree } from "@/utils/categoryTree";

// Import local image assets
import matNguCover from "@/assets/mat_ngu_cuoc_doi.png";
import longTinCover from "@/assets/long_tin.png";
import ngheThuatCover from "@/assets/nghe_thuat_ve.png";
import quanLyCover from "@/assets/quan_ly_cam_xuc.png";

export const useHome = () => {
    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    // Search/Filter states
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Pagination & Loading states
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data || []);
        } catch (e) {
            console.error("Failed to load categories:", e);
        }
    }, []);

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
        } catch (e) {
            console.error("Failed to load products:", e);
        } finally {
            setLoading(false);
        }
    }, [page, selectedCategory, keyword, minPrice, maxPrice]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchCategories();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCategories]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchProducts();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchProducts]);

    const handleClearFilters = () => {
        setSearchParams({});
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setPage(0);
        setTimeout(() => {
            fetchProducts();
        }, 50);
    };

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`);
    };

    const scrollToBestsellers = () => {
        const element = document.getElementById("bestsellers-section");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getProductImage = (product) => {
        if (!product || !product.imageUrl) return null;
        const url = product.imageUrl;
        if (url.includes("mat_ngu_cuoc_doi")) return matNguCover;
        if (url.includes("long_tin")) return longTinCover;
        if (url.includes("nghe_thuat_ve")) return ngheThuatCover;
        if (url.includes("quan_ly_cam_xuc")) return quanLyCover;
        return url;
    };

    const isSearchActive =
        !!keyword || !!selectedCategory || !!minPrice || !!maxPrice;

    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories],
    );

    return {
        addToCart,
        keyword,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        products,
        setPage,
        loading,
        categoryTree,
        isSearchActive,
        handleClearFilters,
        openProductDetail,
        scrollToBestsellers,
        formatPrice,
        getProductImage,
        fetchProducts,
    };
};
