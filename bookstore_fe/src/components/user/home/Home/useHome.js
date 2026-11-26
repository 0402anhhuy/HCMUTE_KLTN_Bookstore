import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { productService } from "@/services/productService";
import { buildCategoryTree } from "@/utils/categoryTree";
import {
    buildActivePromoDiscountMap,
    getProductDiscountPercent,
    getProductOriginalPrice,
} from "@/utils/productPricing";
import {
    buildCatalogSearchParams,
    buildProductsRequestUrl,
    hasActiveCatalogFilters,
    shouldSyncCatalogUrl,
} from "./catalogFilterUrl";

// Import local image assets
import matNguCover from "@/assets/mat_ngu_cuoc_doi.png";
import longTinCover from "@/assets/long_tin.png";
import ngheThuatCover from "@/assets/nghe_thuat_ve.png";
import quanLyCover from "@/assets/quan_ly_cam_xuc.png";

const FLASH_SALE_SLOT_HOURS = 6;

// Cache dùng chung cho toàn bộ phiên (module-level) để lần mount sau (quay lại trang chủ)
// hiển thị ngay dữ liệu cũ trong lúc chờ API, không bắt người dùng nhìn màn hình trống
const CACHE_TTL = 5 * 60 * 1000; // 5 phút
const bestsellersCache = new Map(); // key: tab ("all" hoặc categoryId) -> { data, ts }
const productsCache = new Map(); // key: query string -> { data, ts }

function readCache(cache, key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function writeCache(cache, key, data) {
    cache.set(key, { data, ts: Date.now() });
}

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

export const useHome = (options = {}) => {
    const {
        // Cho phép dùng chung bộ lọc theo URL: khởi tạo từ query params (trang Catalog)
        // hoặc giữ trạng thái cục bộ (trang chủ)
        syncFiltersWithUrl = false,
    } = options;

    const { addToCart } = useApp();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const keyword = (searchParams.get("keyword") || "").trim();

    // Search/Filter states
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(
        () => (syncFiltersWithUrl ? searchParams.get("categoryId") || "" : ""),
    );
    // Theo dõi danh sách NXB đang chọn.
    // Lưu dạng chuỗi id (vd: "3", "7") để gửi thẳng xuống API `?publisher=`
    // (backend lọc theo publisher_id). Giá trị cũ dạng tên vẫn được backend chấp nhận.
    const [selectedPublishers, setSelectedPublishers] = useState(
        () =>
            syncFiltersWithUrl && searchParams.get("publisher")
                ? searchParams.getAll("publisher")
                : [],
    );
    const [minPrice, setMinPrice] = useState(
        () => (syncFiltersWithUrl ? searchParams.get("minPrice") || "" : ""),
    );
    const [maxPrice, setMaxPrice] = useState(
        () => (syncFiltersWithUrl ? searchParams.get("maxPrice") || "" : ""),
    );

    // Pagination & Loading states
    const [products, setProducts] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [page, setPage] = useState(
        () => (syncFiltersWithUrl ? Number(searchParams.get("page")) || 0 : 0),
    );
    // Khởi tạo từ cache nếu có -> lần đầu vào trang không phải chờ API mới có dữ liệu
    const [loading, setLoading] = useState(() =>
        syncFiltersWithUrl
            ? true
            : readCache(productsCache, "default") === null,
    );

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
            // GET /api/v1/publishers -> [{ id, name, shortName, slug, logoUrl, ... }]
            const response = await api.get("/publishers");
            const data = Array.isArray(response.data) ? response.data : [];
            setRawPublishers(data.filter(Boolean));
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

    const catalogFilters = useMemo(
        () => ({
            page,
            keyword,
            selectedCategory,
            minPrice,
            maxPrice,
            selectedPublishers,
        }),
        [
            page,
            keyword,
            selectedCategory,
            minPrice,
            maxPrice,
            selectedPublishers,
        ],
    );

    const fetchProducts = useCallback(async () => {
        const hasActiveFilters = hasActiveCatalogFilters(catalogFilters);
        const url = buildProductsRequestUrl(catalogFilters);

        const cacheKey = hasActiveFilters ? null : "default";
        const cached = cacheKey ? readCache(productsCache, cacheKey) : null;

        // Stale-while-revalidate: có cache thì hiện ngay, rồi vẫn gọi API để làm mới ngầm
        if (cached) {
            setProducts(cached);
            setLoading(false);
        } else {
            setLoading(true);
        }

        try {
            const response = await api.get(url);
            const data = response.data?.content || [];
            if (cacheKey) writeCache(productsCache, cacheKey, data);
            setProducts(data);
            setTotalElements(response.data?.totalElements ?? data.length);
            setTotalPages(Math.max(1, response.data?.totalPages ?? 1));
        } catch (e) {
            console.error("Failed to load products:", e);
        } finally {
            setLoading(false);
        }
    }, [catalogFilters]);

    const searchParamsRef = useRef(searchParams);
    useEffect(() => {
        searchParamsRef.current = searchParams;
    }, [searchParams]);

    // Đồng bộ bộ lọc lên URL tách riêng khỏi fetchProducts để tránh cập nhật URL
    // làm đổi dependency của fetchProducts và bắn lại API lần thứ 2.
    useEffect(() => {
        const next = buildCatalogSearchParams(catalogFilters);
        if (
            shouldSyncCatalogUrl(
                syncFiltersWithUrl,
                next,
                searchParamsRef.current,
            )
        ) {
            setSearchParams(next, { replace: true });
        }
    }, [syncFiltersWithUrl, catalogFilters, setSearchParams]);

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
        return buildActivePromoDiscountMap(activePromotions);
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
        // Chỉ hiển thị các sản phẩm thuộc chương trình khuyến mãi đang diễn ra do Admin tạo
        if (promoProductMap.size === 0) {
            return [];
        }
        return Array.from(promoProductMap.values());
    }, [promoProductMap]);

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
    const [bestsellerList, setBestsellerList] = useState(
        () => readCache(bestsellersCache, "all") || []
    );
    const [loadingBestsellers, setLoadingBestsellers] = useState(
        () => readCache(bestsellersCache, "all") === null
    );
    // Tab mà `bestsellerList` đang chứa dữ liệu (null = chưa áp dụng gì)
    const [bestsellerTabApplied, setBestsellerTabApplied] = useState(() =>
        readCache(bestsellersCache, "all") ? "all" : null
    );

    // Dùng ref thay vì đưa `products` vào dependency: khi products thay đổi (load lại trang)
    // effect không được tự chạy lại -> từng tab được gọi API đúng 1 lần
    const productsRef = useRef(products);
    useEffect(() => {
        productsRef.current = products;
    }, [products]);

    const applyBestsellerFallback = useCallback((tab) => {
        const localProducts = productsRef.current || [];
        if (localProducts.length === 0) {
            setBestsellerList([]);
        } else if (tab === "all") {
            setBestsellerList(localProducts.slice(0, 10));
        } else {
            const filtered = localProducts.filter(
                (p) => String(p.category?.id || p.categoryId) === String(tab)
            );
            setBestsellerList(
                filtered.length > 0 ? filtered.slice(0, 10) : localProducts.slice(0, 10)
            );
        }
    }, []);

    // Lấy danh sách Top 10 Bestseller theo tab danh mục thực tế từ backend
    // (Dữ liệu cache được áp dụng ngay trong handler đổi tab, effect chỉ lo gọi API khi cần)
    useEffect(() => {
        const tab = activeBestsellerTab;
        // Nếu state đã chứa đúng dữ liệu tab này rồi hoặc đã có cache thì không làm gì
        if (bestsellerTabApplied === tab) return;
        if (readCache(bestsellersCache, tab)) return;

        let isMounted = true;
        // setLoadingBestsellers(true) đã được gọi ngay trong handler đổi tab (hoặc state khởi tạo)

        const params = { limit: 10 };
        if (tab && tab !== "all") {
            params.categoryId = tab;
        }

        productService.getBestsellers(params)
            .then((res) => {
                if (isMounted) {
                    const data = Array.isArray(res.data) ? res.data : [];
                    writeCache(bestsellersCache, tab, data);
                    setBestsellerTabApplied(tab);
                    setBestsellerList(data);
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải danh sách bán chạy:", err);
                if (isMounted) {
                    // Fallback to local products if API has error
                    applyBestsellerFallback(tab);
                }
            })
            .finally(() => {
                if (isMounted) setLoadingBestsellers(false);
            });

        return () => {
            isMounted = false;
        };
    }, [activeBestsellerTab, bestsellerTabApplied, applyBestsellerFallback]);

    // Đổi tab: dùng luôn dữ liệu cache (nếu có) ngay trong event click -> không phải chờ API
    const handleBestsellerTabChange = useCallback((tab) => {
        const tabId = String(tab);
        setActiveBestsellerTab(tabId);
        setSelectedBestsellerId(null);

        const cached = readCache(bestsellersCache, tabId);
        if (cached) {
            setBestsellerTabApplied(tabId);
            setBestsellerList(cached);
            setLoadingBestsellers(false);
        } else {
            // Chưa có cache -> hiện ngay trạng thái đang tải cho tới khi API trả về
            setLoadingBestsellers(true);
        }
    }, []);

    // Prefetch trước bestseller của các tab danh mục ngay sau khi có danh sách categories,
    // nhờ đó lần bấm tab đầu tiên cũng không phải chờ API (chỉ tải 1 lần, có cache + TTL)
    const prefetchedTabsRef = useRef(new Set());
    useEffect(() => {
        if (!categories || categories.length === 0) return;

        const timers = [];
        categories.slice(0, 8).forEach((cat, index) => {
            const tabId = String(cat.id);
            if (prefetchedTabsRef.current.has(tabId)) return;
            prefetchedTabsRef.current.add(tabId);

            if (readCache(bestsellersCache, tabId)) return;

            // Giãn cách nhẹ giữa các request để không dồn tải backend cùng lúc
            timers.push(
                window.setTimeout(() => {
                    productService
                        .getBestsellers({ limit: 10, categoryId: tabId })
                        .then((res) => {
                            const data = Array.isArray(res.data) ? res.data : [];
                            writeCache(bestsellersCache, tabId, data);
                        })
                        .catch(() => {
                            // Bỏ qua: nếu lỗi thì sẽ tải lại khi người dùng thực sự bấm tab
                            prefetchedTabsRef.current.delete(tabId);
                        });
                }, 500 + index * 400)
            );
        });

        return () => timers.forEach((t) => window.clearTimeout(t));
    }, [categories]);

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
        if (!activeBestseller?.id) return;

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
        // Phải reset cả NXB, nếu không chip "Xóa tất cả" xoá trên URL nhưng state vẫn giữ NXB
        setSelectedPublishers([]);
        setMinPrice("");
        setMaxPrice("");
        setPage(0);
        // Không cần gọi fetchProducts thủ công: các state vừa reset sẽ kích hoạt effect tải lại.
        // Gọi thủ công bằng closure cũ dễ đem kết quả đang lọc NXB về đè lên kết quả mới.
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
        !!keyword ||
        !!selectedCategory ||
        !!minPrice ||
        !!maxPrice ||
        selectedPublishers.length > 0;

    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories],
    );

    // Danh sách nhà xuất bản / đối tác tải động từ database.
    // Hỗ trợ cả 2 dạng response từ API:
    //   - cũ:  ["NXB Kim Đồng", "NXB Trẻ", ...]                      (chỉ có tên)
    //   - mới: [{ id, name, logoUrl, slug?, ... }, ...]               (bảng publisher)
    const publishers = useMemo(() => {
        const source = Array.isArray(rawPublishers) ? rawPublishers : [];
        const normalized = source.map((item) =>
            typeof item === "string"
                ? { id: null, name: item, logoUrl: "" }
                : {
                      id: item?.id ?? null,
                      name: item?.name ?? item?.publisherName ?? "",
                      // Đọc từ API; nếu backend chưa có thì để rỗng -> dùng placeholder
                      logoUrl: item?.logoUrl ?? item?.logo ?? "",
                  },
        );

        // Fallback: suy ra danh sách NXB từ sản phẩm khi API chưa trả về gì
        const viewed = normalized.length > 0
            ? normalized
            : Array.from(
                  new Set(products.map((p) => p.publisher).filter(Boolean)),
              ).map((name) => ({ id: null, name, logoUrl: "" }));

        return viewed
            .filter((pub) => pub.name && pub.name.trim())
            .map((pub, index) => {
                const name = pub.name.trim();
                const cleanShort = name
                    .replace(/^(NXB|Nhà xuất bản)\s+/i, "")
                    .trim()
                    .toUpperCase();
                return {
                    id: pub.id ?? `pub-${index}`,
                    name,
                    shortName: cleanShort || name.toUpperCase(),
                    highlight: index === 0,
                    logoUrl: pub.logoUrl || "",
                };
            });
    }, [rawPublishers, products]);

    const handlePublisherClick = (publisher) => {
        // Ưu tiên điều hướng theo id; nếu NXB chưa có trong bảng publishers thì dùng tên
        const key = publisher?.id ?? publisher?.name ?? publisher;
        navigate(`/catalog?publisher=${encodeURIComponent(key)}`);
    };

    // Chọn/bỏ chọn NXB trong bộ lọc (dùng chung cho trang chủ và trang Catalog)
    const togglePublisher = useCallback((publisher) => {
        const key = String(publisher?.id ?? publisher?.name ?? publisher ?? "");
        if (!key) return;
        setSelectedPublishers((prev) =>
            prev.includes(key)
                ? prev.filter((item) => item !== key)
                : [...prev, key],
        );
        setPage(0);
    }, []);

    // Đồng bộ bộ lọc từ bên ngoài (Catalog dùng state riêng cho khoảng giá/NXB)
    const applyExternalFilters = useCallback(({ publishers: pubs, min, max }) => {
        if (pubs !== undefined) {
            const list = Array.isArray(pubs) ? pubs : pubs ? [pubs] : [];
            setSelectedPublishers((prev) =>
                prev.length === list.length && prev.every((x, i) => x === list[i])
                    ? prev
                    : list,
            );
        }
        if (min !== undefined) setMinPrice(min);
        if (max !== undefined) setMaxPrice(max);
        setPage(0);
    }, []);

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
        page,
        totalElements,
        totalPages,
        selectedPublishers,
        setSelectedPublishers,
        togglePublisher,
        applyExternalFilters,
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
        handleBestsellerTabChange,
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
