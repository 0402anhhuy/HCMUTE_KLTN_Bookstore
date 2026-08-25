import {
    Search,
    UserPlus,
    MoreHorizontal,
    KeyRound,
    Trash2,
    Shield,
    Edit2,
} from "lucide-react";
import { useAdminUsers } from "./useAdminUsers";
import {
    AdminAddUser,
    AdminEditUser,
    AdminChangePassword,
} from "@/components/admin/users";
import "./AdminUsers.css";

const AdminUsers = ({ users = [], showToast }) => {
    const {
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
    } = useAdminUsers({ users, showToast });

    return (
        <div className="admin-users-container">
            {/* Header */}
            <div className="admin-users-header">
                <div>
                    <h1 className="admin-users-title">Danh sách người dùng</h1>
                </div>

                <div className="admin-users-header-actions">
                    <div className="admin-users-search-wrapper">
                        <Search size={16} className="admin-users-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm người dùng..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-users-search-input"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(true)}
                        className="admin-users-create-btn"
                    >
                        <UserPlus size={16} />
                        <span>Tạo người dùng</span>
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="admin-users-filter-card">
                <div className="admin-users-filter-grid">
                    <div className="admin-users-filter-item">
                        <span className="admin-users-filter-label">
                            Vai trò:
                        </span>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="admin-users-filter-select"
                        >
                            <option value="ALL">Tất cả vai trò</option>
                            <option value="USER">Người dùng</option>
                            <option value="MANAGER">Người quản lý</option>
                            <option value="ADMIN">Quản trị viên</option>
                        </select>
                    </div>

                    <div className="admin-users-filter-item">
                        <span className="admin-users-filter-label">
                            Trạng thái:
                        </span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="admin-users-filter-select"
                        >
                            <option value="ALL">Tất cả trạng thái</option>
                            <option value="ACTIVE">Hoạt động</option>
                            <option value="LOCKED">Đã khóa</option>
                        </select>
                    </div>

                    <div className="admin-users-filter-item">
                        <span className="admin-users-filter-label">
                            Điểm thưởng:
                        </span>
                        <select
                            value={pointsSort}
                            onChange={(e) => setPointsSort(e.target.value)}
                            className="admin-users-filter-select"
                        >
                            <option value="DEFAULT">Mặc định</option>
                            <option value="DESC">Cao nhất xuống thấp</option>
                            <option value="ASC">Thấp nhất lên cao</option>
                        </select>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleResetFilter}
                    className="admin-users-reset-filter-btn"
                >
                    Khôi phục
                </button>
            </div>

            {/* Table Section */}
            <div className="admin-users-table-card">
                <table className="admin-users-table">
                    <thead>
                        <tr className="admin-users-thead-row">
                            <th className="admin-users-th admin-users-th-left">
                                Người dùng
                            </th>
                            <th className="admin-users-th admin-users-th-center">
                                Vai trò
                            </th>
                            <th className="admin-users-th admin-users-th-center">
                                Trạng thái
                            </th>
                            <th className="admin-users-th admin-users-th-center">
                                Điểm
                            </th>
                            <th className="admin-users-th admin-users-th-right">
                                Hành động
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="admin-users-empty-cell"
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
                                        className="admin-users-tbody-row"
                                    >
                                        <td className="admin-users-td">
                                            <div className="admin-users-info-wrapper">
                                                <div className="admin-users-avatar-circle">
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div className="admin-users-fullname">
                                                        {user.fullName ||
                                                            "Chưa đặt tên"}
                                                    </div>
                                                    <div className="admin-users-email">
                                                        {user.email ||
                                                            "Chưa cập nhật"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="admin-users-td-center">
                                            <span
                                                className={`admin-users-badge ${
                                                    user.role === "ADMIN"
                                                        ? "role-admin"
                                                        : user.role ===
                                                            "MANAGER"
                                                          ? "role-manager"
                                                          : "role-user"
                                                }`}
                                            >
                                                {user.role === "ADMIN"
                                                    ? "Quản trị viên"
                                                    : user.role === "MANAGER"
                                                      ? "Người quản lý"
                                                      : "Người dùng"}
                                            </span>
                                        </td>
                                        <td className="admin-users-td-center">
                                            <span
                                                className={`admin-users-badge ${
                                                    isLocked
                                                        ? "status-locked"
                                                        : "status-active"
                                                }`}
                                            >
                                                {isLocked
                                                    ? "Đã khóa"
                                                    : "Hoạt động"}
                                            </span>
                                        </td>
                                        <td className="admin-users-td-center admin-users-points">
                                            {user.rewardPoints || 0}
                                        </td>
                                        <td className="admin-users-td-center">
                                            <div className="admin-users-dropdown-wrapper">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveDropdownId(
                                                            (prev) =>
                                                                prev === user.id
                                                                    ? null
                                                                    : user.id,
                                                        );
                                                    }}
                                                    className={`admin-users-dropdown-btn ${
                                                        activeDropdownId ===
                                                        user.id
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                >
                                                    <MoreHorizontal size={18} />
                                                </button>

                                                {activeDropdownId ===
                                                    user.id && (
                                                    <div
                                                        ref={dropdownRef}
                                                        className="admin-users-dropdown-menu"
                                                    >
                                                        <div className="admin-users-dropdown-list">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setEditingUser(
                                                                        user,
                                                                    );
                                                                    setActiveDropdownId(
                                                                        null,
                                                                    );
                                                                }}
                                                                className="admin-users-dropdown-item"
                                                            >
                                                                <Edit2
                                                                    size={14}
                                                                />{" "}
                                                                Chỉnh sửa tài
                                                                khoản
                                                            </button>
                                                            <button
                                                                type="button"
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
                                                                className={`admin-users-dropdown-item ${
                                                                    isLocked
                                                                        ? "text-green"
                                                                        : "text-yellow"
                                                                }`}
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
                                                                    type="button"
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
                                                                    className="admin-users-dropdown-item text-blue"
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
                                                                type="button"
                                                                onClick={() => {
                                                                    setActiveDropdownId(
                                                                        null,
                                                                    );
                                                                    handleDeleteUser(
                                                                        user,
                                                                    );
                                                                }}
                                                                className="admin-users-dropdown-item text-red"
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

            {/* Modal Edit */}
            {editingUser && (
                <AdminEditUser
                    key={editingUser.id}
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
            )}

            {/* Modal Add */}
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

            {/* Modal Password */}
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

            {/* Modal Delete Confirmation */}
            {deleteTargetUser && (
                <div
                    className="admin-users-delete-modal-overlay"
                    onClick={() => setDeleteTargetUser(null)}
                >
                    <div
                        className="admin-users-delete-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="admin-users-delete-icon-circle">
                            <Trash2 size={32} color="#ef4444" />
                        </div>
                        <h2 className="admin-users-delete-title">
                            Xác nhận xóa tài khoản
                        </h2>
                        <p className="admin-users-delete-desc">
                            Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản{" "}
                            <strong>{deleteTargetUser.email}</strong> không?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="admin-users-delete-actions">
                            <button
                                type="button"
                                onClick={() => setDeleteTargetUser(null)}
                                className="admin-users-delete-cancel-btn"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="button"
                                onClick={executeDeleteUser}
                                className="admin-users-delete-confirm-btn"
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
