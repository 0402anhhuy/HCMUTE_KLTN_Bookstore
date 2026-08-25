import { useApp } from "@/context/AppContext";

export const useFavoriteProducts = () => {
    const { favorites = [], removeFavorite, addToCart } = useApp();

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        if (product && product.stockQuantity > 0) {
            addToCart?.(product.id, 1);
        }
    };

    const handleRemoveFavorite = (e, productId) => {
        e.stopPropagation();
        removeFavorite?.(productId);
    };

    return {
        favorites,
        formatPrice,
        handleAddToCart,
        handleRemoveFavorite,
    };
};
