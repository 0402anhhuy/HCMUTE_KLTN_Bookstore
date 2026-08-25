import { useAdminChangePassword } from "./useAdminChangePassword";
import "./AdminChangePassword.css";

const AdminChangePassword = ({ user, onClose, showToast }) => {
    const {
        step,
        setStep,
        isSubmitting,
        passwordData,
        setPasswordData,
        handleSendOtp,
        handleNextToStep3,
        handleResetPassword,
    } = useAdminChangePassword({ user, onClose, showToast });

    return (
        <div className="admin-change-password-overlay" onClick={onClose}>
            <div
                className="admin-change-password-modal"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Stepper */}
                <div className="admin-change-password-stepper">
                    {/* Connecting Lines */}
                    <div
                        className={`admin-change-password-line-1 ${
                            step >= 2 ? "active" : ""
                        }`}
                    ></div>
                    <div
                        className={`admin-change-password-line-2 ${
                            step >= 3 ? "active" : ""
                        }`}
                    ></div>

                    {/* Step 1: Email */}
                    <div className="admin-change-password-step-item">
                        <div
                            className={`admin-change-password-step-circle ${
                                step > 1
                                    ? "completed"
                                    : step === 1
                                      ? "current"
                                      : ""
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
                            className={`admin-change-password-step-label ${
                                step >= 1 ? "active" : ""
                            }`}
                        >
                            Gửi OTP
                        </span>
                    </div>

                    {/* Step 2: OTP */}
                    <div className="admin-change-password-step-item">
                        <div
                            className={`admin-change-password-step-circle ${
                                step > 2
                                    ? "completed"
                                    : step === 2
                                      ? "current"
                                      : ""
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
                            className={`admin-change-password-step-label ${
                                step >= 2 ? "active" : ""
                            }`}
                        >
                            Nhập OTP
                        </span>
                    </div>

                    {/* Step 3: Mật khẩu mới */}
                    <div className="admin-change-password-step-item">
                        <div
                            className={`admin-change-password-step-circle ${
                                step === 3 ? "current" : ""
                            }`}
                        >
                            3
                        </div>
                        <span
                            className={`admin-change-password-step-label ${
                                step === 3 ? "active" : ""
                            }`}
                        >
                            Hoàn tất
                        </span>
                    </div>
                </div>

                {/* Form fields based on step */}
                <div className="admin-change-password-body">
                    {step === 1 && (
                        <div className="admin-change-password-step-content">
                            <h3 className="admin-change-password-title">
                                Xác thực Email
                            </h3>
                            <p className="admin-change-password-desc">
                                Vui lòng nhập địa chỉ email của tài khoản để
                                nhận mã xác thực (OTP).
                            </p>
                            <label className="admin-change-password-label">
                                Email
                            </label>
                            <input
                                type="email"
                                value={passwordData.email}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        email: e.target.value,
                                    })
                                }
                                placeholder="Nhập email..."
                                className="admin-change-password-input"
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="admin-change-password-step-content">
                            <h3 className="admin-change-password-title">
                                Nhập mã OTP
                            </h3>
                            <p className="admin-change-password-desc">
                                Vui lòng kiểm tra hộp thư email{" "}
                                <strong>{passwordData.email}</strong> để lấy mã
                                xác nhận gồm 6 chữ số.
                            </p>
                            <label className="admin-change-password-label">
                                Mã OTP
                            </label>
                            <input
                                type="text"
                                value={passwordData.otp}
                                onChange={(e) =>
                                    setPasswordData({
                                        ...passwordData,
                                        otp: e.target.value,
                                    })
                                }
                                placeholder="Nhập mã xác thực (VD: 123456)"
                                maxLength="6"
                                className="admin-change-password-input-otp"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <div className="admin-change-password-field-group">
                                <label className="admin-change-password-label">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            newPassword: e.target.value,
                                        })
                                    }
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="admin-change-password-input"
                                />
                            </div>
                            <div className="admin-change-password-field-group">
                                <label className="admin-change-password-label">
                                    Xác nhận mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) =>
                                        setPasswordData({
                                            ...passwordData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                    placeholder="Nhập lại mật khẩu"
                                    className="admin-change-password-input"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Submit Buttons Action */}
                {step === 1 && (
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSubmitting || !passwordData.email}
                        className="admin-change-password-btn-full"
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
                    </button>
                )}

                {step === 2 && (
                    <div className="admin-change-password-btn-group">
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="admin-change-password-btn-back"
                        >
                            Quay lại
                        </button>
                        <button
                            type="button"
                            onClick={handleNextToStep3}
                            disabled={
                                !passwordData.otp || passwordData.otp.length < 6
                            }
                            className="admin-change-password-btn-submit"
                        >
                            Xác nhận
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="admin-change-password-btn-group">
                        <button
                            type="button"
                            onClick={() => setStep(2)}
                            disabled={isSubmitting}
                            className="admin-change-password-btn-back"
                        >
                            Trở lại
                        </button>
                        <button
                            type="button"
                            onClick={handleResetPassword}
                            disabled={
                                isSubmitting ||
                                !passwordData.newPassword ||
                                !passwordData.confirmPassword
                            }
                            className="admin-change-password-btn-submit"
                        >
                            {isSubmitting
                                ? "Đang xử lý..."
                                : "Lưu mật khẩu mới"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChangePassword;
