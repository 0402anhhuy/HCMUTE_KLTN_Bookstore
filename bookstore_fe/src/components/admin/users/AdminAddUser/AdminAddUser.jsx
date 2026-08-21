import { useAdminAddUser } from "./useAdminAddUser";
import {
    User,
    Mail,
    Phone,
    Shield,
    X,
    Save,
    MapPin,
    Lock,
} from "lucide-react";
import "./AdminAddUser.css";

const AdminAddUser = ({ onClose, onSave, showToast }) => {
    const {
        formData,
        isSaving,
        handleChange,
        handleSubmit,
        isFormInvalid,
    } = useAdminAddUser({
        onClose,
        onSave,
        showToast,
    });

    return (
        <div className="admin-add-user-overlay" onClick={onClose}>
            <div
                className="admin-add-user-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="admin-add-user-header">
                    <h2>Thêm người dùng mới</h2>

                    <button
                        type="button"
                        className="admin-add-user-close-button"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-add-user-body">
                    {/* Row 1: Full Name & Email */}
                    <div className="admin-add-user-row">
                        <div className="admin-add-user-field">
                            <label>
                                Họ và tên <span className="required">*</span>
                            </label>

                            <div className="admin-add-user-input-wrapper">
                                <User
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên..."
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-add-user-field">
                            <label>
                                Email <span className="required">*</span>
                            </label>

                            <div className="admin-add-user-input-wrapper">
                                <Mail
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ email..."
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Phone & Role */}
                    <div className="admin-add-user-row">
                        <div className="admin-add-user-field">
                            <label>Số điện thoại</label>

                            <div className="admin-add-user-input-wrapper">
                                <Phone
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại liên hệ..."
                                />
                            </div>
                        </div>

                        <div className="admin-add-user-field">
                            <label>
                                Vai trò <span className="required">*</span>
                            </label>

                            <div className="admin-add-user-input-wrapper">
                                <Shield
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                >
                                    <option value="USER">Người dùng</option>
                                    <option value="MANAGER">
                                        Người quản lý
                                    </option>
                                    <option value="ADMIN">
                                        Quản trị viên
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row Address */}
                    <div className="admin-add-user-field admin-add-user-full-width">
                        <label>Địa chỉ</label>

                        <div className="admin-add-user-input-wrapper">
                            <MapPin
                                size={18}
                                className="admin-add-user-input-icon"
                            />

                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ..."
                            />
                        </div>
                    </div>

                    <hr className="admin-add-user-divider" />

                    {/* Security Info */}
                    <h3 className="admin-add-user-section-title">
                        Thông tin bảo mật
                    </h3>

                    <div className="admin-add-user-row">
                        <div className="admin-add-user-field">
                            <label>
                                Mật khẩu <span className="required">*</span>
                            </label>

                            <div className="admin-add-user-input-wrapper">
                                <Lock
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                />
                            </div>
                        </div>

                        <div className="admin-add-user-field">
                            <label>
                                Xác nhận mật khẩu{" "}
                                <span className="required">*</span>
                            </label>

                            <div className="admin-add-user-input-wrapper">
                                <Lock
                                    size={18}
                                    className="admin-add-user-input-icon"
                                />

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tasks */}
                <div className="admin-add-user-footer">
                    <button
                        type="button"
                        className="admin-add-user-cancel-button"
                        onClick={onClose}
                    >
                        Hủy
                    </button>

                    <button
                        type="button"
                        className="admin-add-user-save-button"
                        onClick={handleSubmit}
                        disabled={isFormInvalid}
                    >
                        <Save size={18} />
                        {isSaving ? "Đang xử lý..." : "Lưu người dùng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAddUser;
