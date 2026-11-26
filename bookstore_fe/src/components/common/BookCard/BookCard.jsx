import { BookOpen, Star, ShoppingCart } from "lucide-react";
import { resolveBookCardPricing } from "./bookCardPricing";
import "./BookCard.css";

const BookCard = ({
    product,
    openProductDetail,
    addToCart,
    formatPrice,
    getProductImage,
    showBadge,
    originalPrice,
    isFlashSale,
}) => {
    if (!product) return null;

    const imageUrl = getProductImage ? getProductImage(product) : product?.imageUrl;
    const isOutOfStock = product?.stockQuantity === 0;

    const { discountPercent, computedOriginalPrice, hasDiscount } = resolveBookCardPricing({
        product,
        originalPrice,
        showBadge,
    });

    return (
        <div
            className="book-card-container group"
            onClick={() => openProductDetail && openProductDetail(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (openProductDetail) openProductDetail(product);
                }
            }}
        >
            <div className="book-card-cover-wrapper">
                {showBadge && (
                    <span className="book-card-badge">{showBadge}</span>
                )}

                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product?.name || "Sách"}
                        className="book-card-img"
                        loading="lazy"
                    />
                ) : (
                    <BookOpen
                        size={48}
                        className="book-card-placeholder-icon"
                    />
                )}

                {isOutOfStock && (
                    <span className="book-card-out-of-stock-overlay">
                        Hết hàng
                    </span>
                )}
            </div>

            <div className="book-card-title">
                <span>{product?.name || "Đang cập nhật"}</span>
            </div>
            <div className="book-card-author">
                {product?.author || "Đang cập nhật"}
            </div>

            <div className="book-card-rating-row">
                <div className="book-card-stars">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                        const rating = Number(product.averageRating || product.rating || 0);
                        const isFilled = rating >= starIdx;
                        return (
                            <Star
                                key={starIdx}
                                size={12}
                                fill={isFilled ? "#ecc94b" : "none"}
                                color={isFilled ? "#ecc94b" : "#cbd5e1"}
                            />
                        );
                    })}
                </div>
                <span className="book-card-rating-text">
                    {Number(product.averageRating) > 0
                        ? `(${Number(product.averageRating).toFixed(1)})`
                        : Number(product.reviewCount) > 0
                        ? `(${Number(product.reviewCount)})`
                        : "(0)"}
                </span>
            </div>

            <div className="book-card-bottom-row">
                <div className="book-card-price-group">
                    {hasDiscount ? (
                        <div className="book-card-original-price-row">
                            <span className="book-card-original-price tabular-nums">
                                {formatPrice ? formatPrice(computedOriginalPrice) : `${Number(computedOriginalPrice).toLocaleString("vi-VN")} đ`}
                            </span>
                            <span className="book-card-discount-rate">
                                -{discountPercent}%
                            </span>
                        </div>
                    ) : (
                        <div className="book-card-original-price-placeholder" />
                    )}
                    <span className={`book-card-price tabular-nums ${hasDiscount ? "is-discounted" : ""}`}>
                        {formatPrice ? formatPrice(product.price) : `${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                    </span>
                </div>

                <button
                    type="button"
                    disabled={isOutOfStock}
                    title={
                        isOutOfStock
                            ? "Sản phẩm tạm hết hàng"
                            : "Thêm vào giỏ hàng"
                    }
                    aria-label="Thêm vào giỏ hàng"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock && addToCart) {
                            addToCart(product.id, 1, product);
                        }
                    }}
                    className="book-card-cart-btn"
                >
                    <ShoppingCart size={15} />
                </button>
            </div>

            {/* Thanh tiến độ Flash Sale (nếu có) */}
            {isFlashSale && (() => {
                const sold = product.promoUsedCount ?? product.soldCount ?? 0;
                const stock = product.stockQuantity ?? 0;
                const total = sold + stock;
                const progressPercent = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;

                return (
                    <div className="book-card-progress-box">
                        <div className="book-card-progress-bg">
                            <div
                                className="book-card-progress-fill"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <span className="book-card-progress-text">
                            Đã bán {sold}
                        </span>
                    </div>
                );
            })()}
        </div>
    );
};

export default BookCard;
