import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart, favorites = [], addFavorite, removeFavorite } = useApp();

    const [product, setProduct] = useState(null);
    const [similarProducts, setSimilarProducts] = useState([]);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [ratingFilter, setRatingFilter] = useState("Tất cả");
    const [activeImageIdx, setActiveImageIdx] = useState(0);
    const [isDescExpanded, setIsDescExpanded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1.0);
    const [timeLeft, setTimeLeft] = useState({
        hours: "01",
        minutes: "36",
        seconds: "05",
    });

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const midnight = new Date();
            midnight.setHours(24, 0, 0, 0);
            const diff = midnight - now;

            if (diff > 0) {
                const h = String(
                    Math.floor((diff / (1000 * 60 * 60)) % 24),
                ).padStart(2, "0");
                const m = String(
                    Math.floor((diff / (1000 * 60)) % 60),
                ).padStart(2, "0");
                const s = String(Math.floor((diff / 1000) % 60)).padStart(
                    2,
                    "0",
                );
                setTimeLeft({ hours: h, minutes: m, seconds: s });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchProductDetail = async () => {
            setLoading(true);
            setQty(1);
            setRatingFilter("Tất cả");
            setActiveImageIdx(0);
            setIsDescExpanded(false);
            try {
                const prodRes = await api.get(`/products/${id}`);
                setProduct(prodRes.data);

                try {
                    const revRes = await api.get(`/reviews/product/${id}`);
                    setReviews(revRes.data || []);
                } catch (revErr) {
                    console.error("Lỗi lấy reviews:", revErr);
                    setReviews([]);
                }

                if (prodRes.data.category?.id) {
                    const simRes = await api.get(
                        `/products?categoryId=${prodRes.data.category.id}&size=6`,
                    );
                    setSimilarProducts(
                        (simRes.data.content || [])
                            .filter((p) => p.id !== prodRes.data.id)
                            .slice(0, 4),
                    );
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProductDetail();
    }, [id]);

    const [promoDiscount, setPromoDiscount] = useState(0);

    useEffect(() => {
        const checkPromo = async () => {
            try {
                const res = await api.get("/promotions/active");
                const promos = res.data || [];
                let maxDiscount = 0;
                promos.forEach((promo) => {
                    if (promo.applicableProducts && promo.applicableProducts.length > 0) {
                        promo.applicableProducts.forEach((p) => {
                            if (String(p.id) === String(id)) {
                                let disc = 0;
                                if (promo.discountType === "PERCENT") {
                                    disc = Number(promo.discountValue) || 0;
                                } else if (promo.discountType === "FIXED" && p.price) {
                                    disc = Math.round(((Number(promo.discountValue) || 0) / p.price) * 100);
                                }
                                if (disc > maxDiscount) maxDiscount = disc;
                            }
                        });
                    }
                });
                setPromoDiscount(maxDiscount);
            } catch (err) {
                console.error("Failed to check active promotions for product:", err);
            }
        };

        if (id) {
            checkPromo();
        }
    }, [id]);

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        })
            .format(price || 0)
            .replace("₫", "đ");
    };

    const discountPercent = product?.discountPercent || promoDiscount || 0;
    const originalPrice =
        product?.originalPrice ||
        (discountPercent > 0
            ? Math.round(product.price / (1 - discountPercent / 100))
            : null);

    const averageRating = useMemo(() => {
        if (!reviews || reviews.length === 0) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    }, [reviews]);

    const handleAddToCart = async () => {
        if (product && product.stockQuantity > 0) {
            await addToCart(product.id, qty, product);
        }
    };

    const isFavorite = useMemo(() => {
        if (!product) return false;
        return favorites.some(
            (fav) =>
                String(fav.product?.id || fav.productId) === String(product.id),
        );
    }, [favorites, product]);

    const handleToggleFavorite = () => {
        if (!product) return;
        if (isFavorite) {
            removeFavorite(product.id);
        } else {
            addFavorite(product.id);
        }
    };

    const handleBuyNow = async () => {
        if (product && product.stockQuantity > 0) {
            navigate(`/checkout?productId=${product.id}&qty=${qty}`);
        }
    };

    const getProductImagesList = (prod) => {
        if (!prod) return [];
        if (Array.isArray(prod.imageUrls) && prod.imageUrls.length > 0) {
            return prod.imageUrls.filter(Boolean);
        }
        if (typeof prod.imageUrl === "string" && prod.imageUrl) {
            return prod.imageUrl
                .split(" || ")
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return [];
    };

    const parsedUrls = getProductImagesList(product);
    const productImages =
        parsedUrls.length > 0
            ? parsedUrls.map((url) => ({ url }))
            : [{ url: "https://via.placeholder.com/350x450?text=No+Cover" }];

    const mainImageUrl =
        productImages[activeImageIdx]?.url ||
        productImages[0]?.url ||
        "https://via.placeholder.com/350x450?text=No+Cover";

    const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [hasDragged, setHasDragged] = useState(false);

    const resetPan = () => {
        setPanPosition({ x: 0, y: 0 });
        setIsDragging(false);
        setHasDragged(false);
    };

    // Thang đo bắt đầu từ 100% trở lên
    const ZOOM_LEVELS = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

    const zoomIn = () => {
        setZoomLevel((prev) => {
            const nextIdx = ZOOM_LEVELS.findIndex((val) => val > prev + 0.001);
            if (nextIdx !== -1) {
                return ZOOM_LEVELS[nextIdx];
            }
            return prev;
        });
    };

    const zoomOut = () => {
        resetPan();
        setZoomLevel((prev) => {
            const reversedIdx = [...ZOOM_LEVELS]
                .reverse()
                .findIndex((val) => val < prev - 0.001);
            if (reversedIdx !== -1) {
                const actualIdx = ZOOM_LEVELS.length - 1 - reversedIdx;
                return ZOOM_LEVELS[actualIdx];
            }
            return 1.0;
        });
    };

    const resetZoom = () => {
        setZoomLevel(1.0);
        resetPan();
    };

    const openLightbox = (idx = 0) => {
        setLightboxIdx(idx);
        setZoomLevel(1.0);
        resetPan();
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
        setZoomLevel(1.0);
        resetPan();
    };

    const nextLightboxImage = () => {
        setZoomLevel(1.0);
        resetPan();
        setLightboxIdx((prev) => (prev + 1) % productImages.length);
    };

    const prevLightboxImage = () => {
        setZoomLevel(1.0);
        resetPan();
        setLightboxIdx((prev) => (prev - 1 + productImages.length) % productImages.length);
    };

    // Click vào ảnh: nếu đang ở 100% thì phóng lên 150%, nếu đang phóng to thì thu về 100%
    const handleImageClick = (e) => {
        if (hasDragged) {
            if (e && typeof e.stopPropagation === "function") {
                e.stopPropagation();
            }
            setHasDragged(false);
            return;
        }
        setZoomLevel((prev) => {
            if (prev > 1.0) {
                resetPan();
                return 1.0;
            }
            return 1.5;
        });
    };

    // Hàm giới hạn vị trí pan theo kích thước zoom
    const getClampedPan = (pos, currentZoom) => {
        if (currentZoom <= 1.0) {
            return { x: 0, y: 0 };
        }
        // Giới hạn vùng di chuyển tối đa tương ứng với mức zoom
        const maxOffsetFactor = 0.5 * (currentZoom - 1);
        const isMobileViewport = window.innerWidth <= 768;
        const maxX = window.innerWidth * maxOffsetFactor;
        const maxY = window.innerHeight * maxOffsetFactor;

        // Nếu người dùng kéo vượt quá biên cho phép, trả về biên tối đa
        return {
            x: isMobileViewport
                ? Math.max(-maxX, Math.min(maxX, pos.x))
                : 0,
            y: Math.max(-maxY, Math.min(maxY, pos.y)),
        };
    };

    const handleMouseDown = (e) => {
        if (zoomLevel <= 1.0 || !e) return;
        setIsDragging(true);
        setHasDragged(false);
        setDragStart({
            x: e.clientX - panPosition.x,
            y: e.clientY - panPosition.y,
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoomLevel <= 1.0 || !e) return;
        const isMobileViewport = window.innerWidth <= 768;
        const newX = isMobileViewport ? e.clientX - dragStart.x : 0;
        const newY = e.clientY - dragStart.y;
        if (
            Math.abs(newX - panPosition.x) > 3 ||
            Math.abs(newY - panPosition.y) > 3
        ) {
            setHasDragged(true);
        }
        setPanPosition({ x: newX, y: newY });
    };

    // Khi thả chuột hoặc rê chuột ra ngoài vùng xem: tự động kéo về biên chuẩn hoặc trung tâm
    const handleMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            setPanPosition((prev) => getClampedPan(prev, zoomLevel));
        }
    };

    const handleTouchStart = (e) => {
        if (zoomLevel <= 1.0 || !e || !e.touches || !e.touches[0]) return;
        setIsDragging(true);
        setHasDragged(false);
        setDragStart({
            x: e.touches[0].clientX - panPosition.x,
            y: e.touches[0].clientY - panPosition.y,
        });
    };

    const handleTouchMove = (e) => {
        if (!isDragging || zoomLevel <= 1.0 || !e || !e.touches || !e.touches[0]) return;
        const isMobileViewport = window.innerWidth <= 768;
        const newX = isMobileViewport
            ? e.touches[0].clientX - dragStart.x
            : 0;
        const newY = e.touches[0].clientY - dragStart.y;
        if (
            Math.abs(newX - panPosition.x) > 3 ||
            Math.abs(newY - panPosition.y) > 3
        ) {
            setHasDragged(true);
        }
        setPanPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
        if (isDragging) {
            setIsDragging(false);
            setPanPosition((prev) => getClampedPan(prev, zoomLevel));
        }
    };

    return {
        product,
        similarProducts,
        qty,
        setQty,
        loading,
        reviews,
        averageRating,
        ratingFilter,
        setRatingFilter,
        activeImageIdx,
        setActiveImageIdx,
        productImages,
        mainImageUrl,
        isFavorite,
        formatPrice,
        discountPercent,
        originalPrice,
        timeLeft,
        isDescExpanded,
        setIsDescExpanded,
        isLightboxOpen,
        lightboxIdx,
        setLightboxIdx,
        zoomLevel,
        panPosition,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleImageClick,
        openLightbox,
        closeLightbox,
        nextLightboxImage,
        prevLightboxImage,
        handleAddToCart,
        handleToggleFavorite,
        handleBuyNow,
        getProductImagesList,
        zoomIn,
        zoomOut,
        resetZoom,
    };
};
