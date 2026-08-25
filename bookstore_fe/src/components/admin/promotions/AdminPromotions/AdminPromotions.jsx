import { PlusCircle, Package, FileText, Edit2, Trash2, Search } from "lucide-react";
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
        deletingPromotion,
        setDeletingPromotion,
        viewingPromotionId,
        setViewingPromotionId,
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
        handleDeletePromotion,
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
                                Loại khuyến mãi:
                            </span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="admin-promotions-filter-select"
                            >
                                <option value="ALL">Tất cả các loại</option>
                                <option value="PERCENT">
                                    Theo phần trăm (%)
                                </option>
                                <option value="FIXED_AMOUNT">
                                    Theo số tiền (VNĐ)
                                </option>
                            </select>
                        </div>

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
                            <th className="admin-promotions-th">Loại</th>
                            <th className="admin-promotions-th">Thời gian</th>
                            <th className="admin-promotions-th">
                                Trạng thái
                            </th>
                            <th className="admin-promotions-th">
                                Sản phẩm áp dụng
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
                                return (
                                    <tr
                                        key={promo.id}
                                        className={
                                            index === promotions.length - 1
                                                ? "admin-promotions-row-last"
                                                : "admin-promotions-row"
                                        }
                                    >
                                        <td className="admin-promotions-td-title">
                                            {promo.title}
                                        </td>
                                        <td className="admin-promotions-td-discount">
                                            {promo.discountType === "PERCENT"
                                                ? `Giảm ${promo.discountValue}%`
                                                : `Giảm ${promo.discountValue.toLocaleString()}đ`}
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
                                        <td className="admin-promotions-td-products">
                                            <div className="admin-promotions-products-box">
                                                <Package
                                                    size={20}
                                                    color="#64748b"
                                                />
                                                {promo.applicableProducts?.length || 0}{" "}
                                                Sản phẩm
                                            </div>
                                        </td>
                                        <td className="admin-promotions-td-actions">
                                            <div className="admin-promotions-actions-group">
                                                <button
                                                    type="button"
                                                    className="admin-promotions-action-btn"
                                                    title="Chi tiết"
                                                    onClick={() =>
                                                        setViewingPromotionId(
                                                            promo.id
                                                        )
                                                    }
                                                >
                                                    <FileText
                                                        size={18}
                                                        color="#64748b"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-promotions-action-btn"
                                                    title="Sửa"
                                                    onClick={() =>
                                                        setEditingPromotion(promo)
                                                    }
                                                >
                                                    <Edit2
                                                        size={18}
                                                        color="#3b82f6"
                                                    />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-promotions-action-btn"
                                                    title="Xóa"
                                                    onClick={() =>
                                                        setDeletingPromotion(promo)
                                                    }
                                                >
                                                    <Trash2
                                                        size={18}
                                                        color="#ef4444"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
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

            {/* Modal Delete Confirmation */}
            {deletingPromotion && (
                <div className="admin-promotions-delete-overlay">
                    <div className="admin-promotions-delete-card">
                        <div className="admin-promotions-delete-icon-box">
                            <Trash2 size={30} color="#ef4444" />
                        </div>
                        <h3 className="admin-promotions-delete-title">
                            Xác nhận xóa
                        </h3>
                        <p className="admin-promotions-delete-desc">
                            Bạn có chắc chắn muốn xóa vĩnh viễn chương trình{" "}
                            <strong>{deletingPromotion.title}</strong>? Các
                            sản phẩm trong chương trình này sẽ tự động trở về
                            giá gốc.
                        </p>
                        <div className="admin-promotions-delete-btn-group">
                            <button
                                type="button"
                                onClick={() => setDeletingPromotion(null)}
                                className="admin-promotions-delete-cancel-btn"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDeletePromotion}
                                className="admin-promotions-delete-confirm-btn"
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
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