import { Award, Ticket, Copy, Check, Wallet } from "lucide-react";
import { useCouponsRewards } from "./useCouponsRewards";
import "./CouponsRewards.css";

const CouponsRewards = () => {
    const {
        coupons,
        loading,
        copiedCode,
        rewardPoints,
        rewardValue,
        walletBalance,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedCoupons,
        handleCopy,
        formatPrice,
    } = useCouponsRewards();

    return (
        <div className="coupons-rewards-card">
            <div className="coupons-rewards-header">
                <Award size={18} /> Kho Xu & Ví Voucher
            </div>

            <div className="coupons-rewards-body">
                <div className="coupons-rewards-top-stack">
                    {/* Wallet Balance Display */}
                    <div className="coupons-rewards-wallet-box">
                        <div className="coupons-rewards-wallet-left">
                            <div className="coupons-rewards-wallet-icon-wrapper">
                                <Wallet size={16} />
                            </div>
                            <div className="coupons-rewards-wallet-info">
                                <div className="coupons-rewards-wallet-label">
                                    Số dư ví điện tử
                                </div>
                                <div className="coupons-rewards-wallet-val">
                                    {formatPrice(walletBalance)}
                                </div>
                            </div>
                        </div>
                        <span className="coupons-rewards-wallet-tag">
                            Hoàn tiền tự động
                        </span>
                    </div>

                    {/* Reward Points */}
                    <div className="coupons-rewards-points-row">
                        <div className="coupons-rewards-points-left">
                            <div className="coupons-rewards-points-label">
                                Xu tích lũy
                            </div>
                            <div className="coupons-rewards-points-val">
                                {rewardPoints} xu
                            </div>
                        </div>
                        <div className="coupons-rewards-points-right">
                            <div className="coupons-rewards-points-label">
                                Giá trị quy đổi
                            </div>
                            <div className="coupons-rewards-cash-val">
                                {formatPrice(rewardValue)}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="coupons-rewards-list-title">
                        Mã giảm giá của bạn ({coupons.length} voucher)
                    </div>

                    {loading ? (
                        <div className="coupons-rewards-loading-text">
                            Đang tải...
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="coupons-rewards-empty-box">
                            <Ticket
                                size={24}
                                className="coupons-rewards-empty-icon"
                            />
                            <div className="coupons-rewards-empty-text">
                                Bạn chưa có mã giảm giá nào.
                            </div>
                            <div className="coupons-rewards-empty-subtext">
                                Đánh giá sản phẩm để nhận voucher tự động!
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="coupons-rewards-scroll-list">
                                {paginatedCoupons.map((coupon) => {
                                    const isExpired =
                                        new Date(coupon.endDate) < new Date();
                                    const isLimitReached =
                                        coupon.usedCount >= coupon.usageLimit;
                                    const isInactive =
                                        coupon.status === "INACTIVE" ||
                                        isExpired ||
                                        isLimitReached;
                                    const isCopied = copiedCode === coupon.code;

                                    return (
                                        <div
                                            key={coupon.id}
                                            className={`coupon-item-card ${
                                                isInactive ? "inactive" : ""
                                            }`}
                                        >
                                            <div className="coupon-item-left">
                                                <div className="coupon-item-code-row">
                                                    <span className="coupon-item-code-badge">
                                                        {coupon.code}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="coupon-item-tag-danger">
                                                            Hết hạn
                                                        </span>
                                                    )}
                                                    {isLimitReached && (
                                                        <span className="coupon-item-tag-danger">
                                                            Đã dùng
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="coupon-item-discount-desc">
                                                    {coupon.discountType ===
                                                    "PERCENT"
                                                        ? `Giảm ${coupon.discountValue}%`
                                                        : `Giảm ${formatPrice(coupon.discountValue)}`}
                                                </div>
                                                <div className="coupon-item-min-order">
                                                    Đơn tối thiểu:{" "}
                                                    {formatPrice(
                                                        coupon.minOrderValue,
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleCopy(coupon.code)
                                                }
                                                disabled={isInactive}
                                                className={`coupon-item-copy-btn ${
                                                    isCopied ? "copied" : ""
                                                }`}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <Check size={12} /> Đã chép
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy size={12} /> Sao chép
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="coupons-rewards-pagination">
                                    <button
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(prev - 1, 1),
                                            )
                                        }
                                        className="coupons-pagination-btn"
                                    >
                                        Trang trước
                                    </button>
                                    <span className="coupons-pagination-info">
                                        Trang {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.min(prev + 1, totalPages),
                                            )
                                        }
                                        className="coupons-pagination-btn"
                                    >
                                        Trang sau
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CouponsRewards;
