import { BookOpen, Star, ShoppingCart } from "lucide-react";

const BookCard = ({
    product,
    openProductDetail,
    addToCart,
    formatPrice,
    getProductImage,
}) => {
    const imageUrl = getProductImage(product);
    const isOutOfStock = product.stockQuantity === 0;

    return (
        <div
            className="book-card-container group"
            onClick={() => openProductDetail(product)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openProductDetail(product);
                }
            }}
        >
            <div className="book-card-cover-wrapper">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
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

            <div className="book-card-title" style={{ textWrap: "balance" }}>
                {product.name}
            </div>
            <div className="book-card-author">
                {product.author || "Đang cập nhật"}
            </div>

            <div className="book-card-rating-row">
                <div className="book-card-stars">
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                        const isFilled =
                            product.averageRating &&
                            product.averageRating >= starIdx;
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
                    {product.averageRating && product.averageRating > 0
                        ? `(${product.averageRating.toFixed(1)})`
                        : "(0)"}
                </span>
            </div>

            <div className="book-card-bottom-row">
                <span className="book-card-price tabular-nums">
                    {formatPrice(product.price)}
                </span>
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
                        if (!isOutOfStock) {
                            addToCart(product.id, 1, product);
                        }
                    }}
                    className="book-card-cart-btn"
                >
                    <ShoppingCart size={15} />
                </button>
            </div>
        </div>
    );
};

export default BookCard;
