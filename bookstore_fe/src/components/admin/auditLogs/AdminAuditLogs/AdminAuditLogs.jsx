import { Shield, Search, RefreshCw } from "lucide-react";
import { useAdminAuditLogs } from "./useAdminAuditLogs";
import "./AdminAuditLogs.css";

const AdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const {
        searchTerm,
        setSearchTerm,
        actionFilter,
        setActionFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,
        filteredLogs,
        paginatedLogs,
        handleRefresh,
        handleResetFilter,
    } = useAdminAuditLogs({ auditLogs, loadData });

    return (
        <div className="admin-audit-logs-container">
            {/* Header */}
            <div className="admin-audit-logs-header">
                <div>
                    <h2 className="admin-audit-logs-title">
                        Nhật Ký Giám Sát Hệ Thống
                    </h2>
                    <span className="admin-audit-logs-subtitle">
                        Ghi nhận toàn bộ thao tác thêm, sửa, xóa quan trọng trên
                        hệ thống
                    </span>
                </div>

                <div className="admin-audit-logs-actions">
                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="admin-audit-logs-refresh-btn"
                    >
                        <RefreshCw size={15} /> Làm Mới
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="admin-audit-logs-filter-card">
                <div className="admin-audit-logs-search-wrapper">
                    <Search
                        size={16}
                        className="admin-audit-logs-search-icon"
                    />
                    <input
                        type="text"
                        placeholder="Tìm hành động, người thực hiện..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="admin-audit-logs-search-input"
                    />
                </div>

                <div className="admin-audit-logs-filter-item">
                    <span className="admin-audit-logs-filter-label">Loại hành động:</span>
                    <select
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="admin-audit-logs-filter-select"
                    >
                        <option value="ALL">Tất cả hành động</option>
                        <option value="CREATE">Tạo mới</option>
                        <option value="UPDATE">Cập nhật</option>
                        <option value="DELETE">Xóa</option>
                        <option value="LOGIN">Đăng nhập</option>
                    </select>
                </div>

                <button
                    type="button"
                    onClick={handleResetFilter}
                    className="admin-audit-logs-reset-btn"
                >
                    Khôi phục
                </button>
            </div>

            {/* Logs Table (Desktop) */}
            <div className="admin-desktop-table admin-audit-logs-table-wrapper">
                <table className="admin-audit-logs-table">
                    <thead>
                        <tr className="admin-audit-logs-thead-row">
                            <th className="admin-audit-logs-th">Thời Gian</th>
                            <th className="admin-audit-logs-th">Hành Động</th>
                            <th className="admin-audit-logs-th">Đối Tượng</th>
                            <th className="admin-audit-logs-th">ID Đối Tượng</th>
                            <th className="admin-audit-logs-th">
                                Tài Khoản Thực Hiện
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="admin-audit-logs-empty-cell"
                                >
                                    Không tìm thấy nhật ký hệ thống nào.
                                </td>
                            </tr>
                        ) : (
                            paginatedLogs.map((log, index) => (
                                <tr key={index} className="admin-audit-logs-row">
                                    <td className="admin-audit-logs-td-time">
                                        {log.createdAt
                                            ? new Date(
                                                  log.createdAt
                                              ).toLocaleString("vi-VN")
                                            : "N/A"}
                                    </td>

                                    <td className="admin-audit-logs-td-action">
                                        <span className="admin-audit-logs-action-badge">
                                            {log.action || "THAO_TAC"}
                                        </span>
                                    </td>

                                    <td className="admin-audit-logs-td-entity">
                                        {log.entityName || "Hệ thống"}
                                    </td>

                                    <td className="admin-audit-logs-td-id">
                                        {log.entityId
                                            ? `#${log.entityId}`
                                            : "-"}
                                    </td>

                                    <td className="admin-audit-logs-td-user">
                                        <div className="admin-audit-logs-user-box">
                                            <Shield
                                                size={16}
                                                color="#2563eb"
                                            />
                                            <span className="admin-audit-logs-username">
                                                {log.username || "Hệ thống"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards List View */}
            <div className="admin-mobile-card-list">
                {paginatedLogs.map((log, index) => (
                    <div key={index} className="admin-card-item">
                        <div className="admin-card-header">
                            <span className="admin-audit-logs-action-badge">
                                {log.action || "THAO_TAC"}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                {log.createdAt ? new Date(log.createdAt).toLocaleString("vi-VN") : "N/A"}
                            </span>
                        </div>

                        <div className="admin-card-body">
                            <div className="admin-card-row">
                                <span className="admin-card-label">Đối tượng:</span>
                                <span className="admin-card-value">
                                    {log.entityName || "Hệ thống"} {log.entityId ? `#${log.entityId}` : ""}
                                </span>
                            </div>
                            <div className="admin-card-row">
                                <span className="admin-card-label">Tài khoản thực hiện:</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Shield size={14} color="#2563eb" />
                                    <span style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '0.85rem' }}>
                                        {log.username || "Hệ thống"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {paginatedLogs.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Không tìm thấy nhật ký hệ thống nào.
                    </div>
                )}
            </div>

            {/* Pagination Controls Bar */}
            {filteredLogs.length > 0 && (
                <div className="admin-audit-logs-pagination">
                    <div className="admin-audit-logs-pagination-info">
                        Hiển thị {Math.min((currentPage - 1) * pageSize + 1, filteredLogs.length)} - {Math.min(currentPage * pageSize, filteredLogs.length)} trên tổng số {filteredLogs.length} kết quả
                    </div>
                    <div className="admin-audit-logs-pagination-controls">
                        <button
                            type="button"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className="admin-audit-logs-page-btn"
                        >
                            Trang trước
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`admin-audit-logs-page-btn ${
                                    currentPage === page ? "active" : ""
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            className="admin-audit-logs-page-btn"
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAuditLogs;