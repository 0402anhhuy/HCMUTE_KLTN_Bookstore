import { X, Calendar, ShoppingCart, DollarSign, Package } from "lucide-react";
import { useAdminViewPromotion } from "./useAdminViewPromotion";
import "./AdminViewPromotion.css";

const AdminViewPromotion = ({ promotionId, onClose, showToast }) => {
    const { report, loading, formatDateTime, getStatusInfo } =
        useAdminViewPromotion({ promotionId, onClose, showToast });

    return (
        <div className="admin-view-promotion-overlay">
            <div className="admin-view-promotion-modal">
                {/* Header */}
                <div className="admin-view-promotion-header">
                    <h2 className="admin-view-promotion-title">
                        Báo cáo Hiệu quả Khuyến mãi
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-view-promotion-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-view-promotion-body">
                    {loading ? (
                        <div className="admin-view-promotion-loading">
                            Đang phân tích dữ liệu...
                        </div>
                    ) : report && report.promotion ? (
                        <div className="admin-view-promotion-content">
                            <div className="admin-view-promotion-heading-box">
                                <h3 className="admin-view-promotion-name">
                                    {report.promotion.title}
                                </h3>
                                <div>
                                    {(() => {
                                        const { className, text } = getStatusInfo(
                                            report.promotion.status
                                        );
                                        return (
                                            <span
                                                className={`admin-view-promotion-status-badge ${className}`}
                                            >
                                                {text}
                                            </span>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="admin-view-promotion-grid">
                                <div className="admin-view-promotion-card">
                                    <div className="admin-view-promotion-icon-box icon-blue">
                                        <Calendar size={24} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <p className="admin-view-promotion-card-label">
                                            Thời gian áp dụng
                                        </p>
                                        <p className="admin-view-promotion-card-text">
                                            {formatDateTime(report.promotion.startDate)}
                                            <br />
                                            đến {formatDateTime(report.promotion.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="admin-view-promotion-card">
                                    <div className="admin-view-promotion-icon-box icon-purple">
                                        <Package size={24} color="#8b5cf6" />
                                    </div>
                                    <div>
                                        <p className="admin-view-promotion-card-label">
                                            Phạm vi áp dụng
                                        </p>
                                        <p className="admin-view-promotion-card-text-lg">
                                            {report.promotion.applicableProducts?.length || 0} Sản phẩm
                                        </p>
                                    </div>
                                </div>

                                <div className="admin-view-promotion-card">
                                    <div className="admin-view-promotion-icon-box icon-green">
                                        <ShoppingCart size={24} color="#10b981" />
                                    </div>
                                    <div>
                                        <p className="admin-view-promotion-card-label">
                                            Tổng lượt sử dụng
                                        </p>
                                        <p className="admin-view-promotion-card-value">
                                            {report.totalUses}{" "}
                                            <span className="admin-view-promotion-card-unit">
                                                đơn hàng
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="admin-view-promotion-card-revenue">
                                    <div className="admin-view-promotion-icon-box icon-amber">
                                        <DollarSign size={24} color="#f59e0b" />
                                    </div>
                                    <div>
                                        <p className="admin-view-promotion-card-label-amber">
                                            Doanh thu mang lại
                                        </p>
                                        <p className="admin-view-promotion-revenue-value">
                                            {report.totalRevenue?.toLocaleString()}đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AdminViewPromotion;