import { Link, useNavigate } from "react-router-dom";
import {
    MapPin,
    CreditCard,
    ShoppingBag,
    Truck,
    Banknote,
    Wallet,
    Ticket,
    Coins,
    AlertTriangle,
    Check,
    Lock,
    Loader2,
    ShieldCheck,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import { Breadcrumb, EmptyState } from "@/components/common";
import { useCheckout } from "./useCheckout";
import { parseAddress } from "@/components/user/profile/AddressList/useAddressList";
import "./Checkout.css";

const Checkout = () => {
    const navigate = useNavigate();
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
        couponInput,
        setCouponInput,
        handleApplyManualCoupon,
        loading,
        error,
        coupons,
        usePoints,
        setUsePoints,
        bestCoupon,
        recipientName,
        setRecipientName,
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
            <div className="page-container animate-fade-in checkout-page-container">
                <div className="checkout-breadcrumb-wrapper">
                    <Breadcrumb
                        items={[
                            { label: "Giỏ hàng", path: "/cart" },
                            { label: "Thanh toán & Đặt hàng" },
                        ]}
                    />
                </div>
                <EmptyState
                    icon={Lock}
                    title="Vui lòng đăng nhập để thanh toán"
                    description="Bạn cần đăng nhập tài khoản để hoàn tất thông tin nhận hàng và hưởng các ưu đãi thành viên."
                    actionText="Đăng nhập ngay"
                    onAction={() => navigate("/login")}
                    secondaryText="Quay lại giỏ hàng"
                    onSecondary={() => navigate("/cart")}
                />
            </div>
        );
    }

    if (fetchingProduct) {
        return (
            <div className="page-container animate-fade-in checkout-page-container">
                <div className="checkout-loading-box">
                    <Loader2 size={36} className="checkout-loading-spinner" />
                    <p className="checkout-empty-text">
                        Đang tải thông tin sản phẩm đặt mua...
                    </p>
                </div>
            </div>
        );
    }

    if (!productId && (!cart?.items || cart.items.length === 0)) {
        return (
            <div className="page-container animate-fade-in checkout-page-container">
                <div className="checkout-breadcrumb-wrapper">
                    <Breadcrumb
                        items={[
                            { label: "Giỏ hàng", path: "/cart" },
                            { label: "Thanh toán & Đặt hàng" },
                        ]}
                    />
                </div>
                <EmptyState
                    icon={ShoppingBag}
                    title="Giỏ hàng của bạn đang trống"
                    description="Chưa có sản phẩm nào được chọn để thanh toán. Khám phá các tác phẩm đặc sắc ngay!"
                    actionText="Khám phá sách hay"
                    onAction={() => navigate("/")}
                />
            </div>
        );
    }

    // Các phương thức thanh toán hỗ trợ
    const paymentOptions = [
        {
            value: "COD",
            label: "Thanh toán khi nhận hàng (COD)",
            desc: "Nhận sách kiểm tra rồi mới thanh toán tiền mặt",
            badge: "Tiện lợi",
            icon: <Banknote size={22} className="checkout-payment-icon" />,
        },
        {
            value: "VNPAY",
            label: "VNPAY (QR Pay / Thẻ ATM / Visa)",
            desc: "Thanh toán qua cổng ngân hàng hoặc ví VNPAY",
            badge: "Khuyên dùng",
            icon: <CreditCard size={22} className="checkout-payment-icon" />,
        },
        {
            value: "WALLET",
            label: "Ví BookStore",
            desc: `Số dư ví hiện tại: ${formatPrice(user?.walletBalance || 0)}`,
            badge: (user?.walletBalance || 0) >= total ? "Đủ số dư" : "Số dư thấp",
            icon: <Wallet size={22} className="checkout-payment-icon" />,
        },
    ];

    const totalItemsCount = buyNowProduct
        ? qty
        : (checkoutItems || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

    return (
        <div className="page-container animate-fade-in checkout-page-container">
            {/* Breadcrumb chung đồng bộ */}
            <div className="checkout-breadcrumb-wrapper">
                <Breadcrumb
                    items={[
                        { label: "Giỏ hàng", path: "/cart" },
                        { label: "Thanh toán & Đặt hàng" },
                    ]}
                />
            </div>

            {/* Stepper Funnel */}
            <div className="checkout-stepper-container">
                <Link to="/cart" className="checkout-step-item completed">
                    <div className="checkout-step-circle completed">
                        <Check size={16} strokeWidth={2.5} />
                    </div>
                    <span className="checkout-step-label completed">
                        Giỏ hàng
                    </span>
                </Link>
                <div className="checkout-step-divider completed" />
                <div className="checkout-step-item active">
                    <div className="checkout-step-circle active">2</div>
                    <span className="checkout-step-label active">
                        Thanh toán & Đặt hàng
                    </span>
                </div>
                <div className="checkout-step-divider" />
                <div className="checkout-step-item inactive">
                    <div className="checkout-step-circle inactive">3</div>
                    <span className="checkout-step-label inactive">
                        Hoàn tất đơn
                    </span>
                </div>
            </div>

            {error && (
                <div className="checkout-error-banner">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handlePlaceOrder} className="checkout-form-grid">
                {/* LEFT: Delivery & Payment Details */}
                <div className="checkout-form-left-col">
                    {/* Section 1: Thông tin giao hàng */}
                    <div className="checkout-section-card">
                        <div className="checkout-section-header">
                            <div className="checkout-section-header-left">
                                <div className="checkout-section-icon-wrap">
                                    <Truck size={20} />
                                </div>
                                <div>
                                    <h3 className="checkout-section-title">
                                        1. Thông tin giao hàng
                                    </h3>
                                    <p className="checkout-section-subtitle">
                                        Địa chỉ nhận sách và thông tin liên hệ
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/profile"
                                className="checkout-manage-addr-link"
                            >
                                Sổ địa chỉ
                            </Link>
                        </div>

                        {/* Recipient info inputs */}
                        <div className="checkout-recipient-grid">
                            <div className="checkout-form-group">
                                <label className="checkout-form-label">
                                    Họ và tên người nhận <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={recipientName}
                                    onChange={(e) =>
                                        setRecipientName(e.target.value)
                                    }
                                    placeholder="Nhập họ tên người nhận..."
                                    required
                                    className="checkout-input-text"
                                />
                            </div>

                            <div className="checkout-form-group">
                                <label className="checkout-form-label">
                                    Số điện thoại nhận hàng <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={recipientPhone}
                                    onChange={(e) =>
                                        setRecipientPhone(e.target.value)
                                    }
                                    placeholder="Nhập số điện thoại nhận hàng..."
                                    required
                                    className="checkout-input-text"
                                />
                            </div>
                        </div>

                        {/* Saved addresses / Custom address */}
                        <div className="checkout-address-block">
                            <label className="checkout-form-label">
                                <MapPin
                                    size={14}
                                    style={{
                                        display: "inline",
                                        marginRight: "4px",
                                    }}
                                />
                                Địa chỉ nhận sách <span className="text-danger">*</span>
                            </label>

                            {savedAddresses.length > 0 ? (
                                <div className="checkout-address-list">
                                    {savedAddresses.map((addr, idx) => {
                                        const parsed = parseAddress(
                                            addr,
                                            user?.fullName,
                                            user?.phone,
                                        );
                                        const isSelected =
                                            !useCustomAddress &&
                                            selectedAddressIdx === idx;

                                        return (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    setSelectedAddressIdx(idx);
                                                    setUseCustomAddress(false);
                                                }}
                                                className={`checkout-address-item-card ${
                                                    isSelected ? "selected" : ""
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="addressSelection"
                                                    checked={isSelected}
                                                    onChange={() => {
                                                        setSelectedAddressIdx(
                                                            idx,
                                                        );
                                                        setUseCustomAddress(
                                                            false,
                                                        );
                                                    }}
                                                    className="checkout-address-radio"
                                                />
                                                <div className="checkout-address-info-wrap">
                                                    <div className="checkout-address-top-row">
                                                        <span className="checkout-address-badge-name">
                                                            {idx === 0
                                                                ? "Địa chỉ mặc định"
                                                                : `Địa chỉ ${idx + 1}`}
                                                        </span>
                                                        {isSelected && (
                                                            <span className="checkout-address-selected-badge">
                                                                <Check size={12} /> Đang chọn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="checkout-address-recipient">
                                                        <strong>{parsed.name}</strong> • {parsed.phone}
                                                    </div>
                                                    <div className="checkout-address-detail-text">
                                                        {parsed.address}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Option to use different address */}
                                    <div
                                        onClick={() =>
                                            setUseCustomAddress(true)
                                        }
                                        className={`checkout-address-item-card ${
                                            useCustomAddress ? "selected" : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="addressSelection"
                                            checked={useCustomAddress}
                                            onChange={() =>
                                                setUseCustomAddress(true)
                                            }
                                            className="checkout-address-radio"
                                        />
                                        <div className="checkout-address-info-wrap">
                                            <span className="checkout-address-badge-name">
                                                Giao đến địa chỉ khác
                                            </span>
                                            <p className="checkout-address-detail-text">
                                                Nhập địa chỉ giao hàng tùy chỉnh cho đơn này
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {(useCustomAddress || savedAddresses.length === 0) && (
                                <div className="checkout-custom-addr-input-wrap">
                                    <textarea
                                        rows={3}
                                        placeholder="Nhập địa chỉ nhận hàng chi tiết (Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố)..."
                                        value={customAddress}
                                        onChange={(e) =>
                                            setCustomAddress(e.target.value)
                                        }
                                        required={useCustomAddress}
                                        className="checkout-input-textarea"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Phương thức thanh toán */}
                    <div className="checkout-section-card">
                        <div className="checkout-section-header">
                            <div className="checkout-section-header-left">
                                <div className="checkout-section-icon-wrap">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h3 className="checkout-section-title">
                                        2. Phương thức thanh toán
                                    </h3>
                                    <p className="checkout-section-subtitle">
                                        Lựa chọn hình thức thanh toán an toàn và bảo mật
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="checkout-payment-methods-grid">
                            {paymentOptions.map((opt) => {
                                const isSelected = paymentMethod === opt.value;
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={() =>
                                            setPaymentMethod(opt.value)
                                        }
                                        className={`checkout-payment-card ${
                                            isSelected ? "selected" : ""
                                        }`}
                                    >
                                        <div className="checkout-payment-card-top">
                                            <div className="checkout-payment-icon-wrapper">
                                                {opt.icon}
                                            </div>
                                            {opt.badge && (
                                                <span
                                                    className={`checkout-payment-badge ${
                                                        opt.value === "WALLET" &&
                                                        (user?.walletBalance || 0) < total
                                                            ? "danger"
                                                            : ""
                                                    }`}
                                                >
                                                    {opt.badge}
                                                </span>
                                            )}
                                        </div>

                                        <div className="checkout-payment-name">
                                            {opt.label}
                                        </div>
                                        <div className="checkout-payment-subtext">
                                            {opt.desc}
                                        </div>

                                        {isSelected && (
                                            <div className="checkout-payment-check-corner">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {paymentMethod === "WALLET" &&
                            (user?.walletBalance || 0) < total && (
                                <div className="checkout-wallet-alert">
                                    <AlertTriangle
                                        size={18}
                                        className="checkout-wallet-alert-icon"
                                    />
                                    <div>
                                        <strong>Số dư ví không đủ:</strong> Hiện bạn đang có{" "}
                                        {formatPrice(user?.walletBalance || 0)}, đơn hàng cần{" "}
                                        {formatPrice(total)}. Vui lòng nạp thêm tiền vào ví hoặc chọn phương thức COD / VNPay để tiếp tục.
                                    </div>
                                </div>
                            )}
                    </div>
                </div>

                {/* RIGHT: Order Summary */}
                <div className="checkout-summary-col">
                    <div className="checkout-summary-card">
                        <div className="checkout-summary-header">
                            <h3 className="checkout-summary-title">
                                Tóm tắt đơn hàng
                            </h3>
                            <span className="checkout-summary-item-badge">
                                {totalItemsCount} cuốn sách
                            </span>
                        </div>

                        {/* Items List */}
                        <div className="checkout-items-scroll-list">
                            {buyNowProduct ? (
                                <div className="checkout-item-preview-row">
                                    <div className="checkout-item-thumb-box">
                                        {buyNowProduct.imageUrl ? (
                                            <img
                                                src={buyNowProduct.imageUrl}
                                                alt={buyNowProduct.name}
                                                className="checkout-item-thumb-img"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="checkout-item-thumb-fallback">
                                                <ShoppingBag size={20} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="checkout-item-info-meta">
                                        <div
                                            className="checkout-item-name"
                                            title={buyNowProduct.name}
                                        >
                                            {buyNowProduct.name}
                                        </div>
                                        <div className="checkout-item-qty">
                                            Số lượng: {qty}
                                        </div>
                                    </div>
                                    <div className="checkout-item-total-price">
                                        {formatPrice(buyNowProduct.price * qty)}
                                    </div>
                                </div>
                            ) : (
                                checkoutItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="checkout-item-preview-row"
                                    >
                                        <div className="checkout-item-thumb-box">
                                            {item.product?.imageUrl ? (
                                                <img
                                                    src={item.product.imageUrl}
                                                    alt={item.product.name}
                                                    className="checkout-item-thumb-img"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="checkout-item-thumb-fallback">
                                                    <ShoppingBag size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="checkout-item-info-meta">
                                            <div
                                                className="checkout-item-name"
                                                title={item.product?.name}
                                            >
                                                {item.product?.name}
                                            </div>
                                            <div className="checkout-item-qty">
                                                Số lượng: {item.quantity}
                                            </div>
                                        </div>
                                        <div className="checkout-item-total-price">
                                            {formatPrice(
                                                item.product?.price * item.quantity,
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Reward Points Card */}
                        {rewardPoints > 0 && (
                            <div className="checkout-points-card">
                                <div className="checkout-points-left">
                                    <div className="checkout-points-title">
                                        <Coins
                                            size={16}
                                            className="checkout-points-icon"
                                        />
                                        Dùng xu tích lũy
                                    </div>
                                    <div className="checkout-points-sub">
                                        Có {rewardPoints.toLocaleString("vi-VN")} xu (Quy đổi tối đa{" "}
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
                                    value={couponInput}
                                    onChange={(e) =>
                                        setCouponInput(
                                            e.target.value.toUpperCase(),
                                        )
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleApplyManualCoupon(couponInput);
                                        }
                                    }}
                                    className="checkout-voucher-input"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleApplyManualCoupon(couponInput)
                                    }
                                    className="checkout-voucher-apply-btn"
                                >
                                    Áp dụng
                                </button>
                                {couponCode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCouponCode("");
                                            setCouponInput("");
                                        }}
                                        className="checkout-voucher-clear-btn"
                                    >
                                        Gỡ mã
                                    </button>
                                )}
                            </div>

                            {coupons.length > 0 ? (
                                <div className="checkout-coupons-wrap">
                                    <div className="checkout-voucher-list-label">
                                        Voucher của cửa hàng:
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
                                                                <Check
                                                                    size={14}
                                                                    style={{
                                                                        display: "inline",
                                                                        marginRight: "2px",
                                                                        verticalAlign: "middle",
                                                                    }}
                                                                />{" "}
                                                                Đang dùng
                                                            </span>
                                                        ) : isEligible ? (
                                                            <span className="checkout-voucher-status-use">
                                                                Chọn
                                                            </span>
                                                        ) : (
                                                            <span className="checkout-voucher-status-kdk">
                                                                Chưa đủ ĐK
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Price Totals Stack */}
                        <div className="checkout-totals-stack">
                            <div className="checkout-totals-row">
                                <span>Tạm tính</span>
                                <span className="checkout-totals-val">
                                    {formatPrice(subtotal)}
                                </span>
                            </div>

                            <div className="checkout-totals-row">
                                <span>Phí vận chuyển</span>
                                <span
                                    className={`checkout-totals-val ${
                                        shippingFee === 0 ? "free-ship" : ""
                                    }`}
                                >
                                    {shippingFee === 0
                                        ? "Miễn phí"
                                        : formatPrice(shippingFee)}
                                </span>
                            </div>

                            {couponDiscount > 0 && (
                                <div className="checkout-totals-row discount">
                                    <span>Giảm giá Voucher</span>
                                    <span className="checkout-totals-val">
                                        -{formatPrice(couponDiscount)}
                                    </span>
                                </div>
                            )}

                            {pointsDiscount > 0 && (
                                <div className="checkout-totals-row discount">
                                    <span>
                                        Dùng xu ({pointsUsed} xu)
                                    </span>
                                    <span className="checkout-totals-val">
                                        -{formatPrice(pointsDiscount)}
                                    </span>
                                </div>
                            )}

                            <div className="checkout-totals-final-row">
                                <div>
                                    <div className="checkout-totals-final-label">
                                        Tổng thanh toán
                                    </div>
                                    <div className="checkout-totals-final-note">
                                        (Đã bao gồm thuế & phí)
                                    </div>
                                </div>
                                <div className="checkout-totals-final-price">
                                    {formatPrice(total)}
                                </div>
                            </div>
                        </div>

                        {/* Desktop Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="checkout-btn-submit-order"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="checkout-spinner-icon"
                                    />
                                    Đang xử lý đơn hàng...
                                </>
                            ) : (
                                `Đặt hàng (${formatPrice(total)})`
                            )}
                        </button>

                        <div className="checkout-trust-badges">
                            <span className="checkout-trust-item">
                                <ShieldCheck size={14} /> Bảo mật 100%
                            </span>
                            <span className="checkout-trust-divider">•</span>
                            <span className="checkout-trust-item">
                                <Truck size={14} /> Giao toàn quốc
                            </span>
                            <span className="checkout-trust-divider">•</span>
                            <span className="checkout-trust-item">
                                🔄 Đổi trả 7 ngày
                            </span>
                        </div>

                        <Link to="/cart" className="checkout-return-cart-link">
                            <ArrowLeft size={15} /> Quay lại giỏ hàng
                        </Link>
                    </div>
                </div>

                {/* MOBILE STICKY BOTTOM CONFIRM BAR */}
                <div className="checkout-mobile-sticky-bar">
                    <div className="checkout-mobile-sticky-inner">
                        <div className="checkout-mobile-sticky-info">
                            <span className="checkout-mobile-sticky-label">
                                Tổng thanh toán:
                            </span>
                            <span className="checkout-mobile-sticky-total">
                                {formatPrice(total)}
                            </span>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="checkout-mobile-sticky-btn"
                        >
                            {loading ? (
                                <Loader2
                                    size={18}
                                    className="checkout-spinner-icon"
                                />
                            ) : (
                                "Đặt hàng ngay"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Checkout;
