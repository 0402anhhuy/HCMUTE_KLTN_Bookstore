import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavoriteProducts } from "./useFavoriteProducts";
import "./FavoriteProducts.css";

const FavoriteProducts = ({ highlight = false }) => {
    const { favorites, formatPrice, handleAddToCart, handleRemoveFavorite } =
        useFavoriteProducts();

    return (
        <div
            id="favorite-section"
            className={`favorite-section-container ${highlight ? "highlight" : ""}`}
        >
            <h3 className="favorite-section-title">
                <Heart
                    size={18}
                    className="favorite-header-icon"
                    style={{ fill: favorites.length > 0 ? "#ef4444" : "none" }}
                />
                Sản phẩm yêu thích
                <span className="favorite-header-badge">
                    {favorites.length} món
                </span>
            </h3>

            {favorites.length === 0 ? (
                <div className="favorite-empty-card">
                    <Heart size={28} className="favorite-empty-icon" />
                    <div className="favorite-empty-text">
                        Chưa có sản phẩm yêu thích.
                    </div>
                    <Link to="/" className="favorite-explore-link">
                        Khám phá ngay
                    </Link>
                </div>
            ) : (
                <div className="favorite-items-list">
                    {favorites.map((fav) => {
                        const product = fav.product;
                        if (!product) return null;

                        return (
                            <div key={fav.id} className="favorite-item-card">
                                <img
                                    src={product.imageUrl || "/placeholder.png"}
                                    alt={product.name}
                                    className="favorite-item-img"
                                />
                                <div className="favorite-item-info">
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="favorite-item-link"
                                    >
                                        {product.name}
                                    </Link>
                                    <div className="favorite-item-author">
                                        {product.author || "Chưa rõ tác giả"}
                                    </div>
                                    <div className="favorite-item-price">
                                        {formatPrice(product.price)}
                                    </div>
                                </div>
                                <div className="favorite-item-actions">
                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleAddToCart(e, product)
                                        }
                                        disabled={product.stockQuantity === 0}
                                        title="Thêm vào giỏ hàng"
                                        className="favorite-btn-cart"
                                    >
                                        <ShoppingCart size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) =>
                                            handleRemoveFavorite(e, product.id)
                                        }
                                        title="Xóa khỏi yêu thích"
                                        className="favorite-btn-remove"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FavoriteProducts;
