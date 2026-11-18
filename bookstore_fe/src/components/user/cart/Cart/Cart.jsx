import React, { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
    Plus,
    Minus,
    Trash2,
    ArrowLeft,
    Ticket,
    Gift,
    Truck,
    Info,
    X,
    ChevronRight,
    ChevronDown,
    ShoppingCart,
} from "lucide-react";
import {
    Breadcrumb,
    EmptyState,
    RecommendationSection,
} from "@/components/common";
import { useCart } from "./useCart";
import "./Cart.css";

const Cart = () => {
    const navigate = useNavigate();
    const {
        cart,
        updateCartQty,
        removeFromCart,
        clearCart,
        user,
        couponCode,
        setCouponCode,
        usePoints,
        setUsePoints,
        selectedItemIds,
        toggleSelectItem,
        isAllSelected,
        toggleSelectAll,
        formatPrice,
        totalAmount,
        coupons,
        bestCoupon,
        couponDiscount,
        shippingFee,
        rewardPoints,
        maxPointsValue,
        pointsDiscount,
        pointsUsed,
        total,
        calculateDiscount,
        handleCheckoutRedirect,
        isCouponModalOpen,
        openCouponModal,
        closeCouponModal,
        couponSearchInput,
        setCouponSearchInput,
        handleApplyCouponFromModal,
    } = useCart();

    const [showMoreDiscounts, setShowMoreDiscounts] = useState(false);
    const validItems = (cart?.items || []).filter(
        (item) => item && item.product && typeof item.product === "object",
    );

    if (validItems.length === 0) {
        return (
            <div className="page-container animate-fade-in cart-empty-container">
                <Breadcrumb items={[{ label: "Giỏ hàng" }]} />
                <EmptyState
                    icon={ShoppingCart}
                    title="Giỏ hàng của bạn đang trống"
                    description="Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá ngay hàng ngàn tựa sách đặc sắc tại Bookstore!"
                    actionText="Khám phá kho sách ngay"
                    onAction={() => navigate("/catalog")}
                    actionIcon={ArrowLeft}
                />
                <div className="cart-empty-recommendations">
                    <RecommendationSection
                        title="GỢI Ý DÀNH CHO BẠN"
                        limit={10}
                    />
                </div>
            </div>
        );
    }

    // Tự động phân loại danh sách coupon thành: Mã giảm giá & Mã freeship
    const orderDiscounts = coupons.filter(
        (c) =>
            c &&
            (c.discountType === "PERCENT" ||
                !String(c.code || "").toUpperCase().includes("SHIP")),
    );
    const shippingDiscounts = coupons.filter(
        (c) =>
            c &&
            (String(c.code || "").toUpperCase().includes("SHIP") ||
                c.discountType === "SHIPPING"),
    );

    // Fallback dữ liệu mẫu nếu chưa có mã freeship từ DB
    const finalShippingCoupons =
        shippingDiscounts.length > 0
            ? shippingDiscounts
            : [
                  {
                      id: "mock-ship-1",
                      code: "FREESHIP25K",
                      discountType: "FIXED",
                      discountValue: 25000,
                      minOrderValue: 250000,
                      endDate: "2026-09-30",
                      isShipping: true,
                      isHot: false,
                  },
                  {
                      id: "mock-ship-2",
                      code: "FREESHIPMAX",
                      discountType: "FIXED",
                      discountValue: 25000,
                      minOrderValue: 300000,
                      endDate: "2026-12-31",
                      isShipping: true,
                      isHot: true,
                  },
              ];

    const eligibleCouponsCount = coupons.filter(
        (c) => calculateDiscount(c, totalAmount) > 0,
    ).length;

    // Tự động tính toán mã tốt nhất cho đơn hàng khi xem voucher
    const computedBestCoupon = useMemo(() => {
        if (!coupons || coupons.length === 0) return null;
        let maxDisc = 0;
        let best = null;
        coupons.forEach((c) => {
            const disc = calculateDiscount(c, totalAmount);
            if (disc > maxDisc) {
                maxDisc = disc;
                best = c;
            }
        });
        return best || bestCoupon;
    }, [coupons, totalAmount, calculateDiscount, bestCoupon]);

    // Component render từng Item thẻ khuyến mãi
    const renderCouponCard = (c, isShippingType = false) => {
        const discountVal = calculateDiscount(c, totalAmount);
        const isEligible = totalAmount >= (c.minOrderValue || 0);
        const isSelected = couponCode === c.code;
        const isBest =
            Boolean(computedBestCoupon && computedBestCoupon.id === c.id && discountVal > 0);
        const missingAmount = Math.max(0, (c.minOrderValue || 0) - totalAmount);
        const progressPercent = Math.min(
            100,
            Math.round((totalAmount / (c.minOrderValue || 1)) * 100),
        );

        return (
            <div
                key={c.id}
                className={`fahasa-coupon-card ${isSelected ? "selected" : ""} ${!isEligible ? "disabled" : ""}`}
            >
                {c.isHot && <div className="coupon-hot-badge">Sắp hết</div>}
                {isBest && <div className="coupon-best-badge">Mã tốt nhất</div>}

                {/* Stub bên trái */}
                <div className="fahasa-coupon-stub">
                    <div className="stub-icon-circle">
                        {isShippingType ? (
                            <Truck size={22} color="#0a422d" />
                        ) : (
                            <span className="stub-percent-sym">%</span>
                        )}
                    </div>
                    <span className="stub-type-txt">
                        {isShippingType ? "Freeship" : "Mã giảm"}
                    </span>
                </div>

                {/* Nội dung chi tiết */}
                <div className="fahasa-coupon-body">
                    <div className="fahasa-coupon-title-row">
                        <strong className="coupon-main-name">
                            {isShippingType
                                ? `Mã Freeship ${formatPrice(c.discountValue)} đơn từ ${formatPrice(c.minOrderValue)}`
                                : c.discountType === "PERCENT"
                                  ? `Giảm ${c.discountValue}% đơn từ ${formatPrice(c.minOrderValue)}`
                                  : `Giảm ${formatPrice(c.discountValue)} Toàn Sàn`}
                        </strong>
                        <Info size={16} className="coupon-info-icon" />
                    </div>

                    <div className="coupon-condition-row">
                        <p className="coupon-condition-txt">
                            Đơn hàng từ {formatPrice(c.minOrderValue)} - Mã:{" "}
                            <strong>{c.code}</strong>
                        </p>
                        {isBest && (
                            <span className="coupon-best-tag">
                                Mã tốt nhất
                            </span>
                        )}
                    </div>

                    <div className="coupon-expiry-txt">
                        HSD: {c.endDate ? new Date(c.endDate).toLocaleDateString("vi-VN") : "Không giới hạn"}
                    </div>

                    {/* Thanh tiến độ đạt điều kiện */}
                    {!isEligible && (
                        <div className="coupon-progress-container">
                            <div className="coupon-progress-bar">
                                <div
                                    className="coupon-progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                            <span className="coupon-progress-tip">
                                Mua thêm {formatPrice(missingAmount)}
                            </span>
                        </div>
                    )}
                </div>

                {/* Nút hành động */}
                <div className="fahasa-coupon-action-col">
                    <button
                        type="button"
                        onClick={() => {
                            if (isEligible) {
                                handleApplyCouponFromModal(c.code);
                            } else {
                                closeCouponModal();
                            }
                        }}
                        className={`fahasa-coupon-btn ${isEligible ? "eligible" : "buy-more"} ${isSelected ? "active" : ""}`}
                    >
                        {isSelected
                            ? "Đang chọn"
                            : isEligible
                              ? "Áp dụng"
                              : "Mua thêm"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="page-container animate-fade-in cart-page-container">
            <Breadcrumb items={[{ label: "Giỏ hàng" }]} />

            <div className="cart-main-grid">
                {/* CỘT TRÁI */}
                <div className="cart-items-section">
                    <div className="cart-card-box cart-header-card">
                        <label className="cart-checkbox-label">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className="cart-custom-checkbox"
                            />
                            <span className="cart-header-title">
                                Chọn tất cả ({validItems.length} sản phẩm)
                            </span>
                        </label>
                        <span className="cart-header-col-qty">Số lượng</span>
                        <span className="cart-header-col-total">
                            Thành tiền
                        </span>
                    </div>

                    <div className="cart-card-box cart-items-list-card">
                        {validItems.map((item, idx) => {
                            const isSelected = selectedItemIds.has(item.id);
                            const prod = item.product || {};
                            const stockQty = prod.stockQuantity ?? 100;
                            const isOutOfStock = stockQty === 0;
                            const price = Number(prod.price) || 0;
                            const originalPrice =
                                prod.originalPrice ||
                                Math.round(price * 1.25);
                            const imgUrl =
                                prod.imageUrls?.[0] || prod.imageUrl;
                            const prodId = prod.id;
                            const prodName = prod.name || "Sách";
                            const itemQty = Number(item.quantity) || 1;

                            return (
                                <div
                                    key={item.id || `cart-item-${idx}`}
                                    className={`cart-product-row ${idx !== validItems.length - 1 ? "has-divider" : ""}`}
                                >
                                    <div className="cart-row-checkbox-col">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() =>
                                                toggleSelectItem(item.id)
                                            }
                                            className="cart-custom-checkbox"
                                        />
                                    </div>

                                    <div className="cart-product-thumb-box">
                                        {imgUrl ? (
                                            <img
                                                src={imgUrl}
                                                alt={prodName}
                                                className="cart-product-img"
                                            />
                                        ) : (
                                            <span className="cart-placeholder-text">
                                                Sách
                                            </span>
                                        )}
                                    </div>

                                    <div className="cart-product-info-col">
                                        <h4 className="cart-product-title">
                                            {prodName}
                                        </h4>
                                        <div className="cart-product-price-sub">
                                            <span className="current-price">
                                                {formatPrice(price)}
                                            </span>
                                            <span className="old-price">
                                                {formatPrice(originalPrice)}
                                            </span>
                                        </div>
                                        {isOutOfStock && (
                                            <div className="cart-product-warning">
                                                * Sản phẩm đã hết hàng. Xin gỡ
                                                bỏ.
                                            </div>
                                        )}
                                    </div>

                                    <div className="cart-product-qty-col">
                                        <div className="cart-qty-control-box">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateCartQty(
                                                        prodId,
                                                        itemQty - 1,
                                                    )
                                                }
                                                className="cart-qty-btn"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="cart-qty-number">
                                                {itemQty}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateCartQty(
                                                        prodId,
                                                        itemQty + 1,
                                                    )
                                                }
                                                className="cart-qty-btn"
                                                disabled={
                                                    isOutOfStock ||
                                                    itemQty >= stockQty
                                                }
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-product-subtotal-col">
                                        {formatPrice(price * itemQty)}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromCart(prodId)
                                        }
                                        className="cart-btn-remove-item"
                                        title="Xóa sản phẩm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="cart-bottom-actions-bar">
                        <Link
                            to="/catalog"
                            className="cart-link-continue-shopping"
                        >
                            <ArrowLeft size={16} /> Tiếp tục mua sắm
                        </Link>

                        <button
                            type="button"
                            onClick={clearCart}
                            className="cart-btn-clear-all"
                        >
                            <Trash2 size={15} /> Xóa toàn bộ giỏ hàng
                        </button>
                    </div>
                </div>

                {/* CỘT PHẢI */}
                <div className="cart-sidebar-section">
                    <div className="cart-card-box cart-promo-card">
                        <div className="cart-sidebar-card-header">
                            <span className="header-title">
                                <Ticket size={18} color="#0a422d" /> KHUYẾN MÃI
                            </span>
                            <span
                                className="header-action-link"
                                onClick={openCouponModal}
                            >
                                Xem thêm <ChevronRight size={14} />
                            </span>
                        </div>

                        <div
                            className="cart-featured-coupon-box"
                            onClick={openCouponModal}
                        >
                            <div className="coupon-ticket-stub">
                                <Ticket size={24} color="#0a422d" />
                                <span>Ví ưu đãi</span>
                            </div>
                            <div className="coupon-ticket-body">
                                <div className="ticket-title-row">
                                    <strong>
                                        {couponCode
                                            ? `MÃ: ${couponCode}`
                                            : "MÃ GIẢM GIÁ ĐƠN HÀNG"}
                                    </strong>
                                    <Info size={14} color="#94a3b8" />
                                </div>
                                <p className="ticket-subtext">
                                    {couponDiscount > 0
                                        ? `Đang áp dụng: Giảm ${formatPrice(couponDiscount)}`
                                        : "Áp dụng các mã voucher giảm giá và freeship từ đối tác..."}
                                </p>
                            </div>
                        </div>

                        <div
                            className="cart-eligible-coupons-badge"
                            onClick={openCouponModal}
                        >
                            <span>
                                {eligibleCouponsCount > 0
                                    ? `${eligibleCouponsCount} khuyến mãi đủ điều kiện`
                                    : totalAmount === 0
                                      ? "Chọn sản phẩm để mở khóa voucher"
                                      : "Xem danh sách mã giảm giá"}
                            </span>
                            <ChevronRight size={14} />
                        </div>
                    </div>

                    {/* KHỐI TIẾN ĐỘ FREESHIP TRỰC QUAN */}
                    {(() => {
                        const freeShipThreshold = 500000;
                        const isFreeShipEligible = totalAmount >= freeShipThreshold;
                        const freeShipRemaining = Math.max(
                            0,
                            freeShipThreshold - totalAmount,
                        );
                        const freeShipPercent = Math.min(
                            100,
                            Math.round(
                                (totalAmount / freeShipThreshold) * 100,
                            ),
                        );

                        return (
                            <div className="cart-card-box cart-freeship-card">
                                <div className="cart-freeship-header">
                                    <Truck
                                        size={18}
                                        className="cart-freeship-icon"
                                    />
                                    <span className="cart-freeship-title">
                                        {isFreeShipEligible
                                            ? "Đơn hàng đủ điều kiện Freeship toàn quốc!"
                                            : `Mua thêm ${formatPrice(freeShipRemaining)} để được Freeship`}
                                    </span>
                                </div>
                                <div className="cart-freeship-progress-bar">
                                    <div
                                        className="cart-freeship-progress-fill"
                                        style={{
                                            width: `${freeShipPercent}%`,
                                        }}
                                    />
                                </div>
                                <div className="cart-freeship-subtext">
                                    <span>Đơn từ 500.000đ</span>
                                    <span>{freeShipPercent}%</span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* DÙNG ĐIỂM THƯỞNG */}
                    {user && rewardPoints > 0 && (
                        <div className="cart-card-box cart-points-card">
                            <label className="cart-points-toggle-label">
                                <input
                                    type="checkbox"
                                    checked={usePoints}
                                    onChange={(e) =>
                                        setUsePoints(e.target.checked)
                                    }
                                    className="cart-custom-checkbox"
                                />
                                <div className="cart-points-info">
                                    <span className="cart-points-title">
                                        Dùng điểm thưởng ({rewardPoints} điểm)
                                    </span>
                                    <span className="cart-points-sub">
                                        Quy đổi giảm tối đa {formatPrice(maxPointsValue)}
                                    </span>
                                </div>
                            </label>
                        </div>
                    )}

                    <div className="cart-card-box cart-summary-card">
                        <div className="cart-summary-line">
                            <span>Thành tiền</span>
                            <span className="val-text tabular-nums">
                                {formatPrice(totalAmount)}
                            </span>
                        </div>

                        {selectedItemIds.size > 0 && (
                            <div className="cart-summary-line">
                                <span>Phí vận chuyển dự kiến</span>
                                <span className="val-text tabular-nums">
                                    {shippingFee === 0
                                        ? "Miễn phí"
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>
                        )}

                        {couponDiscount > 0 && (
                            <div className="cart-summary-line discount">
                                <span>Giảm giá khuyến mãi</span>
                                <span className="val-discount tabular-nums">
                                    -{formatPrice(couponDiscount)}
                                </span>
                            </div>
                        )}

                        {pointsDiscount > 0 && (
                            <div className="cart-summary-line discount">
                                <span>
                                    Dùng điểm tích lũy ({pointsUsed} điểm)
                                </span>
                                <span className="val-discount tabular-nums">
                                    -{formatPrice(pointsDiscount)}
                                </span>
                            </div>
                        )}

                        <div className="cart-summary-total-line">
                            <span className="total-label">
                                Tổng Số Tiền (gồm VAT)
                            </span>
                            <span className="total-val tabular-nums">
                                {formatPrice(total)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckoutRedirect}
                            disabled={selectedItemIds.size === 0}
                            className="cart-btn-submit-checkout"
                        >
                            THANH TOÁN ({selectedItemIds.size})
                        </button>
                        <div className="cart-vat-note">
                            (Giá đã bao gồm VAT và ưu đãi áp dụng)
                        </div>
                    </div>
                </div>
            </div>


            {/* MOBILE STICKY BOTTOM CHECKOUT BAR (iPhone 14 Pro Max & Mobile) */}
            <div className="cart-mobile-sticky-bar">
                <label className="cart-mobile-sticky-select-all">
                    <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="cart-custom-checkbox"
                    />
                    <span>Tất cả ({selectedItemIds.size})</span>
                </label>
                <div className="cart-mobile-sticky-total-box">
                    <span className="sticky-total-label">Tổng thanh toán:</span>
                    <span className="sticky-total-val tabular-nums">
                        {formatPrice(total)}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleCheckoutRedirect}
                    disabled={selectedItemIds.size === 0}
                    className="cart-mobile-sticky-btn-checkout"
                >
                    Thanh toán ({selectedItemIds.size})
                </button>
            </div>


            {/* MODAL MÃ KHUYẾN MÃI THEO PHÂN LOẠI */}
            {isCouponModalOpen &&
                createPortal(
                    <div
                        className="cart-coupon-modal-backdrop"
                        onClick={closeCouponModal}
                    >
                        <div
                            className="cart-coupon-modal-container animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="cart-modal-header">
                                <div className="cart-modal-title">
                                    <Ticket size={20} color="#0a422d" />
                                    <span>CHỌN MÃ KHUYẾN MÃI</span>
                                </div>
                                <button
                                    type="button"
                                    className="cart-modal-btn-close"
                                    onClick={closeCouponModal}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Input Code */}
                            <div className="cart-modal-input-bar">
                                <input
                                    type="text"
                                    placeholder="Nhập mã khuyến mãi / Gift Card"
                                    value={couponSearchInput}
                                    onChange={(e) =>
                                        setCouponSearchInput(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="cart-modal-input"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (couponSearchInput.trim()) {
                                            handleApplyCouponFromModal(
                                                couponSearchInput.trim(),
                                            );
                                        }
                                    }}
                                    className="cart-modal-btn-apply"
                                >
                                    Áp dụng
                                </button>
                            </div>

                            {/* Modal Body: Cuộn dọc các Section */}
                            <div className="cart-modal-scrollable-list">
                                {/* SECTION 1: MÃ GIẢM GIÁ */}
                                <div className="modal-category-section">
                                    <div className="cart-modal-section-title">
                                        <span>Mã giảm giá</span>
                                        <span className="sub-limit">
                                            Quy định: Tối đa 1 mã/đơn
                                        </span>
                                    </div>
                                    <div className="modal-coupons-group">
                                        {(showMoreDiscounts
                                            ? orderDiscounts
                                            : orderDiscounts.slice(0, 2)
                                        ).map((c) =>
                                            renderCouponCard(c, false),
                                        )}
                                    </div>

                                    {orderDiscounts.length > 2 && (
                                        <div
                                            className="modal-see-more-toggle"
                                            onClick={() =>
                                                setShowMoreDiscounts(
                                                    !showMoreDiscounts,
                                                )
                                            }
                                        >
                                            <span>
                                                {showMoreDiscounts
                                                    ? "Thu gọn"
                                                    : "Xem thêm"}
                                            </span>
                                            <ChevronDown
                                                size={15}
                                                style={{
                                                    transform: showMoreDiscounts
                                                        ? "rotate(180deg)"
                                                        : "none",
                                                    transition:
                                                        "transform 0.2s",
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* SECTION 2: MÃ VẬN CHUYỂN */}
                                <div className="modal-category-section">
                                    <div className="cart-modal-section-title">
                                        <span>Mã vận chuyển</span>
                                        <span className="sub-limit">
                                            Quy định: Tối đa 1 mã/đơn
                                        </span>
                                    </div>
                                    <div className="modal-coupons-group">
                                        {finalShippingCoupons.map((c) =>
                                            renderCouponCard(c, true),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    );
};

export default Cart;
