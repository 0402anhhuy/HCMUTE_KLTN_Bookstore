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
            className="book-card-container"
            onClick={() => openProductDetail(product)}
        >
            <div className="book-card-cover-wrapper">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="book-card-img"
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

            <div className="book-card-title">{product.name}</div>
            <div className="book-card-author">
                Tác giả: {product.author || "Chưa rõ"}
            </div>

            <div className="book-card-rating-row">
                <div className="book-card-stars">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={12}
                            fill="currentColor"
                            stroke="none"
                        />
                    ))}
                </div>
                <span className="book-card-rating-text">(5.0)</span>
            </div>

            <div className="book-card-bottom-row">
                <span className="book-card-price">
                    {formatPrice(product.price)}
                </span>
                <button
                    type="button"
                    disabled={isOutOfStock}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (!isOutOfStock) {
                            addToCart(product.id, 1);
                        }
                    }}
                    className="book-card-cart-btn"
                >
                    <ShoppingCart size={14} />
                </button>
            </div>
        </div>
    );
};

export default BookCard;
