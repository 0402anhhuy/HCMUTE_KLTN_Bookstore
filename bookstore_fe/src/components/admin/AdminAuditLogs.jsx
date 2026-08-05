import { useState } from "react";
import { Shield, Search, RefreshCw } from "lucide-react";

const AdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLogs = auditLogs.filter((log) => {
        return (
            (log.action || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (log.entityName || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (log.username || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: 0,
                        }}
                    >
                        Nhật Ký Giám Sát Hệ Thống
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Ghi nhận toàn bộ thao tác thêm, sửa, xóa quan trọng trên
                        hệ thống
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ position: "relative" }}>
                        <Search
                            size={16}
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "11px",
                                color: "#94a3b8",
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Tìm hành động, người thực hiện..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: "9px 12px 9px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                width: "260px",
                                fontSize: "0.875rem",
                            }}
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (loadData) loadData();
                        }}
                        style={{
                            padding: "9px 16px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#475569",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                        }}
                    >
                        <RefreshCw size={15} /> Làm Mới
                    </button>
                </div>
            </div>

            {/* Logs Table */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                            }}
                        >
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Thời Gian
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Hành Động
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Đối Tượng
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                ID Đối Tượng
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Tài Khoản Thực Hiện
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    Không tìm thấy nhật ký hệ thống nào.
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <tr
                                    key={index}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            fontSize: "0.85rem",
                                            color: "#475569",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {log.createdAt
                                            ? new Date(
                                                  log.createdAt,
                                              ).toLocaleString("vi-VN")
                                            : "N/A"}
                                    </td>

                                    <td style={{ padding: "16px 20px" }}>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "6px",
                                                backgroundColor: "#eff6ff",
                                                color: "#1e40af",
                                                fontWeight: 700,
                                                fontSize: "0.8rem",
                                            }}
                                        >
                                            {log.action || "THAO_TAC"}
                                        </span>
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            fontWeight: 600,
                                            color: "#0f172a",
                                        }}
                                    >
                                        {log.entityName || "Hệ thống"}
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            color: "#64748b",
                                        }}
                                    >
                                        {log.entityId
                                            ? `#${log.entityId}`
                                            : "-"}
                                    </td>

                                    <td style={{ padding: "16px 20px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <Shield size={16} color="#2563eb" />
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color: "#1e293b",
                                                }}
                                            >
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
