import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { productService } from "@/services/productService";
import { buildCategoryTree } from "@/utils/categoryTree";

// Import local image assets
import matNguCover from "@/assets/mat_ngu_cuoc_doi.png";
import longTinCover from "@/assets/long_tin.png";
import ngheThuatCover from "@/assets/nghe_thuat_ve.png";
import quanLyCover from "@/assets/quan_ly_cam_xuc.png";

const FLASH_SALE_SLOT_HOURS = 6;
const FLASH_SALE_LIMIT = 10;

function getNextFlashSaleEndTime(date = new Date()) {
    const endsAt = new Date(date);
    const nextSlot =
        Math.floor(date.getHours() / FLASH_SALE_SLOT_HOURS) *
            FLASH_SALE_SLOT_HOURS +
        FLASH_SALE_SLOT_HOURS;

    endsAt.setHours(nextSlot, 0, 0, 0);
    return endsAt;
}

function getTimeLeft(endTime) {
    const diff = Math.max(0, endTime.getTime() - Date.now());
    const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
    const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
    const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");

    return { hours: h, minutes: m, seconds: s };
}

function getSeededScore(product, seed) {
    const id = Number(product.id) || 0;
    return (id * 9301 + seed * 49297) % 233280;
}

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
    const [activePromotions, setActivePromotions] = useState([]);
    const [activeBestsellerTab, setActiveBestsellerTab] = useState("all");
    const [flashSaleEndsAt, setFlashSaleEndsAt] = useState(() =>
        getNextFlashSaleEndTime(),
    );
    const [timeLeft, setTimeLeft] = useState(getTimeLeft(flashSaleEndsAt));
    const [flashSalePage, setFlashSalePage] = useState(1);
    const [rawPublishers, setRawPublishers] = useState([]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get("/categories");
            setCategories(response.data || []);
        } catch (e) {
            console.error("Failed to load categories:", e);
        }
    }, []);

    const fetchPublishers = useCallback(async () => {
        try {
            const response = await api.get("/products/publishers");
            if (Array.isArray(response.data) && response.data.length > 0) {
                setRawPublishers(response.data);
            }
        } catch (e) {
            console.error("Failed to load publishers:", e);
        }
    }, []);

    const fetchActivePromotions = useCallback(async () => {
        try {
            const response = await api.get("/promotions/active");
            const promos = response.data || [];
            setActivePromotions(promos);
            
            // Tìm mốc thời gian kết thúc sớm nhất trong số các chương trình đang diễn ra
            if (promos.length > 0) {
                const now = Date.now();
                const validEndTimes = promos
                    .filter((p) => p.endDate && new Date(p.endDate).getTime() > now)
                    .map((p) => new Date(p.endDate).getTime());
                
                if (validEndTimes.length > 0) {
                    const earliestEnd = Math.min(...validEndTimes);
                    setFlashSaleEndsAt(new Date(earliestEnd));
                }
            }
        } catch (e) {
            console.error("Failed to load active promotions:", e);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const hasActiveFilters =
                !!keyword.trim() ||
                !!selectedCategory ||
                !!minPrice ||
                !!maxPrice;
            let url = `/products?page=${page}&size=${hasActiveFilters ? 12 : 30}`;
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
            fetchActivePromotions();
            fetchPublishers();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchCategories, fetchActivePromotions, fetchPublishers]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            fetchProducts();
        }, 0);
        return () => window.clearTimeout(timer);
    }, [fetchProducts]);

    // Đếm ngược cho Flash Sale
    useEffect(() => {
        const timer = setInterval(() => {
            if (Date.now() >= flashSaleEndsAt.getTime()) {
                // Tải lại các chương trình khuyến mãi để cập nhật mốc thời gian tiếp theo
                fetchActivePromotions();
                return;
            }

            setTimeLeft(getTimeLeft(flashSaleEndsAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [flashSaleEndsAt, fetchActivePromotions]);

    const flashSaleProducts = useMemo(() => {
        // Priority 1: Products assigned by Admin in active Promotion programs
        if (activePromotions && activePromotions.length > 0) {
            const promoProductMap = new Map();
            activePromotions.forEach((promo) => {
                if (promo.applicableProducts && promo.applicableProducts.length > 0) {
                    promo.applicableProducts.forEach((p) => {
                        let discount = 0;
                        if (promo.discountType === "PERCENT") {
                            discount = Number(promo.discountValue) || 0;
                        } else if (promo.discountType === "FIXED") {
                            discount = p.price ? Math.round(((Number(promo.discountValue) || 0) / p.price) * 100) : 0;
                        }
                        
                        const pId = String(p.id);
                        // Nếu sản phẩm đã tồn tại trong Map (nằm ở 2 sự kiện cùng lúc), giữ lại mức giảm giá ƯU ĐÃI NHẤT
                        if (promoProductMap.has(pId)) {
                            const existing = promoProductMap.get(pId);
                            if (discount > existing.promotionDiscountPercent) {
                                promoProductMap.set(pId, {
                                    ...p,
                                    promotionDiscountPercent: discount,
                                    promotionTitle: promo.title,
                                    promotionEndDate: promo.endDate,
                                    promoUsedCount: promo.usedCount || 0,
                                });
                            }
                        } else {
                            promoProductMap.set(pId, {
                                ...p,
                                promotionDiscountPercent: discount,
                                promotionTitle: promo.title,
                                promotionEndDate: promo.endDate,
                                promoUsedCount: promo.usedCount || 0,
                            });
                        }
                    });
                }
            });

            const uniquePromoProducts = Array.from(promoProductMap.values());
            if (uniquePromoProducts.length > 0) {
                return uniquePromoProducts;
            }
        }

        // If no active promotion programs created by Admin, return empty list
        return [];
    }, [activePromotions]);

    const flashSaleTotalPages = Math.max(
        1,
        Math.ceil(flashSaleProducts.length / 5),
    );
    const activeFlashSalePage = Math.min(flashSalePage, flashSaleTotalPages);
    const visibleFlashSaleProducts = useMemo(() => {
        const startIndex = (activeFlashSalePage - 1) * 5;
        return flashSaleProducts.slice(startIndex, startIndex + 5);
    }, [flashSaleProducts, activeFlashSalePage]);

    const handlePrevFlashSalePage = useCallback(() => {
        setFlashSalePage((prev) =>
            prev <= 1 ? flashSaleTotalPages : prev - 1,
        );
    }, [flashSaleTotalPages]);

    const handleNextFlashSalePage = useCallback(() => {
        setFlashSalePage((prev) =>
            prev >= flashSaleTotalPages ? 1 : prev + 1,
        );
    }, [flashSaleTotalPages]);

    // Thêm state vào trong hook useHome:
    const [selectedBestsellerId, setSelectedBestsellerId] = useState(null);
    const [bestsellerList, setBestsellerList] = useState([]);
    const [loadingBestsellers, setLoadingBestsellers] = useState(false);

    // Lấy danh sách Top 10 Bestseller theo tab danh mục thực tế từ backend
    useEffect(() => {
        let isMounted = true;
        setLoadingBestsellers(true);
        setSelectedBestsellerId(null);

        const params = { limit: 10 };
        if (activeBestsellerTab && activeBestsellerTab !== "all") {
            params.categoryId = activeBestsellerTab;
        }

        productService.getBestsellers(params)
            .then((res) => {
                if (isMounted) {
                    const data = Array.isArray(res.data) ? res.data : [];
                    setBestsellerList(data);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách bán chạy:", err);
                if (isMounted) {
                    // Fallback to local products if API has error
                    if (!products || products.length === 0) {
                        setBestsellerList([]);
                    } else if (activeBestsellerTab === "all") {
                        setBestsellerList(products.slice(0, 10));
                    } else {
                        const filtered = products.filter(
                            (p) => String(p.category?.id || p.categoryId) === String(activeBestsellerTab)
                        );
                        setBestsellerList(filtered.length > 0 ? filtered.slice(0, 10) : products.slice(0, 10));
                    }
                }
            })
            .finally(() => {
                if (isMounted) setLoadingBestsellers(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeBestsellerTab, products]);

    // Tự động gán sản phẩm đầu tiên khi có dữ liệu
    const activeBestsellerId = selectedBestsellerId || bestsellerList[0]?.id || null;

    // Chi tiết sản phẩm đang được chọn bên phải
    const activeBestseller = useMemo(() => {
        return bestsellerList.find((p) => String(p.id) === String(activeBestsellerId)) || bestsellerList[0] || null;
    }, [bestsellerList, activeBestsellerId]);

    // Trạng thái đánh giá cho sản phẩm bestseller đang chọn
    const [bestsellerReviews, setBestsellerReviews] = useState([]);
    const [loadingBestsellerReviews, setLoadingBestsellerReviews] = useState(false);
    const reviewsCacheRef = useRef(new Map());

    useEffect(() => {
        if (!activeBestseller?.id) {
            setBestsellerReviews([]);
            return;
        }

        const productId = activeBestseller.id;
        if (reviewsCacheRef.current.has(productId)) {
            setBestsellerReviews(reviewsCacheRef.current.get(productId));
            return;
        }

        let isMounted = true;
        setLoadingBestsellerReviews(true);

        api.get(`/reviews/product/${productId}`)
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : [];
                reviewsCacheRef.current.set(productId, data);
                if (isMounted) {
                    setBestsellerReviews(data);
                }
            })
            .catch((err) => {
                console.error("Lỗi tải đánh giá sản phẩm bestseller:", err);
                if (isMounted) {
                    setBestsellerReviews([]);
                }
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingBestsellerReviews(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [activeBestseller?.id]);

    const bestsellerRating = useMemo(() => {
        if (!bestsellerReviews || bestsellerReviews.length === 0) return 0;
        const sum = bestsellerReviews.reduce(
            (acc, r) => acc + (Number(r.rating) || 0),
            0,
        );
        return sum / bestsellerReviews.length;
    }, [bestsellerReviews]);

    // Hàm tính % giảm giá ảo hoặc từ dữ liệu gốc
    const getDiscountPercent = (product) => {
        if (product.promotionDiscountPercent !== undefined && product.promotionDiscountPercent !== null) return product.promotionDiscountPercent;
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

    // Danh sách nhà xuất bản / đối tác tải động từ database:
    const publishers = useMemo(() => {
        const list = rawPublishers.length > 0
            ? rawPublishers
            : Array.from(new Set(products.map((p) => p.publisher).filter(Boolean)));

        return list.map((name, index) => {
            const cleanShort = name
                .replace(/^(NXB|Nhà xuất bản)\s+/i, "")
                .trim()
                .toUpperCase();
            return {
                id: `pub-${index}`,
                name: name.trim(),
                shortName: cleanShort || name.trim().toUpperCase(),
                highlight: index === 0,
            };
        });
    }, [rawPublishers, products]);

    const handlePublisherClick = (publisherName) => {
        navigate(`/catalog?publisher=${encodeURIComponent(publisherName)}`);
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
        flashSaleProducts,
        visibleFlashSaleProducts,
        activeFlashSalePage,
        flashSaleTotalPages,
        handlePrevFlashSalePage,
        handleNextFlashSalePage,
        getDiscountPercent,
        getOriginalPrice,
        categories,
        bestsellerList,
        activeBestseller,
        activeBestsellerId,
        selectedBestsellerId,
        setSelectedBestsellerId,
        bestsellerReviews,
        bestsellerRating,
        loadingBestsellerReviews,
        loadingBestsellers,
        publishers,
        handlePublisherClick
    };
};
