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

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        })
            .format(price || 0)
            .replace("₫", "đ");
    };

    const discountPercent = product?.discountPercent || 0;
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
            await addToCart(product.id, qty);
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

    const mainImageUrl = productImages[0]?.url;

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
        handleAddToCart,
        handleToggleFavorite,
        handleBuyNow,
        getProductImagesList,
    };
};
