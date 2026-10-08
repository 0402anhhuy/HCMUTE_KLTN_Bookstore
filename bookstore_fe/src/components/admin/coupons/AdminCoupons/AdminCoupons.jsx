import { useState } from "react";
import {
    Ticket,
    Plus,
    Trash2,
    Edit2,
    Search,
    X,
    CheckCircle2,
    AlertCircle,
    ShoppingBag,
    RotateCcw,
    Copy,
    Check,
} from "lucide-react";
import { useAdminCoupons } from "./useAdminCoupons";
import AdminEditCoupon from "../AdminEditCoupon/AdminEditCoupon";
import EmptyState from "@/components/common/EmptyState/EmptyState";
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
        stats,
    } = useAdminCoupons({ coupons, loadData, showToast });

    const [copiedCode, setCopiedCode] = useState(null);

    const handleCopyCode = (code) => {
        if (!code) return;
        navigator.clipboard?.writeText(code);
        setCopiedCode(code);
        showToast?.(`Đã sao chép mã: ${code}`, "success");
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const isFiltered =
        searchTerm !== "" || statusFilter !== "ALL" || typeFilter !== "ALL";

    return (
        <div className="admin-coupons-container">
            {/* Header */}
            <div className="admin-coupons-header">
                <div>
                    <h1 className="admin-coupons-title">
                        Quản lý Mã Giảm Giá
                    </h1>
                    <p className="admin-coupons-subtitle">
                        Thiết lập mã coupon ưu đãi, tỷ lệ chiết khấu và theo dõi lượt sử dụng toàn hệ thống
                    </p>
                </div>

                <div className="admin-coupons-header-actions">
                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className="admin-coupons-create-btn"
                    >
                        <Plus size={16} />
                        <span>{showForm ? "Đóng biểu mẫu" : "Tạo Mã Giảm Giá"}</span>
                    </button>
                </div>
            </div>

            {/* 4 KPI Stats Cards */}
            <div className="admin-coupons-stats-grid">
                {/* Card 1: Total */}
                <div className="admin-coupons-stat-card">
                    <div className="admin-coupons-stat-top">
                        <span className="admin-coupons-stat-label">TỔNG MÃ COUPON</span>
                        <div className="admin-coupons-stat-icon-wrap total">
                            <Ticket size={20} />
                        </div>
                    </div>
                    <div className="admin-coupons-stat-value">{stats.total}</div>
                    <div className="admin-coupons-stat-desc neutral">trên toàn hệ thống</div>
                </div>

                {/* Card 2: Active */}
                <div className="admin-coupons-stat-card">
                    <div className="admin-coupons-stat-top">
                        <span className="admin-coupons-stat-label">ĐANG HOẠT ĐỘNG</span>
                        <div className="admin-coupons-stat-icon-wrap active">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="admin-coupons-stat-value">{stats.active}</div>
                    <div className="admin-coupons-stat-desc success">sẵn sàng áp dụng</div>
                </div>

                {/* Card 3: Inactive */}
                <div className="admin-coupons-stat-card">
                    <div className="admin-coupons-stat-top">
                        <span className="admin-coupons-stat-label">TẠM KHÓA / HẾT HẠN</span>
                        <div className="admin-coupons-stat-icon-wrap inactive">
                            <AlertCircle size={20} />
                        </div>
                    </div>
                    <div className="admin-coupons-stat-value">{stats.inactive}</div>
                    <div className="admin-coupons-stat-desc danger">ngừng nhận áp dụng</div>
                </div>

                {/* Card 4: Total Used */}
                <div className="admin-coupons-stat-card">
                    <div className="admin-coupons-stat-top">
                        <span className="admin-coupons-stat-label">LƯỢT ĐÃ SỬ DỤNG</span>
                        <div className="admin-coupons-stat-icon-wrap used">
                            <ShoppingBag size={20} />
                        </div>
                    </div>
                    <div className="admin-coupons-stat-value">{stats.totalUsed}</div>
                    <div className="admin-coupons-stat-desc warning">lượt giao dịch thành công</div>
                </div>
            </div>

            {/* New Coupon Modal / Form */}
            {showForm && (
                <form onSubmit={handleCreateCoupon} className="admin-coupons-form">
                    <div className="admin-coupons-form-header">
                        <h3 className="admin-coupons-form-title">
                            Tạo Mã Coupon Ưu Đãi Mới
                        </h3>
                        <p className="admin-coupons-form-subtitle">
                            Nhập thông số chiết khấu và điều kiện áp dụng cho khách hàng
                        </p>
                    </div>

                    <div className="admin-coupons-form-grid">
                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Mã Coupon *
                            </label>
                            <input
                                type="text"
                                name="code"
                                required
                                placeholder="VD: BOOKSUMMER2026"
                                value={formData.code}
                                onChange={handleFormChange}
                                className="admin-coupons-input-code"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Giảm theo %
                            </label>
                            <input
                                type="number"
                                name="discountPercentage"
                                placeholder="VD: 15 (%)"
                                min="0"
                                max="100"
                                value={formData.discountPercentage}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Hoặc Giảm số tiền cố định (₫)
                            </label>
                            <input
                                type="number"
                                name="discountAmount"
                                placeholder="VD: 30000"
                                min="0"
                                value={formData.discountAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Đơn hàng tối thiểu (₫)
                            </label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                min="0"
                                value={formData.minOrderAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Giảm tối đa (₫)
                            </label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                min="0"
                                value={formData.maxDiscountAmount}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Giới hạn lượt dùng
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                min="1"
                                value={formData.usageLimit}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Ngày bắt đầu
                            </label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={handleFormChange}
                                className="admin-coupons-input"
                            />
                        </div>

                        <div className="admin-coupons-form-group">
                            <label className="admin-coupons-form-label">
                                Ngày kết thúc
                            </label>
                            <input
                                type="date"
                                name="validTo"
                                value={formData.validTo}
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
                            Hủy bỏ
                        </button>
                        <button type="submit" className="admin-coupons-btn-submit">
                            Lưu Mã Coupon
                        </button>
                    </div>
                </form>
            )}

            {/* Filter and Search Section */}
            <div className="admin-coupons-filter-bar">
                <div className="admin-coupons-search-wrapper">
                    <Search size={18} className="admin-coupons-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã coupon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-coupons-search-input"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            className="admin-coupons-search-clear"
                            onClick={() => setSearchTerm("")}
                            title="Xóa tìm kiếm"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="admin-coupons-filter-group">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="admin-coupons-filter-select"
                    >
                        <option value="ALL">Tất cả loại giảm</option>
                        <option value="PERCENT">Theo phần trăm (%)</option>
                        <option value="AMOUNT">Theo số tiền cố định (₫)</option>
                    </select>
                </div>

                <div className="admin-coupons-filter-group">
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

                {isFiltered && (
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="admin-coupons-reset-btn"
                        title="Đặt lại bộ lọc"
                    >
                        <RotateCcw size={15} />
                        <span>Đặt lại</span>
                    </button>
                )}
            </div>

            {/* Table (Desktop) / Cards (Mobile) / EmptyState */}
            {filteredCoupons.length === 0 ? (
                <div className="admin-coupons-empty-container">
                    <EmptyState
                        icon={Ticket}
                        title="Không tìm thấy mã giảm giá nào"
                        description={
                            isFiltered
                                ? "Không có mã coupon nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm. Vui lòng thử lại với tiêu chí khác."
                                : "Chưa có mã giảm giá nào trong hệ thống. Hãy tạo mã coupon đầu tiên!"
                        }
                        actionText={isFiltered ? "Đặt lại bộ lọc" : "Tạo Mã Giảm Giá"}
                        onAction={isFiltered ? handleResetFilter : () => setShowForm(true)}
                        actionIcon={isFiltered ? RotateCcw : Plus}
                    />
                </div>
            ) : (
                <>
                    {/* Coupons Table (Desktop) */}
                    <div className="admin-desktop-table admin-coupons-table-wrapper">
                        <table className="admin-coupons-table">
                            <thead>
                                <tr className="admin-coupons-table-header-row">
                                    <th className="admin-coupons-th">MÃ COUPON</th>
                                    <th className="admin-coupons-th">ƯU ĐÃI GIẢM</th>
                                    <th className="admin-coupons-th">ĐƠN TỐI THIỂU</th>
                                    <th className="admin-coupons-th">LƯỢT DÙNG</th>
                                    <th className="admin-coupons-th-center">TRẠNG THÁI</th>
                                    <th className="admin-coupons-th-right">THAO TÁC</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((c) => (
                                    <tr key={c.id} className="admin-coupons-row">
                                        <td className="admin-coupons-td">
                                            <div className="admin-coupons-code-wrap">
                                                <span className="admin-coupons-code-badge">
                                                    <Ticket size={14} />
                                                    <span>{c.code}</span>
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleCopyCode(c.code)}
                                                    className="admin-coupons-btn-copy"
                                                    title="Sao chép mã"
                                                >
                                                    {copiedCode === c.code ? (
                                                        <Check size={13} color="#059669" />
                                                    ) : (
                                                        <Copy size={13} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>

                                        <td className="admin-coupons-td">
                                            <span className="admin-coupons-discount-value">
                                                {c.discountType === "PERCENT"
                                                    ? `${c.discountValue}% (Tối đa ${formatPrice(
                                                          c.maxDiscountAmount
                                                      )})`
                                                    : formatPrice(c.discountValue)}
                                            </span>
                                        </td>

                                        <td className="admin-coupons-td-muted">
                                            {formatPrice(c.minOrderValue)}
                                        </td>

                                        <td className="admin-coupons-td-muted">
                                            <span className="admin-coupons-usage-pill">
                                                <strong>{c.usedCount || 0}</strong> /{" "}
                                                {c.usageLimit || "∞"} lượt
                                            </span>
                                        </td>

                                        <td className="admin-coupons-td-center">
                                            <span
                                                className={`admin-coupons-status-badge ${
                                                    c.status === "ACTIVE"
                                                        ? "active"
                                                        : "inactive"
                                                }`}
                                            >
                                                <span className="admin-status-dot" />
                                                {c.status === "ACTIVE"
                                                    ? "Hoạt động"
                                                    : "Đã khóa"}
                                            </span>
                                        </td>

                                        <td className="admin-coupons-td-actions">
                                            <button
                                                type="button"
                                                onClick={() => setEditingCoupon(c)}
                                                className="admin-coupons-btn-action edit"
                                                title="Chỉnh sửa Coupon"
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setDeletingCoupon(c)}
                                                className="admin-coupons-btn-action delete"
                                                title="Xóa Coupon"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards List View */}
                    <div className="admin-mobile-card-list">
                        {filteredCoupons.map((c) => (
                            <div key={c.id} className="admin-card-item">
                                <div className="admin-card-header">
                                    <div className="admin-coupons-code-wrap">
                                        <span className="admin-coupons-code-badge">
                                            <Ticket size={14} />
                                            <span>{c.code}</span>
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyCode(c.code)}
                                            className="admin-coupons-btn-copy"
                                            title="Sao chép mã"
                                        >
                                            {copiedCode === c.code ? (
                                                <Check size={13} color="#059669" />
                                            ) : (
                                                <Copy size={13} />
                                            )}
                                        </button>
                                    </div>
                                    <span
                                        className={`admin-coupons-status-badge ${
                                            c.status === "ACTIVE" ? "active" : "inactive"
                                        }`}
                                    >
                                        <span className="admin-status-dot" />
                                        {c.status === "ACTIVE" ? "Hoạt động" : "Đã khóa"}
                                    </span>
                                </div>

                                <div className="admin-card-body">
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Ưu đãi giảm:</span>
                                        <span className="admin-card-value discount">
                                            {c.discountType === "PERCENT"
                                                ? `${c.discountValue}% (Tối đa ${formatPrice(
                                                      c.maxDiscountAmount
                                                  )})`
                                                : formatPrice(c.discountValue)}
                                        </span>
                                    </div>
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Đơn tối thiểu:</span>
                                        <span className="admin-card-value">
                                            {formatPrice(c.minOrderValue)}
                                        </span>
                                    </div>
                                    <div className="admin-card-row">
                                        <span className="admin-card-label">Lượt dùng:</span>
                                        <span className="admin-card-value">
                                            <strong>{c.usedCount || 0}</strong> /{" "}
                                            {c.usageLimit || "∞"} lượt
                                        </span>
                                    </div>
                                </div>

                                <div className="admin-card-footer">
                                    <button
                                        type="button"
                                        onClick={() => setEditingCoupon(c)}
                                        className="admin-card-btn-edit"
                                    >
                                        <Edit2 size={15} />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeletingCoupon(c)}
                                        className="admin-card-btn-delete"
                                    >
                                        <Trash2 size={15} />
                                        <span>Xóa</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

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
                            <Trash2 size={28} />
                        </div>
                        <h3 className="admin-coupons-delete-title">
                            Xác nhận xóa mã giảm giá
                        </h3>
                        <p className="admin-coupons-delete-desc">
                            Bạn có chắc chắn muốn xóa vĩnh viễn mã{" "}
                            <strong>{deletingCoupon.code}</strong> khỏi hệ thống? Khách hàng sẽ không thể sử dụng mã này được nữa.
                        </p>
                        <div className="admin-coupons-delete-actions">
                            <button
                                type="button"
                                onClick={() => setDeletingCoupon(null)}
                                className="admin-coupons-delete-cancel-btn"
                            >
                                Hủy bỏ
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