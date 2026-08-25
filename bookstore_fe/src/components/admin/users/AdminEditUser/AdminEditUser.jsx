import { useAdminEditUser } from "./useAdminEditUser";
import { User, Mail, Phone, Shield, Power, X, Save } from "lucide-react";
import "./AdminEditUser.css";

const AdminEditUser = ({ user, onClose, onSave, showToast }) => {
    const { formData, isSaving, handleChange, handleSubmit } = useAdminEditUser(
        { user, onClose, onSave, showToast },
    );

    if (!user) return null;

    return (
        <div className="admin-edit-user-overlay" onClick={onClose}>
            <div
                className="admin-edit-user-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="admin-edit-user-header">
                    <h2 className="admin-edit-user-title">
                        Chỉnh sửa tài khoản
                    </h2>
                    <button
                        type="button"
                        className="admin-edit-user-close-button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-edit-user-body">
                    {/* Row 1: Full Name & Email */}
                    <div className="admin-edit-user-row">
                        <div className="admin-edit-user-field">
                            <label className="admin-edit-user-label">
                                Họ và tên
                            </label>
                            <div className="admin-edit-user-input-wrapper">
                                <User
                                    size={18}
                                    className="admin-edit-user-input-icon"
                                />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên..."
                                    required
                                    className="admin-edit-user-input"
                                />
                            </div>
                        </div>

                        <div className="admin-edit-user-field">
                            <label className="admin-edit-user-label">
                                Email
                            </label>
                            <div className="admin-edit-user-input-wrapper">
                                <Mail
                                    size={18}
                                    className="admin-edit-user-input-icon"
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ email..."
                                    required
                                    className="admin-edit-user-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Phone & Role */}
                    <div className="admin-edit-user-row">
                        <div className="admin-edit-user-field">
                            <label className="admin-edit-user-label">
                                Số điện thoại
                            </label>
                            <div className="admin-edit-user-input-wrapper">
                                <Phone
                                    size={18}
                                    className="admin-edit-user-input-icon"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại liên hệ..."
                                    className="admin-edit-user-input"
                                />
                            </div>
                        </div>

                        <div className="admin-edit-user-field">
                            <label className="admin-edit-user-label">
                                Vai trò
                            </label>
                            <div className="admin-edit-user-input-wrapper">
                                <Shield
                                    size={18}
                                    className="admin-edit-user-input-icon"
                                />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="admin-edit-user-select"
                                >
                                    <option value="USER">Người dùng</option>
                                    <option value="MANAGER">
                                        Người quản lý
                                    </option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Status */}
                    <div className="admin-edit-user-field-half">
                        <label className="admin-edit-user-label">
                            Trạng thái tài khoản
                        </label>
                        <div className="admin-edit-user-input-wrapper">
                            <Power
                                size={18}
                                className="admin-edit-user-input-icon"
                            />
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="admin-edit-user-select"
                            >
                                <option value="ACTIVE">Mở khóa</option>
                                <option value="LOCKED">Khóa tài khoản</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="admin-edit-user-footer">
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-edit-user-cancel-button"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        className="admin-edit-user-save-button"
                    >
                        <Save size={18} />
                        {isSaving ? "Đang xử lý..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditUser;
