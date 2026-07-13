import { useState } from "react";
import { Search, Lock, Unlock, UserCheck } from "lucide-react";
import api from "../../services/api";

const AdminUsers = ({ users = [], loadData, showToast }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const filteredUsers = users.filter((u) => {
        const matchNameOrEmail =
            (u.fullName || "")
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.phone || "").includes(searchTerm);
        const matchRole = !roleFilter || u.role === roleFilter;
        return matchNameOrEmail && matchRole;
    });

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED";
        setUpdatingId(user.id);
        try {
            await api.put(`/admin/users/${user.id}/status?status=${newStatus}`);
            showToast(
                `Đã chuyển trạng thái tài khoản ${user.email} sang ${newStatus === "ACTIVE" ? "Hoạt động" : "Đã khóa"}`,
                "success",
            );
            if (loadData) loadData();
        } catch (error) {
            console.error("Failed to update status", error);
            showToast("Lỗi cập nhật trạng thái tài khoản", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdatingId(userId);
        try {
            await api.put(`/admin/users/${userId}/role?role=${newRole}`);
            showToast(
                `Đã cập nhật vai trò thành công sang ${newRole}`,
                "success",
            );
            if (loadData) loadData();
        } catch (error) {
            console.error("Failed to update role", error);
            showToast("Lỗi cập nhật vai trò người dùng", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header Controls */}
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
                        Quản Lý Người Dùng & Phân Quyền
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Xem danh sách, kiểm soát trạng thái hoạt động và cấp
                        quyền hệ thống
                    </span>
                </div>

                {/* Filters */}
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                    }}
                >
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
                            placeholder="Tìm theo tên, email, SĐT..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: "9px 12px 9px 36px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                width: "240px",
                                fontSize: "0.875rem",
                            }}
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        style={{
                            padding: "9px 14px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                        }}
                    >
                        <option value="">Tất cả vai trò</option>
                        <option value="USER">Khách hàng (USER)</option>
                        <option value="MANAGER">Quản lý (MANAGER)</option>
                        <option value="ADMIN">Quản trị viên (ADMIN)</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
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
                                Tài Khoản
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
                                Liên Hệ
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
                                Vai Trò
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
                                Trạng Thái
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                    textAlign: "right",
                                }}
                            >
                                Thao Tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    Không tìm thấy người dùng phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr
                                    key={u.id}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <td style={{ padding: "16px 20px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: "38px",
                                                    height: "38px",
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        u.role === "ADMIN"
                                                            ? "#1e40af"
                                                            : u.role ===
                                                                "MANAGER"
                                                              ? "#7c3aed"
                                                              : "#e2e8f0",
                                                    color:
                                                        u.role === "USER"
                                                            ? "#475569"
                                                            : "#ffffff",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 700,
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {u.fullName
                                                    ? u.fullName
                                                          .charAt(0)
                                                          .toUpperCase()
                                                    : "U"}
                                            </div>
                                            <div>
                                                <div
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: "0.9rem",
                                                        color: "#0f172a",
                                                    }}
                                                >
                                                    {u.fullName ||
                                                        "Chưa đặt tên"}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.8rem",
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    {u.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            fontSize: "0.875rem",
                                            color: "#334155",
                                        }}
                                    >
                                        {u.phone || "Chưa cập nhật"}
                                    </td>

                                    <td style={{ padding: "16px 20px" }}>
                                        <select
                                            value={u.role || "USER"}
                                            disabled={updatingId === u.id}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    u.id,
                                                    e.target.value,
                                                )
                                            }
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #cbd5e1",
                                                backgroundColor:
                                                    u.role === "ADMIN"
                                                        ? "#eff6ff"
                                                        : "#ffffff",
                                                color:
                                                    u.role === "ADMIN"
                                                        ? "#1e40af"
                                                        : "#1e293b",
                                                fontWeight: 600,
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="MANAGER">
                                                MANAGER
                                            </option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>

                                    <td style={{ padding: "16px 20px" }}>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                backgroundColor:
                                                    u.status === "LOCKED"
                                                        ? "#fef2f2"
                                                        : "#ecfdf5",
                                                color:
                                                    u.status === "LOCKED"
                                                        ? "#dc2626"
                                                        : "#059669",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "4px",
                                            }}
                                        >
                                            {u.status === "LOCKED" ? (
                                                <Lock size={12} />
                                            ) : (
                                                <UserCheck size={12} />
                                            )}
                                            {u.status === "LOCKED"
                                                ? "Đã khóa"
                                                : "Hoạt động"}
                                        </span>
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            textAlign: "right",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                handleToggleStatus(u)
                                            }
                                            disabled={updatingId === u.id}
                                            style={{
                                                padding: "6px 14px",
                                                borderRadius: "6px",
                                                border:
                                                    u.status === "LOCKED"
                                                        ? "1px solid #10b981"
                                                        : "1px solid #ef4444",
                                                backgroundColor:
                                                    u.status === "LOCKED"
                                                        ? "#ecfdf5"
                                                        : "#fef2f2",
                                                color:
                                                    u.status === "LOCKED"
                                                        ? "#059669"
                                                        : "#dc2626",
                                                fontWeight: 600,
                                                fontSize: "0.8rem",
                                                cursor: "pointer",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            {u.status === "LOCKED" ? (
                                                <>
                                                    <Unlock size={14} /> Mở Khóa
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={14} /> Khóa TK
                                                </>
                                            )}
                                        </button>
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

export default AdminUsers;
