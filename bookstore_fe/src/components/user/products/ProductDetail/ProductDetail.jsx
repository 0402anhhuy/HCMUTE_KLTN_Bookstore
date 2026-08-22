import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Star,
    Truck,
    ShieldCheck,
    RefreshCcw,
    HeadphonesIcon,
    Heart,
} from "lucide-react";
import { useProductDetail } from "./useProductDetail";
import { useApp } from "@/context/AppContext";
import "./ProductDetail.css";

const ProductDetail = () => {
    const navigate = useNavigate();
    const { addToCart } = useApp();
    const {
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
    } = useProductDetail();

    if (loading) {
        return <div className="product-detail-loading-box">Đang tải...</div>;
    }

    if (!product) {
        return (
            <div className="product-detail-notfound-box">
                Không tìm thấy sản phẩm
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in product-detail-container">
            {/* Breadcrumb */}
            <div className="product-detail-breadcrumb">
                <Link to="/" className="product-detail-breadcrumb-link">
                    Trang chủ
                </Link>
                <span>&gt;</span>
                <Link to="/catalog" className="product-detail-breadcrumb-link">
                    Khám phá kho sách
                </Link>
                <span>&gt;</span>
                <span className="product-detail-breadcrumb-current">
                    {product.name}
                </span>
            </div>

            <div className="product-detail-main-card">
                {/* Left: Image Gallery */}
                <div className="product-detail-gallery-col">
                    <div className="product-detail-main-image-wrapper">
                        {mainImageUrl ? (
                            <img
                                src={
                                    productImages[activeImageIdx]?.url ||
                                    mainImageUrl
                                }
                                alt={product.name}
                                className="product-detail-main-img"
                            />
                        ) : (
                            <div className="product-detail-no-image-text">
                                Không có ảnh
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    <div className="product-detail-thumbs-container">
                        {productImages.map((imgObj, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveImageIdx(idx)}
                                className={`product-detail-thumb-item ${
                                    activeImageIdx === idx ? "active" : ""
                                }`}
                            >
                                {mainImageUrl && (
                                    <div className="product-detail-thumb-box">
                                        <img
                                            src={imgObj.url}
                                            alt="thumb"
                                            className={`product-detail-thumb-img ${
                                                activeImageIdx === idx
                                                    ? "active"
                                                    : ""
                                            }`}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="product-detail-info-col">
                    <div className="product-detail-tag-bestseller">
                        Sách bán chạy
                    </div>

                    <h1 className="product-detail-title">{product.name}</h1>

                    <div className="product-detail-author-text">
                        Tác giả:{" "}
                        <span className="product-detail-author-name">
                            {product.author}
                        </span>
                    </div>

                    <div className="product-detail-rating-row">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                                key={i}
                                size={16}
                                fill="currentColor"
                                stroke="none"
                            />
                        ))}
                        <span className="product-detail-rating-label">
                            (5.0 / 1.205 đánh giá)
                        </span>
                    </div>

                    <div className="product-detail-price">
                        {formatPrice(product.price)}
                    </div>

                    <p className="product-detail-desc">
                        {product.description
                            ? product.description.substring(0, 250) + "..."
                            : "Bản in đặc biệt kỷ niệm, bao gồm các hình vẽ nguyên bản. Tác phẩm kinh điển này là một bức tranh sống động về tình thương và sự kiên cường. Một cuốn sách không thể thiếu trong tủ sách của mọi gia đình Việt."}
                    </p>

                    {/* Details Grid */}
                    <div className="product-detail-specs-grid">
                        <div>
                            <div className="product-detail-spec-label">
                                Định dạng
                            </div>
                            <div className="product-detail-spec-val">
                                {product.format || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Số trang
                            </div>
                            <div className="product-detail-spec-val">
                                {product.page
                                    ? `${product.page} trang`
                                    : "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Ngôn ngữ
                            </div>
                            <div className="product-detail-spec-val">
                                {product.language || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Nhà xuất bản
                            </div>
                            <div className="product-detail-spec-val">
                                {product.publisher || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Nhà cung cấp
                            </div>
                            <div className="product-detail-spec-val">
                                {product.supplierName || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Năm xuất bản
                            </div>
                            <div className="product-detail-spec-val">
                                {product.publicationYear || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Kích thước
                            </div>
                            <div className="product-detail-spec-val">
                                {product.dimensions || "Đang cập nhật"}
                            </div>
                        </div>
                        <div>
                            <div className="product-detail-spec-label">
                                Trọng lượng
                            </div>
                            <div className="product-detail-spec-val">
                                {product.weight
                                    ? `${product.weight} g`
                                    : "Đang cập nhật"}
                            </div>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="product-detail-qty-row">
                        <span className="product-detail-qty-label">
                            Số lượng:
                        </span>
                        <div className="product-detail-qty-control">
                            <button
                                type="button"
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="product-detail-qty-btn"
                            >
                                -
                            </button>
                            <div className="product-detail-qty-val">{qty}</div>
                            <button
                                type="button"
                                onClick={() =>
                                    setQty(
                                        Math.min(
                                            product.stockQuantity,
                                            qty + 1,
                                        ),
                                    )
                                }
                                className="product-detail-qty-btn"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="product-detail-actions-stack">
                        <div className="product-detail-actions-top-row">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={product.stockQuantity === 0}
                                className="product-detail-btn-cart"
                            >
                                <ShoppingCart size={18} /> Thêm vào giỏ hàng
                            </button>
                            <button
                                type="button"
                                onClick={handleToggleFavorite}
                                className={`product-detail-btn-favorite ${
                                    isFavorite ? "active" : ""
                                }`}
                                title={
                                    isFavorite
                                        ? "Xóa khỏi danh sách yêu thích"
                                        : "Thêm vào danh sách yêu thích"
                                }
                            >
                                <Heart
                                    size={20}
                                    fill={isFavorite ? "#ef4444" : "none"}
                                />
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={product.stockQuantity === 0}
                            className="product-detail-btn-buynow"
                        >
                            Mua ngay
                        </button>
                    </div>

                    {/* Features */}
                    <div className="product-detail-features-grid">
                        <div className="product-detail-feature-item">
                            <Truck size={18} />{" "}
                            <span>Miễn phí vận chuyển toàn quốc</span>
                        </div>
                        <div className="product-detail-feature-item">
                            <ShieldCheck size={18} />{" "}
                            <span>Bảo vệ khách hàng 100%</span>
                        </div>
                        <div className="product-detail-feature-item">
                            <RefreshCcw size={18} />{" "}
                            <span>Đổi trả dễ dàng 30 ngày</span>
                        </div>
                        <div className="product-detail-feature-item">
                            <HeadphonesIcon size={18} />{" "}
                            <span>Hỗ trợ khách hàng 24/7</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Reviews Section */}
            <div className="product-detail-reviews-card">
                <h2 className="product-detail-reviews-title">
                    <Star size={24} fill="#ecc94b" stroke="none" /> Đánh giá sản
                    phẩm
                </h2>

                {/* Rating Summary Card */}
                <div className="product-detail-rating-summary-card">
                    <div className="product-detail-rating-left-box">
                        <div className="product-detail-big-rating-score">
                            {reviews.length > 0
                                ? (
                                      reviews.reduce(
                                          (acc, r) => acc + r.rating,
                                          0,
                                      ) / reviews.length
                                  ).toFixed(1)
                                : "5.0"}
                        </div>
                        <div className="product-detail-rating-scale-text">
                            trên 5
                        </div>
                        <div className="product-detail-summary-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={18}
                                    fill="currentColor"
                                    stroke="none"
                                />
                            ))}
                        </div>
                        <div className="product-detail-total-reviews-count">
                            ({reviews.length > 0 ? reviews.length : 2} đánh giá
                            thực tế)
                        </div>
                    </div>

                    <div className="product-detail-filter-stars-buttons">
                        {[
                            "Tất cả",
                            "5 Sao",
                            "4 Sao",
                            "3 Sao",
                            "2 Sao",
                            "1 Sao",
                        ].map((label, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setRatingFilter(label)}
                                className={`product-detail-filter-star-btn ${
                                    ratingFilter === label ? "active" : ""
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Reviews List */}
                <div className="product-detail-reviews-list">
                    {(reviews.length > 0
                        ? reviews
                        : [
                              {
                                  id: "mock-1",
                                  user: { fullName: "Nguyễn Anh Huy" },
                                  rating: 5,
                                  comment:
                                      "Sách in rất đẹp, chất lượng giấy dày dặn và bìa cứng cầm rất chắc tay. Nội dung cực kỳ thực tế và bổ ích, rất đáng tiền!",
                                  reviewedAt: "2026-07-02T08:15:00Z",
                              },
                              {
                                  id: "mock-2",
                                  user: { fullName: "Lê Hoài Nam" },
                                  rating: 5,
                                  comment:
                                      "Đã nhận được sách, giao hàng nhanh trong 2 ngày. Gói hàng bọc chống sốc kỹ càng. Nội dung sách truyền cảm hứng rất nhiều.",
                                  reviewedAt: "2026-07-04T14:22:00Z",
                              },
                          ]
                    )
                        .filter((rev) => {
                            if (ratingFilter === "Tất cả") return true;
                            const starVal = parseInt(
                                ratingFilter.split(" ")[0],
                                10,
                            );
                            return rev.rating === starVal;
                        })
                        .map((rev, idx) => (
                            <div
                                key={rev.id || idx}
                                className="product-detail-review-item"
                            >
                                <div className="product-detail-review-top">
                                    <div className="product-detail-avatar-circle">
                                        {rev.user?.fullName
                                            ? rev.user.fullName
                                                  .split(" ")
                                                  .pop()[0]
                                                  .toUpperCase()
                                            : "U"}
                                    </div>
                                    <div>
                                        <div className="product-detail-reviewer-name">
                                            {rev.user?.fullName ||
                                                "Người dùng ẩn danh"}
                                            <span className="product-detail-verified-badge">
                                                Đã mua hàng
                                            </span>
                                        </div>
                                        <div className="product-detail-review-stars-list">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    fill={
                                                        i <= rev.rating
                                                            ? "currentColor"
                                                            : "none"
                                                    }
                                                    stroke={
                                                        i <= rev.rating
                                                            ? "none"
                                                            : "#ecc94b"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="product-detail-review-date">
                                        {new Date(
                                            rev.reviewedAt,
                                        ).toLocaleDateString("vi-VN")}
                                    </div>
                                </div>
                                <p className="product-detail-review-comment">
                                    {rev.comment}
                                </p>
                                {rev.reply && (
                                    <div className="product-detail-review-reply-box">
                                        <div className="product-detail-reply-title">
                                            Cửa hàng phản hồi:
                                        </div>
                                        {rev.reply}
                                    </div>
                                )}
                            </div>
                        ))}
                    {reviews.length > 0 || ratingFilter === "Tất cả" ? null : (
                        <div className="product-detail-empty-filter-review">
                            Không có đánh giá nào {ratingFilter.toLowerCase()}{" "}
                            cho sản phẩm này.
                        </div>
                    )}
                </div>
            </div>

            {/* Similar Products */}
            {similarProducts.length > 0 && (
                <div className="product-detail-similar-section">
                    <div className="product-detail-similar-header">
                        <h2 className="product-detail-similar-title">
                            Sách cùng thể loại "
                            {product.category?.name || "Tổng hợp"}"
                        </h2>
                        <Link
                            to="/catalog"
                            className="product-detail-see-all-link"
                        >
                            Xem tất cả &gt;
                        </Link>
                    </div>

                    <div className="product-detail-similar-grid">
                        {similarProducts.map((p) => {
                            const pImgs = getProductImagesList(p);
                            const pCover = pImgs[0] || null;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/product/${p.id}`)}
                                    className="product-detail-similar-card"
                                >
                                    <div className="product-detail-similar-cover-box">
                                        {pCover ? (
                                            <img
                                                src={pCover}
                                                alt={p.name}
                                                className="product-detail-similar-img"
                                            />
                                        ) : (
                                            <span className="product-detail-similar-no-img">
                                                No Image
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="product-detail-similar-name">
                                        {p.name}
                                    </h3>
                                    <div className="product-detail-similar-author">
                                        {p.author}
                                    </div>
                                    <div className="product-detail-similar-price-row">
                                        <span className="product-detail-similar-price">
                                            {formatPrice(p.price)}
                                        </span>
                                        <div className="product-detail-similar-rating">
                                            <Star
                                                size={12}
                                                fill="currentColor"
                                                stroke="none"
                                            />{" "}
                                            4.9
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(p.id, 1);
                                        }}
                                        className="product-detail-btn-similar-add"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
