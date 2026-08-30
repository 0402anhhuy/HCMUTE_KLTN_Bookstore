import React from "react";
import { PlusCircle, Package, FileText, Edit2, Search, ChevronDown, ChevronUp, ShoppingCart } from "lucide-react";
import { useAdminPromotions } from "./useAdminPromotions";
import AdminAddPromotion from "../AdminAddPromotion/AdminAddPromotion";
import AdminEditPromotion from "../AdminEditPromotion/AdminEditPromotion";
import AdminViewPromotion from "../AdminViewPromotion/AdminViewPromotion";
import "./AdminPromotions.css";

const AdminPromotions = () => {
    const {
        showToast,
        promotions,
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
    } = useAdminPromotions();

    return (
        <div className="admin-promotions-container">
            {/* Header section */}
            <div className="admin-promotions-header">
                <h1 className="admin-promotions-title">Quản lý khuyến mãi</h1>
                <button
                    type="button"
                    className="admin-promotions-create-btn"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <PlusCircle size={18} />
                    Tạo chương trình khuyến mãi
                </button>
            </div>

            {/* Filter and Search Section */}
            <div className="admin-promotions-filter-section">
                <div className="admin-promotions-search-wrapper">
                    <Search
                        size={18}
                        color="#64748b"
                        className="admin-promotions-search-icon"
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chương trình khuyến mãi theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-promotions-search-input"
                    />
                </div>

                <div className="admin-promotions-filter-box">
                    <div className="admin-promotions-filter-grid">
                        <div className="admin-promotions-filter-group">
                            <span className="admin-promotions-filter-label">
                                Trạng thái:
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="admin-promotions-filter-select"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ kích hoạt</option>
                                <option value="ACTIVE">Đang diễn ra</option>
                                <option value="INACTIVE">Vô hiệu hóa</option>
                                <option value="EXPIRED">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="admin-promotions-reset-btn"
                    >
                        Khôi phục
                    </button>
                </div>
            </div>

            {/* Table section */}
            <div className="admin-promotions-table-wrapper">
                <table className="admin-promotions-table">
                    <thead>
                        <tr className="admin-promotions-table-header-row">
                            <th className="admin-promotions-th">
                                Chương trình
                            </th>
                            <th className="admin-promotions-th">Thời gian</th>
                            <th className="admin-promotions-th">
                                Trạng thái
                            </th>
                            <th className="admin-promotions-th">
                                Tổng đơn hàng
                            </th>
                            <th className="admin-promotions-th">
                                Doanh thu
                            </th>
                            <th className="admin-promotions-th">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="admin-promotions-loading-cell"
                                >
                                    Đang tải dữ liệu...
                                </td>
                            </tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="6"
                                    className="admin-promotions-empty-cell"
                                >
                                    Không tìm thấy chương trình khuyến mãi nào phù hợp
                                </td>
                            </tr>
                        ) : (
                            filteredPromotions.map((promo, index) => {
                                const status = getStatusStyle(promo.status);
                                const isExpanded = expandedPromoId === promo.id;
                                return (
                                    <React.Fragment key={promo.id}>
                                        <tr
                                            className={`${index === filteredPromotions.length - 1 && !isExpanded
                                                ? "admin-promotions-row-last"
                                                : "admin-promotions-row"
                                                } ${isExpanded ? "row-expanded-active" : ""}`}
                                        >
                                            <td className="admin-promotions-td-title">
                                                {promo.title}
                                            </td>
                                            <td className="admin-promotions-td-time">
                                                <div className="admin-promotions-time-container">
                                                    <div className="admin-promotions-date-row">
                                                        <span>
                                                            {formatDateOnly(
                                                                promo.startDate
                                                            )}
                                                        </span>
                                                        <span className="admin-promotions-time-separator">
                                                            -
                                                        </span>
                                                        <span>
                                                            {formatDateOnly(
                                                                promo.endDate
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="admin-promotions-subtime-row">
                                                        <span>
                                                            (
                                                            {formatTimeOnly(
                                                                promo.startDate
                                                            )}
                                                            )
                                                        </span>
                                                        <span>
                                                            (
                                                            {formatTimeOnly(
                                                                promo.endDate
                                                            )}
                                                            )
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-promotions-td-status">
                                                <span
                                                    className={`admin-promotions-status-badge ${status.className}`}
                                                >
                                                    {status.text}
                                                </span>
                                            </td>
                                            <td className="admin-promotions-td-orders">
                                                <span className="admin-promotions-orders-count">
                                                    {promo.totalUses || 0}
                                                </span>
                                            </td>
                                            <td className="admin-promotions-td-revenue">
                                                <span className="admin-promotions-revenue-badge">
                                                    {(promo.totalRevenue || 0).toLocaleString("vi-VN")}đ
                                                </span>
                                            </td>
                                            <td className="admin-promotions-td-actions">
                                                <div className="admin-promotions-actions-group">
                                                    <button
                                                        type="button"
                                                        className={`admin-promotions-action-btn ${isExpanded ? "active" : ""}`}
                                                        title={isExpanded ? "Thu gọn chi tiết sản phẩm" : "Xem danh sách sản phẩm áp dụng"}
                                                        onClick={() => toggleExpandRow(promo.id)}
                                                    >
                                                        <FileText
                                                            size={18}
                                                            color={isExpanded ? "#7c3aed" : "#64748b"}
                                                        />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="admin-promotions-action-btn"
                                                        title="Chỉnh sửa"
                                                        onClick={() =>
                                                            setEditingPromotion(promo)
                                                        }
                                                    >
                                                        <Edit2
                                                            size={18}
                                                            color="#3b82f6"
                                                        />
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
                                                                <Package size={20} color="#7c3aed" />
                                                                <span className="admin-promotions-expanded-title">
                                                                    Danh sách sản phẩm áp dụng ({promo.applicableProducts?.length || 0})
                                                                </span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="admin-promotions-expanded-report-btn"
                                                                onClick={() => setViewingPromotionId(promo.id)}
                                                            >
                                                                <FileText size={15} /> Xem báo cáo hiệu quả
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
                                                                                        {Math.round(discountPrice).toLocaleString("vi-VN")}đ
                                                                                    </span>
                                                                                    {promo.discountValue > 0 && (
                                                                                        <span className="admin-promotions-expanded-price-old">
                                                                                            {originalPrice.toLocaleString("vi-VN")}đ
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
                            })
                        )}
                    </tbody>
                </table>
            </div>

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