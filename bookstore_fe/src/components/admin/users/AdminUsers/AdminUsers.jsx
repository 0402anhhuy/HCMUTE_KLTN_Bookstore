import { useMemo } from "react";
import {
    Search,
    UserPlus,
    MoreHorizontal,
    KeyRound,
    Trash2,
    Shield,
    Edit2,
    Users,
    CheckCircle2,
    Lock,
    RotateCcw,
    X,
    Award,
} from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
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
        localUsers,
        setLocalUsers,
        filteredUsers,
        handleToggleStatus,
        handleDeleteUser,
        executeDeleteUser,
        handleResetFilter,
    } = useAdminUsers({ users, showToast });

    // Thống kê nhanh tóm tắt
    const stats = useMemo(() => {
        const list = localUsers || [];
        const total = list.length;
        const active = list.filter((u) => u.status === "ACTIVE").length;
        const locked = list.filter((u) => u.status === "LOCKED").length;
        const admins = list.filter(
            (u) => u.role === "ADMIN" || u.role === "MANAGER",
        ).length;
        return { total, active, locked, admins };
    }, [localUsers]);

    return (
        <div className="admin-users-container">
            {/* Header */}
            <div className="admin-users-header">
                <div>
                    <h1 className="admin-users-title">Quản lý người dùng</h1>
                    <p className="admin-users-subtitle">
                        Xem và quản lý tất cả tài khoản, phân quyền vai trò và trạng thái hoạt động.
                    </p>
                </div>

                <div className="admin-users-header-actions">
                    <div className="admin-users-search-wrapper">
                        <Search size={16} className="admin-users-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, sđt..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="admin-users-search-input"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm("")}
                                className="admin-users-search-clear"
                                aria-label="Xóa tìm kiếm"
                            >
                                <X size={14} />
                            </button>
                        )}
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

            {/* KPI Summary Cards */}
            <div className="admin-users-stats-grid">
                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-icon-wrap red">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="admin-users-stat-label">Tổng người dùng</div>
                        <div className="admin-users-stat-value">{stats.total}</div>
                    </div>
                </div>

                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-icon-wrap green">
                        <CheckCircle2 size={22} />
                    </div>
                    <div>
                        <div className="admin-users-stat-label">Đang hoạt động</div>
                        <div className="admin-users-stat-value">{stats.active}</div>
                    </div>
                </div>

                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-icon-wrap amber">
                        <Lock size={22} />
                    </div>
                    <div>
                        <div className="admin-users-stat-label">Đã khóa</div>
                        <div className="admin-users-stat-value">{stats.locked}</div>
                    </div>
                </div>

                <div className="admin-users-stat-card">
                    <div className="admin-users-stat-icon-wrap purple">
                        <Shield size={22} />
                    </div>
                    <div>
                        <div className="admin-users-stat-label">Quản trị & Quản lý</div>
                        <div className="admin-users-stat-value">{stats.admins}</div>
                    </div>
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
                    title="Đặt lại bộ lọc về mặc định"
                >
                    <RotateCcw size={14} />
                    <span>Khôi phục</span>
                </button>
            </div>

            {/* Content Area: Empty State or Table/Cards */}
            {filteredUsers.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="Không tìm thấy người dùng"
                    description={
                        searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                            ? "Không có tài khoản nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại. Hãy thử thay đổi từ khóa hoặc thiết lập lại bộ lọc."
                            : "Hệ thống hiện tại chưa có dữ liệu tài khoản người dùng."
                    }
                    actionText={
                        searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                            ? "Khôi phục bộ lọc"
                            : "Tạo người dùng mới"
                    }
                    onAction={
                        searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                            ? handleResetFilter
                            : () => setIsAddModalOpen(true)
                    }
                    actionIcon={
                        searchTerm || roleFilter !== "ALL" || statusFilter !== "ALL"
                            ? RotateCcw
                            : UserPlus
                    }
                />
            ) : (
                <>
                    {/* Table Section (Desktop) */}
                    <div className="admin-desktop-table admin-users-table-card">
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
                                        Điểm thưởng
                                    </th>
                                    <th className="admin-users-th admin-users-th-right">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
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
                                                        {user.avatar ? (
                                                            <img
                                                                src={user.avatar}
                                                                alt={user.fullName || "User"}
                                                                className="admin-users-avatar-img"
                                                            />
                                                        ) : (
                                                            initials
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="admin-users-fullname">
                                                            {user.fullName || "Chưa đặt tên"}
                                                        </div>
                                                        <div className="admin-users-email">
                                                            {user.email || "Chưa cập nhật email"}
                                                        </div>
                                                        {user.phone && (
                                                            <div className="admin-users-phone">
                                                                {user.phone}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="admin-users-td-center">
                                                <span
                                                    className={`admin-users-badge ${
                                                        user.role === "ADMIN"
                                                            ? "role-admin"
                                                            : user.role === "MANAGER"
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
                                                    <span className="admin-users-status-dot" />
                                                    {isLocked
                                                        ? "Đã khóa"
                                                        : "Hoạt động"}
                                                </span>
                                            </td>
                                            <td className="admin-users-td-center">
                                                <div className="admin-users-points-pill">
                                                    <Award size={13} />
                                                    <span>{user.rewardPoints || 0}</span>
                                                </div>
                                            </td>
                                            <td className="admin-users-td-right">
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
                                                            activeDropdownId === user.id
                                                                ? "active"
                                                                : ""
                                                        }`}
                                                        aria-label="Tùy chọn thao tác"
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>

                                                    {activeDropdownId === user.id && (
                                                        <div
                                                            ref={dropdownRef}
                                                            className="admin-users-dropdown-menu"
                                                        >
                                                            <div className="admin-users-dropdown-list">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setEditingUser(user);
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    className="admin-users-dropdown-item"
                                                                >
                                                                    <Edit2 size={14} />
                                                                    <span>Sửa tài khoản</span>
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        handleToggleStatus(user);
                                                                        setActiveDropdownId(null);
                                                                    }}
                                                                    disabled={updatingId === user.id}
                                                                    className={`admin-users-dropdown-item ${
                                                                        isLocked
                                                                            ? "text-green"
                                                                            : "text-amber"
                                                                    }`}
                                                                >
                                                                    <Shield size={14} />
                                                                    <span>
                                                                        {isLocked
                                                                            ? "Mở khóa tài khoản"
                                                                            : "Khóa tài khoản"}
                                                                    </span>
                                                                </button>
                                                                {isCurrentUser && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setPasswordTargetUser(user);
                                                                            setIsPasswordModalOpen(true);
                                                                            setActiveDropdownId(null);
                                                                        }}
                                                                        className="admin-users-dropdown-item text-blue"
                                                                    >
                                                                        <KeyRound size={14} />
                                                                        <span>Đổi mật khẩu</span>
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setActiveDropdownId(null);
                                                                        handleDeleteUser(user);
                                                                    }}
                                                                    className="admin-users-dropdown-item text-red"
                                                                >
                                                                    <Trash2 size={14} />
                                                                    <span>Xóa tài khoản</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card List View */}
                    <div className="admin-mobile-card-list">
                        {filteredUsers.map((user) => {
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
                                <div key={user.id} className="admin-card-item">
                                    <div className="admin-card-header">
                                        <div className="admin-users-mobile-user-head">
                                            <div className="admin-users-avatar-circle small">
                                                {user.avatar ? (
                                                    <img
                                                        src={user.avatar}
                                                        alt={user.fullName || "User"}
                                                        className="admin-users-avatar-img"
                                                    />
                                                ) : (
                                                    initials
                                                )}
                                            </div>
                                            <div>
                                                <span className="admin-card-title">
                                                    {user.fullName || "Chưa đặt tên"}
                                                </span>
                                                <div className="admin-users-mobile-email">
                                                    {user.email || "Chưa cập nhật email"}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`admin-users-badge ${
                                                user.role === "ADMIN"
                                                    ? "role-admin"
                                                    : user.role === "MANAGER"
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
                                    </div>

                                    <div className="admin-card-body">
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Trạng thái:</span>
                                            <span
                                                className={`admin-users-badge ${
                                                    isLocked
                                                        ? "status-locked"
                                                        : "status-active"
                                                }`}
                                            >
                                                <span className="admin-users-status-dot" />
                                                {isLocked ? "Đã khóa" : "Hoạt động"}
                                            </span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Điểm thưởng:</span>
                                            <div className="admin-users-points-pill">
                                                <Award size={13} />
                                                <span>{user.rewardPoints || 0} điểm</span>
                                            </div>
                                        </div>
                                        {user.phone && (
                                            <div className="admin-card-row">
                                                <span className="admin-card-label">Số điện thoại:</span>
                                                <span className="admin-card-value">{user.phone}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="admin-card-footer">
                                        <button
                                            type="button"
                                            onClick={() => setEditingUser(user)}
                                            className="admin-users-mobile-action-btn default"
                                        >
                                            <Edit2 size={14} />
                                            <span>Sửa</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(user)}
                                            disabled={updatingId === user.id}
                                            className={`admin-users-mobile-action-btn ${isLocked ? "success" : "warning"}`}
                                        >
                                            <Shield size={14} />
                                            <span>{isLocked ? "Mở khóa" : "Khóa"}</span>
                                        </button>
                                        {isCurrentUser && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setPasswordTargetUser(user);
                                                    setIsPasswordModalOpen(true);
                                                }}
                                                className="admin-users-mobile-action-btn primary"
                                            >
                                                <KeyRound size={14} />
                                                <span>Đổi MK</span>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteUser(user)}
                                            className="admin-users-mobile-action-btn danger"
                                        >
                                            <Trash2 size={14} />
                                            <span>Xóa</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

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
