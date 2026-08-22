import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { buildCategoryTree } from "@/utils/categoryTree";

export const useCatalog = () => {
    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = searchParams.get("keyword") || "";

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [searchInput, setSearchInput] = useState(keyword);

    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const fetchProducts = async () => {
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
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [page, selectedCategory, keyword]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0);
        if (searchInput.trim()) {
            setSearchParams({ keyword: searchInput.trim() });
        } else {
            setSearchParams({});
        }
    };

    const handleApplyFilters = () => {
        setPage(0);
        fetchProducts();
    };

    const handleClearFilters = () => {
        setSearchParams({});
        setSelectedCategory("");
        setMinPrice("");
        setMaxPrice("");
        setSearchInput("");
        setPage(0);
        setTimeout(() => fetchProducts(), 50);
    };

    const openProductDetail = (product) => {
        navigate(`/product/${product.id}`);
    };

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const getProductImage = (product) => {
        if (!product) return null;
        if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
            return product.imageUrls[0];
        }
        if (typeof product.imageUrl === "string") {
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

    return {
        keyword,
        searchInput,
        setSearchInput,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        products,
        page,
        setPage,
        totalPages,
        loading,
        categoryTree,
        handleSearch,
        handleApplyFilters,
        handleClearFilters,
        openProductDetail,
        addToCart,
        formatPrice,
        getProductImage,
    };
};
