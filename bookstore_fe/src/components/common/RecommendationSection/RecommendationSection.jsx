import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { BookCard } from "../BookCard";
import "./RecommendationSection.css";

const RecommendationSection = ({
    title = "GỢI Ý DÀNH CHO BẠN",
    limit = 10,
}) => {
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useApp();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                // Sau này chỉ cần đổi endpoint sang api recommendation của bạn (VD: /products/recommendations)
                const res = await api.get(`/products?page=0&size=${limit}`);
                setRecommendedProducts(res.data?.content || []);
            } catch (err) {
                console.error("Failed to load recommendations:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [limit]);

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

    if (!loading && recommendedProducts.length === 0) return null;

    return (
        <section className="recommendation-common-container">
            <div className="recommendation-common-header-banner">
                <BookOpen size={18} />
                <span>{title}</span>
            </div>

            {loading ? (
                <div className="recommendation-common-loading">
                    Đang tải gợi ý...
                </div>
            ) : (
                <div className="recommendation-common-grid">
                    {recommendedProducts.map((product) => (
                        <BookCard
                            key={product.id}
                            product={product}
                            openProductDetail={(p) =>
                                navigate(`/product/${p.id}`)
                            }
                            addToCart={addToCart}
                            formatPrice={formatPrice}
                            getProductImage={getProductImage}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default RecommendationSection;
