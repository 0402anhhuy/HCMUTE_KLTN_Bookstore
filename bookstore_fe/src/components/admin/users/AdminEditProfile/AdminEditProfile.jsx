import { useAdminEditProfile } from "./useAdminEditProfile";
import { User, Mail, Phone, MapPin, Save, X } from "lucide-react";
import "./AdminEditProfile.css";

const AdminEditProfile = ({ user, onCancel, onSave }) => {
    const {
        formData,
        isPasswordModalOpen,
        step,
        setStep,
        passwordData,
        handleChange,
        handlePasswordDataChange,
        openPasswordModal,
        closePasswordModal,
        handleSubmit,
        handleCompletePasswordReset,
    } = useAdminEditProfile({ user, onSave });

    return (
        <div className="admin-edit-profile-container">
            {/* Header Top Bar */}
            <div className="admin-edit-profile-top-bar">
                <div>
                    <h1 className="admin-edit-profile-title">
                        Cập nhật hồ sơ tài khoản
                    </h1>
                    <p className="admin-edit-profile-subtitle">
                        Chỉnh sửa thông tin cá nhân của quản trị viên hệ thống
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    type="button"
                    className="admin-edit-profile-close-btn"
                >
                    <X size={16} />
                    <span>Đóng</span>
                </button>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="admin-edit-profile-form">
                <div className="admin-edit-profile-main-layout">
                    {/* Avatar Column */}
                    <div className="admin-edit-profile-avatar-col">
                        <div className="admin-edit-profile-avatar-circle">
                            <span className="admin-edit-profile-avatar-text">
                                {formData.fullName
                                    ? formData.fullName.charAt(0).toUpperCase()
                                    : "U"}
                            </span>
                        </div>
                        <span className="admin-edit-profile-avatar-label">
                            Ảnh đại diện
                        </span>
                        <button
                            type="button"
                            onClick={openPasswordModal}
                            className="admin-edit-profile-change-pwd-btn"
                        >
                            Đổi mật khẩu
                        </button>
                    </div>

                    {/* Inputs Column */}
                    <div className="admin-edit-profile-fields-col">
                        {/* Row 1: FullName & Email */}
                        <div className="admin-edit-profile-row">
                            <div className="admin-edit-profile-field-group">
                                <label className="admin-edit-profile-label">
                                    Họ và tên
                                </label>
                                <div className="admin-edit-profile-input-wrapper">
                                    <User
                                        size={18}
                                        className="admin-edit-profile-icon"
                                    />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên..."
                                        className="admin-edit-profile-input"
                                    />
                                </div>
                            </div>

                            <div className="admin-edit-profile-field-group">
                                <label className="admin-edit-profile-label">
                                    Email
                                </label>
                                <div className="admin-edit-profile-input-wrapper">
                                    <Mail
                                        size={18}
                                        className="admin-edit-profile-icon"
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                        className="admin-edit-profile-input-disabled"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Phone */}
                        <div className="admin-edit-profile-field-group">
                            <label className="admin-edit-profile-label">
                                Số điện thoại
                            </label>
                            <div className="admin-edit-profile-input-wrapper">
                                <Phone
                                    size={18}
                                    className="admin-edit-profile-icon"
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 0912345678"
                                    className="admin-edit-profile-input"
                                />
                            </div>
                        </div>

                        {/* Row 3: Address */}
                        <div className="admin-edit-profile-field-group">
                            <label className="admin-edit-profile-label">
                                Địa chỉ
                            </label>
                            <div className="admin-edit-profile-input-wrapper">
                                <MapPin
                                    size={18}
                                    className="admin-edit-profile-icon-textarea"
                                />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ nhận hàng/liên hệ..."
                                    rows="4"
                                    className="admin-edit-profile-textarea"
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Footer */}
                <div className="admin-edit-profile-form-footer">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="admin-edit-profile-cancel-btn"
                    >
                        Hủy thay đổi
                    </button>
                    <button
                        type="submit"
                        className="admin-edit-profile-save-btn"
                    >
                        <Save size={18} />
                        Lưu thông tin
                    </button>
                </div>
            </form>

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <div
                    className="admin-edit-profile-modal-overlay"
                    onClick={closePasswordModal}
                >
                    <div
                        className="admin-edit-profile-modal-card"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Stepper */}
                        <div className="admin-edit-profile-stepper">
                            <div
                                className={`admin-edit-profile-step-line-1 ${
                                    step >= 2 ? "active" : ""
                                }`}
                            ></div>
                            <div
                                className={`admin-edit-profile-step-line-2 ${
                                    step >= 3 ? "active" : ""
                                }`}
                            ></div>

                            {/* Step 1 */}
                            <div className="admin-edit-profile-step-item">
                                <div
                                    className={`admin-edit-profile-step-circle ${
                                        step > 1
                                            ? "completed"
                                            : step === 1
                                              ? "current"
                                              : "idle-gray-alt"
                                    }`}
                                >
                                    {step > 1 ? (
                                        <svg
                                            width="12"
                                            height="9"
                                            viewBox="0 0 14 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 5.33333L4.82353 9L13 1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        "1"
                                    )}
                                </div>
                                <span
                                    className={`admin-edit-profile-step-text ${
                                        step >= 1 ? "active" : "inactive"
                                    }`}
                                >
                                    Email
                                </span>
                            </div>

                            {/* Step 2 */}
                            <div className="admin-edit-profile-step-item">
                                <div
                                    className={`admin-edit-profile-step-circle ${
                                        step > 2
                                            ? "completed"
                                            : step === 2
                                              ? "current"
                                              : "idle-gray"
                                    }`}
                                >
                                    {step > 2 ? (
                                        <svg
                                            width="12"
                                            height="9"
                                            viewBox="0 0 14 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 5.33333L4.82353 9L13 1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : (
                                        "2"
                                    )}
                                </div>
                                <span
                                    className={`admin-edit-profile-step-text ${
                                        step >= 2 ? "active" : "inactive"
                                    }`}
                                >
                                    Xác thực OTP
                                </span>
                            </div>

                            {/* Step 3 */}
                            <div className="admin-edit-profile-step-item">
                                <div
                                    className={`admin-edit-profile-step-circle ${
                                        step === 3 ? "current" : "idle-gray"
                                    }`}
                                >
                                    3
                                </div>
                                <span
                                    className={`admin-edit-profile-step-text ${
                                        step === 3 ? "active" : "inactive"
                                    }`}
                                >
                                    Mật khẩu mới
                                </span>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="admin-edit-profile-modal-body">
                            {step === 1 && (
                                <div className="admin-edit-profile-modal-step-box">
                                    <h3 className="admin-edit-profile-modal-step-title">
                                        Quên mật khẩu?
                                    </h3>
                                    <p className="admin-edit-profile-modal-step-desc">
                                        Nhập địa chỉ email của tài khoản đang
                                        đăng nhập để nhận mã OTP xác thực.
                                    </p>
                                    <label className="admin-edit-profile-modal-label">
                                        Email xác thực
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={passwordData.email}
                                        onChange={handlePasswordDataChange}
                                        placeholder="Nhập email..."
                                        className="admin-edit-profile-modal-input"
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div className="admin-edit-profile-modal-step-box">
                                    <h3 className="admin-edit-profile-modal-step-title">
                                        Nhập mã OTP
                                    </h3>
                                    <p className="admin-edit-profile-modal-step-desc">
                                        Vui lòng kiểm tra hộp thư email{" "}
                                        <strong>{passwordData.email}</strong> để
                                        lấy mã xác nhận gồm 6 chữ số.
                                    </p>
                                    <label className="admin-edit-profile-modal-label">
                                        Mã OTP
                                    </label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={passwordData.otp}
                                        onChange={handlePasswordDataChange}
                                        placeholder="Nhập mã xác thực (VD: 123456)"
                                        maxLength="6"
                                        className="admin-edit-profile-modal-input-otp"
                                    />
                                </div>
                            )}

                            {step === 3 && (
                                <>
                                    <div className="admin-edit-profile-modal-step-box">
                                        <label className="admin-edit-profile-modal-label">
                                            Mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordDataChange}
                                            placeholder="Tối thiểu 6 ký tự"
                                            className="admin-edit-profile-modal-input"
                                        />
                                    </div>
                                    <div className="admin-edit-profile-modal-step-box">
                                        <label className="admin-edit-profile-modal-label">
                                            Xác nhận mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordDataChange}
                                            placeholder="Nhập lại mật khẩu"
                                            className="admin-edit-profile-modal-input"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Modal Action Buttons */}
                        {step === 1 && (
                            <button
                                type="button"
                                onClick={() => setStep(2)}
                                className="admin-edit-profile-modal-btn-full"
                            >
                                Gửi mã OTP
                            </button>
                        )}
                        {step === 2 && (
                            <div className="admin-edit-profile-modal-btn-group">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="admin-edit-profile-modal-btn-back"
                                >
                                    Quay lại
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="admin-edit-profile-modal-btn-next"
                                >
                                    Xác nhận OTP
                                </button>
                            </div>
                        )}
                        {step === 3 && (
                            <button
                                type="button"
                                onClick={handleCompletePasswordReset}
                                className="admin-edit-profile-modal-btn-full"
                            >
                                Hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEditProfile;
