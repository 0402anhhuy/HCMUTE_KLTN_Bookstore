import React from "react";
import { useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Star,
    Truck,
    RotateCcw,
    Zap,
    ChevronDown,
    ChevronUp,
    Heart,
} from "lucide-react";
import { Breadcrumb, RecommendationSection } from "@/components/common";
import { buildCategoryBreadcrumbs } from "@/utils/categoryTree";
import { useProductDetail } from "./useProductDetail";
import "./ProductDetail.css";

const ProductDetail = () => {
    const navigate = useNavigate();
    const {
        product,
        similarProducts,
        qty,
        setQty,
        loading,
        reviews,
        averageRating,
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
    } = useProductDetail();

    if (loading) {
        return (
            <div className="product-detail-loading-box">
                Đang tải thông tin sách...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-detail-notfound-box">
                Không tìm thấy sản phẩm yêu cầu.
            </div>
        );
    }

    // Tự động xây dựng Breadcrumb đệ quy chuẩn
    const breadcrumbItems = [
        { label: "Khám phá kho sách", path: "/catalog" },
        ...buildCategoryBreadcrumbs(product.category, product.name),
    ];

    return (
        <div className="page-container animate-fade-in product-detail-container">
            {/* Breadcrumb đồng bộ */}
            <div className="product-detail-breadcrumb-wrapper">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Top Layout */}
            <div className="product-detail-main-layout">
                {/* CỘT TRÁI */}
                <div className="product-detail-left-card">
                    <div className="product-detail-main-cover-box">
                        <img
                            src={
                                productImages[activeImageIdx]?.url ||
                                mainImageUrl
                            }
                            alt={product.name}
                            className="product-detail-main-cover-img"
                        />
                    </div>

                    <div className="product-detail-thumbs-strip">
                        {productImages.map((imgObj, idx) => (
                            <div
                                key={idx}
                                onClick={() => setActiveImageIdx(idx)}
                                className={`product-detail-thumb-box ${activeImageIdx === idx ? "active" : ""}`}
                            >
                                <img
                                    src={imgObj.url}
                                    alt="thumb"
                                    className="product-detail-thumb-img"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="product-detail-cta-group">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={product.stockQuantity === 0}
                            className="product-detail-btn-outline-cart"
                        >
                            <ShoppingCart size={18} /> Thêm vào giỏ hàng
                        </button>
                        <button
                            type="button"
                            onClick={handleBuyNow}
                            disabled={product.stockQuantity === 0}
                            className="product-detail-btn-solid-buy"
                        >
                            Mua ngay
                        </button>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="product-detail-right-col">
                    <div className="product-detail-card-box">
                        <div className="product-detail-header-block">
                            <div className="product-detail-title-row">
                                <h1 className="product-detail-book-title">
                                    {product.name}
                                </h1>
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className={`product-detail-btn-fav-round ${isFavorite ? "active" : ""}`}
                                    title={
                                        isFavorite ? "Bỏ thích" : "Yêu thích"
                                    }
                                >
                                    <Heart
                                        size={18}
                                        fill={isFavorite ? "#ef4444" : "none"}
                                        color={
                                            isFavorite ? "#ef4444" : "#94a3b8"
                                        }
                                    />
                                </button>
                            </div>

                            <div className="product-detail-meta-line">
                                <span>
                                    Nhà cung cấp:{" "}
                                    <strong>
                                        {product.supplierName ||
                                            product.publisher ||
                                            "Chưa cập nhật"}
                                    </strong>
                                </span>
                                <span>
                                    Tác giả:{" "}
                                    <strong>
                                        {product.author || "Chưa rõ tác giả"}
                                    </strong>
                                </span>
                            </div>

                            <div className="product-detail-rating-meta-row">
                                <div className="product-detail-stars-list">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            fill={
                                                averageRating >= i
                                                    ? "#ecc94b"
                                                    : "none"
                                            }
                                            stroke={
                                                averageRating >= i
                                                    ? "none"
                                                    : "#cbd5e1"
                                            }
                                        />
                                    ))}
                                </div>
                                <span className="product-detail-review-count-text">
                                    ({reviews.length} đánh giá)
                                </span>
                                <span className="product-detail-divider-dot">
                                    |
                                </span>
                                <span className="product-detail-sold-stat">
                                    Còn lại:{" "}
                                    <strong>{product.stockQuantity}</strong>
                                </span>
                            </div>
                        </div>

                        {/* Flash Sale Banner */}
                        {discountPercent > 0 && (
                            <div className="product-detail-flashsale-banner">
                                <div className="product-detail-flashsale-label">
                                    <Zap size={16} fill="#ffffff" /> FLASH SALE
                                </div>
                                <div className="product-detail-flashsale-timer">
                                    <span>Kết thúc trong</span>
                                    <span className="timer-badge">
                                        {timeLeft.hours}
                                    </span>{" "}
                                    :
                                    <span className="timer-badge">
                                        {timeLeft.minutes}
                                    </span>{" "}
                                    :
                                    <span className="timer-badge">
                                        {timeLeft.seconds}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Giá tiền */}
                        <div className="product-detail-pricing-box">
                            <span className="product-detail-sale-price">
                                {formatPrice(product.price)}
                            </span>
                            {originalPrice && (
                                <span className="product-detail-old-price">
                                    {formatPrice(originalPrice)}
                                </span>
                            )}
                            {discountPercent > 0 && (
                                <span className="product-detail-discount-tag">
                                    -{discountPercent}%
                                </span>
                            )}
                        </div>

                        {/* Số lượng */}
                        <div className="product-detail-quantity-row">
                            <span className="product-detail-qty-title">
                                Số lượng:
                            </span>
                            <div className="product-detail-qty-picker">
                                <button
                                    type="button"
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="qty-picker-btn"
                                >
                                    -
                                </button>
                                <span className="qty-picker-val">{qty}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setQty(
                                            Math.min(
                                                product.stockQuantity || 99,
                                                qty + 1,
                                            ),
                                        )
                                    }
                                    className="qty-picker-btn"
                                    disabled={qty >= product.stockQuantity}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Thông tin vận chuyển */}
                    <div className="product-detail-card-box">
                        <h4 className="product-detail-card-heading">
                            Thông tin vận chuyển
                        </h4>
                        <div className="product-detail-shipping-list">
                            <div className="product-detail-shipping-item">
                                <Truck size={18} className="shipping-icon" />
                                <div className="shipping-text-box">
                                    <p className="shipping-main-txt">
                                        Giao hàng đến{" "}
                                        <strong>Hồ Chí Minh</strong>
                                    </p>
                                    <p className="shipping-sub-txt">
                                        Giao nhanh và uy tín trong ngày với các
                                        đơn hàng tại TP.HCM và Hà Nội.
                                    </p>
                                </div>
                            </div>
                            <div className="product-detail-shipping-item">
                                <RotateCcw
                                    size={18}
                                    className="shipping-icon"
                                />
                                <div className="shipping-text-box">
                                    <p className="shipping-main-txt">
                                        Đổi trả miễn phí toàn quốc 30 ngày
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thông số sách */}
                    <div className="product-detail-card-box">
                        <h4 className="product-detail-card-heading">
                            Thông tin chi tiết
                        </h4>
                        <table className="product-detail-specs-table">
                            <tbody>
                                <tr>
                                    <td className="spec-name">Nhà xuất bản</td>
                                    <td className="spec-value">
                                        {product.publisher || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Hình thức bìa</td>
                                    <td className="spec-value">
                                        {product.format || "Bìa Mềm"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Năm xuất bản</td>
                                    <td className="spec-value">
                                        {product.publicationYear ||
                                            "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Ngôn ngữ</td>
                                    <td className="spec-value">
                                        {product.language || "Tiếng Việt"}
                                    </td>
                                </tr>
                                {product.page && (
                                    <tr>
                                        <td className="spec-name">Số trang</td>
                                        <td className="spec-value">
                                            {product.page} trang
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mô tả sản phẩm */}
            <div className="product-detail-section-card">
                <h3 className="product-detail-section-heading">
                    Mô tả sản phẩm
                </h3>
                <div className="product-detail-desc-content">
                    <h4 className="product-detail-desc-book-name">
                        {product.name}
                    </h4>
                    <div
                        className={`product-detail-desc-text ${!isDescExpanded ? "clamped" : ""}`}
                    >
                        {product.description ||
                            "Chưa có mô tả cho tác phẩm này."}
                    </div>

                    {product.description &&
                        product.description.length > 200 && (
                            <button
                                type="button"
                                className="product-detail-desc-toggle-btn"
                                onClick={() =>
                                    setIsDescExpanded(!isDescExpanded)
                                }
                            >
                                {isDescExpanded ? "Thu gọn" : "Xem thêm"}{" "}
                                {isDescExpanded ? (
                                    <ChevronUp size={16} />
                                ) : (
                                    <ChevronDown size={16} />
                                )}
                            </button>
                        )}
                </div>
            </div>

            {/* Đánh giá sản phẩm */}
            <div className="product-detail-section-card">
                <h3 className="product-detail-section-heading">
                    Đánh giá sản phẩm
                </h3>
                <div className="product-detail-review-summary-row">
                    <div className="product-detail-score-box">
                        <span className="big-score">
                            {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                            <small>/5</small>
                        </span>
                        <div className="score-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={15}
                                    fill={
                                        averageRating >= i ? "#ecc94b" : "none"
                                    }
                                    stroke={
                                        averageRating >= i ? "none" : "#cbd5e1"
                                    }
                                />
                            ))}
                        </div>
                        <span className="score-count">
                            ({reviews.length} đánh giá)
                        </span>
                    </div>

                    <div className="product-detail-reviews-empty">
                        {reviews.length === 0
                            ? "Chưa có đánh giá nào cho sản phẩm này."
                            : `${reviews.length} đánh giá từ khách hàng`}
                    </div>
                </div>
            </div>

            {/* Sản phẩm liên quan */}
            {similarProducts.length > 0 && (
                <div className="product-detail-section-card">
                    <h3 className="product-detail-section-heading">
                        Sản phẩm liên quan
                    </h3>
                    <div className="product-detail-similar-grid">
                        {similarProducts.map((simProd) => {
                            const simImgs = getProductImagesList(simProd);
                            return (
                                <div
                                    key={simProd.id}
                                    className="product-detail-similar-item"
                                    onClick={() =>
                                        navigate(`/product/${simProd.id}`)
                                    }
                                >
                                    <div className="similar-thumb-box">
                                        <img
                                            src={simImgs[0] || simProd.imageUrl}
                                            alt={simProd.name}
                                            className="similar-img"
                                        />
                                    </div>
                                    <h5 className="similar-name">
                                        {simProd.name}
                                    </h5>
                                    <div className="similar-price">
                                        {formatPrice(simProd.price)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <RecommendationSection title="GỢI Ý CHO BẠN" limit={10} />
        </div>
    );
};

export default ProductDetail;
