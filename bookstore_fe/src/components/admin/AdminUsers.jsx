import { useState, useEffect, useRef } from "react";
import {
    Search,
    UserPlus,
    MoreHorizontal,
    KeyRound,
    Trash2,
    Shield,
    Edit2,
} from "lucide-react";
import api from "../../services/api";
import { useApp } from "../../context/AppContext";
import AdminEditUser from "./AdminEditUser";
import AdminChangePassword from "./AdminChangePassword";
import AdminAddUser from "./AdminAddUser";

const AdminUsers = ({ users = [], loadData, showToast }) => {
    const { user: currentUser } = useApp();
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    const [activeDropdownId, setActiveDropdownId] = useState(null);
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [pointsSort, setPointsSort] = useState("DEFAULT");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [passwordTargetUser, setPasswordTargetUser] = useState(null);
    const [deleteTargetUser, setDeleteTargetUser] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setActiveDropdownId(null);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const [localUsers, setLocalUsers] = useState(users);

    useEffect(() => {
        setLocalUsers(users);
    }, [users]);

    const filteredUsers = localUsers
        .filter((user) => {
            const keyword = searchTerm.toLowerCase();
            const searchRegex =
                (user.fullName || "").toLowerCase().includes(keyword) ||
                (user.email || "").toLowerCase().includes(keyword) ||
                (user.phone || "").toLowerCase().includes(keyword);

            const matchRole = roleFilter === "ALL" || user.role === roleFilter;
            const matchStatus =
                statusFilter === "ALL" || user.status === statusFilter;

            return searchRegex && matchRole && matchStatus;
        })
        .sort((a, b) => {
            if (pointsSort === "ASC") {
                return (a.rewardPoints || 0) - (b.rewardPoints || 0);
            } else if (pointsSort === "DESC") {
                return (b.rewardPoints || 0) - (a.rewardPoints || 0);
            }
            return 0;
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
            setLocalUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, status: newStatus } : u,
                ),
            );
        } catch (error) {
            console.error("Failed to update status", error);
            showToast("Lỗi cập nhật trạng thái tài khoản", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDeleteUser = (user) => {
        setDeleteTargetUser(user);
    };

    const executeDeleteUser = async () => {
        if (!deleteTargetUser) return;
        const targetId = deleteTargetUser.id;

        setUpdatingId(targetId);
        setDeleteTargetUser(null);
        try {
            await api.delete(`/admin/users/${targetId}`);
            showToast(
                "Đã xóa vĩnh viễn tài khoản người dùng thành công",
                "success",
            );
            setLocalUsers((prev) => prev.filter((u) => u.id !== targetId));
        } catch (error) {
            console.error("Failed to delete user", error);

            // Check for 400 Bad Request which is what we throw when constrained
            const errResponse = error.response;
            if (errResponse && errResponse.status === 400) {
                showToast(
                    errResponse.data.error ||
                        "Tài khoản có ràng buộc lịch sử, đã tự động khóa.",
                    "error",
                );

                // Optimiztic UI state transition to LOCKED if they are not already locked
                if (deleteTargetUser.status !== "LOCKED") {
                    setLocalUsers((prev) =>
                        prev.map((u) =>
                            u.id === targetId
                                ? {
                                      ...u,
                                      status: "LOCKED",
                                      lockedReason: errResponse.data.error,
                                  }
                                : u,
                        ),
                    );
                }
            } else {
                showToast(
                    "Lỗi khi xóa tài khoản. Vui lòng thử lại sau.",
                    "error",
                );
            }
        } finally {
            setUpdatingId(null);
        }
    };
    const handleResetFilter = () => {
        setRoleFilter("ALL");
        setStatusFilter("ALL");
        setPointsSort("DEFAULT");
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "1.55rem",
                            lineHeight: 1.1,
                            color: "#0f172a",
                            fontWeight: 800,
                        }}
                    >
                        Danh sách người dùng
                    </h1>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <Search
                            size={16}
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#94a3b8",
                            }}
                        />
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
                        onClick={() => setIsAddModalOpen(true)}
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

            {/* Filter Section */}
            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    backgroundColor: "#ffffff",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "16px",
                        flex: 1,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#475569",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Vai trò:
                        </span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.85rem",
                                outline: "none",
                                cursor: "pointer",
                                backgroundColor: "#f8fafc",
                            }}
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="USER">Người dùng</option>
                            <option value="MANAGER">Người quản lý</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#475569",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Trạng thái:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.85rem",
                                outline: "none",
                                cursor: "pointer",
                                backgroundColor: "#f8fafc",
                            }}
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                        </select>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#475569",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Điểm thưởng:
                        </span>
                        <select
                            value={pointsSort}
                            onChange={(e) => setPointsSort(e.target.value)}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                fontSize: "0.85rem",
                                outline: "none",
                                cursor: "pointer",
                                backgroundColor: "#f8fafc",
                            }}
                        >
                            <option value="DEFAULT">Mặc định</option>
                            <option value="DESC">Cao nhất xuống thấp</option>
                            <option value="ASC">Thấp nhất lên cao</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleResetFilter}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                    }}
                >
                    Khôi phục
                </button>
            </div>

            <div
                style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #d7def0",
                    borderRadius: "14px",
                    overflow: "visible",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)",
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
                                backgroundColor: "#f8faff",
                                color: "#94a3b8",
                            }}
                        >
                            <th
                                style={{
                                    padding: "12px 18px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    borderTopLeftRadius: "13px",
                                }}
                            >
                                Người dùng
                            </th>
                            <th
                                style={{
                                    padding: "12px 18px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                }}
                            >
                                Vai trò
                            </th>
                            <th
                                style={{
                                    padding: "12px 18px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                }}
                            >
                                Trạng thái
                            </th>
                            <th
                                style={{
                                    padding: "12px 18px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                }}
                            >
                                Điểm
                            </th>
                            <th
                                style={{
                                    padding: "12px 18px",
                                    fontSize: "0.72rem",
                                    fontWeight: 700,
                                    textAlign: "center",
                                    borderTopRightRadius: "13px",
                                }}
                            >
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        padding: "36px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    Không tìm thấy người dùng phù hợp.
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user) => {
                                const initials = (
                                    user.fullName ||
                                    user.email ||
                                    "U"
                                )
                                    .trim()
                                    .charAt(0)
                                    .toUpperCase();
                                const isLocked = user.status === "LOCKED";
                                const isCurrentUser =
                                    currentUser?.id === user.id ||
                                    currentUser?.email === user.email;
                                return (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderTop: "1px solid #edf2f7",
                                        }}
                                    >
                                        <td style={{ padding: "14px 18px" }}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "999px",
                                                        backgroundColor:
                                                            "#e2e8f0",
                                                        color: "#334155",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div
                                                        style={{
                                                            fontWeight: 800,
                                                            color: "#0f172a",
                                                            fontSize: "0.9rem",
                                                        }}
                                                    >
                                                        {user.fullName ||
                                                            "Chưa đặt tên"}
                                                    </div>
                                                    <div
                                                        style={{
                                                            fontSize: "0.78rem",
                                                            color: "#94a3b8",
                                                        }}
                                                    >
                                                        {user.email ||
                                                            "Chưa cập nhật"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                padding: "14px 18px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "999px",
                                                    padding: "5px 10px",
                                                    backgroundColor:
                                                        user.role === "ADMIN"
                                                            ? "#fee2e2"
                                                            : user.role ===
                                                                "MANAGER"
                                                              ? "#dbeafe"
                                                              : "#eef2ff",
                                                    color:
                                                        user.role === "ADMIN"
                                                            ? "#dc2626"
                                                            : user.role ===
                                                                "MANAGER"
                                                              ? "#2563eb"
                                                              : "#4f46e5",
                                                    fontWeight: 700,
                                                    fontSize: "0.76rem",
                                                }}
                                            >
                                                {user.role === "ADMIN"
                                                    ? "Quản trị viên"
                                                    : user.role === "MANAGER"
                                                      ? "Người quản lý"
                                                      : "Người dùng"}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                padding: "14px 18px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    borderRadius: "999px",
                                                    padding: "5px 10px",
                                                    backgroundColor: isLocked
                                                        ? "#fff1f2"
                                                        : "#ecfdf5",
                                                    color: isLocked
                                                        ? "#ef4444"
                                                        : "#16a34a",
                                                    fontWeight: 700,
                                                    fontSize: "0.76rem",
                                                }}
                                            >
                                                {isLocked
                                                    ? "Đã khóa"
                                                    : "Hoạt động"}
                                            </span>
                                        </td>
                                        <td
                                            style={{
                                                padding: "14px 18px",
                                                color: "#334155",
                                                fontWeight: 700,
                                                textAlign: "center",
                                            }}
                                        >
                                            {user.rewardPoints || 0}
                                        </td>
                                        <td
                                            style={{
                                                padding: "14px 18px",
                                                textAlign: "center",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    position: "relative",
                                                    display: "inline-block",
                                                }}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdownId(
                                                            (prev) =>
                                                                prev === user.id
                                                                    ? null
                                                                    : user.id,
                                                        );
                                                    }}
                                                    onMouseOver={(e) => {
                                                        if (
                                                            activeDropdownId !==
                                                            user.id
                                                        )
                                                            e.currentTarget.style.backgroundColor =
                                                                "#f1f5f9";
                                                    }}
                                                    onMouseOut={(e) => {
                                                        if (
                                                            activeDropdownId !==
                                                            user.id
                                                        )
                                                            e.currentTarget.style.backgroundColor =
                                                                "transparent";
                                                    }}
                                                    style={{
                                                        background:
                                                            activeDropdownId ===
                                                            user.id
                                                                ? "#e2e8f0"
                                                                : "transparent",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        padding: "2px 8px",
                                                        color:
                                                            activeDropdownId ===
                                                            user.id
                                                                ? "#1e293b"
                                                                : "#64748b",
                                                        borderRadius: "4px",
                                                        transition:
                                                            "background 0.2s",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent:
                                                            "center",
                                                    }}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeDropdownId ===
                                                    user.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        style={{
                                                            position:
                                                                "absolute",
                                                            top: "calc(100% + 4px)",
                                                            right: "0",
                                                            backgroundColor:
                                                                "#ffffff",
                                                            borderRadius: "8px",
                                                            boxShadow:
                                                                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                                                            border: "1px solid #e2e8f0",
                                                            zIndex: 50,
                                                            minWidth: "180px",
                                                            overflow: "hidden",
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                            }}
                                                        >
                                                            <button
                                                                onClick={() => {
                                                                    setEditingUser(
                                                                        user,
                                                                    );
                                                                    setActiveDropdownId(
                                                                        null,
                                                                    );
                                                                }}
                                                                style={{
                                                                    padding:
                                                                        "10px 16px",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "8px",
                                                                    background:
                                                                        "none",
                                                                    border: "none",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    cursor: "pointer",
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    color: "#334155",
                                                                    textAlign:
                                                                        "left",
                                                                    transition:
                                                                        "background 0.2s",
                                                                }}
                                                                onMouseOver={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "#f8fafc")
                                                                }
                                                                onMouseOut={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "transparent")
                                                                }
                                                            >
                                                                <Edit2
                                                                    size={14}
                                                                />{" "}
                                                                Chỉnh sửa tài
                                                                khoản
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    handleToggleStatus(
                                                                        user,
                                                                    );
                                                                    setActiveDropdownId(
                                                                        null,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    updatingId ===
                                                                    user.id
                                                                }
                                                                style={{
                                                                    padding:
                                                                        "10px 16px",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "8px",
                                                                    background:
                                                                        "none",
                                                                    border: "none",
                                                                    borderBottom:
                                                                        "1px solid #f1f5f9",
                                                                    cursor:
                                                                        updatingId ===
                                                                        user.id
                                                                            ? "wait"
                                                                            : "pointer",
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    color: isLocked
                                                                        ? "#16a34a"
                                                                        : "#ca8a04",
                                                                    textAlign:
                                                                        "left",
                                                                    transition:
                                                                        "background 0.2s",
                                                                }}
                                                                onMouseOver={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "#f8fafc")
                                                                }
                                                                onMouseOut={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "transparent")
                                                                }
                                                            >
                                                                <Shield
                                                                    size={14}
                                                                />{" "}
                                                                {isLocked
                                                                    ? "Mở khóa tài khoản"
                                                                    : "Khóa tài khoản"}
                                                            </button>
                                                            {isCurrentUser && (
                                                                <button
                                                                    onClick={() => {
                                                                        setPasswordTargetUser(
                                                                            user,
                                                                        );
                                                                        setIsPasswordModalOpen(
                                                                            true,
                                                                        );
                                                                        setActiveDropdownId(
                                                                            null,
                                                                        );
                                                                    }}
                                                                    style={{
                                                                        padding:
                                                                            "10px 16px",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        gap: "8px",
                                                                        background:
                                                                            "none",
                                                                        border: "none",
                                                                        borderBottom:
                                                                            "1px solid #f1f5f9",
                                                                        cursor: "pointer",
                                                                        fontSize:
                                                                            "0.85rem",
                                                                        color: "#2563eb",
                                                                        textAlign:
                                                                            "left",
                                                                        transition:
                                                                            "background 0.2s",
                                                                    }}
                                                                    onMouseOver={(
                                                                        e,
                                                                    ) =>
                                                                        (e.currentTarget.style.backgroundColor =
                                                                            "#f8fafc")
                                                                    }
                                                                    onMouseOut={(
                                                                        e,
                                                                    ) =>
                                                                        (e.currentTarget.style.backgroundColor =
                                                                            "transparent")
                                                                    }
                                                                >
                                                                    <KeyRound
                                                                        size={
                                                                            14
                                                                        }
                                                                    />{" "}
                                                                    Đổi mật khẩu
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    setActiveDropdownId(
                                                                        null,
                                                                    );
                                                                    handleDeleteUser(
                                                                        user,
                                                                    );
                                                                }}
                                                                style={{
                                                                    padding:
                                                                        "10px 16px",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    gap: "8px",
                                                                    background:
                                                                        "none",
                                                                    border: "none",
                                                                    cursor: "pointer",
                                                                    fontSize:
                                                                        "0.85rem",
                                                                    color: "#ef4444",
                                                                    textAlign:
                                                                        "left",
                                                                    transition:
                                                                        "background 0.2s",
                                                                }}
                                                                onMouseOver={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "#fef2f2")
                                                                }
                                                                onMouseOut={(
                                                                    e,
                                                                ) =>
                                                                    (e.currentTarget.style.backgroundColor =
                                                                        "transparent")
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={14}
                                                                />{" "}
                                                                Xóa tài khoản
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <AdminEditUser
                user={editingUser}
                onClose={() => setEditingUser(null)}
                onSave={(updatedUser) => {
                    setLocalUsers((prev) =>
                        prev.map((u) =>
                            u.id === updatedUser.id ? updatedUser : u,
                        ),
                    );
                    setEditingUser(null);
                }}
                showToast={showToast}
            />

            {isAddModalOpen && (
                <AdminAddUser
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={(newUser) => {
                        setLocalUsers((prev) => [newUser, ...prev]);
                        setIsAddModalOpen(false);
                    }}
                    showToast={showToast}
                />
            )}

            {isPasswordModalOpen && passwordTargetUser && (
                <AdminChangePassword
                    user={passwordTargetUser}
                    onClose={() => {
                        setIsPasswordModalOpen(false);
                        setPasswordTargetUser(null);
                    }}
                    showToast={showToast}
                />
            )}

            {/* Custom Delete Confirmation Modal */}
            {deleteTargetUser && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(15, 23, 42, 0.4)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 2000,
                    }}
                    onClick={() => setDeleteTargetUser(null)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            padding: "32px",
                            maxWidth: "450px",
                            width: "90%",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: "64px",
                                height: "64px",
                                borderRadius: "50%",
                                backgroundColor: "#fee2e2",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "20px",
                            }}
                        >
                            <Trash2 size={32} color="#ef4444" />
                        </div>
                        <h2
                            style={{
                                margin: "0 0 12px",
                                fontSize: "1.25rem",
                                color: "#0f172a",
                                fontWeight: 700,
                            }}
                        >
                            Xác nhận xóa tài khoản
                        </h2>
                        <p
                            style={{
                                margin: "0 0 24px",
                                color: "#64748b",
                                fontSize: "0.95rem",
                                lineHeight: 1.5,
                            }}
                        >
                            Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
                            <strong>{deleteTargetUser.email}</strong> không?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                gap: "12px",
                                width: "100%",
                            }}
                        >
                            <button
                                onClick={() => setDeleteTargetUser(null)}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "10px",
                                    border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff",
                                    color: "#334155",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.backgroundColor = "#f8fafc")
                                }
                                onMouseOut={(e) =>
                                    (e.target.style.backgroundColor = "#ffffff")
                                }
                            >
                                Hủy bỏ
                            </button>
                            <button
                                onClick={executeDeleteUser}
                                style={{
                                    flex: 1,
                                    padding: "12px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.backgroundColor = "#dc2626")
                                }
                                onMouseOut={(e) =>
                                    (e.target.style.backgroundColor = "#ef4444")
                                }
                            >
                                Vâng, Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
