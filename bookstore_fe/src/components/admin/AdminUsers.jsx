import { useState } from "react";
import { Edit2, Search, Trash2, UserPlus } from "lucide-react";
import api from "../../services/api";

const AdminUsers = ({ users = [], loadData, showToast }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    const filteredUsers = users.filter((user) => {
        const keyword = searchTerm.toLowerCase();
        return (
            (user.fullName || "").toLowerCase().includes(keyword) ||
            (user.email || "").toLowerCase().includes(keyword) ||
            (user.phone || "").toLowerCase().includes(keyword)
        );
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

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "1.55rem", lineHeight: 1.1, color: "#0f172a", fontWeight: 800 }}>
                        Danh sách người dùng
                    </h1>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <div style={{ position: "relative" }}>
                        <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: "340px",
                                maxWidth: "52vw",
                                padding: "9px 14px 9px 36px",
                                borderRadius: "999px",
                                border: "1px solid #d7def0",
                                backgroundColor: "#f7f9fe",
                                outline: "none",
                                fontSize: "0.9rem",
                            }}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => showToast?.("Tính năng tạo người dùng đang được giữ nguyên ở backend.", "info")}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 16px",
                            borderRadius: "10px",
                            border: "none",
                            backgroundColor: "#c81e1e",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                        }}
                    >
                        <UserPlus size={16} />
                        <span>Tạo người dùng</span>
                    </button>
                </div>
            </div>

            <div style={{ backgroundColor: "#ffffff", border: "1px solid #d7def0", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8faff", color: "#94a3b8" }}>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700 }}>Người dùng</th>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700 }}>Vai trò</th>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700 }}>Trạng thái</th>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700 }}>Điểm</th>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700 }}>Hành động</th>
                            <th style={{ padding: "12px 18px", fontSize: "0.72rem", fontWeight: 700, textAlign: "right" }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ padding: "36px", textAlign: "center", color: "#64748b" }}>
                                    Không tìm thấy người dùng phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const initials = (user.fullName || user.email || "U").trim().charAt(0).toUpperCase();
                                const isLocked = user.status === "LOCKED";
                                return (
                                    <tr key={user.id} style={{ borderTop: "1px solid #edf2f7" }}>
                                        <td style={{ padding: "14px 18px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "36px", height: "36px", borderRadius: "999px", backgroundColor: "#e2e8f0", color: "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "0.9rem" }}>
                                                        {user.fullName || "Chưa đặt tên"}
                                                    </div>
                                                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
                                                        {user.email || "Chưa cập nhật"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", padding: "5px 10px", backgroundColor: user.role === "ADMIN" ? "#fee2e2" : user.role === "MANAGER" ? "#dbeafe" : "#eef2ff", color: user.role === "ADMIN" ? "#dc2626" : user.role === "MANAGER" ? "#2563eb" : "#4f46e5", fontWeight: 700, fontSize: "0.76rem" }}>
                                                {user.role === "ADMIN" ? "Quản trị viên" : user.role === "MANAGER" ? "Người quản lý" : "Người dùng"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", padding: "5px 10px", backgroundColor: isLocked ? "#fff1f2" : "#ecfdf5", color: isLocked ? "#ef4444" : "#16a34a", fontWeight: 700, fontSize: "0.76rem" }}>
                                                {isLocked ? "Đã khóa" : "Hoạt động"}
                                            </span>
                                        </td>
                                        <td style={{ padding: "14px 18px", color: "#334155", fontWeight: 700 }}>
                                            120
                                        </td>
                                        <td style={{ padding: "14px 18px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1d4ed8" }}>
                                                <Edit2 size={15} />
                                                <Trash2 size={15} color="#ef4444" />
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleToggleStatus(user)}
                                                disabled={updatingId === user.id}
                                                style={{
                                                    border: "none",
                                                    background: "none",
                                                    color: "#ef4444",
                                                    fontWeight: 700,
                                                    fontSize: "0.88rem",
                                                    cursor: updatingId === user.id ? "wait" : "pointer",
                                                }}
                                            >
                                                {isLocked ? "Mở khóa" : "Khóa"}
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
