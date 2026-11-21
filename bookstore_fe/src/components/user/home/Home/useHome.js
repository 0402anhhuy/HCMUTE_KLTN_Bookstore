import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { productService } from "@/services/productService";
import { buildCategoryTree } from "@/utils/categoryTree";
import { getProductDiscountPercent, getProductOriginalPrice } from "@/utils/productPricing";

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

    const promoProductMap = useMemo(() => {
        const map = new Map();
        if (activePromotions && activePromotions.length > 0) {
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
                        if (map.has(pId)) {
                            const existing = map.get(pId);
                            if (discount > existing.promotionDiscountPercent) {
                                map.set(pId, {
                                    ...p,
                                    promotionDiscountPercent: discount,
                                    promotionTitle: promo.title,
                                    promotionEndDate: promo.endDate,
                                    promoUsedCount: promo.usedCount || 0,
                                });
                            }
                        } else {
                            map.set(pId, {
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
        }
        return map;
    }, [activePromotions]);

    const enrichedProducts = useMemo(() => {
        if (!products || products.length === 0) return [];
        return products.map((p) => {
            const promo = promoProductMap.get(String(p.id));
            const disc = promo ? promo.promotionDiscountPercent : getProductDiscountPercent(p);
            return {
                ...p,
                promotionDiscountPercent: disc,
                promotionTitle: promo?.promotionTitle,
            };
        });
    }, [products, promoProductMap]);

    const flashSaleProducts = useMemo(() => {
        // Priority 1: Products assigned by Admin in active Promotion programs
        if (promoProductMap.size > 0) {
            const uniquePromoProducts = Array.from(promoProductMap.values());
            if (uniquePromoProducts.length > 0) {
                return uniquePromoProducts;
            }
        }

        // Priority 2: Các sản phẩm có mức giảm giá tốt nhất để luôn có flash sale sinh động
        const saleItems = enrichedProducts
            .filter((p) => (Number(p.promotionDiscountPercent) || 0) > 0)
            .slice(0, FLASH_SALE_LIMIT);
        return saleItems;
    }, [promoProductMap, enrichedProducts]);

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

    // Hàm tính % giảm giá thực tế từ dữ liệu khuyến mãi/sản phẩm (không dùng số giả lập)
    const getDiscountPercent = (product) => {
        return getProductDiscountPercent(product);
    };

    const getOriginalPrice = (product) => {
        return getProductOriginalPrice(product);
    };

    // Dữ liệu cho phần Xu hướng mua sắm phản hồi theo từng tab
    const trendingProducts = useMemo(() => {
        if (!products || products.length === 0) return [];

        if (activeTrendTab === "hot") {
            // Sách Hot - Giảm sốc: sắp xếp giảm giá cao nhất
            return [...products]
                .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
                .slice(0, 10);
        }

        if (activeTrendTab === "bestseller") {
            // Bestseller ngoại văn: lọc sách tiếng Anh / ngoại văn
            const foreign = products.filter((p) => {
                const lang = (p.language || "").toLowerCase();
                const cat = (p.category?.name || "").toLowerCase();
                return (
                    lang.includes("anh") ||
                    lang.includes("english") ||
                    lang.includes("ngoại") ||
                    cat.includes("ngoại văn") ||
                    cat.includes("foreign")
                );
            });
            if (foreign.length >= 4) {
                return foreign.slice(0, 10);
            }
            return [...products].reverse().slice(0, 10);
        }

        // Tab "all": Xu hướng theo ngày
        return products.slice(0, 10);
    }, [activeTrendTab, products]);

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

    // Xử lý click các thẻ khuyến mãi/banner nổi bật trang chủ
    const handlePromoCardClick = useCallback((type) => {
        if (type === "manga") {
            const matchedCat = (categories || []).find((c) => {
                const name = (c?.name || "").trim().toLowerCase();
                return (
                    name.includes("manga") ||
                    name.includes("truyện") ||
                    name.includes("comic") ||
                    name.includes("light novel") ||
                    name.includes("thiếu nhi")
                );
            });
            if (matchedCat) {
                navigate(`/catalog?categoryId=${matchedCat.id}`);
                return;
            }
            const hasTruyen = (products || []).some((p) =>
                (p?.name || "").toLowerCase().includes("truyện")
            );
            if (hasTruyen) {
                navigate(`/catalog?keyword=${encodeURIComponent("truyện")}`);
            } else {
                navigate("/catalog");
            }
            return;
        }

        if (type === "biz") {
            const matchedCat = (categories || []).find((c) => {
                const name = (c?.name || "").trim().toLowerCase();
                return name.includes("kinh tế") || name.includes("quản trị");
            });
            if (matchedCat) {
                navigate(`/catalog?categoryId=${matchedCat.id}`);
            } else {
                navigate(`/catalog?keyword=${encodeURIComponent("kinh tế")}`);
            }
            return;
        }

        if (type === "lit") {
            const matchedCat = (categories || []).find((c) => {
                const name = (c?.name || "").trim().toLowerCase();
                return name.includes("văn học");
            });
            if (matchedCat) {
                navigate(`/catalog?categoryId=${matchedCat.id}`);
            } else {
                navigate(`/catalog?keyword=${encodeURIComponent("văn học")}`);
            }
            return;
        }

        navigate("/catalog");
    }, [categories, products, navigate]);

    return {
        addToCart,
        keyword,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        products: enrichedProducts,
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
        trendingProducts,
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
        handlePublisherClick,
        handlePromoCardClick,
    };
};
