import { Link } from "react-router-dom";
import { useRegister } from "./useRegister";
import "./Register.css";

const Register = () => {
    const {
        fullName,
        setFullName,
        email,
        setEmail,
        phone,
        setPhone,
        address,
        setAddress,
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        view,
        otpCode,
        setOtpCode,
        loading,
        resendLoading,
        resendCooldown,
        error,
        message,
        handleRegisterSubmit,
        handleOtpSubmit,
        handleResendOtp,
    } = useRegister();

    return (
        <div className="auth-container animate-fade-in auth-page">
            <div className="register-card-wrapper">
                {/* VIEW: REGISTER FORM */}
                {view === "register" && (
                    <form onSubmit={handleRegisterSubmit}>
                        <h2 className="register-header-title">
                            Tạo tài khoản{" "}
                            <span className="register-brand-highlight">
                                Bookstore
                            </span>
                        </h2>

                        {/* Stepper */}
                        <div className="register-stepper-container">
                            <div className="register-step-item">
                                <div className="register-step-circle active">
                                    1
                                </div>
                                <span className="register-step-label active">
                                    Thông tin
                                </span>
                            </div>
                            <div className="register-step-divider" />
                            <div className="register-step-item">
                                <div className="register-step-circle inactive">
                                    2
                                </div>
                                <span className="register-step-label inactive">
                                    Xác thực OTP
                                </span>
                            </div>
                        </div>

                        {error && (
                            <div className="register-alert-error">{error}</div>
                        )}

                        <div className="form-group register-form-group">
                            <label className="form-label register-field-label">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                className="form-input register-text-input"
                                placeholder="Nguyễn Văn A"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group register-form-group">
                            <label className="form-label register-field-label">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-input register-text-input"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group register-form-group">
                            <label className="form-label register-field-label">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                className="form-input register-text-input"
                                placeholder="Ví dụ: 0912345678"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group register-form-group">
                            <label className="form-label register-field-label">
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                className="form-input register-text-input"
                                placeholder="Tối thiểu 6 ký tự"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group register-form-group">
                            <label className="form-label register-field-label">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                className="form-input register-text-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="form-group register-form-group-lg">
                            <label className="form-label register-field-label">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                className="form-input register-text-input"
                                placeholder="VD: 123 Lê Lợi, Phường 1, Quận 1, TP.HCM"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary register-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Đang gửi..." : "Gửi mã OTP"}
                        </button>

                        <p className="register-footer-text">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="register-footer-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                )}

                {/* VIEW: OTP VERIFICATION VIEW */}
                {view === "otp" && (
                    <form onSubmit={handleOtpSubmit}>
                        <h2 className="register-header-title">
                            Tạo tài khoản{" "}
                            <span className="register-brand-highlight">
                                Bookstore
                            </span>
                        </h2>

                        {/* Stepper */}
                        <div className="register-stepper-container">
                            <div className="register-step-item">
                                <div className="register-step-circle active">
                                    ✓
                                </div>
                                <span className="register-step-label inactive">
                                    Thông tin
                                </span>
                            </div>
                            <div className="register-step-divider active" />
                            <div className="register-step-item">
                                <div className="register-step-circle active">
                                    2
                                </div>
                                <span className="register-step-label active">
                                    Xác thực OTP
                                </span>
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="register-alert-info">
                            Đã gửi OTP đến{" "}
                            <strong className="register-alert-info-email">
                                {email}
                            </strong>
                        </div>

                        {error && (
                            <div className="register-alert-error">{error}</div>
                        )}

                        <div className="form-group register-form-group-lg">
                            <label className="form-label register-field-label register-field-label-center">
                                Mã OTP
                            </label>
                            <input
                                type="text"
                                className="form-input register-otp-input"
                                placeholder="0  0  0  0  0  0"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                            <p className="register-otp-hint">
                                Nhập mã 6 chữ số được gửi đến email của bạn
                            </p>
                        </div>

                        <div className="register-otp-btn-row">
                            <button
                                type="submit"
                                className="btn-primary register-btn-verify-otp"
                                disabled={loading}
                            >
                                {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={
                                    loading ||
                                    resendLoading ||
                                    resendCooldown > 0
                                }
                                className="register-btn-resend-otp"
                            >
                                {resendLoading
                                    ? "Đang gửi..."
                                    : resendCooldown > 0
                                      ? `Gửi lại (${resendCooldown}s)`
                                      : "Gửi lại"}
                            </button>
                        </div>

                        {/* Alert box */}
                        {message && (
                            <div className="register-alert-message">
                                {message}
                            </div>
                        )}

                        <p className="register-footer-text">
                            Đã có tài khoản?{" "}
                            <Link to="/login" className="register-footer-link">
                                Đăng nhập ngay
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Register;
