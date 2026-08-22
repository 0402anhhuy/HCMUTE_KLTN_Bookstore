import { Link } from "react-router-dom";
import { Plus, Minus, ArrowLeft, Trash2, Coins } from "lucide-react";
import { useCart } from "./useCart";
import "./Cart.css";

const Cart = () => {
    const {
        cart,
        updateCartQty,
        removeFromCart,
        clearCart,
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
    } = useCart();

    if (!cart?.items || cart.items.length === 0) {
        return (
            <div className="page-container animate-fade-in cart-empty-container">
                <div className="cart-empty-card">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6b7280"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="cart-empty-icon"
                    >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                    <h2 className="cart-empty-title">Giỏ hàng trống</h2>
                    <p className="cart-empty-desc">
                        Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy lướt xem
                        các đầu sách hấp dẫn của chúng tôi!
                    </p>
                    <Link to="/" className="cart-empty-btn-shop">
                        Mua sắm ngay
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in cart-page-container">
            <h2 className="cart-page-title">Giỏ hàng của bạn</h2>
            <p className="cart-page-subtitle">
                Bạn có {cart.items.length} sản phẩm trong giỏ hàng
            </p>

            <div className="cart-main-grid">
                {/* Cart Items List */}
                <div className="cart-items-section">
                    {/* Table Headers */}
                    <div className="cart-table-header">
                        <label className="cart-select-all-label">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className="cart-checkbox"
                            />
                            <span className="cart-select-all-text">
                                Chọn tất cả ({cart.items.length})
                            </span>
                        </label>
                        <div className="cart-col-header-price">GIÁ</div>
                        <div className="cart-col-header-qty">SỐ LƯỢNG</div>
                        <div className="cart-col-header-total">TỔNG</div>
                    </div>

                    {/* Cards */}
                    {cart.items.map((item) => {
                        const isSelected = selectedItemIds.has(item.id);

                        return (
                            <div
                                key={item.id}
                                className={`cart-item-row ${isSelected ? "selected" : ""}`}
                            >
                                {/* Checkbox */}
                                <div className="cart-item-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() =>
                                            toggleSelectItem(item.id)
                                        }
                                        className="cart-checkbox"
                                    />
                                </div>

                                {/* Product (Image + Info) */}
                                <div className="cart-item-product-info">
                                    <div className="cart-item-img-box">
                                        {item.product.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="cart-item-img"
                                            />
                                        ) : (
                                            <span className="cart-item-placeholder-text">
                                                UTEShop
                                            </span>
                                        )}
                                    </div>
                                    <div className="cart-item-details-stack">
                                        <div className="cart-item-name">
                                            {item.product.name}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeFromCart(item.product.id)
                                            }
                                            className="cart-item-delete-btn"
                                        >
                                            <Trash2 size={14} />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="cart-item-price-unit">
                                    {formatPrice(item.product.price)}
                                </div>

                                {/* Quantity control */}
                                <div className="cart-item-qty-container">
                                    <div className="cart-item-qty-box">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                updateCartQty(
                                                    item.product.id,
                                                    item.quantity - 1,
                                                )
                                            }
                                            className="cart-item-qty-btn"
                                        >
                                            <Minus size={13} />
                                        </button>
                                        <span className="cart-item-qty-text">
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
                                            className="cart-item-qty-btn"
                                        >
                                            <Plus size={13} />
                                        </button>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="cart-item-total-price">
                                    {formatPrice(
                                        item.product.price * item.quantity,
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Action Row */}
                    <div className="cart-actions-bottom-row">
                        <Link to="/" className="cart-continue-link">
                            <ArrowLeft size={16} />
                            Tiếp tục mua sắm
                        </Link>
                        <button
                            type="button"
                            onClick={clearCart}
                            className="cart-clear-btn"
                        >
                            Xóa giỏ hàng
                        </button>
                    </div>
                </div>

                {/* Invoice Sidebar */}
                <div className="cart-summary-section">
                    <div className="cart-summary-card">
                        <h3 className="cart-summary-title">Tóm tắt đơn hàng</h3>

                        {/* Invoice rows */}
                        <div className="cart-summary-rows-stack">
                            <div className="cart-summary-row">
                                <span>Tạm tính</span>
                                <span className="cart-summary-row-val">
                                    {formatPrice(totalAmount)}
                                </span>
                            </div>

                            <div className="cart-summary-row">
                                <span>Phí vận chuyển</span>
                                <span
                                    className={`cart-summary-row-val ${
                                        shippingFee === 0 ? "free" : "paid"
                                    }`}
                                >
                                    {shippingFee === 0
                                        ? "Miễn phí"
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="cart-summary-row discount">
                                    <span>Giảm giá (Voucher)</span>
                                    <span>-{formatPrice(couponDiscount)}</span>
                                </div>
                            )}

                            {pointsDiscount > 0 && (
                                <div className="cart-summary-row discount">
                                    <span>
                                        Dùng xu tích lũy ({pointsUsed} xu)
                                    </span>
                                    <span>-{formatPrice(pointsDiscount)}</span>
                                </div>
                            )}

                            <div className="cart-summary-total-row">
                                <span className="cart-summary-total-label">
                                    Tổng cộng
                                </span>
                                <span className="cart-summary-total-val">
                                    {formatPrice(total)}
                                </span>
                            </div>
                        </div>

                        {/* Checkout button */}
                        <button
                            type="button"
                            onClick={handleCheckoutRedirect}
                            className="cart-btn-checkout"
                        >
                            Tiến hành thanh toán
                        </button>

                        {/* Reward Points inside summary */}
                        {rewardPoints > 0 && (
                            <div className="cart-points-card">
                                <div>
                                    <div className="cart-points-title">
                                        <Coins
                                            size={16}
                                            className="cart-points-icon"
                                        />
                                        Dùng xu tích lũy
                                    </div>
                                    <div className="cart-points-sub">
                                        Có {rewardPoints} xu (-
                                        {formatPrice(maxPointsValue)})
                                    </div>
                                </div>
                                <label className="cart-points-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={usePoints}
                                        onChange={(e) =>
                                            setUsePoints(e.target.checked)
                                        }
                                        className="cart-points-checkbox"
                                    />
                                    <span className="cart-points-checkbox-text">
                                        Dùng
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Promo code block */}
                        <div className="cart-coupon-block">
                            <div className="cart-coupon-input-group">
                                <input
                                    type="text"
                                    placeholder="Mã giảm giá..."
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="cart-coupon-input"
                                />
                                {couponCode && (
                                    <button
                                        type="button"
                                        onClick={() => setCouponCode("")}
                                        className="cart-coupon-clear-btn"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>

                            {coupons.length > 0 && (
                                <div>
                                    <div className="cart-coupon-list-title">
                                        Chọn mã giảm giá khả dụng:
                                    </div>
                                    <div className="cart-coupon-scroll-list">
                                        {coupons.map((c) => {
                                            const isBest =
                                                bestCoupon &&
                                                bestCoupon.id === c.id;
                                            const discountVal =
                                                calculateDiscount(
                                                    c,
                                                    totalAmount,
                                                );
                                            const isEligible = discountVal > 0;
                                            const isCurrentSelected =
                                                couponCode === c.code;

                                            return (
                                                <div
                                                    key={c.id}
                                                    onClick={() =>
                                                        isEligible &&
                                                        setCouponCode(c.code)
                                                    }
                                                    className={`cart-coupon-item-card ${
                                                        isCurrentSelected
                                                            ? "selected"
                                                            : ""
                                                    } ${!isEligible ? "ineligible" : ""}`}
                                                >
                                                    <div className="cart-coupon-item-left">
                                                        <div className="cart-coupon-code-row">
                                                            <span className="cart-coupon-code-badge">
                                                                {c.code}
                                                            </span>
                                                            {isBest && (
                                                                <span className="cart-coupon-best-tag">
                                                                    Mã tốt nhất
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="cart-coupon-desc">
                                                            {c.discountType ===
                                                            "PERCENT"
                                                                ? `Giảm ${c.discountValue}%`
                                                                : `Giảm ${formatPrice(c.discountValue)}`}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {isCurrentSelected ? (
                                                            <span className="cart-coupon-status-selected">
                                                                ✓ Chọn
                                                            </span>
                                                        ) : isEligible ? (
                                                            <span className="cart-coupon-status-use">
                                                                Dùng
                                                            </span>
                                                        ) : (
                                                            <span className="cart-coupon-status-kdk">
                                                                KĐK
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Shipping alert box */}
                    <div className="cart-shipping-notice-card">
                        <div className="cart-shipping-notice-icon">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                                <path d="M19 18h2a1 1 0 0 0 1-1v-5.14a1 1 0 0 0-.29-.7L18.41 8.3a1 1 0 0 0-.7-.3H14" />
                                <circle cx="7.5" cy="18" r="2.5" />
                                <circle cx="16.5" cy="18" r="2.5" />
                            </svg>
                        </div>
                        <div>
                            <div className="cart-shipping-notice-title">
                                Miễn phí giao hàng
                            </div>
                            <div className="cart-shipping-notice-desc">
                                Đối với đơn hàng hơn 500.000đ
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
