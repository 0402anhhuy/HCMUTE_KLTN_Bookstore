import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
    ShoppingCart,
    Star,
    Truck,
    RotateCcw,
    Zap,
    ChevronDown,
    ChevronUp,
    Heart,
    X,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    User,
    Building2,
    BookOpenText,
    Store,
    BookOpen,
    ShieldCheck,
    ArrowLeft,
    BookX,
} from "lucide-react";
import { Breadcrumb, RecommendationSection } from "@/components/common";
import { buildCategoryBreadcrumbs } from "@/utils/categoryTree";
import { useProductDetail } from "./useProductDetail";
import ProductDetailSkeleton from "./ProductDetailSkeleton";
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
        isLightboxOpen,
        lightboxIdx,
        setLightboxIdx,
        zoomLevel,
        panPosition,
        isDragging,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleImageClick,
        openLightbox,
        closeLightbox,
        nextLightboxImage,
        prevLightboxImage,
        handleAddToCart,
        handleToggleFavorite,
        handleBuyNow,
        getProductImagesList,
        zoomIn,
        zoomOut,
        resetZoom,
    } = useProductDetail();

    if (loading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return (
            <div className="page-container product-detail-notfound-container">
                <div className="product-detail-notfound-box">
                    <div className="notfound-icon-wrap">
                        <BookX size={48} strokeWidth={1.5} />
                    </div>
                    <h2 className="notfound-title">Không tìm thấy sản phẩm</h2>
                    <p className="notfound-desc">
                        Tựa sách bạn đang tìm kiếm có thể đã tạm thời ngừng kinh doanh hoặc liên kết không chính xác.
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate("/catalog")}
                        className="notfound-back-btn"
                    >
                        <ArrowLeft size={16} /> Quay lại kho sách
                    </button>
                </div>
            </div>
        );
    }

    const breadcrumbItems = [
        { label: "Khám phá kho sách", path: "/catalog" },
        ...buildCategoryBreadcrumbs(product.category, product.name),
    ];

    const maxVisibleThumbs = 4;
    const totalImagesCount = productImages.length;
    const hasMoreThumbs = totalImagesCount > maxVisibleThumbs;
    const visibleThumbs = hasMoreThumbs
        ? productImages.slice(0, 4)
        : productImages;
    const remainingCount = totalImagesCount - 3;

    return (
        <div className="page-container animate-fade-in product-detail-container">
            {/* Breadcrumb */}
            <div className="product-detail-breadcrumb-wrapper">
                <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Top Layout */}
            <div className="product-detail-main-layout">
                {/* CỘT TRÁI - KHUNG HÌNH VÀ THUMBNAILS (STICKY TRÊN DESKTOP) */}
                <div className="product-detail-left-card">
                    <div
                        className="product-detail-main-cover-box group"
                        onClick={() => openLightbox(activeImageIdx)}
                        title="Nhấp để phóng to / Đọc thử nội dung sách"
                    >
                        <img
                            src={
                                productImages[activeImageIdx]?.url ||
                                mainImageUrl
                            }
                            alt={product.name}
                            className="product-detail-main-cover-img"
                        />
                        <div className="product-detail-cover-hover-hint">
                            <Maximize2 size={16} /> Phóng to đọc thử
                        </div>
                    </div>

                    {/* Thanh Thumbnails hiển thị 4 hình + badge +N */}
                    <div className="product-detail-thumbs-strip">
                        {visibleThumbs.map((imgObj, idx) => {
                            const isFourthItemWithMore =
                                hasMoreThumbs && idx === 3;

                            return (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        if (isFourthItemWithMore) {
                                            openLightbox(3);
                                        } else {
                                            setActiveImageIdx(idx);
                                        }
                                    }}
                                    className={`product-detail-thumb-box ${
                                        activeImageIdx === idx ? "active" : ""
                                    } ${
                                        isFourthItemWithMore
                                            ? "thumb-has-more"
                                            : ""
                                    }`}
                                >
                                    <img
                                        src={imgObj.url}
                                        alt={`thumb-${idx}`}
                                        className="product-detail-thumb-img"
                                    />
                                    {isFourthItemWithMore && (
                                        <div className="product-detail-thumb-overlay-more">
                                            <span>+{remainingCount}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CỘT PHẢI - THÔNG TIN, VẬN CHUYỂN, CHI TIẾT & MÔ TẢ SẢN PHẨM */}
                <div className="product-detail-right-col">
                    {/* Card 1: Thông tin chính, giá, nút mua */}
                    <div className="product-detail-card-box product-detail-main-info-card">
                        <div className="product-detail-header-block">
                            <div className="product-detail-title-row">
                                <h1
                                    className="product-detail-book-title"
                                    style={{ textWrap: "balance" }}
                                >
                                    {product.name}
                                </h1>
                                <button
                                    type="button"
                                    onClick={handleToggleFavorite}
                                    className={`product-detail-btn-fav-round ${
                                        isFavorite ? "active" : ""
                                    }`}
                                    title={
                                        isFavorite ? "Bỏ thích" : "Yêu thích"
                                    }
                                    aria-label={
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
                                <span className="product-detail-meta-item">
                                    <Store size={15} color="#0a422d" />
                                    <span>
                                        Nhà cung cấp:{" "}
                                        <strong>
                                            {product.supplierName ||
                                                "Chưa cập nhật"}
                                        </strong>
                                    </span>
                                </span>
                                <span className="product-detail-meta-item">
                                    <User size={15} color="#0a422d" />
                                    <span>
                                        Tác giả:{" "}
                                        <strong>
                                            {product.author ||
                                                "Chưa rõ tác giả"}
                                        </strong>
                                    </span>
                                </span>
                                <span className="product-detail-meta-item">
                                    <Building2 size={15} color="#0a422d" />
                                    <span>
                                        Nhà xuất bản:{" "}
                                        <strong>
                                            {product.publisher ||
                                                "Chưa cập nhật"}
                                        </strong>
                                    </span>
                                </span>
                                <span className="product-detail-meta-item">
                                    <BookOpenText size={15} color="#0a422d" />
                                    <span>
                                        Hình thức bìa:{" "}
                                        <strong>
                                            {product.format || "Chưa cập nhật"}
                                        </strong>
                                    </span>
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
                                <div className="product-detail-flashsale-timer tabular-nums">
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
                        <div className="product-detail-pricing-box tabular-nums">
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
                                    aria-label="Giảm số lượng"
                                >
                                    -
                                </button>
                                <span className="qty-picker-val tabular-nums">
                                    {qty}
                                </span>
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
                                    aria-label="Tăng số lượng"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
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
                                {product.stockQuantity === 0 ? "Hết hàng" : "Mua ngay"}
                            </button>
                        </div>

                        {/* Trust Badges Bar (Gắn liền với card mua hàng để tối ưu conversion) */}
                        <div className="product-detail-trust-badges">
                            <div className="trust-badge-item">
                                <Truck size={16} className="trust-badge-icon" />
                                <span>Giao nhanh toàn quốc</span>
                            </div>
                            <div className="trust-badge-item">
                                <RotateCcw size={16} className="trust-badge-icon" />
                                <span>Đổi trả 30 ngày</span>
                            </div>
                            <div className="trust-badge-item">
                                <ShieldCheck size={16} className="trust-badge-icon" />
                                <span>Sách chính hãng 100%</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Thông tin chi tiết (Bảng thông số) */}
                    <div className="product-detail-card-box">
                        <h4 className="product-detail-card-heading">
                            Thông tin chi tiết
                        </h4>
                        <table className="product-detail-specs-table">
                            <tbody>
                                <tr>
                                    <td className="spec-name">Nhà cung cấp</td>
                                    <td className="spec-value">
                                        {product.supplierName || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Tác giả</td>
                                    <td className="spec-value">
                                        {product.author || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                {product.translator && (
                                    <tr>
                                        <td className="spec-name">
                                            Người dịch
                                        </td>
                                        <td className="spec-value">
                                            {product.translator}
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td className="spec-name">Nhà xuất bản</td>
                                    <td className="spec-value">
                                        {product.publisher || "Chưa cập nhật"}
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
                                <tr>
                                    <td className="spec-name">
                                        Trọng lượng (gr)
                                    </td>
                                    <td className="spec-value">
                                        {product.weight || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">
                                        Kích thước bao bì
                                    </td>
                                    <td className="spec-value">
                                        {product.dimensions || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Số trang</td>
                                    <td className="spec-value">
                                        {product.page || "Chưa cập nhật"}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="spec-name">Hình thức</td>
                                    <td className="spec-value">
                                        {product.format || "Chưa cập nhật"}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Card 3: Mô tả sản phẩm */}
                    <div className="product-detail-card-box">
                        <h4 className="product-detail-card-heading">
                            Mô tả sản phẩm
                        </h4>
                        <div className="product-detail-desc-content">
                            <h5 className="product-detail-desc-book-name">
                                {product.name}
                            </h5>
                            <div
                                className={`product-detail-desc-text ${
                                    !isDescExpanded ? "collapsed" : ""
                                }`}
                            >
                                {product.description ||
                                    "Chưa có mô tả cho tác phẩm này."}
                            </div>
                            {product.description &&
                                product.description.length > 100 && (
                                    <div className="product-detail-desc-toggle-wrapper">
                                        <button
                                            type="button"
                                            className="product-detail-btn-toggle-desc"
                                            onClick={() =>
                                                setIsDescExpanded(
                                                    !isDescExpanded,
                                                )
                                            }
                                        >
                                            {isDescExpanded ? (
                                                <>
                                                    Thu gọn{" "}
                                                    <ChevronUp size={16} />
                                                </>
                                            ) : (
                                                <>
                                                    Xem thêm{" "}
                                                    <ChevronDown size={16} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Đánh giá sản phẩm */}
            <div className="product-detail-section-card">
                <h3 className="product-detail-section-heading">
                    Đánh giá sản phẩm
                </h3>
                <div className="product-detail-review-summary-row">
                    <div className="product-detail-score-box">
                        <span className="big-score tabular-nums">
                            {averageRating > 0 ? averageRating.toFixed(1) : "0"}
                            <small>/5</small>
                        </span>
                        <div className="score-stars">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    size={16}
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
                            {reviews.length} đánh giá
                        </span>
                    </div>

                    <div className="product-detail-reviews-empty">
                        {reviews.length === 0 ? (
                            "Chưa có đánh giá nào cho sản phẩm này."
                        ) : (
                            <span>
                                Đã có {reviews.length} nhận xét từ độc giả.
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Sản phẩm tương tự */}
            {similarProducts.length > 0 && (
                <div className="product-detail-section-card">
                    <h3 className="product-detail-section-heading">
                        Sản phẩm tương tự
                    </h3>
                    <div className="product-detail-similar-grid">
                        {similarProducts.slice(0, 5).map((simProd) => {
                            const simImgs = getProductImagesList(simProd);
                            const coverUrl = simImgs[0] || simProd.imageUrl;

                            return (
                                <div
                                    key={simProd.id}
                                    className="product-detail-similar-item group"
                                    onClick={() => navigate(`/product/${simProd.id}`)}
                                >
                                    <div className="similar-thumb-box">
                                        {coverUrl ? (
                                            <img
                                                src={coverUrl}
                                                alt={simProd.name}
                                                className="similar-img"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <BookOpen size={40} color="#0a422d" opacity={0.5} />
                                        )}
                                    </div>

                                    <h5
                                        className="similar-name"
                                        title={simProd.name}
                                        style={{ textWrap: "balance" }}
                                    >
                                        {simProd.name}
                                    </h5>

                                    <div className="similar-author">
                                        Tác giả: {simProd.author || "Đang cập nhật"}
                                    </div>

                                    <div className="similar-rating-row">
                                        <div className="similar-stars-list">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const rating = simProd.averageRating || simProd.rating || 0;
                                                const isFilled = rating >= star;

                                                return (
                                                    <Star
                                                        key={star}
                                                        size={13}
                                                        fill={isFilled ? "#ecc94b" : "none"}
                                                        stroke={isFilled ? "#ecc94b" : "#cbd5e1"}
                                                        className={isFilled ? "star-filled" : "star-empty"}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <span className="similar-review-text">
                                            ({simProd.reviewCount || 0})
                                        </span>
                                    </div>

                                    <div className="similar-footer-row">
                                        <span className="similar-price tabular-nums">
                                            {formatPrice(simProd.price)}
                                        </span>
                                        <button
                                            type="button"
                                            className="similar-btn-add-cart"
                                            title="Thêm vào giỏ"
                                            aria-label="Thêm vào giỏ hàng"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(simProd.id, 1);
                                            }}
                                        >
                                            <ShoppingCart size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <RecommendationSection title="GỢI Ý CHO BẠN" limit={10} />

            {/* MOBILE STICKY BOTTOM ACTION BAR (iPhone 14 Pro Max & Mobile devices) */}
            <div className="product-detail-mobile-sticky-bar">
                <div className="mobile-sticky-price-wrap tabular-nums">
                    <span className="mobile-sticky-price">
                        {formatPrice(product.price)}
                    </span>
                    {originalPrice && (
                        <span className="mobile-sticky-old-price">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
                <div className="mobile-sticky-cta-wrap">
                    <button
                        type="button"
                        disabled={product.stockQuantity === 0}
                        onClick={handleAddToCart}
                        className="mobile-sticky-btn-cart"
                        title="Thêm vào giỏ"
                        aria-label="Thêm vào giỏ hàng"
                    >
                        <ShoppingCart size={18} />
                    </button>
                    <button
                        type="button"
                        disabled={product.stockQuantity === 0}
                        onClick={handleBuyNow}
                        className="mobile-sticky-btn-buy"
                    >
                        {product.stockQuantity === 0 ? "Hết hàng" : "Mua ngay"}
                    </button>
                </div>
            </div>

            {/* LIGHTBOX PREVIEW FULLSCREEN MODAL */}
            {isLightboxOpen && createPortal(
                <div
                    className="product-detail-lightbox-overlay"
                    onClick={closeLightbox}
                >
                    <div
                        className="product-detail-lightbox-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="product-detail-lightbox-header">
                            <div className="lightbox-title-box">
                                <span className="lightbox-book-title">
                                    {product.name}
                                </span>
                                <span className="lightbox-page-badge">
                                    Trang {lightboxIdx + 1} / {totalImagesCount}
                                </span>
                            </div>
                            {/* Lightbox Actions Group */}
                            <div className="lightbox-actions-group">
                                {/* Bộ điều khiển nấc zoom */}
                                <div className="lightbox-zoom-controller">
                                    <button
                                        type="button"
                                        onClick={zoomOut}
                                        disabled={zoomLevel <= 1.0}
                                        className="lightbox-zoom-btn"
                                        title="Thu nhỏ về 100%"
                                        aria-label="Thu nhỏ"
                                    >
                                        <ZoomOut size={18} />
                                    </button>
                                    
                                    <span 
                                        className="lightbox-zoom-label tabular-nums" 
                                        onClick={resetZoom}
                                        title="Nhấp để đặt lại về 100%"
                                    >
                                        {Math.round(zoomLevel * 100)}%
                                    </span>

                                    <button
                                        type="button"
                                        onClick={zoomIn}
                                        disabled={zoomLevel >= 3.0}
                                        className="lightbox-zoom-btn"
                                        title="Phóng to"
                                        aria-label="Phóng to"
                                    >
                                        <ZoomIn size={18} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={closeLightbox}
                                    className="lightbox-close-btn"
                                    title="Đóng preview"
                                    aria-label="Đóng preview"
                                >
                                    <X size={22} />
                                </button>
                            </div>
                        </div>

                        {/* Vùng xem ảnh tràn viền */}
                        <div className="product-detail-lightbox-stage">
                            {totalImagesCount > 1 && (
                                <button
                                    type="button"
                                    onClick={prevLightboxImage}
                                    className="lightbox-arrow-btn prev"
                                    title="Trang trước"
                                    aria-label="Trang trước"
                                >
                                    <ChevronLeft size={36} />
                                </button>
                            )}

                            <div
                                className={`lightbox-image-wrapper ${
                                    zoomLevel > 1 ? "can-drag" : ""
                                } ${isDragging ? "dragging" : ""}`}
                                onClick={handleImageClick}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <img
                                    src={productImages[lightboxIdx]?.url}
                                    alt={`Trang ${lightboxIdx + 1}`}
                                    className={`lightbox-main-img ${zoomLevel > 1.0 ? "zoomed" : ""}`}
                                    style={{
                                        transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`,
                                        transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
                                        cursor: zoomLevel > 1.0 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                                    }}
                                    draggable={false}
                                />
                            </div>

                            {totalImagesCount > 1 && (
                                <button
                                    type="button"
                                    onClick={nextLightboxImage}
                                    className="lightbox-arrow-btn next"
                                    title="Trang tiếp theo"
                                    aria-label="Trang tiếp theo"
                                >
                                    <ChevronRight size={36} />
                                </button>
                            )}
                        </div>

                        {/* Thanh Thumbnails dưới đáy */}
                        {totalImagesCount > 1 && (
                            <div className="product-detail-lightbox-thumbs-bar">
                                {productImages.map((imgObj, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => {
                                            setLightboxIdx(idx);
                                            resetZoom();
                                        }}
                                        className={`lightbox-mini-thumb ${
                                            lightboxIdx === idx ? "active" : ""
                                        }`}
                                    >
                                        <img
                                            src={imgObj.url}
                                            alt={`thumb-${idx}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default ProductDetail;
