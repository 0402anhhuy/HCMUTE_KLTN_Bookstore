import {
    ShieldAlert,
    RefreshCw,
    Download,
    Search,
    Filter,
    RotateCcw,
    PlusCircle,
    FileEdit,
    AlertTriangle,
    User,
    Calendar,
    Eye,
    X,
    ChevronLeft,
    ChevronRight,
    Info,
    Clock,
    Layers,
    Lock,
} from "lucide-react";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import { useAdminAuditLogs } from "./useAdminAuditLogs";
import "./AdminAuditLogs.css";

const getActionBadgeClass = (action = "") => {
    const act = String(action || "").toUpperCase();
    if (act.includes("CREATE") || act.includes("ADD") || act.includes("INSERT")) {
        return "badge-create";
    }
    if (
        act.includes("UPDATE") ||
        act.includes("EDIT") ||
        act.includes("MODIFY") ||
        act.includes("TOGGLE") ||
        act.includes("STATUS")
    ) {
        return "badge-update";
    }
    if (act.includes("DELETE") || act.includes("REMOVE")) {
        return "badge-delete";
    }
    if (
        act.includes("BLOCK") ||
        act.includes("BAN") ||
        act.includes("REJECT") ||
        act.includes("APPROVE")
    ) {
        return "badge-sensitive";
    }
    if (act.includes("LOGIN") || act.includes("AUTH")) {
        return "badge-auth";
    }
    return "badge-default";
};

const AdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const {
        searchTerm,
        setSearchTerm,
        actionFilter,
        setActionFilter,
        entityFilter,
        setEntityFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,
        filteredLogs,
        paginatedLogs,
        kpiMetrics,
        isRefreshing,
        selectedLog,
        setSelectedLog,
        handleRefresh,
        handleResetFilter,
        exportToCSV,
    } = useAdminAuditLogs({ auditLogs, loadData });

    return (
        <div className="admin-audit-logs-container">
            {/* 1. Header Bar */}
            <div className="admin-audit-logs-header">
                <div className="admin-audit-logs-header-left">
                    <div className="admin-audit-logs-header-badge">
                        <ShieldAlert size={14} />
                        <span>Giám sát hệ thống</span>
                    </div>
                    <h1 className="admin-audit-logs-title">
                        Nhật Ký & Lịch Sử Hoạt Động
                    </h1>
                    <p className="admin-audit-logs-subtitle">
                        Theo dõi toàn diện các thao tác quản trị, kiểm duyệt dữ liệu và thay đổi trạng thái trong hệ thống
                    </p>
                </div>

                <div className="admin-audit-logs-header-actions">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="admin-audit-logs-btn-secondary"
                        title="Tải lại danh sách nhật ký mới nhất"
                    >
                        <RefreshCw
                            size={16}
                            className={isRefreshing ? "spin-icon" : ""}
                        />
                        <span>{isRefreshing ? "Đang tải..." : "Làm mới"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="admin-audit-logs-btn-primary"
                        title="Xuất danh sách nhật ký ra tệp CSV (UTF-8)"
                    >
                        <Download size={16} />
                        <span>Xuất CSV</span>
                    </button>
                </div>
            </div>

            {/* 2. 4 KPI Metrics Summary Cards */}
            <div className="admin-audit-logs-kpi-grid">
                {/* KPI 1: Tổng số nhật ký */}
                <div className="admin-audit-kpi-card primary-kpi">
                    <div className="admin-audit-kpi-header">
                        <span className="admin-audit-kpi-label">
                            Tổng số hoạt động
                        </span>
                        <div className="admin-audit-kpi-icon-box red">
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                    <div className="admin-audit-kpi-value red-text">
                        {kpiMetrics.total}
                    </div>
                    <div className="admin-audit-kpi-footer">
                        <span className="kpi-tag neutral">Toàn hệ thống</span>
                        <span className="kpi-subtext">Lịch sử ghi nhận</span>
                    </div>
                </div>

                {/* KPI 2: Thao tác tạo mới */}
                <div className="admin-audit-kpi-card">
                    <div className="admin-audit-kpi-header">
                        <span className="admin-audit-kpi-label">
                            Tạo mới (Create)
                        </span>
                        <div className="admin-audit-kpi-icon-box green">
                            <PlusCircle size={20} />
                        </div>
                    </div>
                    <div className="admin-audit-kpi-value">
                        {kpiMetrics.createCount}
                    </div>
                    <div className="admin-audit-kpi-footer">
                        <span className="kpi-tag green">Thêm dữ liệu</span>
                        <span className="kpi-subtext">Tạo tài khoản / mục</span>
                    </div>
                </div>

                {/* KPI 3: Cập nhật & Chỉnh sửa */}
                <div className="admin-audit-kpi-card">
                    <div className="admin-audit-kpi-header">
                        <span className="admin-audit-kpi-label">
                            Cập nhật (Update)
                        </span>
                        <div className="admin-audit-kpi-icon-box blue">
                            <FileEdit size={20} />
                        </div>
                    </div>
                    <div className="admin-audit-kpi-value">
                        {kpiMetrics.updateCount}
                    </div>
                    <div className="admin-audit-kpi-footer">
                        <span className="kpi-tag blue">Chỉnh sửa</span>
                        <span className="kpi-subtext">Thay đổi cấu hình/thông tin</span>
                    </div>
                </div>

                {/* KPI 4: Thao tác nhạy cảm */}
                <div className="admin-audit-kpi-card">
                    <div className="admin-audit-kpi-header">
                        <span className="admin-audit-kpi-label">
                            Nhạy cảm (Delete/Block)
                        </span>
                        <div className="admin-audit-kpi-icon-box amber">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="admin-audit-kpi-value">
                        {kpiMetrics.sensitiveCount}
                    </div>
                    <div className="admin-audit-kpi-footer">
                        <span className="kpi-tag amber">Cần lưu ý</span>
                        <span className="kpi-subtext">Xóa hoặc khóa tài khoản</span>
                    </div>
                </div>
            </div>

            {/* 3. Search & Filter Bar */}
            <div className="admin-audit-logs-filter-card">
                <div className="admin-audit-logs-search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm theo hành động, người thực hiện, đối tượng, mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="admin-audit-logs-search-input"
                    />
                </div>

                <div className="admin-audit-logs-filter-group">
                    {/* Action Filter */}
                    <div className="admin-audit-logs-filter-item">
                        <Filter size={15} className="filter-icon" />
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="admin-audit-logs-filter-select"
                        >
                            <option value="ALL">Tất cả hành động</option>
                            <option value="CREATE">Tạo mới (Create/Add)</option>
                            <option value="UPDATE">Cập nhật (Update/Edit)</option>
                            <option value="DELETE">Xóa (Delete/Remove)</option>
                            <option value="SECURITY">Kiểm duyệt / Khóa (Block/Approve)</option>
                            <option value="LOGIN">Đăng nhập (Login/Auth)</option>
                        </select>
                    </div>

                    {/* Entity Filter */}
                    <div className="admin-audit-logs-filter-item">
                        <Layers size={15} className="filter-icon" />
                        <select
                            value={entityFilter}
                            onChange={(e) => setEntityFilter(e.target.value)}
                            className="admin-audit-logs-filter-select"
                        >
                            <option value="ALL">Tất cả thực thể</option>
                            <option value="USER">Người dùng (User)</option>
                            <option value="PRODUCT">Sản phẩm (Product)</option>
                            <option value="COUPON">Mã giảm giá (Coupon)</option>
                            <option value="PROMOTION">Khuyến mãi (Promotion)</option>
                            <option value="ORDER">Đơn hàng (Order)</option>
                            <option value="CATEGORY">Danh mục (Category)</option>
                            <option value="SYSTEM">Hệ thống (System)</option>
                        </select>
                    </div>

                    {/* Reset Button */}
                    <button
                        type="button"
                        onClick={handleResetFilter}
                        className="admin-audit-logs-reset-btn"
                        title="Đặt lại toàn bộ bộ lọc"
                    >
                        <RotateCcw size={15} />
                        <span>Khôi phục</span>
                    </button>
                </div>
            </div>

            {/* 4. Table (Desktop) / Cards (Mobile) Container */}
            <div className="admin-audit-logs-table-card">
                {/* Header row in table card */}
                <div className="admin-audit-table-card-header">
                    <div className="table-card-header-left">
                        <h2 className="table-card-title">
                            Danh sách nhật ký
                        </h2>
                        <span className="table-card-badge">
                            {filteredLogs.length} ghi nhận
                        </span>
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="admin-audit-logs-table-scroll-wrapper">
                    {paginatedLogs.length > 0 ? (
                        <table className="admin-audit-logs-table">
                            <thead>
                                <tr className="admin-audit-logs-thead-row">
                                    <th className="admin-audit-logs-th">Thời Gian</th>
                                    <th className="admin-audit-logs-th">Hành Động</th>
                                    <th className="admin-audit-logs-th">Đối Tượng</th>
                                    <th className="admin-audit-logs-th">Chi Tiết / Mô Tả</th>
                                    <th className="admin-audit-logs-th">Người Thực Hiện</th>
                                    <th className="admin-audit-logs-th align-center">Thao Tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.map((log, index) => {
                                    const actionClass = getActionBadgeClass(log.action);
                                    return (
                                        <tr
                                            key={log.id || index}
                                            className="admin-audit-logs-row"
                                        >
                                            <td className="admin-audit-logs-td-time">
                                                <div className="time-cell">
                                                    <Calendar size={14} className="cell-icon" />
                                                    <span>
                                                        {log.createdAt
                                                            ? new Date(
                                                                  log.createdAt
                                                              ).toLocaleString("vi-VN", {
                                                                  day: "2-digit",
                                                                  month: "2-digit",
                                                                  year: "numeric",
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                                  second: "2-digit",
                                                              })
                                                            : "N/A"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="admin-audit-logs-td-action">
                                                <span
                                                    className={`action-badge ${actionClass}`}
                                                >
                                                    {log.action || "THAO_TAC"}
                                                </span>
                                            </td>

                                            <td className="admin-audit-logs-td-entity">
                                                <div className="entity-cell">
                                                    <span className="entity-name">
                                                        {log.entityName || "Hệ thống"}
                                                    </span>
                                                    {log.entityId && (
                                                        <span className="entity-id">
                                                            #{log.entityId}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="admin-audit-logs-td-desc">
                                                <div
                                                    className="desc-text-clamp"
                                                    title={log.description || ""}
                                                >
                                                    {log.description || "Không có mô tả chi tiết."}
                                                </div>
                                            </td>

                                            <td className="admin-audit-logs-td-user">
                                                <div className="admin-audit-logs-user-box">
                                                    <div className="user-avatar-mini">
                                                        <User size={14} />
                                                    </div>
                                                    <span className="admin-audit-logs-username">
                                                        {log.username || "Hệ thống"}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="admin-audit-logs-td-view align-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedLog(log)}
                                                    className="admin-audit-view-btn"
                                                    title="Xem toàn bộ thông tin chi tiết nhật ký này"
                                                >
                                                    <Eye size={15} />
                                                    <span>Chi tiết</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="admin-audit-empty-container">
                            <EmptyState
                                icon={ShieldAlert}
                                title="Không tìm thấy nhật ký nào"
                                description={
                                    searchTerm || actionFilter !== "ALL" || entityFilter !== "ALL"
                                        ? "Không có hoạt động nào phù hợp với điều kiện tìm kiếm và bộ lọc hiện tại."
                                        : "Chưa ghi nhận hoạt động giám sát nào trong hệ thống."
                                }
                                actionText={
                                    searchTerm || actionFilter !== "ALL" || entityFilter !== "ALL"
                                        ? "Khôi phục bộ lọc"
                                        : undefined
                                }
                                onAction={handleResetFilter}
                            />
                        </div>
                    )}
                </div>

                {/* Mobile Cards List View (<768px) */}
                <div className="admin-audit-logs-mobile-cards">
                    {paginatedLogs.length > 0 ? (
                        paginatedLogs.map((log, index) => {
                            const actionClass = getActionBadgeClass(log.action);
                            return (
                                <div
                                    key={log.id || index}
                                    className="admin-audit-mobile-card"
                                >
                                    <div className="mobile-card-header">
                                        <span className={`action-badge ${actionClass}`}>
                                            {log.action || "THAO_TAC"}
                                        </span>
                                        <span className="mobile-card-time">
                                            {log.createdAt
                                                ? new Date(log.createdAt).toLocaleString("vi-VN")
                                                : "N/A"}
                                        </span>
                                    </div>

                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Đối tượng:</span>
                                            <span className="mobile-card-value font-bold">
                                                {log.entityName || "Hệ thống"}{" "}
                                                {log.entityId ? `#${log.entityId}` : ""}
                                            </span>
                                        </div>

                                        <div className="mobile-card-row">
                                            <span className="mobile-card-label">Người thực hiện:</span>
                                            <div className="mobile-user-box">
                                                <User size={13} />
                                                <span>{log.username || "Hệ thống"}</span>
                                            </div>
                                        </div>

                                        {log.description && (
                                            <div className="mobile-card-desc-box">
                                                <span className="mobile-desc-label">Mô tả:</span>
                                                <p className="mobile-desc-text">
                                                    {log.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mobile-card-footer">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedLog(log)}
                                            className="mobile-view-detail-btn"
                                        >
                                            <Eye size={15} />
                                            <span>Xem toàn bộ thông tin</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="admin-audit-empty-container">
                            <EmptyState
                                icon={ShieldAlert}
                                title="Không tìm thấy nhật ký nào"
                                description="Không có hoạt động nào phù hợp với bộ lọc hiện tại."
                            />
                        </div>
                    )}
                </div>

                {/* 5. Pagination Footer */}
                {totalPages > 1 && (
                    <div className="admin-audit-logs-pagination">
                        <div className="admin-audit-logs-pagination-info">
                            Hiển thị{" "}
                            <strong>
                                {Math.min(
                                    (currentPage - 1) * pageSize + 1,
                                    filteredLogs.length
                                )}
                            </strong>{" "}
                            -{" "}
                            <strong>
                                {Math.min(
                                    currentPage * pageSize,
                                    filteredLogs.length
                                )}
                            </strong>{" "}
                            trên tổng số <strong>{filteredLogs.length}</strong> nhật ký
                        </div>

                        <div className="admin-audit-logs-pagination-controls">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="admin-audit-page-btn"
                                aria-label="Trang trước"
                            >
                                <ChevronLeft size={16} />
                                <span>Trước</span>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                    return (
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - currentPage) <= 1
                                    );
                                })
                                .map((page, idx, arr) => (
                                    <span key={page} className="pagination-numbers-wrap">
                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                            <span className="pagination-dots">...</span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`admin-audit-number-btn ${
                                                currentPage === page ? "active" : ""
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    </span>
                                ))}

                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                className="admin-audit-page-btn"
                                aria-label="Trang sau"
                            >
                                <span>Tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 6. Modal Xem Chi Tiết Nhật Ký (Audit Log Detail Modal) */}
            {selectedLog && (
                <div
                    className="admin-audit-modal-backdrop"
                    onClick={() => setSelectedLog(null)}
                >
                    <div
                        className="admin-audit-modal-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-audit-modal-header">
                            <div className="modal-header-title-box">
                                <ShieldAlert size={20} className="modal-header-icon" />
                                <div>
                                    <h3 className="admin-audit-modal-title">
                                        Chi Tiết Hoạt Động Giám Sát
                                    </h3>
                                    <span className="admin-audit-modal-subtitle">
                                        Mã Log #{selectedLog.id || "N/A"}
                                    </span>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="admin-audit-modal-close-btn"
                                aria-label="Đóng modal"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="admin-audit-modal-body">
                            <div className="modal-info-grid">
                                <div className="modal-info-item">
                                    <span className="modal-info-label">
                                        <Clock size={14} /> Thời gian thực hiện:
                                    </span>
                                    <span className="modal-info-value">
                                        {selectedLog.createdAt
                                            ? new Date(selectedLog.createdAt).toLocaleString("vi-VN", {
                                                  day: "2-digit",
                                                  month: "2-digit",
                                                  year: "numeric",
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                              })
                                            : "N/A"}
                                    </span>
                                </div>

                                <div className="modal-info-item">
                                    <span className="modal-info-label">
                                        <User size={14} /> Tài khoản thực hiện:
                                    </span>
                                    <span className="modal-info-value font-bold text-slate-800">
                                        {selectedLog.username || "Hệ thống"}
                                    </span>
                                </div>

                                <div className="modal-info-item">
                                    <span className="modal-info-label">
                                        <Filter size={14} /> Hành động:
                                    </span>
                                    <span
                                        className={`action-badge ${getActionBadgeClass(
                                            selectedLog.action
                                        )}`}
                                    >
                                        {selectedLog.action || "THAO_TAC"}
                                    </span>
                                </div>

                                <div className="modal-info-item">
                                    <span className="modal-info-label">
                                        <Layers size={14} /> Đối tượng tác động:
                                    </span>
                                    <span className="modal-info-value font-bold">
                                        {selectedLog.entityName || "Hệ thống"}{" "}
                                        {selectedLog.entityId
                                            ? `(#${selectedLog.entityId})`
                                            : ""}
                                    </span>
                                </div>
                            </div>

                            <div className="modal-desc-section">
                                <span className="modal-desc-title">
                                    <Info size={15} /> Nội dung mô tả chi tiết:
                                </span>
                                <div className="modal-desc-content">
                                    {selectedLog.description ||
                                        "Không có nội dung mô tả chi tiết cho hoạt động này."}
                                </div>
                            </div>
                        </div>

                        <div className="admin-audit-modal-footer">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="admin-audit-modal-btn"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;