import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    MapPin,
    CreditCard,
    Truck,
    AlertTriangle,
    RotateCcw,
    Star,
    X,
    XCircle,
    CheckCircle,
    Package,
    ShoppingBag,
    Clock,
    Lock,
    Loader2,
    Eye,
} from "lucide-react";
import { Breadcrumb, EmptyState } from "@/components/common";
import { useOrderHistory } from "./useOrderHistory";
import "./OrderHistory.css";

const OrderHistory = () => {
    const navigate = useNavigate();
    const {
        user,
        loading,
        activeTab,
        setActiveTab,
        orderItems,
        cancelOrderId,
        setCancelOrderId,
        cancelReason,
        setCancelReason,
        returnOrderId,
        setReturnOrderId,
        returnType,
        setReturnType,
        returnReasonCategory,
        setReturnReasonCategory,
        returnReasonDetail,
        setReturnReasonDetail,
        evidenceImages,
        setEvidenceImages,
        uploadingImage,
        reviewProduct,
        setReviewProduct,
        reviewRating,
        setReviewRating,
        reviewComment,
        setReviewComment,
        selectedOrderDetail,
        setSelectedOrderDetail,
        activeReturnRequest,
        isEditingAddress,
        setIsEditingAddress,
        editAddressValue,
        setEditAddressValue,
        editPhoneValue,
        setEditPhoneValue,
        handleCancelSubmit,
        handleEvidenceUpload,
        handleRemoveEvidence,
        handleReturnSubmit,
        handleOpenDetails,
        handleUpdateAddress,
        handleReviewSubmit,
        formatPrice,
        formatDate,
        getStatusText,
        getStatusColor,
        isReturnable,
        tabs,
        filteredOrders,
    } = useOrderHistory();

    if (!user) {
        return (
            <div className="page-container animate-fade-in order-history-page-container">
                <div className="order-history-breadcrumb-wrapper">
                    <Breadcrumb items={[{ label: "Đơn hàng của tôi" }]} />
                </div>
                <EmptyState
                    icon={Lock}
                    title="Vui lòng đăng nhập"
                    description="Bạn cần đăng nhập tài khoản để xem lịch sử mua hàng và quản lý các đơn hàng của mình."
                    actionText="Đăng nhập ngay"
                    onAction={() => navigate("/login")}
                />
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in order-history-page-container">
            {/* Breadcrumb */}
            <div className="order-history-breadcrumb-wrapper">
                <Breadcrumb items={[{ label: "Đơn hàng của tôi" }]} />
            </div>

            <div className="order-history-header">
                <h1 className="order-history-title">Đơn hàng của tôi</h1>
                <p className="order-history-subtitle">
                    Theo dõi tiến trình vận chuyển và quản lý trạng thái các đơn hàng đã đặt
                </p>
            </div>

            {/* Tabs */}
            <div className="order-history-tabs-container">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`order-history-tab-btn ${
                            activeTab === tab.id ? "active" : ""
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="order-history-loading-box">
                    <Loader2 size={36} className="order-history-loading-spinner" />
                    <p className="order-history-loading-text">
                        Đang tải lịch sử đơn hàng...
                    </p>
                </div>
            ) : filteredOrders.length === 0 ? (
                <EmptyState
                    icon={ShoppingBag}
                    title="Chưa có đơn hàng nào"
                    description="Bạn chưa có đơn hàng nào trong trạng thái này. Tiếp tục khám phá những tựa sách hấp dẫn nhé!"
                    actionText="Tiếp tục mua sắm"
                    onAction={() => navigate("/catalog")}
                />
            ) : (
                <div className="order-history-list-stack">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="order-card-container">
                            {/* Order Header */}
                            <div className="order-card-header">
                                <div className="order-card-header-left">
                                    <span className="order-card-id-text">
                                        Mã đơn: #{order.id}
                                    </span>
                                    <span className="order-card-divider-vert">
                                        |
                                    </span>
                                    <span className="order-card-date-text">
                                        <Calendar size={14} />{" "}
                                        {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <div
                                    className="order-card-status-badge"
                                    style={{
                                        color: getStatusColor(order.status),
                                    }}
                                >
                                    {order.status === "delivered" ? (
                                        <CheckCircle size={16} />
                                    ) : order.status === "shipping" ? (
                                        <Truck size={16} />
                                    ) : order.status === "cancelled" ? (
                                        <XCircle size={16} />
                                    ) : order.status === "refunded" || order.status === "cancel_requested" ? (
                                        <RotateCcw size={16} />
                                    ) : order.status === "pending" ? (
                                        <Clock size={16} />
                                    ) : (
                                        <Package size={16} />
                                    )}
                                    {getStatusText(order.status).toUpperCase()}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="order-card-items-body">
                                {orderItems[order.id] ? (
                                    <div className="order-items-stack">
                                        {orderItems[order.id].map(
                                            (item, idx) => {
                                                const isNotLast =
                                                    idx !==
                                                    orderItems[order.id]
                                                        .length -
                                                        1;

                                                return (
                                                    <div
                                                        key={item.id}
                                                        className={`order-item-row ${
                                                            isNotLast
                                                                ? "with-border"
                                                                : ""
                                                        }`}
                                                    >
                                                        <div className="order-item-thumb-wrapper">
                                                            {item.product
                                                                ?.imageUrl && (
                                                                <img
                                                                    src={
                                                                        item
                                                                            .product
                                                                            .imageUrl
                                                                    }
                                                                    alt={
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                    className="order-item-thumb-img"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="order-item-info-meta">
                                                            <h4 className="order-item-title">
                                                                {item.product
                                                                    ?.name ||
                                                                    "Sách đã bị xóa"}
                                                            </h4>
                                                            <div className="order-item-spec-text">
                                                                {item.product
                                                                    ?.format
                                                                    ? `Hình thức: ${item.product.format}`
                                                                    : item
                                                                            .product
                                                                            ?.publisher
                                                                      ? `NXB: ${item.product.publisher}`
                                                                      : "Ấn bản chính thức"}
                                                            </div>
                                                            <div className="order-item-qty-text">
                                                                Số lượng: x
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div className="order-item-right-price-col">
                                                            <div className="order-item-price-text">
                                                                {formatPrice(
                                                                    item.subtotal ||
                                                                        item.unitPrice *
                                                                            item.quantity,
                                                                )}
                                                            </div>
                                                            {order.status ===
                                                                "delivered" &&
                                                                (item.reviewed ? (
                                                                    <button
                                                                        type="button"
                                                                        disabled
                                                                        className="order-item-btn-reviewed"
                                                                    >
                                                                        Đã đánh
                                                                        giá
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setReviewProduct(
                                                                                {
                                                                                    id: item
                                                                                        .product
                                                                                        .id,
                                                                                    name: item
                                                                                        .product
                                                                                        .name,
                                                                                    orderId:
                                                                                        order.id,
                                                                                },
                                                                            )
                                                                        }
                                                                        className="order-item-btn-review-action"
                                                                    >
                                                                        Đánh giá
                                                                    </button>
                                                                ))}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                ) : (
                                    <div className="order-items-loading-text">
                                        Đang tải sản phẩm...
                                    </div>
                                )}
                            </div>

                            {/* Order Footer */}
                            <div className="order-card-footer">
                                <div className="order-card-payment-type-text">
                                    Thanh toán:{" "}
                                    <span className="order-card-payment-type-val">
                                        {order.paymentMethod === "VNPAY"
                                            ? "VNPay"
                                            : order.paymentMethod === "WALLET"
                                              ? "Ví điện tử"
                                              : "COD"}
                                    </span>
                                </div>
                                <div className="order-card-footer-right">
                                    <div className="order-card-total-group">
                                        <span className="order-card-total-label">
                                            Thành tiền:
                                        </span>
                                        <span className="order-card-total-val">
                                            {formatPrice(order.finalAmount)}
                                        </span>
                                    </div>

                                    <div className="order-card-actions-group">
                                        {(order.status === "pending" ||
                                            order.status === "confirmed") && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setCancelOrderId(order.id)
                                                }
                                                className="order-btn-cancel-order"
                                            >
                                                Hủy đơn
                                            </button>
                                        )}
                                        {isReturnable(order) && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setReturnOrderId(order.id)
                                                }
                                                className="order-btn-return-order"
                                            >
                                                Đổi trả
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleOpenDetails(order)
                                            }
                                            className="order-btn-view-details"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CANCEL MODAL */}
            {cancelOrderId &&
                createPortal(
                    <div
                        className="order-modal-backdrop"
                        onClick={() => setCancelOrderId(null)}
                    >
                        <div
                            className="order-modal-card-small"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="order-modal-title">
                                Hủy đơn hàng #{cancelOrderId}
                            </h3>
                            <p className="order-modal-subtitle">
                                Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng
                                nhập lý do.
                            </p>
                            <form onSubmit={handleCancelSubmit}>
                                <textarea
                                    rows={3}
                                    placeholder="Lý do hủy đơn..."
                                    value={cancelReason}
                                    onChange={(e) =>
                                        setCancelReason(e.target.value)
                                    }
                                    className="order-modal-textarea"
                                    required
                                />
                                <div className="order-modal-btn-row">
                                    <button
                                        type="button"
                                        onClick={() => setCancelOrderId(null)}
                                        className="order-modal-btn-cancel"
                                    >
                                        Bỏ qua
                                    </button>
                                    <button
                                        type="submit"
                                        className="order-modal-btn-confirm-danger"
                                    >
                                        Xác nhận hủy
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* RETURN MODAL */}
            {returnOrderId &&
                createPortal(
                    <div
                        className="order-modal-backdrop blur"
                        onClick={() => setReturnOrderId(null)}
                    >
                        <div
                            className="order-modal-card-medium"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="order-modal-title brand">
                                Yêu cầu đổi trả đơn hàng #{returnOrderId}
                            </h3>
                            <p className="order-modal-subtitle small">
                                Yêu cầu đổi trả hợp lệ trong 07 ngày kể từ khi
                                nhận hàng. Vui lòng cung cấp đầy đủ thông tin và
                                hình ảnh minh chứng lỗi để được duyệt nhanh
                                nhất.
                            </p>
                            <form
                                onSubmit={handleReturnSubmit}
                                className="order-return-form-stack"
                            >
                                <div>
                                    <label className="order-return-label">
                                        Bạn muốn đổi hay trả hàng?
                                    </label>
                                    <div className="order-return-segmented-row">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setReturnType("RETURN_REFUND")
                                            }
                                            className={`order-return-segmented-btn ${
                                                returnType === "RETURN_REFUND"
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            Trả hàng & Hoàn tiền
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setReturnType("EXCHANGE")
                                            }
                                            className={`order-return-segmented-btn ${
                                                returnType === "EXCHANGE"
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            Đổi sản phẩm mới
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="order-return-label">
                                        Nhóm lý do *
                                    </label>
                                    <select
                                        value={returnReasonCategory}
                                        onChange={(e) =>
                                            setReturnReasonCategory(
                                                e.target.value,
                                            )
                                        }
                                        className="order-return-select"
                                        required
                                    >
                                        <option value="Sách bị hỏng/rách trong quá trình vận chuyển">
                                            Sách bị hỏng/rách trong quá trình
                                            vận chuyển
                                        </option>
                                        <option value="Giao sai sách (không đúng tựa đề, tập sách...)">
                                            Giao sai sách (không đúng tựa đề,
                                            tập sách...)
                                        </option>
                                        <option value="Chất lượng in ấn kém (mất trang, chữ bị nhòe mờ)">
                                            Chất lượng in ấn kém (mất trang, chữ
                                            bị nhòe mờ)
                                        </option>
                                        <option value="Sách giả, không giống mô tả">
                                            Sách giả, không giống mô tả
                                        </option>
                                        <option value="Lý do khác">
                                            Lý do khác
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="order-return-label">
                                        Mô tả chi tiết lỗi *
                                    </label>
                                    <textarea
                                        rows={3}
                                        placeholder="Vui lòng cung cấp chi tiết như: trang bị lỗi, chỗ rách, sai sách thế nào..."
                                        value={returnReasonDetail}
                                        onChange={(e) =>
                                            setReturnReasonDetail(
                                                e.target.value,
                                            )
                                        }
                                        className="order-modal-textarea"
                                        style={{ marginBottom: 0 }}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="order-return-label">
                                        Hình ảnh minh chứng *
                                    </label>
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            marginBottom: "8px",
                                        }}
                                    >
                                        <label className="order-upload-btn-label">
                                            Tải ảnh lên
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEvidenceUpload}
                                                style={{ display: "none" }}
                                            />
                                        </label>
                                        {uploadingImage && (
                                            <span
                                                style={{
                                                    fontSize: "0.8rem",
                                                    color: "#0a422d",
                                                }}
                                            >
                                                Đang tải lên...
                                            </span>
                                        )}
                                    </div>

                                    <div className="order-evidence-thumbs-row">
                                        {evidenceImages.map((url, idx) => (
                                            <div
                                                key={idx}
                                                className="order-evidence-thumb-item"
                                            >
                                                <img
                                                    src={url}
                                                    alt="Minh chứng"
                                                    className="order-evidence-img"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemoveEvidence(
                                                            idx,
                                                        )
                                                    }
                                                    className="order-evidence-delete-btn"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "10px",
                                    }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReturnOrderId(null);
                                            setEvidenceImages([]);
                                        }}
                                        className="order-modal-btn-cancel"
                                        style={{
                                            padding: "12px",
                                            borderRadius: "8px",
                                        }}
                                    >
                                        Bỏ qua
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={evidenceImages.length === 0}
                                        className="order-return-submit-btn"
                                    >
                                        Gửi yêu cầu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* REVIEW MODAL */}
            {reviewProduct &&
                createPortal(
                    <div
                        className="order-modal-backdrop"
                        onClick={() => setReviewProduct(null)}
                    >
                        <div
                            className="order-modal-card-small"
                            style={{ position: "relative" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => setReviewProduct(null)}
                                className="order-review-modal-close-btn"
                            >
                                <X size={20} />
                            </button>
                            <h3
                                className="order-modal-title"
                                style={{
                                    textAlign: "center",
                                    marginBottom: "4px",
                                }}
                            >
                                Đánh giá sản phẩm
                            </h3>
                            <p
                                className="order-modal-subtitle"
                                style={{ textAlign: "center" }}
                            >
                                {reviewProduct.name}
                            </p>
                            <form onSubmit={handleReviewSubmit}>
                                <div className="order-review-stars-select-row">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() =>
                                                setReviewRating(star)
                                            }
                                            className="order-review-star-btn"
                                            style={{
                                                color:
                                                    star <= reviewRating
                                                        ? "#f59e0b"
                                                        : "#d1d5db",
                                            }}
                                        >
                                            <Star
                                                size={32}
                                                fill="currentColor"
                                                stroke="none"
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    rows={4}
                                    placeholder="Chia sẻ nhận xét của bạn..."
                                    value={reviewComment}
                                    onChange={(e) =>
                                        setReviewComment(e.target.value)
                                    }
                                    className="order-modal-textarea"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="order-review-submit-btn"
                                >
                                    Gửi đánh giá
                                </button>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}

            {/* ORDER DETAILS MODAL (HEADER CỐ ĐỊNH, SCROLL BÊN TRONG) */}
            {selectedOrderDetail &&
                createPortal(
                    (() => {
                        const order = selectedOrderDetail;
                        const items = orderItems[order.id] || [];
                        const pointsDiscount = order.pointsDiscount || 0;
                        const couponDiscount = Math.max(
                            0,
                            (order.discountAmount || 0) - pointsDiscount,
                        );

                        const isCancelled = order.status === "cancelled";
                        const isRefunded = order.status === "refunded";

                        const steps = [
                            {
                                label: "Chờ xác nhận",
                                time: order.createdAt,
                                done: true,
                                icon: ShoppingBag,
                                color: "#10b981",
                            },
                        ];

                        if (order.confirmedAt) {
                            steps.push({
                                label: "Đã xác nhận",
                                time: order.confirmedAt,
                                done: true,
                                icon: CheckCircle,
                                color: "#10b981",
                            });
                        } else if (!isCancelled && !isRefunded) {
                            steps.push({
                                label: "Đã xác nhận",
                                time: null,
                                done: false,
                                icon: CheckCircle,
                                color: "#cbd5e1",
                            });
                        }

                        if (order.preparingAt) {
                            steps.push({
                                label: "Đang đóng gói",
                                time: order.preparingAt,
                                done: true,
                                icon: Package,
                                color: "#10b981",
                            });
                        } else if (!isCancelled && !isRefunded) {
                            steps.push({
                                label: "Đang đóng gói",
                                time: null,
                                done: false,
                                icon: Package,
                                color: "#cbd5e1",
                            });
                        }

                        if (order.shippingAt) {
                            steps.push({
                                label: "Đang giao",
                                time: order.shippingAt,
                                done: true,
                                icon: Truck,
                                color: "#10b981",
                            });
                        } else if (!isCancelled && !isRefunded) {
                            steps.push({
                                label: "Đang giao",
                                time: null,
                                done: false,
                                icon: Truck,
                                color: "#cbd5e1",
                            });
                        }

                        if (isCancelled) {
                            steps.push({
                                label: "Đã hủy",
                                time: order.cancelledAt,
                                done: true,
                                icon: X,
                                color: "#ef4444",
                                isError: true,
                            });
                        } else if (isRefunded) {
                            if (order.deliveredAt) {
                                steps.push({
                                    label: "Hoàn thành",
                                    time: order.deliveredAt,
                                    done: true,
                                    icon: CheckCircle,
                                    color: "#10b981",
                                });
                            }
                            steps.push({
                                label: "Đã hoàn tiền",
                                time: order.refundedAt,
                                done: true,
                                icon: RotateCcw,
                                color: "#6366f1",
                                isRefunded: true,
                            });
                        } else {
                            steps.push({
                                label: "Hoàn thành",
                                time: order.deliveredAt,
                                done: !!order.deliveredAt,
                                icon: CheckCircle,
                                color: "#10b981",
                            });
                        }

                        let lastDoneIndex = 0;
                        for (let i = steps.length - 1; i >= 0; i--) {
                            if (steps[i].done) {
                                lastDoneIndex = i;
                                break;
                            }
                        }
                        const totalSegments = steps.length - 1;
                        const activeProgressPercent =
                            totalSegments > 0
                                ? (lastDoneIndex / totalSegments) * 100
                                : 0;

                        return (
                            <div
                                className="order-modal-backdrop"
                                onClick={() => setSelectedOrderDetail(null)}
                            >
                                <div
                                    className="order-modal-card-large"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {/* HEADER CỐ ĐỊNH Ở TRÊN CÙNG */}
                                    <div className="order-details-modal-fixed-header">
                                        <div>
                                            <h3 className="order-details-meta-title">
                                                Chi tiết đơn hàng #{order.id}
                                            </h3>
                                            <div className="order-details-meta-tags">
                                                <span className="order-details-date-text">
                                                    <Calendar size={13} />{" "}
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}
                                                </span>
                                                <span className="order-details-divider">
                                                    |
                                                </span>
                                                <span
                                                    className="order-details-status-tag"
                                                    style={{
                                                        color: getStatusColor(
                                                            order.status,
                                                        ),
                                                        backgroundColor:
                                                            getStatusColor(
                                                                order.status,
                                                            ) + "18",
                                                    }}
                                                >
                                                    {getStatusText(
                                                        order.status,
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedOrderDetail(null)
                                            }
                                            className="order-details-close-btn"
                                            aria-label="Đóng"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* BODY CUỘN BÊN TRONG GIỮA 2 MÉP */}
                                    <div className="order-details-scrollable-body">
                                        {/* Info Blocks */}
                                        <div className="order-details-info-stack">
                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <MapPin
                                                    size={16}
                                                    style={{
                                                        color: "#0a422d",
                                                        flexShrink: 0,
                                                        marginTop: "2px",
                                                    }}
                                                />
                                                <div style={{ flex: 1 }}>
                                                    <div className="order-details-recipient-header">
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                color: "#111827",
                                                            }}
                                                        >
                                                            Thông tin nhận hàng
                                                        </div>
                                                        {order.status ===
                                                            "pending" &&
                                                            !isEditingAddress && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditAddressValue(
                                                                            order.shippingAddress ||
                                                                                "",
                                                                        );
                                                                        setEditPhoneValue(
                                                                            order.recipientPhone ||
                                                                                order
                                                                                    .user
                                                                                    ?.phone ||
                                                                                "",
                                                                        );
                                                                        setIsEditingAddress(
                                                                            true,
                                                                        );
                                                                    }}
                                                                    className="order-details-edit-address-btn"
                                                                >
                                                                    Chỉnh sửa
                                                                </button>
                                                            )}
                                                    </div>

                                                    {isEditingAddress ? (
                                                        <div className="order-details-edit-form-stack">
                                                            <div>
                                                                <label
                                                                    style={{
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        fontWeight: 600,
                                                                        color: "#4b5563",
                                                                    }}
                                                                >
                                                                    Địa chỉ nhận
                                                                    hàng
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editAddressValue
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditAddressValue(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="order-details-edit-input"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label
                                                                    style={{
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        fontWeight: 600,
                                                                        color: "#4b5563",
                                                                    }}
                                                                >
                                                                    Số điện
                                                                    thoại nhận
                                                                    hàng
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={
                                                                        editPhoneValue
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        setEditPhoneValue(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    className="order-details-edit-input"
                                                                />
                                                            </div>
                                                            <div
                                                                style={{
                                                                    display:
                                                                        "flex",
                                                                    gap: "8px",
                                                                    justifyContent:
                                                                        "flex-end",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setIsEditingAddress(
                                                                            false,
                                                                        )
                                                                    }
                                                                    className="order-modal-btn-cancel"
                                                                    style={{
                                                                        padding:
                                                                            "4px 10px",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        flex: "none",
                                                                    }}
                                                                >
                                                                    Hủy
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        handleUpdateAddress
                                                                    }
                                                                    className="order-return-submit-btn"
                                                                    style={{
                                                                        padding:
                                                                            "4px 10px",
                                                                        fontSize:
                                                                            "0.75rem",
                                                                        flex: "none",
                                                                    }}
                                                                >
                                                                    Lưu
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "0.85rem",
                                                                marginTop:
                                                                    "4px",
                                                                lineHeight:
                                                                    "1.5",
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    color: "#4b5563",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    Địa chỉ:
                                                                </span>{" "}
                                                                {
                                                                    order.shippingAddress
                                                                }
                                                            </div>
                                                            <div
                                                                style={{
                                                                    color: "#4b5563",
                                                                    marginTop:
                                                                        "2px",
                                                                }}
                                                            >
                                                                <span
                                                                    style={{
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    SĐT:
                                                                </span>{" "}
                                                                {order.recipientPhone ||
                                                                    order.user
                                                                        ?.phone ||
                                                                    "Chưa cập nhật"}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    gap: "8px",
                                                    alignItems: "flex-start",
                                                }}
                                            >
                                                <CreditCard
                                                    size={16}
                                                    style={{
                                                        color: "#0a422d",
                                                        flexShrink: 0,
                                                        marginTop: "2px",
                                                    }}
                                                />
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 600,
                                                            color: "#111827",
                                                        }}
                                                    >
                                                        Phương thức thanh toán
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: "#4b5563",
                                                            fontSize: "0.85rem",
                                                            marginTop: "2px",
                                                        }}
                                                    >
                                                        {order.paymentMethod ===
                                                        "VNPAY"
                                                            ? "Thanh toán trực tuyến VNPay"
                                                            : order.paymentMethod ===
                                                                "WALLET"
                                                              ? "Ví điện tử"
                                                              : "Thanh toán khi nhận hàng (COD)"}
                                                    </div>
                                                </div>
                                            </div>

                                            {order.cancelledReason && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        alignItems:
                                                            "flex-start",
                                                        padding: "10px 14px",
                                                        backgroundColor:
                                                            "#fef2f2",
                                                        borderRadius: "8px",
                                                        border: "1px solid #fee2e2",
                                                    }}
                                                >
                                                    <AlertTriangle
                                                        size={16}
                                                        style={{
                                                            color: "#ef4444",
                                                            flexShrink: 0,
                                                            marginTop: "2px",
                                                        }}
                                                    />
                                                    <div>
                                                        <div
                                                            style={{
                                                                fontWeight: 600,
                                                                color: "#991b1b",
                                                            }}
                                                        >
                                                            Lý do hủy / từ chối
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: "#b91c1c",
                                                                fontSize:
                                                                    "0.85rem",
                                                                marginTop:
                                                                    "2px",
                                                            }}
                                                        >
                                                            {
                                                                order.cancelledReason
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {activeReturnRequest && (
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "8px",
                                                        alignItems:
                                                            "flex-start",
                                                        padding: "12px 16px",
                                                        backgroundColor:
                                                            "#fffbeb",
                                                        borderRadius: "10px",
                                                        border: "1px solid #fef3c7",
                                                    }}
                                                >
                                                    <AlertTriangle
                                                        size={18}
                                                        style={{
                                                            color: "#d97706",
                                                            flexShrink: 0,
                                                            marginTop: "2px",
                                                        }}
                                                    />
                                                    <div
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                fontWeight: 700,
                                                                color: "#b45309",
                                                                fontSize:
                                                                    "0.925rem",
                                                            }}
                                                        >
                                                            Yêu cầu đổi trả (
                                                            {activeReturnRequest.returnType ===
                                                            "EXCHANGE"
                                                                ? "Đổi hàng mới"
                                                                : "Trả hàng hoàn tiền"}
                                                            )
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: "#78350f",
                                                                fontSize:
                                                                    "0.85rem",
                                                                marginTop:
                                                                    "6px",
                                                                lineHeight:
                                                                    "1.4",
                                                            }}
                                                        >
                                                            <strong>
                                                                Lý do:
                                                            </strong>{" "}
                                                            {
                                                                activeReturnRequest.reason
                                                            }
                                                        </div>
                                                        <div
                                                            style={{
                                                                color: "#78350f",
                                                                fontSize:
                                                                    "0.85rem",
                                                                marginTop:
                                                                    "4px",
                                                            }}
                                                        >
                                                            <strong>
                                                                Trạng thái yêu
                                                                cầu:
                                                            </strong>{" "}
                                                            <span
                                                                style={{
                                                                    fontWeight: 700,
                                                                    color:
                                                                        activeReturnRequest.status ===
                                                                        "PENDING"
                                                                            ? "#d97706"
                                                                            : activeReturnRequest.status ===
                                                                                "APPROVED"
                                                                              ? "#10b981"
                                                                              : "#ef4444",
                                                                }}
                                                            >
                                                                {activeReturnRequest.status ===
                                                                "PENDING"
                                                                    ? "Chờ duyệt"
                                                                    : activeReturnRequest.status ===
                                                                        "APPROVED"
                                                                      ? "Đã duyệt"
                                                                      : "Bị từ chối"}
                                                            </span>
                                                        </div>

                                                        {activeReturnRequest.rejectedReason && (
                                                            <div
                                                                style={{
                                                                    color: "#ef4444",
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    marginTop:
                                                                        "4px",
                                                                }}
                                                            >
                                                                <strong>
                                                                    Lý do từ
                                                                    chối:
                                                                </strong>{" "}
                                                                {
                                                                    activeReturnRequest.rejectedReason
                                                                }
                                                            </div>
                                                        )}

                                                        {activeReturnRequest.evidenceImages && (
                                                            <div
                                                                style={{
                                                                    marginTop:
                                                                        "10px",
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        fontWeight: 600,
                                                                        color: "#78350f",
                                                                        fontSize:
                                                                            "0.8rem",
                                                                        marginBottom:
                                                                            "4px",
                                                                    }}
                                                                >
                                                                    Ảnh minh
                                                                    chứng:
                                                                </div>
                                                                <div
                                                                    style={{
                                                                        display:
                                                                            "flex",
                                                                        gap: "8px",
                                                                        flexWrap:
                                                                            "wrap",
                                                                    }}
                                                                >
                                                                    {activeReturnRequest.evidenceImages
                                                                        .split(
                                                                            " || ",
                                                                        )
                                                                        .map(
                                                                            (
                                                                                img,
                                                                                i,
                                                                            ) => (
                                                                                <a
                                                                                    key={
                                                                                        i
                                                                                    }
                                                                                    href={
                                                                                        img
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    style={{
                                                                                        display:
                                                                                            "block",
                                                                                        width: "50px",
                                                                                        height: "50px",
                                                                                        borderRadius:
                                                                                            "4px",
                                                                                        overflow:
                                                                                            "hidden",
                                                                                        border: "1px solid #fcd34d",
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src={
                                                                                            img
                                                                                        }
                                                                                        alt="Minh chứng"
                                                                                        style={{
                                                                                            width: "100%",
                                                                                            height: "100%",
                                                                                            objectFit:
                                                                                                "cover",
                                                                                        }}
                                                                                    />
                                                                                </a>
                                                                            ),
                                                                        )}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Timeline Stepper */}
                                        <div className="order-stepper-box">
                                            <div className="order-stepper-header-title">
                                                <Clock
                                                    size={16}
                                                    style={{ color: "#0a422d" }}
                                                />
                                                Theo dõi trạng thái đơn hàng
                                            </div>

                                            <div className="order-stepper-row">
                                                <div
                                                    className="order-stepper-line-bg"
                                                    style={{
                                                        left: `${100 / (steps.length * 2)}%`,
                                                        right: `${100 / (steps.length * 2)}%`,
                                                    }}
                                                >
                                                    <div
                                                        className="order-stepper-line-active"
                                                        style={{
                                                            width: `${activeProgressPercent}%`,
                                                            backgroundColor:
                                                                isCancelled
                                                                    ? "#ef4444"
                                                                    : "#10b981",
                                                        }}
                                                    />
                                                </div>

                                                {steps.map((step, idx) => {
                                                    const IconComponent =
                                                        step.icon;
                                                    const isDone = step.done;
                                                    const circleColor =
                                                        step.isError
                                                            ? "#ef4444"
                                                            : step.isRefunded
                                                              ? "#6366f1"
                                                              : isDone
                                                                ? "#10b981"
                                                                : "#cbd5e1";
                                                    const textColor = isDone
                                                        ? "#111827"
                                                        : "#9ca3af";

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="order-stepper-node"
                                                        >
                                                            <div
                                                                className="order-stepper-circle"
                                                                style={{
                                                                    backgroundColor:
                                                                        isDone
                                                                            ? circleColor
                                                                            : "#ffffff",
                                                                    border: `3px solid ${circleColor}`,
                                                                    color: isDone
                                                                        ? "#ffffff"
                                                                        : "#9ca3af",
                                                                    boxShadow:
                                                                        isDone
                                                                            ? `0 0 0 4px ${circleColor}20`
                                                                            : "none",
                                                                }}
                                                            >
                                                                <IconComponent
                                                                    size={20}
                                                                />
                                                            </div>

                                                            <div
                                                                className="order-stepper-node-label"
                                                                style={{
                                                                    color: textColor,
                                                                }}
                                                            >
                                                                {step.label}
                                                            </div>

                                                            {step.time && (
                                                                <div className="order-stepper-node-time">
                                                                    {formatDate(
                                                                        step.time,
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Danh sách sản phẩm */}
                                        <div style={{ marginBottom: "24px" }}>
                                            <div
                                                style={{
                                                    fontWeight: 700,
                                                    fontSize: "0.95rem",
                                                    color: "#111827",
                                                    marginBottom: "12px",
                                                    borderBottom:
                                                        "1px solid #f3f4f6",
                                                    paddingBottom: "8px",
                                                }}
                                            >
                                                Sản phẩm đã mua
                                            </div>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: "14px",
                                                }}
                                            >
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        style={{
                                                            display: "flex",
                                                            gap: "12px",
                                                            alignItems:
                                                                "center",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                width: "50px",
                                                                height: "65px",
                                                                backgroundColor:
                                                                    "#f3f4f6",
                                                                borderRadius:
                                                                    "4px",
                                                                border: "1px solid #e5e7eb",
                                                                overflow:
                                                                    "hidden",
                                                                flexShrink: 0,
                                                            }}
                                                        >
                                                            {item.product
                                                                ?.imageUrl && (
                                                                <img
                                                                    src={
                                                                        item
                                                                            .product
                                                                            .imageUrl
                                                                    }
                                                                    alt={
                                                                        item
                                                                            .product
                                                                            .name
                                                                    }
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit:
                                                                            "cover",
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <div
                                                            style={{
                                                                flex: 1,
                                                                minWidth: 0,
                                                            }}
                                                        >
                                                            <h4
                                                                style={{
                                                                    fontSize:
                                                                        "0.88rem",
                                                                    fontWeight: 600,
                                                                    color: "#111827",
                                                                    margin: "0 0 3px 0",
                                                                    whiteSpace:
                                                                        "nowrap",
                                                                    overflow:
                                                                        "hidden",
                                                                    textOverflow:
                                                                        "ellipsis",
                                                                }}
                                                            >
                                                                {item.product
                                                                    ?.name ||
                                                                    "Sách đã bị xóa"}
                                                            </h4>
                                                            <div
                                                                style={{
                                                                    fontSize:
                                                                        "0.8rem",
                                                                    color: "#6b7280",
                                                                }}
                                                            >
                                                                Đơn giá:{" "}
                                                                {formatPrice(
                                                                    item.unitPrice,
                                                                )}{" "}
                                                                | Số lượng: x
                                                                {item.quantity}
                                                            </div>
                                                        </div>
                                                        <div
                                                            style={{
                                                                fontSize:
                                                                    "0.9rem",
                                                                fontWeight: 700,
                                                                color: "#111827",
                                                            }}
                                                        >
                                                            {formatPrice(
                                                                item.subtotal ||
                                                                    item.unitPrice *
                                                                        item.quantity,
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Tổng kết tiền */}
                                        <div className="order-details-financial-stack">
                                            <div className="order-details-financial-row">
                                                <span>Tạm tính (Giá gốc)</span>
                                                <span
                                                    style={{
                                                        fontWeight: 500,
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {formatPrice(
                                                        order.totalAmount,
                                                    )}
                                                </span>
                                            </div>

                                            <div className="order-details-financial-row">
                                                <span>Phí vận chuyển</span>
                                                <span
                                                    style={{
                                                        fontWeight: 500,
                                                        color: "#111827",
                                                    }}
                                                >
                                                    {order.shippingFee === 0
                                                        ? "Miễn phí"
                                                        : formatPrice(
                                                              order.shippingFee,
                                                          )}
                                                </span>
                                            </div>

                                            {couponDiscount > 0 && (
                                                <div className="order-details-financial-row discount">
                                                    <span>
                                                        Voucher giảm giá{" "}
                                                        {order.coupon?.code
                                                            ? `(Mã: ${order.coupon.code})`
                                                            : ""}
                                                    </span>
                                                    <span>
                                                        -
                                                        {formatPrice(
                                                            couponDiscount,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            {pointsDiscount > 0 && (
                                                <div className="order-details-financial-row discount">
                                                    <span>
                                                        Xu tích lũy đã dùng{" "}
                                                        {order.pointsUsed
                                                            ? `(${order.pointsUsed} xu)`
                                                            : ""}
                                                    </span>
                                                    <span>
                                                        -
                                                        {formatPrice(
                                                            pointsDiscount,
                                                        )}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="order-details-financial-total-row">
                                                <span className="order-details-financial-total-label">
                                                    Thành tiền
                                                </span>
                                                <span className="order-details-financial-total-val">
                                                    {formatPrice(
                                                        order.finalAmount,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })(),
                    document.body,
                )}
        </div>
    );
};

export default OrderHistory;
