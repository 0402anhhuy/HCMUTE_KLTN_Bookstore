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

                            {/* Applicable Products Section */}
                            <div style={{ marginTop: "24px", textAlign: "left" }}>
                                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Package size={18} color="#7c3aed" /> Danh sách sản phẩm áp dụng ({report.promotion.applicableProducts?.length || 0})
                                </h4>
                                {report.promotion.applicableProducts && report.promotion.applicableProducts.length > 0 ? (
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px", maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
                                        {report.promotion.applicableProducts.map((p) => (
                                            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} style={{ width: "36px", height: "44px", objectFit: "cover", borderRadius: "4px" }} />
                                                ) : (
                                                    <Package size={20} color="#94a3b8" />
                                                )}
                                                <div style={{ overflow: "hidden" }}>
                                                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={p.name}>
                                                        {p.name}
                                                    </div>
                                                    <div style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 700 }}>
                                                        {p.price?.toLocaleString("vi-VN")}đ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic", textAlign: "center", padding: "12px" }}>
                                        Chưa có sản phẩm nào được chọn trong chương trình này.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AdminViewPromotion;