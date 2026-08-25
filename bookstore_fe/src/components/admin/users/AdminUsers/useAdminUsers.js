import { useState, useRef, useEffect } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useAdminUsers = ({ users = [], showToast }) => {
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
    const [localUsers, setLocalUsers] = useState(users);

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

    // Lọc và sắp xếp trên localUsers
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

    // 1. Cập nhật trạng thái tức thì
    const handleToggleStatus = async (user) => {
        const newStatus = user.status === "LOCKED" ? "ACTIVE" : "LOCKED";
        setUpdatingId(user.id);
        try {
            await api.put(`/admin/users/${user.id}/status?status=${newStatus}`);
            showToast?.(
                `Đã chuyển trạng thái tài khoản ${user.email} sang ${newStatus === "ACTIVE" ? "Hoạt động" : "Đã khóa"}`,
                "success",
            );
            // Cập nhật UI tức thì
            setLocalUsers((prev) =>
                prev.map((u) =>
                    u.id === user.id ? { ...u, status: newStatus } : u,
                ),
            );
        } catch (error) {
            console.error("Failed to update status", error);
            showToast?.("Lỗi cập nhật trạng thái tài khoản", "error");
        } finally {
            setUpdatingId(null);
        }
    };

    // 2. Xóa tức thì
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
            showToast?.(
                "Đã xóa vĩnh viễn tài khoản người dùng thành công",
                "success",
            );
            // Cập nhật UI tức thì
            setLocalUsers((prev) => prev.filter((u) => u.id !== targetId));
        } catch (error) {
            console.error("Failed to delete user", error);
            const errResponse = error.response;
            if (errResponse && errResponse.status === 400) {
                showToast?.(
                    errResponse.data.error ||
                        "Tài khoản có ràng buộc lịch sử, đã tự động khóa.",
                    "error",
                );

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
                showToast?.(
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

    return {
        currentUser,
        searchTerm,
        setSearchTerm,
        updatingId,
        editingUser,
        setEditingUser,
        activeDropdownId,
        setActiveDropdownId,
        roleFilter,
        setRoleFilter,
        statusFilter,
        setStatusFilter,
        pointsSort,
        setPointsSort,
        isPasswordModalOpen,
        setIsPasswordModalOpen,
        isAddModalOpen,
        setIsAddModalOpen,
        passwordTargetUser,
        setPasswordTargetUser,
        deleteTargetUser,
        setDeleteTargetUser,
        dropdownRef,
        setLocalUsers,
        filteredUsers,
        handleToggleStatus,
        handleDeleteUser,
        executeDeleteUser,
        handleResetFilter,
    };
}; 