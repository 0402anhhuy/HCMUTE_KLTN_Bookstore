import { useNavigate, Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common";
import { useFavoriteProducts } from "./useFavoriteProducts";
import "./FavoriteProducts.css";

const FavoriteProducts = ({ highlight = false }) => {
    const navigate = useNavigate();
    const { favorites, formatPrice, handleAddToCart, handleRemoveFavorite } =
        useFavoriteProducts();

    return (
        <div
            id="favorite-section"
            className={`favorite-section-container ${highlight ? "highlight" : ""}`}
        >
            <div className="favorite-section-header">
                <h3 className="favorite-section-title">
                    <Heart
                        size={18}
                        className="favorite-header-icon"
                        style={{ fill: favorites.length > 0 ? "#ef4444" : "none" }}
                    />
                    Sản phẩm yêu thích
                </h3>
                <span className="favorite-header-badge">
                    {favorites.length} sản phẩm
                </span>
            </div>

            {favorites.length === 0 ? (
                <EmptyState
                    icon={Heart}
                    title="Chưa có sản phẩm yêu thích"
                    description="Bạn chưa lưu cuốn sách nào vào danh sách yêu thích. Hãy khám phá và thả tim cho những cuốn sách yêu thích nhé!"
                    actionText="Khám phá ngay"
                    onAction={() => navigate("/catalog")}
                />
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
