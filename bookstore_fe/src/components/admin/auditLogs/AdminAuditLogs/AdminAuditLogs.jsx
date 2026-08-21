import { Shield, Search, RefreshCw } from "lucide-react";
import { useAdminAuditLogs } from "./useAdminAuditLogs";
import "./AdminAuditLogs.css";

const AdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const { searchTerm, setSearchTerm, filteredLogs, handleRefresh } =
        useAdminAuditLogs({ auditLogs, loadData });

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
                    <div className="admin-audit-logs-search-wrapper">
                        <Search
                            size={16}
                            className="admin-audit-logs-search-icon"
                        />
                        <input
                            type="text"
                            placeholder="Tìm hành động, người thực hiện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-audit-logs-search-input"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleRefresh}
                        className="admin-audit-logs-refresh-btn"
                    >
                        <RefreshCw size={15} /> Làm Mới
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="admin-audit-logs-table-wrapper">
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
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="admin-audit-logs-empty-cell"
                                >
                                    Không tìm thấy nhật ký hệ thống nào.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log, index) => (
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
        </div>
    );
};

export default AdminAuditLogs;