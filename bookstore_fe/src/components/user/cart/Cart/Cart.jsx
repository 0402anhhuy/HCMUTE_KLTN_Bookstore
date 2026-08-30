import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
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
import { Breadcrumb } from "@/components/common";
import { useCart } from "./useCart";
import "./Cart.css";

const Cart = () => {
    const {
        cart,
        updateCartQty,
        removeFromCart,
        clearCart,
        couponCode,
        selectedItemIds,
        toggleSelectItem,
        isAllSelected,
        toggleSelectAll,
        formatPrice,
        totalAmount,
        coupons,
        couponDiscount,
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

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="page-container animate-fade-in cart-empty-container">
                <div className="cart-empty-card">
                    <ShoppingCart
                        size={64}
                        strokeWidth={1.5}
                        color="#9ca3af"
                        className="cart-empty-icon"
                    />
                    <h2 className="cart-empty-title">Giỏ hàng trống</h2>
                    <p className="cart-empty-desc">
                        Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá
                        ngay các tựa sách đặc sắc!
                    </p>
                    <Link to="/catalog" className="cart-empty-btn-shop">
                        Khám phá kho sách
                    </Link>
                </div>
            </div>
        );
    }

    // Tự động phân loại danh sách coupon thành: Mã giảm giá & Mã freeship
    const orderDiscounts = coupons.filter(
        (c) =>
            c.discountType === "PERCENT" ||
            !c.code.toUpperCase().includes("SHIP"),
    );
    const shippingDiscounts = coupons.filter(
        (c) =>
            c.code.toUpperCase().includes("SHIP") ||
            c.discountType === "SHIPPING",
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

    // Component render từng Item thẻ khuyến mãi
    const renderCouponCard = (c, isShippingType = false) => {
        const discountVal = calculateDiscount(c, totalAmount);
        const isEligible = totalAmount >= (c.minOrderValue || 0);
        const isSelected = couponCode === c.code;
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

                    <p className="coupon-condition-txt">
                        Đơn hàng từ {formatPrice(c.minOrderValue)} - Mã:{" "}
                        <strong>{c.code}</strong>
                    </p>

                    <div className="coupon-expiry-txt">
                        HSD: {new Date(c.endDate).toLocaleDateString("vi-VN")}
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
                                Chọn tất cả ({cart.items.length} sản phẩm)
                            </span>
                        </label>
                        <span className="cart-header-col-qty">Số lượng</span>
                        <span className="cart-header-col-total">
                            Thành tiền
                        </span>
                    </div>

                    <div className="cart-card-box cart-items-list-card">
                        {cart.items.map((item, idx) => {
                            const isSelected = selectedItemIds.has(item.id);
                            const isOutOfStock =
                                item.product.stockQuantity === 0;
                            const originalPrice = Math.round(
                                item.product.price * 1.25,
                            );

                            return (
                                <div
                                    key={item.id}
                                    className={`cart-product-row ${idx !== cart.items.length - 1 ? "has-divider" : ""}`}
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
                                        {item.product.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
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
                                            {item.product.name}
                                        </h4>
                                        <div className="cart-product-price-sub">
                                            <span className="current-price">
                                                {formatPrice(
                                                    item.product.price,
                                                )}
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
                                                        item.product.id,
                                                        item.quantity - 1,
                                                    )
                                                }
                                                className="cart-qty-btn"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="cart-qty-number">
                                                {item.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    updateCartQty(
                                                        item.product.id,
                                                        item.quantity + 1,
                                                    )
                                                }
                                                className="cart-qty-btn"
                                                disabled={
                                                    isOutOfStock ||
                                                    item.quantity >=
                                                        item.product
                                                            .stockQuantity
                                                }
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="cart-product-subtotal-col">
                                        {formatPrice(
                                            item.product.price * item.quantity,
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeFromCart(item.product.id)
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
                                {eligibleCouponsCount} khuyến mãi đủ điều kiện
                            </span>
                            <ChevronRight size={14} />
                        </div>
                    </div>

                    <div className="cart-card-box cart-gift-card">
                        <div className="cart-sidebar-card-header">
                            <span className="header-title">
                                <Gift size={18} color="#0a422d" /> Nhận quà
                            </span>
                            <span className="header-action-link">
                                Chọn quà <ChevronRight size={14} />
                            </span>
                        </div>
                    </div>

                    <div className="cart-shipping-notice-box">
                        <Truck size={18} color="#0a422d" />
                        <span>
                            Miễn phí giao hàng cho đơn từ{" "}
                            <strong>500.000đ</strong> trở lên!
                        </span>
                    </div>

                    <div className="cart-card-box cart-summary-card">
                        <div className="cart-summary-line">
                            <span>Thành tiền</span>
                            <span className="val-text">
                                {formatPrice(totalAmount)}
                            </span>
                        </div>

                        {couponDiscount > 0 && (
                            <div className="cart-summary-line discount">
                                <span>Giảm giá khuyến mãi</span>
                                <span className="val-discount">
                                    -{formatPrice(couponDiscount)}
                                </span>
                            </div>
                        )}

                        <div className="cart-summary-total-line">
                            <span className="total-label">
                                Tổng Số Tiền (gồm VAT)
                            </span>
                            <span className="total-val">
                                {formatPrice(total)}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCheckoutRedirect}
                            className="cart-btn-submit-checkout"
                        >
                            THANH TOÁN
                        </button>
                        <div className="cart-vat-note">
                            (Giá đã bao gồm VAT và ưu đãi áp dụng)
                        </div>
                    </div>
                </div>
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
                                            Áp dụng tối đa: 1
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
                                            Áp dụng tối đa: 1
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
