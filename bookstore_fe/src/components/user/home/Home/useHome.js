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

    const [activeTrendTab, setActiveTrendTab] = useState("all");
    const [activeBestsellerTab, setActiveBestsellerTab] = useState("all");
    const [timeLeft, setTimeLeft] = useState({ hours: "02", minutes: "45", seconds: "18" });

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

    // Đếm ngược cho Flash Sale
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            if (diff > 0) {
                const h = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, "0");
                const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
                const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
                setTimeLeft({ hours: h, minutes: m, seconds: s });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Thêm state vào trong hook useHome:
    const [selectedBestsellerId, setSelectedBestsellerId] = useState(null);

    // Lấy danh sách Top 10 Bestseller
    const bestsellerList = useMemo(() => {
        if (!products || products.length === 0) return [];
        return products.slice(0, 10);
    }, [products]);

    // Tự động gán sản phẩm đầu tiên khi có dữ liệu
    useEffect(() => {
        if (bestsellerList.length > 0 && !selectedBestsellerId) {
            setSelectedBestsellerId(bestsellerList[0].id);
        }
    }, [bestsellerList, selectedBestsellerId]);

    // Chi tiết sản phẩm đang được chọn bên phải
    const activeBestseller = useMemo(() => {
        return bestsellerList.find((p) => String(p.id) === String(selectedBestsellerId)) || bestsellerList[0] || null;
    }, [bestsellerList, selectedBestsellerId]);

    // Hàm tính % giảm giá ảo hoặc từ dữ liệu gốc
    const getDiscountPercent = (product) => {
        if (product.discountPercent) return product.discountPercent;
        // Tự sinh % cố định theo ID để hiển thị badge nếu DB chưa có cột discount
        return ((product.id * 7) % 35) + 10;
    };

    const getOriginalPrice = (product) => {
        const discount = getDiscountPercent(product);
        return Math.round(product.price / (1 - discount / 100));
    };

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

    // Thêm danh sách nhà xuất bản / đối tác:
    const publishers = [
        { id: 'dinh-ti', name: 'Đinh Tị Books', shortName: 'ĐINH TỊ' },
        { id: 'vinh-thinh', name: 'Vĩnh Thịnh', shortName: 'VĨNH THỊNH' },
        { id: 'deli', name: 'Deli', shortName: 'deli', highlight: true },
        { id: 'tan-viet', name: 'Tân Việt Books', shortName: 'TÂN VIỆT' },
        { id: 'fbmn', name: 'Futurebook', shortName: 'FBMN' },
        { id: 'dong-a', name: 'Đông A', shortName: 'ĐÔNG A' },
        { id: 'sworld', name: 'SWorld', shortName: 'SWORLD' },
        { id: 'huy-hoang', name: 'Huy Hoàng Bookstore', shortName: 'HUY HOÀNG' },
        { id: 'thien-long', name: 'Thiên Long', shortName: 'THIÊN LONG' },
    ];

    const handlePublisherClick = (publisherName) => {
        navigate(`/?keyword=${encodeURIComponent(publisherName)}`);
    };

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
        activeTrendTab,
        setActiveTrendTab,
        activeBestsellerTab,
        setActiveBestsellerTab,
        timeLeft,
        getDiscountPercent,
        getOriginalPrice,
        categories,
        bestsellerList,
        activeBestseller,
        selectedBestsellerId,
        setSelectedBestsellerId,
        publishers,
        handlePublisherClick
    };
};
