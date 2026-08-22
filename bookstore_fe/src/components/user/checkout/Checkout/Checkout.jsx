import { Link } from "react-router-dom";
import {
    MapPin,
    CreditCard,
    ShoppingBag,
    Truck,
    ChevronRight,
    Banknote,
    Wallet,
    Ticket,
    Coins,
} from "lucide-react";
import { useCheckout } from "./useCheckout";
import "./Checkout.css";

const Checkout = () => {
    const {
        user,
        cart,
        productId,
        qty,
        buyNowProduct,
        fetchingProduct,
        savedAddresses,
        selectedAddressIdx,
        setSelectedAddressIdx,
        customAddress,
        setCustomAddress,
        useCustomAddress,
        setUseCustomAddress,
        paymentMethod,
        setPaymentMethod,
        couponCode,
        setCouponCode,
        loading,
        error,
        coupons,
        usePoints,
        setUsePoints,
        bestCoupon,
        recipientPhone,
        setRecipientPhone,
        formatPrice,
        checkoutItems,
        subtotal,
        shippingFee,
        calculateDiscount,
        couponDiscount,
        rewardPoints,
        maxPointsValue,
        pointsDiscount,
        pointsUsed,
        total,
        handlePlaceOrder,
    } = useCheckout();

    if (!user) {
        return (
            <div className="page-container checkout-unauth-box">
                <p className="checkout-empty-text">
                    Vui lòng{" "}
                    <Link
                        to="/login"
                        style={{ color: "#0056C6", fontWeight: 600 }}
                    >
                        đăng nhập
                    </Link>{" "}
                    để tiếp tục thanh toán.
                </p>
            </div>
        );
    }

    if (fetchingProduct) {
        return (
            <div className="page-container checkout-loading-box">
                <p className="checkout-empty-text">
                    Đang tải thông tin sản phẩm...
                </p>
            </div>
        );
    }

    if (!productId && (!cart?.items || cart.items.length === 0)) {
        return (
            <div className="page-container checkout-empty-box">
                <ShoppingBag size={48} className="checkout-empty-icon" />
                <p className="checkout-empty-text">
                    Giỏ hàng của bạn đang trống.
                </p>
                <Link to="/" className="checkout-btn-home-return">
                    Quay lại trang chủ
                </Link>
            </div>
        );
    }

    const paymentOptions = [
        {
            value: "COD",
            label: "COD",
            desc: "Thanh toán khi nhận hàng",
            icon: <Banknote size={24} style={{ color: "#0a422d" }} />,
        },
        {
            value: "VNPAY",
            label: "VNPay",
            desc: "Thanh toán qua VNPay",
            icon: <CreditCard size={24} style={{ color: "#0a422d" }} />,
        },
        {
            value: "WALLET",
            label: "Ví điện tử",
            desc: `Số dư: ${formatPrice(user?.walletBalance || 0)}`,
            icon: <Wallet size={24} style={{ color: "#0a422d" }} />,
        },
    ];

    return (
        <div className="page-container animate-fade-in checkout-page-container">
            {/* Breadcrumb */}
            <div className="checkout-breadcrumb">
                <Link to="/" className="checkout-breadcrumb-link">
                    Trang chủ
                </Link>
                <ChevronRight size={14} />
                <Link to="/cart" className="checkout-breadcrumb-link">
                    Giỏ hàng
                </Link>
                <ChevronRight size={14} />
                <span className="checkout-breadcrumb-current">Thanh toán</span>
            </div>

            {/* Stepper */}
            <div className="checkout-stepper-container">
                <div className="checkout-step-item">
                    <div className="checkout-step-circle active">1</div>
                    <span className="checkout-step-label active">
                        Giao hàng
                    </span>
                </div>
                <div className="checkout-step-divider" />
                <div className="checkout-step-item">
                    <div className="checkout-step-circle inactive">2</div>
                    <span className="checkout-step-label inactive">
                        Thanh toán
                    </span>
                </div>
            </div>

            {error && <div className="checkout-error-banner">{error}</div>}

            <form onSubmit={handlePlaceOrder} className="checkout-form-grid">
                {/* LEFT: Form */}
                <div className="checkout-form-left-col">
                    {/* Section 1: Customer info */}
                    <div className="checkout-section-card">
                        <div className="checkout-section-header">
                            <Truck
                                size={20}
                                className="checkout-section-icon"
                            />
                            <h3 className="checkout-section-title">
                                Thông tin giao hàng
                            </h3>
                        </div>

                        <div className="checkout-form-group">
                            <label className="checkout-form-label">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={user.fullName || ""}
                                readOnly
                                className="checkout-input-readonly"
                            />
                        </div>

                        <div className="checkout-form-group">
                            <label className="checkout-form-label">
                                Số điện thoại nhận hàng
                            </label>
                            <input
                                type="text"
                                value={recipientPhone}
                                onChange={(e) =>
                                    setRecipientPhone(e.target.value)
                                }
                                placeholder="Nhập số điện thoại nhận hàng..."
                                required
                                className="checkout-input-text"
                            />
                        </div>

                        <div>
                            <label
                                className="checkout-form-label"
                                style={{ marginBottom: "10px" }}
                            >
                                <MapPin
                                    size={13}
                                    style={{
                                        display: "inline",
                                        marginRight: "4px",
                                    }}
                                />
                                Địa chỉ nhận hàng
                            </label>

                            {savedAddresses.map((addr, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setSelectedAddressIdx(idx);
                                        setUseCustomAddress(false);
                                    }}
                                    className={`checkout-address-item-card ${
                                        !useCustomAddress &&
                                        selectedAddressIdx === idx
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="addressSelection"
                                        checked={
                                            !useCustomAddress &&
                                            selectedAddressIdx === idx
                                        }
                                        onChange={() => {
                                            setSelectedAddressIdx(idx);
                                            setUseCustomAddress(false);
                                        }}
                                        className="checkout-address-radio"
                                    />
                                    <div>
                                        <div className="checkout-address-badge-name">
                                            {idx === 0
                                                ? "Địa chỉ mặc định"
                                                : `Địa chỉ ${idx}`}
                                        </div>
                                        <div className="checkout-address-detail-text">
                                            {addr}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <div
                                onClick={() => setUseCustomAddress(true)}
                                className={`checkout-address-item-card ${
                                    useCustomAddress ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="addressSelection"
                                    checked={useCustomAddress}
                                    onChange={() => setUseCustomAddress(true)}
                                    className="checkout-address-radio"
                                />
                                <span className="checkout-address-badge-name">
                                    Giao đến địa chỉ khác
                                </span>
                            </div>

                            {useCustomAddress && (
                                <input
                                    type="text"
                                    placeholder="Nhập địa chỉ giao hàng cụ thể..."
                                    value={customAddress}
                                    onChange={(e) =>
                                        setCustomAddress(e.target.value)
                                    }
                                    required={useCustomAddress}
                                    className="checkout-input-text"
                                />
                            )}
                        </div>
                    </div>

                    {/* Section 2: Payment method */}
                    <div className="checkout-section-card">
                        <div className="checkout-section-header">
                            <CreditCard
                                size={20}
                                className="checkout-section-icon"
                            />
                            <h3 className="checkout-section-title">
                                Phương thức thanh toán
                            </h3>
                        </div>

                        <div className="checkout-payment-methods-grid">
                            {paymentOptions.map((opt) => (
                                <div
                                    key={opt.value}
                                    onClick={() => setPaymentMethod(opt.value)}
                                    className={`checkout-payment-card ${
                                        paymentMethod === opt.value
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    <div className="checkout-payment-icon-wrapper">
                                        {opt.icon}
                                    </div>
                                    <div className="checkout-payment-name">
                                        {opt.label}
                                    </div>
                                    <div className="checkout-payment-subtext">
                                        {opt.desc}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {paymentMethod === "WALLET" &&
                            (user?.walletBalance || 0) < total && (
                                <div className="checkout-wallet-alert">
                                    ⚠️ Số dư ví hiện tại (
                                    {formatPrice(user?.walletBalance || 0)})
                                    không đủ để thanh toán đơn hàng này (
                                    {formatPrice(total)}). Vui lòng nạp thêm
                                    tiền hoặc chọn phương thức thanh toán khác.
                                </div>
                            )}
                    </div>
                </div>

                {/* RIGHT: Order summary */}
                <div className="checkout-summary-col">
                    <div className="checkout-summary-card">
                        <div>
                            <h3 className="checkout-summary-title">
                                Tóm tắt đơn hàng
                            </h3>

                            {/* Items List */}
                            <div className="checkout-items-scroll-list">
                                {buyNowProduct ? (
                                    <div className="checkout-item-preview-row">
                                        <div className="checkout-item-thumb-box">
                                            {buyNowProduct.imageUrl && (
                                                <img
                                                    src={buyNowProduct.imageUrl}
                                                    alt={buyNowProduct.name}
                                                    className="checkout-item-thumb-img"
                                                />
                                            )}
                                        </div>
                                        <div className="checkout-item-info-meta">
                                            <div className="checkout-item-name">
                                                {buyNowProduct.name}
                                            </div>
                                            <div className="checkout-item-qty">
                                                Số lượng: {qty}
                                            </div>
                                        </div>
                                        <div className="checkout-item-total-price">
                                            {formatPrice(
                                                buyNowProduct.price * qty,
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    checkoutItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className="checkout-item-preview-row"
                                        >
                                            <div className="checkout-item-thumb-box">
                                                {item.product.imageUrl && (
                                                    <img
                                                        src={
                                                            item.product
                                                                .imageUrl
                                                        }
                                                        alt={item.product.name}
                                                        className="checkout-item-thumb-img"
                                                    />
                                                )}
                                            </div>
                                            <div className="checkout-item-info-meta">
                                                <div className="checkout-item-name">
                                                    {item.product.name}
                                                </div>
                                                <div className="checkout-item-qty">
                                                    Số lượng: {item.quantity}
                                                </div>
                                            </div>
                                            <div className="checkout-item-total-price">
                                                {formatPrice(
                                                    item.product.price *
                                                        item.quantity,
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Totals */}
                            <div className="checkout-totals-stack">
                                <div className="checkout-totals-row">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="checkout-totals-row">
                                    <span>Vận chuyển</span>
                                    <span
                                        style={{
                                            color:
                                                shippingFee === 0
                                                    ? "#10b981"
                                                    : "#111827",
                                        }}
                                    >
                                        {shippingFee === 0
                                            ? "Miễn phí"
                                            : formatPrice(shippingFee)}
                                    </span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="checkout-totals-row discount">
                                        <span>Giảm giá (Voucher)</span>
                                        <span>
                                            -{formatPrice(couponDiscount)}
                                        </span>
                                    </div>
                                )}
                                {pointsDiscount > 0 && (
                                    <div className="checkout-totals-row discount">
                                        <span>
                                            Dùng xu tích lũy ({pointsUsed} xu)
                                        </span>
                                        <span>
                                            -{formatPrice(pointsDiscount)}
                                        </span>
                                    </div>
                                )}
                                <div className="checkout-totals-final-row">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="checkout-divider" />

                        {/* Reward Points */}
                        {rewardPoints > 0 && (
                            <div className="checkout-points-card">
                                <div>
                                    <div className="checkout-points-title">
                                        <Coins
                                            size={16}
                                            className="checkout-points-icon"
                                        />
                                        Dùng xu tích lũy
                                    </div>
                                    <div className="checkout-points-sub">
                                        Có {rewardPoints} xu (-
                                        {formatPrice(maxPointsValue)})
                                    </div>
                                </div>
                                <label className="checkout-points-checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={usePoints}
                                        onChange={(e) =>
                                            setUsePoints(e.target.checked)
                                        }
                                        className="checkout-points-checkbox"
                                    />
                                    <span className="checkout-points-checkbox-text">
                                        Dùng
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Voucher Block */}
                        <div className="checkout-voucher-block">
                            <div className="checkout-voucher-title-row">
                                <Ticket
                                    size={16}
                                    className="checkout-voucher-icon"
                                />
                                <span className="checkout-voucher-title">
                                    Mã giảm giá (Voucher)
                                </span>
                            </div>

                            <div className="checkout-voucher-input-group">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá..."
                                    value={couponCode}
                                    onChange={(e) =>
                                        setCouponCode(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    className="checkout-voucher-input"
                                />
                                {couponCode && (
                                    <button
                                        type="button"
                                        onClick={() => setCouponCode("")}
                                        className="checkout-voucher-clear-btn"
                                    >
                                        Xóa
                                    </button>
                                )}
                            </div>

                            {coupons.length > 0 ? (
                                <div>
                                    <div className="checkout-voucher-list-label">
                                        Chọn mã giảm giá khả dụng:
                                    </div>
                                    <div className="checkout-voucher-scroll-list">
                                        {coupons.map((c) => {
                                            const isBest =
                                                bestCoupon &&
                                                bestCoupon.id === c.id;
                                            const discountVal =
                                                calculateDiscount(c, subtotal);
                                            const isEligible = discountVal > 0;
                                            const isSelected =
                                                couponCode === c.code;

                                            return (
                                                <div
                                                    key={c.id}
                                                    onClick={() =>
                                                        isEligible &&
                                                        setCouponCode(c.code)
                                                    }
                                                    className={`checkout-voucher-item-card ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    } ${!isEligible ? "ineligible" : ""}`}
                                                >
                                                    <div className="checkout-voucher-item-left">
                                                        <div className="checkout-voucher-code-row">
                                                            <span className="checkout-voucher-code-text">
                                                                {c.code}
                                                            </span>
                                                            {isBest && (
                                                                <span className="checkout-voucher-best-badge">
                                                                    Tốt nhất
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="checkout-voucher-desc-text">
                                                            {c.discountType ===
                                                            "PERCENT"
                                                                ? `Giảm ${c.discountValue}%`
                                                                : `Giảm ${formatPrice(c.discountValue)}`}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        {isSelected ? (
                                                            <span className="checkout-voucher-status-selected">
                                                                ✓ Chọn
                                                            </span>
                                                        ) : isEligible ? (
                                                            <span className="checkout-voucher-status-use">
                                                                Dùng
                                                            </span>
                                                        ) : (
                                                            <span className="checkout-voucher-status-kdk">
                                                                KĐK
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="checkout-voucher-empty-notice">
                                    Mua sách tích điểm để nhận thêm nhiều ưu
                                    đãi!
                                </div>
                            )}
                        </div>

                        <div className="checkout-divider" />

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="checkout-btn-submit-order"
                        >
                            {loading ? "Đang xử lý..." : "Đặt hàng ngay"}
                        </button>

                        <Link to="/cart" className="checkout-return-cart-link">
                            ← Quay lại giỏ hàng
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
