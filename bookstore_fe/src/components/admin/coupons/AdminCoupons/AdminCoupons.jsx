import { Tag, Plus, Trash2, Edit2, Search } from "lucide-react";
import { useAdminCoupons } from "./useAdminCoupons";
import AdminEditCoupon from "../AdminEditCoupon/AdminEditCoupon";
import "./AdminCoupons.css";

const AdminCoupons = ({
    coupons = [],
    promotions = [],
    loadData,
    showToast,
}) => {
    const {
        showForm,
        setShowForm,
        editingCoupon,
        setEditingCoupon,
        deletingCoupon,
        setDeletingCoupon,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        formData,
        handleFormChange,
        filteredCoupons,
        formatPrice,
        handleCreateCoupon,
        handleDeleteCoupon,
        handleResetFilter,
    } = useAdminCoupons({ coupons, loadData, showToast });

    return (
        <div className="admin-coupons-container">
            {/* Header */}
            <div className="admin-coupons-header">
                <div>
                    <h2 className="admin-coupons-title">
                        Quản Lý Mã Giảm Giá & Khuyến Mãi
                    </h2>
                    <span className="admin-coupons-subtitle">
                        Thiết lập mã coupon ưu đãi và chương trình khuyến mãi cho toàn sàn
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className="admin-coupons-create-btn"
                    >
                        <Plus size={16} /> Tạo Mã Giảm Giá
                    </button>
                </div>
            </div>

            {/* New Coupon Modal / Expand Form */}
            {showForm && (
                <form onSubmit={handleCreateCoupon} className="admin-coupons-form">
                    <h3 className="admin-coupons-form-title">
                        Tạo Mã Coupon Ưu Đãi Mới
                    </h3>

                    <div className="admin-coupons-form-grid">
                        <div>
                            <label className="admin-coupons-form-label">
                                Mã Coupon (VD: BOOKSUMMER)
                            </label>
                            <input
                                type="text"
                                name="code"
                                required
                                placeholder="BOOKSUMMER"
                                value={formData.code}
                                onChange={handleFormChange}
                                className="admin-coupons-input-code"
                            />
                        </div>

                        <div>
                            <label className="admin-coupons-form-label">
                                Giảm theo %
                            </label>
                            <input
                                type="number"
                                name="discountPercentage"
                                placeholder="VD: 15 (%)"
                                value={formData.discountPercentage}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div>
                            <label className="admin-coupons-form-label">
                                Hoặc Giảm số tiền cố định (VND)
                            </label>
                            <input
                                type="number"
                                name="discountAmount"
                                placeholder="VD: 30000"
                                value={formData.discountAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div>
                            <label className="admin-coupons-form-label">
                                Đơn hàng tối thiểu (VND)
                            </label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div>
                            <label className="admin-coupons-form-label">
                                Giảm tối đa (VND)
                            </label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                value={formData.maxDiscountAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div>
                            <label className="admin-coupons-form-label">
                                Giới hạn lượt dùng
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>
                    </div>

                    <div className="admin-coupons-form-actions">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="admin-coupons-btn-cancel"
                        >
                            Hủy
                        </button>
                        <button type="submit" className="admin-coupons-btn-submit">
                            Lưu Mã Coupon
                        </button>
                    </div>
                </form>
            )}

            {/* Filter and Search Section */}
            <div className="admin-coupons-filter-section">
                <div className="admin-coupons-search-wrapper">
                    <Search
                        size={18}
                        color="#64748b"
                        className="admin-coupons-search-icon"
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm mã giảm giá..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-coupons-search-input"
                    />
                </div>

                <div className="admin-coupons-filter-box">
                    <div className="admin-coupons-filter-grid">
                        <div className="admin-coupons-filter-group">
                            <span className="admin-coupons-filter-label">
                                Loại giảm giá:
                            </span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="admin-coupons-filter-select"
                            >
                                <option value="ALL">Tất cả các loại</option>
                                <option value="PERCENT">Theo phần trăm (%)</option>
                                <option value="AMOUNT">Theo số tiền (VNĐ)</option>
                            </select>
                        </div>

                        <div className="admin-coupons-filter-group">
                            <span className="admin-coupons-filter-label">
                                Trạng thái:
                            </span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="admin-coupons-filter-select"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="INACTIVE">Tạm khóa</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="admin-coupons-reset-btn"
                    >
                        Khôi phục
                    </button>
                </div>
            </div>

            {/* Coupons Table (Desktop) */}
            <div className="admin-desktop-table admin-coupons-table-wrapper">
                <table className="admin-coupons-table">
                    <thead>
                        <tr className="admin-coupons-table-header-row">
                            <th className="admin-coupons-th">Mã Code</th>
                            <th className="admin-coupons-th">Ưu Đãi Giảm</th>
                            <th className="admin-coupons-th">Đơn Tối Thiểu</th>
                            <th className="admin-coupons-th">Giới Hạn</th>
                            <th className="admin-coupons-th">Trạng Thái</th>
                            <th className="admin-coupons-th-right">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoupons.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="admin-coupons-empty-cell">
                                    Chưa có mã giảm giá nào. Hãy nhấn "Tạo Mã Giảm Giá" để thêm mới.
                                </td>
                            </tr>
                        ) : (
                            filteredCoupons.map((c) => (
                                <tr key={c.id} className="admin-coupons-row">
                                    <td className="admin-coupons-td">
                                        <span className="admin-coupons-code-badge">
                                            <Tag size={14} /> {c.code}
                                        </span>
                                    </td>

                                    <td className="admin-coupons-td-discount">
                                        {c.discountType === "PERCENT"
                                            ? `${c.discountValue}% (Tối đa ${formatPrice(
                                                  c.maxDiscountAmount
                                              )})`
                                            : formatPrice(c.discountValue)}
                                    </td>

                                    <td className="admin-coupons-td-muted">
                                        {formatPrice(c.minOrderValue)}
                                    </td>

                                    <td className="admin-coupons-td-muted">
                                        {c.usedCount || 0} /{" "}
                                        {c.usageLimit || "∞"} lượt
                                    </td>

                                    <td className="admin-coupons-td">
                                        <span
                                            className={`admin-coupons-status-badge ${
                                                c.status === "ACTIVE"
                                                    ? "active"
                                                    : "inactive"
                                            }`}
                                        >
                                            {c.status === "ACTIVE"
                                                ? "Hoạt động"
                                                : "Đã khóa"}
                                        </span>
                                    </td>

                                    <td className="admin-coupons-td-actions">
                                        <button
                                            type="button"
                                            onClick={() => setEditingCoupon(c)}
                                            className="admin-coupons-btn-edit"
                                            title="Sửa Coupon"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingCoupon(c)}
                                            className="admin-coupons-btn-delete"
                                            title="Xóa Coupon"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="admin-mobile-card-list">
                {filteredCoupons.map((c) => (
                    <div key={c.id} className="admin-card-item">
                        <div className="admin-card-header">
                            <span className="admin-coupons-code-badge">
                                <Tag size={14} /> {c.code}
                            </span>
                            <span className={`admin-coupons-status-badge ${c.status === "ACTIVE" ? "active" : "inactive"}`}>
                                {c.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                            </span>
                        </div>

                        <div className="admin-card-body">
                            <div className="admin-card-row">
                                <span className="admin-card-label">Ưu đãi giảm:</span>
                                <span className="admin-card-value" style={{ color: '#ef4444' }}>
                                    {c.discountType === "PERCENT"
                                        ? `${c.discountValue}% (Tối đa ${formatPrice(c.maxDiscountAmount)})`
                                        : formatPrice(c.discountValue)}
                                </span>
                            </div>
                            <div className="admin-card-row">
                                <span className="admin-card-label">Đơn tối thiểu:</span>
                                <span className="admin-card-value">{formatPrice(c.minOrderValue)}</span>
                            </div>
                            <div className="admin-card-row">
                                <span className="admin-card-label">Lượt dùng:</span>
                                <span className="admin-card-value">{c.usedCount || 0} / {c.usageLimit || "∞"} lượt</span>
                            </div>
                        </div>

                        <div className="admin-card-footer">
                            <button
                                type="button"
                                onClick={() => setEditingCoupon(c)}
                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Sửa coupon
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeletingCoupon(c)}
                                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
                {filteredCoupons.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Chưa có mã giảm giá nào. Hãy nhấn "Tạo Mã Giảm Giá" để thêm mới.
                    </div>
                )}
            </div>

            {/* Edit Coupon Modal */}
            {editingCoupon && (
                <AdminEditCoupon
                    coupon={editingCoupon}
                    onClose={() => setEditingCoupon(null)}
                    onSave={() => {
                        setEditingCoupon(null);
                        loadData?.();
                    }}
                    showToast={showToast}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingCoupon && (
                <div className="admin-coupons-delete-overlay">
                    <div className="admin-coupons-delete-card">
                        <div className="admin-coupons-delete-icon-box">
                            <Trash2 size={30} color="#ef4444" />
                        </div>
                        <h3 className="admin-coupons-delete-title">
                            Xác nhận xóa mã giảm giá
                        </h3>
                        <p className="admin-coupons-delete-desc">
                            Bạn có chắc chắn muốn xóa vĩnh viễn giới hạn mã{" "}
                            <strong>{deletingCoupon.code}</strong> khỏi hệ thống? Khách hàng sẽ không thể sử dụng mã này được nữa.
                        </p>
                        <div className="admin-coupons-delete-actions">
                            <button
                                type="button"
                                onClick={() => setDeletingCoupon(null)}
                                className="admin-coupons-delete-cancel-btn"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteCoupon}
                                className="admin-coupons-delete-confirm-btn"
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCoupons;