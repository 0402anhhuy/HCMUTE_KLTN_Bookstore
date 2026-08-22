import { useState, useEffect } from "react";
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

    useEffect(() => {
        const fetchProductDetail = async () => {
            setLoading(true);
            setQty(1);
            setRatingFilter("Tất cả");
            setActiveImageIdx(0);
            try {
                const prodRes = await api.get(`/products/${id}`);
                setProduct(prodRes.data);

                // Fetch reviews
                try {
                    const revRes = await api.get(`/reviews/product/${id}`);
                    setReviews(revRes.data || []);
                } catch (revErr) {
                    console.error("Failed to fetch product reviews:", revErr);
                }

                // Fetch similar products
                if (prodRes.data.category) {
                    const simRes = await api.get(
                        `/products?categoryId=${prodRes.data.category.id}&size=5`,
                    );
                    setSimilarProducts(
                        (simRes.data.content || [])
                            .filter((p) => p.id !== prodRes.data.id)
                            .slice(0, 4),
                    );
                } else {
                    const simRes = await api.get(`/products?size=5`);
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

    const handleAddToCart = async () => {
        if (product && product.stockQuantity > 0) {
            await addToCart(product.id, qty);
        }
    };

    const isFavorite = product
        ? favorites.some((fav) => fav.product?.id === product.id)
        : false;

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
        if (Array.isArray(prod.imageUrl) && prod.imageUrl.length > 0) {
            return prod.imageUrl.filter(Boolean);
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
            ? parsedUrls.map((url) => ({
                  url: url,
                  style: {},
              }))
            : [
                  {
                      url: "https://via.placeholder.com/200x300?text=No+Image",
                      style: {},
                  },
              ];

    const mainImageUrl = productImages[0]?.url;

    return {
        product,
        similarProducts,
        qty,
        setQty,
        loading,
        reviews,
        ratingFilter,
        setRatingFilter,
        activeImageIdx,
        setActiveImageIdx,
        productImages,
        mainImageUrl,
        isFavorite,
        formatPrice,
        handleAddToCart,
        handleToggleFavorite,
        handleBuyNow,
        getProductImagesList,
    };
};
