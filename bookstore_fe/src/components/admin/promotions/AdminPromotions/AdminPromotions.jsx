import React from "react";
import {
    Sparkles,
    Plus,
    Package,
    Edit2,
    Search,
    X,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    Clock,
    TrendingUp,
    RotateCcw,
    BarChart3,
    Tag,
} from "lucide-react";
import { useAdminPromotions } from "./useAdminPromotions";
import AdminAddPromotion from "../AdminAddPromotion/AdminAddPromotion";
import AdminEditPromotion from "../AdminEditPromotion/AdminEditPromotion";
import AdminViewPromotion from "../AdminViewPromotion/AdminViewPromotion";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import "./AdminPromotions.css";

const AdminPromotions = () => {
    const {
        showToast,
        loading,
        isAddModalOpen,
        setIsAddModalOpen,
        editingPromotion,
        setEditingPromotion,
        viewingPromotionId,
        setViewingPromotionId,
        expandedPromoId,
        toggleExpandRow,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        filteredPromotions,
        formatDateOnly,
        formatTimeOnly,
        getStatusStyle,
        handleSavePromotion,
        handleUpdatePromotion,
        handleResetFilter,
        stats,
    } = useAdminPromotions();

    const isFiltered =
        searchTerm !== "" || statusFilter !== "ALL" || typeFilter !== "ALL";

    return (
        <div className="admin-promotions-container">
            {/* Header section */}
            <div className="admin-promotions-header">
                <div>
                    <h1 className="admin-promotions-title">
                        Quản lý Chương trình Khuyến Mãi
                    </h1>
                    <p className="admin-promotions-subtitle">
                        Tạo chiến dịch ưu đãi, áp dụng giảm giá theo danh mục sách và theo dõi doanh thu thực tế
                    </p>
                </div>

                <div className="admin-promotions-header-actions">
                    <button
                        type="button"
                        className="admin-promotions-create-btn"
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>Tạo chương trình khuyến mãi</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI Stats Cards */}
            <div className="admin-promotions-stats-grid">
                {/* Card 1: Total */}
                <div className="admin-promotions-stat-card">
                    <div className="admin-promotions-stat-top">
                        <span className="admin-promotions-stat-label">
                            TỔNG CHƯƠNG TRÌNH
                        </span>
                        <div className="admin-promotions-stat-icon-wrap total">
                            <Sparkles size={20} />
                        </div>
                    </div>
                    <div className="admin-promotions-stat-value">{stats.total}</div>
                    <div className="admin-promotions-stat-desc neutral">
                        chiến dịch khuyến mãi
                    </div>
                </div>

                {/* Card 2: Active */}
                <div className="admin-promotions-stat-card">
                    <div className="admin-promotions-stat-top">
                        <span className="admin-promotions-stat-label">
                            ĐANG DIỄN RA
                        </span>
                        <div className="admin-promotions-stat-icon-wrap active">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="admin-promotions-stat-value">{stats.active}</div>
                    <div className="admin-promotions-stat-desc success">
                        đang áp dụng cho khách hàng
                    </div>
                </div>

                {/* Card 3: Pending */}
                <div className="admin-promotions-stat-card">
                    <div className="admin-promotions-stat-top">
                        <span className="admin-promotions-stat-label">
                            CHỜ KÍCH HOẠT
                        </span>
                        <div className="admin-promotions-stat-icon-wrap pending">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="admin-promotions-stat-value">{stats.pending}</div>
                    <div className="admin-promotions-stat-desc warning">
                        lên lịch sắp diễn ra
                    </div>
                </div>

                {/* Card 4: Total Revenue */}
                <div className="admin-promotions-stat-card">
                    <div className="admin-promotions-stat-top">
                        <span className="admin-promotions-stat-label">
                            DOANH THU MANG LẠI
                        </span>
                        <div className="admin-promotions-stat-icon-wrap revenue">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="admin-promotions-stat-value revenue-text">
                        {(stats.totalRevenue || 0).toLocaleString("vi-VN")}₫
                    </div>
                    <div className="admin-promotions-stat-desc revenue">
                        từ các đơn áp dụng ưu đãi
                    </div>
                </div>
            </div>

            {/* Filter and Search Section */}
            <div className="admin-promotions-filter-bar">
                <div className="admin-promotions-search-wrapper">
                    <Search size={18} className="admin-promotions-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chương trình theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-promotions-search-input"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="admin-promotions-search-clear"
                            onClick={() => setSearchTerm("")}
                            title="Xóa tìm kiếm"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="admin-promotions-filter-group">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="admin-promotions-filter-select"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang diễn ra</option>
                        <option value="PENDING">Chờ kích hoạt</option>
                        <option value="INACTIVE">Vô hiệu hóa</option>
                        <option value="EXPIRED">Đã kết thúc</option>
                    </select>
                </div>

                <div className="admin-promotions-filter-group">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="admin-promotions-filter-select"
                    >
                        <option value="ALL">Tất cả hình thức</option>
                        <option value="PERCENT">Giảm theo %</option>
                        <option value="FIXED">Giảm số tiền (₫)</option>
                    </select>
                </div>

                {isFiltered && (
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="admin-promotions-reset-btn"
                        title="Đặt lại bộ lọc"
                    >
                        <RotateCcw size={15} />
                        <span>Đặt lại</span>
                    </button>
                )}
            </div>

            {/* Table section (Desktop) / Cards (Mobile) / EmptyState */}
            {loading ? (
                <div className="admin-promotions-loading-container">
                    <div className="admin-promotions-spinner" />
                    <p>Đang tải danh sách chương trình khuyến mãi...</p>
                </div>
            ) : filteredPromotions.length === 0 ? (
                <div className="admin-promotions-empty-container">
                    <EmptyState
                        icon={Sparkles}
                        title="Không tìm thấy chương trình khuyến mãi nào"
                        description={
                            isFiltered
                                ? "Không có chương trình nào khớp với bộ lọc hoặc từ khóa tìm kiếm. Vui lòng thử lại với tiêu chí khác."
                                : "Chưa có chương trình khuyến mãi nào trong hệ thống. Hãy tạo chương trình đầu tiên!"
                        }
                        actionText={isFiltered ? "Đặt lại bộ lọc" : "Tạo chương trình khuyến mãi"}
                        onAction={isFiltered ? handleResetFilter : () => setIsAddModalOpen(true)}
                        actionIcon={isFiltered ? RotateCcw : Plus}
                    />
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="admin-desktop-table admin-promotions-table-wrapper">
                        <table className="admin-promotions-table">
                            <thead>
                                <tr className="admin-promotions-table-header-row">
                                    <th className="admin-promotions-th">
                                        CHƯƠNG TRÌNH KHUYẾN MÃI
                                    </th>
                                    <th className="admin-promotions-th">
                                        THỜI GIAN ÁP DỤNG
                                    </th>
                                    <th className="admin-promotions-th-center">
                                        TRẠNG THÁI
                                    </th>
                                    <th className="admin-promotions-th-center">
                                        LƯỢT ÁP DỤNG
                                    </th>
                                    <th className="admin-promotions-th-right">
                                        DOANH THU MANG LẠI
                                    </th>
                                    <th className="admin-promotions-th-right">
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPromotions.map((promo) => {
                                    const status = getStatusStyle(promo.status);
                                    const isExpanded = expandedPromoId === promo.id;
                                    const discountLabel =
                                        promo.discountType === "PERCENT"
                                            ? `Giảm ${promo.discountValue}%`
                                            : promo.discountValue
                                            ? `Giảm ${promo.discountValue?.toLocaleString("vi-VN")}₫`
                                            : "Ưu đãi";

                                    return (
                                        <React.Fragment key={promo.id}>
                                            <tr
                                                className={`admin-promotions-row ${
                                                    isExpanded ? "row-expanded-active" : ""
                                                }`}
                                            >
                                                <td className="admin-promotions-td-title">
                                                    <div className="admin-promotions-title-cell">
                                                        <div className="admin-promotions-title-text">
                                                            {promo.title}
                                                        </div>
                                                        <div className="admin-promotions-discount-tag">
                                                            <Tag size={12} />
                                                            <span>{discountLabel}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="admin-promotions-td-time">
                                                    <div className="admin-promotions-time-container">
                                                        <div className="admin-promotions-date-row">
                                                            <span>{formatDateOnly(promo.startDate)}</span>
                                                            <span className="admin-promotions-time-separator">→</span>
                                                            <span>{formatDateOnly(promo.endDate)}</span>
                                                        </div>
                                                        <div className="admin-promotions-subtime-row">
                                                            <span>{formatTimeOnly(promo.startDate)}</span>
                                                            <span>-</span>
                                                            <span>{formatTimeOnly(promo.endDate)}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="admin-promotions-td-center">
                                                    <span
                                                        className={`admin-promotions-status-badge ${status.className}`}
                                                    >
                                                        <span className="admin-status-dot" />
                                                        {status.text}
                                                    </span>
                                                </td>

                                                <td className="admin-promotions-td-center">
                                                    <span className="admin-promotions-orders-count">
                                                        {promo.totalUses || 0} đơn
                                                    </span>
                                                </td>

                                                <td className="admin-promotions-td-right">
                                                    <span className="admin-promotions-revenue-badge">
                                                        {(promo.totalRevenue || 0).toLocaleString("vi-VN")}₫
                                                    </span>
                                                </td>

                                                <td className="admin-promotions-td-actions">
                                                    <div className="admin-promotions-actions-group">
                                                        <button
                                                            type="button"
                                                            className={`admin-promotions-action-btn expand ${
                                                                isExpanded ? "active" : ""
                                                            }`}
                                                            title={
                                                                isExpanded
                                                                    ? "Thu gọn danh sách sách"
                                                                    : "Xem danh sách sách áp dụng"
                                                            }
                                                            onClick={() => toggleExpandRow(promo.id)}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUp size={16} />
                                                            ) : (
                                                                <ChevronDown size={16} />
                                                            )}
                                                            <span>
                                                                {promo.applicableProducts?.length || 0} sách
                                                            </span>
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-promotions-action-btn report"
                                                            title="Xem báo cáo hiệu quả"
                                                            onClick={() => setViewingPromotionId(promo.id)}
                                                        >
                                                            <BarChart3 size={15} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="admin-promotions-action-btn edit"
                                                            title="Chỉnh sửa chương trình"
                                                            onClick={() => setEditingPromotion(promo)}
                                                        >
                                                            <Edit2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Accordion Expandable Row */}
                                            {isExpanded && (
                                                <tr className="admin-promotions-expanded-row">
                                                    <td colSpan="6" className="admin-promotions-expanded-cell">
                                                        <div className="admin-promotions-expanded-card">
                                                            <div className="admin-promotions-expanded-header">
                                                                <div className="admin-promotions-expanded-title-group">
                                                                    <Package size={18} className="expanded-icon" />
                                                                    <span className="admin-promotions-expanded-title">
                                                                        Sản phẩm đang áp dụng ({promo.applicableProducts?.length || 0})
                                                                    </span>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    className="admin-promotions-expanded-report-btn"
                                                                    onClick={() => setViewingPromotionId(promo.id)}
                                                                >
                                                                    <BarChart3 size={14} />
                                                                    <span>Báo cáo chi tiết</span>
                                                                </button>
                                                            </div>

                                                            {promo.applicableProducts && promo.applicableProducts.length > 0 ? (
                                                                <div className="admin-promotions-expanded-grid">
                                                                    {promo.applicableProducts.map((product) => {
                                                                        const originalPrice = product.price || 0;
                                                                        let discountPrice = originalPrice;
                                                                        if (promo.discountType === "PERCENT") {
                                                                            discountPrice = originalPrice * (1 - (promo.discountValue || 0) / 100);
                                                                        } else if (promo.discountType === "FIXED") {
                                                                            discountPrice = Math.max(0, originalPrice - (promo.discountValue || 0));
                                                                        }
                                                                        return (
                                                                            <div key={product.id} className="admin-promotions-expanded-item">
                                                                                <div className="admin-promotions-expanded-thumb">
                                                                                    {product.imageUrl ? (
                                                                                        <img src={product.imageUrl} alt={product.name} />
                                                                                    ) : (
                                                                                        <Package size={22} color="#94a3b8" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="admin-promotions-expanded-info">
                                                                                    <div className="admin-promotions-expanded-name" title={product.name}>
                                                                                        {product.name}
                                                                                    </div>
                                                                                    <div className="admin-promotions-expanded-prices">
                                                                                        <span className="admin-promotions-expanded-price-sale">
                                                                                            {Math.round(discountPrice).toLocaleString("vi-VN")}₫
                                                                                        </span>
                                                                                        {promo.discountValue > 0 && (
                                                                                            <span className="admin-promotions-expanded-price-old">
                                                                                                {originalPrice.toLocaleString("vi-VN")}₫
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="admin-promotions-expanded-empty">
                                                                    Chưa có sản phẩm nào được áp dụng cho chương trình này.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards List View */}
                    <div className="admin-mobile-card-list">
                        {filteredPromotions.map((promo) => {
                            const status = getStatusStyle(promo.status);
                            const discountLabel =
                                promo.discountType === "PERCENT"
                                    ? `Giảm ${promo.discountValue}%`
                                    : promo.discountValue
                                    ? `Giảm ${promo.discountValue?.toLocaleString("vi-VN")}₫`
                                    : "Ưu đãi";

                            return (
                                <div key={promo.id} className="admin-card-item">
                                    <div className="admin-card-header">
                                        <div>
                                            <div className="admin-card-title">{promo.title}</div>
                                            <div className="admin-promotions-discount-tag">
                                                <Tag size={12} />
                                                <span>{discountLabel}</span>
                                            </div>
                                        </div>
                                        <span className={`admin-promotions-status-badge ${status.className}`}>
                                            <span className="admin-status-dot" />
                                            {status.text}
                                        </span>
                                    </div>

                                    <div className="admin-card-body">
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Thời gian:</span>
                                            <span className="admin-card-value time">
                                                {formatDateOnly(promo.startDate)} - {formatDateOnly(promo.endDate)}
                                            </span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Đơn áp dụng:</span>
                                            <span className="admin-card-value">{promo.totalUses || 0} đơn</span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Doanh thu mang lại:</span>
                                            <span className="admin-card-value revenue">
                                                {(promo.totalRevenue || 0).toLocaleString("vi-VN")}₫
                                            </span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Sách áp dụng:</span>
                                            <span className="admin-card-value">
                                                {promo.applicableProducts?.length || 0} sản phẩm
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-card-footer">
                                        <button
                                            type="button"
                                            onClick={() => setViewingPromotionId(promo.id)}
                                            className="admin-card-btn-report"
                                        >
                                            <BarChart3 size={15} />
                                            <span>Báo cáo hiệu quả</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingPromotion(promo)}
                                            className="admin-card-btn-edit"
                                        >
                                            <Edit2 size={15} />
                                            <span>Sửa</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Modal Add */}
            {isAddModalOpen && (
                <AdminAddPromotion
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSavePromotion}
                    showToast={showToast}
                />
            )}

            {/* Modal Edit */}
            {editingPromotion && (
                <AdminEditPromotion
                    promotion={editingPromotion}
                    onClose={() => setEditingPromotion(null)}
                    onSave={handleUpdatePromotion}
                    showToast={showToast}
                />
            )}

            {/* Modal View */}
            {viewingPromotionId && (
                <AdminViewPromotion
                    promotionId={viewingPromotionId}
                    onClose={() => setViewingPromotionId(null)}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default AdminPromotions;