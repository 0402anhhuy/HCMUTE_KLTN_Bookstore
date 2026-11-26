import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "./useLogin";
import "./Login.css";

const Login = () => {
    const {
        view,
        email,
        setEmail,
        password,
        setPassword,
        rememberMe,
        setRememberMe,
        otpCode,
        setOtpCode,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        showPassword,
        setShowPassword,
        loading,
        resendLoading,
        resendCooldown,
        message,
        error,
        resetStep,
        handleLoginSubmit,
        handleForgotSubmit,
        handleResendForgotOtp,
        handleResetSubmit,
        handleVerifyOtpStep,
        switchView,
        loginAsGuest,
    } = useLogin();

    const isDone1 = view === "reset";
    const isActive1 = view === "forgot";

    const isDone2 = view === "reset" && resetStep === "new_password";
    const isActive2 = view === "reset" && resetStep === "otp";

    const isActive3 = view === "reset" && resetStep === "new_password";

    const isResendDisabled = loading || resendLoading || resendCooldown > 0;
    const resendLabel = resendLoading
        ? "Đang gửi..."
        : resendCooldown > 0
          ? `Gửi lại (${resendCooldown}s)`
          : "Gửi lại";

    return (
        <div className="auth-container animate-fade-in auth-page">
            <div className="login-card-wrapper">
                {/* VIEW: LOGIN */}
                {view === "login" && (
                    <form onSubmit={handleLoginSubmit}>
                        <h2 className="login-header-title">
                            Chào mừng trở lại!
                        </h2>
                        <p className="login-header-subtitle">
                            Đăng nhập vào Bookstore
                        </p>

                        {error && (
                            <div className="login-alert-error">{error}</div>
                        )}

                        <div className="form-group login-form-group">
                            <label className="form-label login-field-label">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-input login-text-input"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group login-form-group-sm">
                            <label className="form-label login-field-label">
                                Mật khẩu
                            </label>
                            <div className="login-password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input login-password-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="login-password-toggle-btn"
                                >
                                    {showPassword ? (
                                        <EyeOff size={18} />
                                    ) : (
                                        <Eye size={18} />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="login-remember-forgot-row">
                            <label className="login-remember-me-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="login-remember-me-checkbox"
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => switchView("forgot")}
                                className="login-link-btn"
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="btn-primary login-submit-btn"
                            disabled={loading}
                        >
                            {loading ? "Đang xử lý..." : "Đăng nhập"}
                        </button>

                        <button
                            type="button"
                            onClick={loginAsGuest}
                            className="btn-secondary login-guest-btn"
                        >
                            Đăng nhập với vai trò khách
                        </button>

                        <p className="login-footer-text">
                            Chưa có tài khoản?{" "}
                            <Link to="/register" className="login-footer-link">
                                Đăng ký tại đây
                            </Link>
                        </p>
                    </form>
                )}

                {/* VIEW: FORGOT & RESET PASSWORD FLOW */}
                {(view === "forgot" || view === "reset") && (
                    <div>
                        {/* Stepper */}
                        <div className="login-stepper-container">
                            {/* Step 1 */}
                            <div className="login-step-item">
                                <div
                                    className={`login-step-circle ${isDone1 ? "done" : ""} ${
                                        isActive1 ? "active" : ""
                                    }`}
                                >
                                    {isDone1 ? "✓" : "1"}
                                </div>
                                <span
                                    className={`login-step-label ${
                                        isDone1 || isActive1 ? "active" : ""
                                    }`}
                                >
                                    Email
                                </span>
                            </div>

                            <div
                                className={`login-step-divider ${isDone1 ? "done" : ""}`}
                            />

                            {/* Step 2 */}
                            <div className="login-step-item">
                                <div
                                    className={`login-step-circle ${isDone2 ? "done" : ""} ${
                                        isActive2 ? "active" : ""
                                    }`}
                                >
                                    {isDone2 ? "✓" : "2"}
                                </div>
                                <span
                                    className={`login-step-label ${
                                        isDone2 || isActive2 ? "active" : ""
                                    }`}
                                >
                                    Xác thực OTP
                                </span>
                            </div>

                            <div
                                className={`login-step-divider ${isDone2 ? "done" : ""}`}
                            />

                            {/* Step 3 */}
                            <div className="login-step-item">
                                <div
                                    className={`login-step-circle ${isActive3 ? "active" : ""}`}
                                >
                                    3
                                </div>
                                <span
                                    className={`login-step-label ${isActive3 ? "active" : ""}`}
                                >
                                    Mật khẩu mới
                                </span>
                            </div>
                        </div>

                        {/* Blue Key Icon Header */}
                        <div className="login-key-icon-wrapper">
                            <div className="login-key-icon-box">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="28"
                                    height="28"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="7.5" cy="15.5" r="5.5" />
                                    <path d="m21 2-9.6 9.6" />
                                    <path d="m15.5 7.5 3 3M17 6l3 3" />
                                </svg>
                            </div>
                        </div>

                        <h2 className="forgot-header-title">Quên mật khẩu?</h2>
                        <p className="forgot-header-subtitle">
                            Đừng lo, chúng tôi sẽ giúp bạn khôi phục
                        </p>

                        {error && (
                            <div className="login-alert-error">{error}</div>
                        )}
                        {message && (
                            <div className="login-alert-success">{message}</div>
                        )}

                        {/* Step: Forgot (Enter Email) */}
                        {view === "forgot" && (
                            <form onSubmit={handleForgotSubmit}>
                                <div className="form-group login-form-group-lg">
                                    <label className="form-label login-field-label">
                                        Email đã đăng ký
                                    </label>
                                    <input
                                        type="email"
                                        className="form-input login-text-input"
                                        placeholder="example@gmail.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary login-submit-btn"
                                    disabled={loading}
                                >
                                    <span>
                                        {loading ? "Đang gửi..." : "Gửi mã OTP"}
                                    </span>
                                </button>

                                <div className="login-back-btn-row">
                                    <button
                                        type="button"
                                        onClick={() => switchView("login")}
                                        className="login-link-btn"
                                    >
                                        ← Quay lại đăng nhập
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Step: OTP Verification */}
                        {view === "reset" && resetStep === "otp" && (
                            <div>
                                <div className="login-alert-info">
                                    Đã gửi OTP đến{" "}
                                    <strong className="login-alert-info-email">
                                        {email}
                                    </strong>
                                </div>

                                <div className="form-group login-form-group-lg">
                                    <label className="form-label login-field-label login-field-label-center">
                                        Mã OTP
                                    </label>
                                    <input
                                        type="text"
                                        className="form-input login-otp-input"
                                        placeholder="0  0  0  0  0  0"
                                        value={otpCode}
                                        onChange={(e) =>
                                            setOtpCode(e.target.value)
                                        }
                                        maxLength={6}
                                        required
                                    />
                                    <p className="login-otp-hint">
                                        Nhập mã 6 chữ số được gửi đến email của
                                        bạn
                                    </p>
                                </div>

                                <div className="login-otp-buttons-row">
                                    <button
                                        type="button"
                                        onClick={handleVerifyOtpStep}
                                        className="btn-primary login-btn-verify-otp"
                                    >
                                        Xác nhận OTP
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendForgotOtp}
                                        disabled={isResendDisabled}
                                        className="login-btn-resend-otp"
                                    >
                                        {resendLabel}
                                    </button>
                                </div>

                                <div className="login-resend-inline-box">
                                    Không nhận được?{" "}
                                    <button
                                        type="button"
                                        className="login-resend-inline-link"
                                        disabled={isResendDisabled}
                                        onClick={handleResendForgotOtp}
                                    >
                                        {resendLabel}
                                    </button>
                                </div>

                                <div className="login-back-btn-row">
                                    <button
                                        type="button"
                                        onClick={() => switchView("login")}
                                        className="login-link-btn"
                                    >
                                        ← Quay lại đăng nhập
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step: New Password */}
                        {view === "reset" && resetStep === "new_password" && (
                            <form onSubmit={handleResetSubmit}>
                                <div className="form-group login-form-group">
                                    <label className="form-label login-field-label">
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        className="form-input login-text-input"
                                        placeholder="Tối thiểu 6 ký tự"
                                        value={newPassword}
                                        onChange={(e) =>
                                            setNewPassword(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                                <div className="form-group login-form-group-lg">
                                    <label className="form-label login-field-label">
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        className="form-input login-text-input"
                                        placeholder="Nhập lại mật khẩu"
                                        value={confirmNewPassword}
                                        onChange={(e) =>
                                            setConfirmNewPassword(
                                                e.target.value,
                                            )
                                        }
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn-primary login-submit-btn"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Đang cập nhật..."
                                        : "Đặt lại mật khẩu"}
                                </button>

                                <div className="login-back-btn-row">
                                    <button
                                        type="button"
                                        onClick={() => switchView("login")}
                                        className="login-link-btn"
                                    >
                                        ← Quay lại đăng nhập
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
