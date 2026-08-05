import React, { useState } from "react";
import api from "../../services/api";

const AdminChangePassword = ({ user, onClose, showToast }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordData, setPasswordData] = useState({
        email: user?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleSendOtp = async () => {
        if (!passwordData.email) return;
        setIsSubmitting(true);
        try {
            await api.post("/auth/forgot-password", {
                email: passwordData.email,
            });
            showToast("Mã OTP đã được gửi đến email của bạn", "success");
            setStep(2);
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.error || "Lỗi gửi mã OTP", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextToStep3 = () => {
        if (!passwordData.otp || passwordData.otp.length < 6) {
            showToast("Vui lòng nhập mã OTP hợp lệ", "error");
            return;
        }
        setStep(3);
    };

    const handleResetPassword = async () => {
        if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
            showToast("Mật khẩu mới phải từ 6 ký tự trở lên", "error");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/auth/reset-password", {
                email: passwordData.email,
                otpCode: passwordData.otp,
                newPassword: passwordData.newPassword,
            });
            showToast("Thay đổi mật khẩu thành công!", "success");
            onClose();
        } catch (error) {
            console.error(error);
            showToast(
                error.response?.data?.error || "Lỗi khi đổi mật khẩu",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "420px",
                    padding: "32px 32px 24px",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    position: "relative",
                }}
            >
                {/* Stepper */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "flex-start",
                        position: "relative",
                        width: "100%",
                        margin: "0 0 40px",
                    }}
                >
                    {/* Connecting Lines */}
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            left: "16.66%",
                            right: "50%",
                            height: "2px",
                            backgroundColor: step >= 2 ? "#ef4444" : "#f1f5f9",
                            zIndex: 1,
                            transition: "background-color 0.3s",
                        }}
                    ></div>
                    <div
                        style={{
                            position: "absolute",
                            top: "12px",
                            left: "50%",
                            right: "16.66%",
                            height: "2px",
                            backgroundColor: step >= 3 ? "#ef4444" : "#f1f5f9",
                            zIndex: 1,
                            transition: "background-color 0.3s",
                        }}
                    ></div>

                    {/* Step 1: Email */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor:
                                    step > 1
                                        ? "#ef4444"
                                        : step === 1
                                          ? "#ffffff"
                                          : "#f1f5f9",
                                border: `2px solid ${step >= 1 ? "#ef4444" : "#cbd5e1"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: step === 1 ? "#ef4444" : "#fff",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                boxSizing: "border-box",
                                transition: "all 0.3s",
                            }}
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
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: step >= 1 ? "#7f1d1d" : "#94a3b8",
                                transition: "color 0.3s",
                            }}
                        >
                            Gửi OTP
                        </span>
                    </div>

                    {/* Step 2: OTP */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor:
                                    step > 2
                                        ? "#ef4444"
                                        : step === 2
                                          ? "#ffffff"
                                          : "#f1f5f9",
                                border: `2px solid ${step >= 2 ? "#ef4444" : "#cbd5e1"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color:
                                    step === 2
                                        ? "#ef4444"
                                        : step > 2
                                          ? "#fff"
                                          : "#94a3b8",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                boxSizing: "border-box",
                                transition: "all 0.3s",
                            }}
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
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: step >= 2 ? "#7f1d1d" : "#94a3b8",
                                transition: "color 0.3s",
                            }}
                        >
                            Nhập OTP
                        </span>
                    </div>

                    {/* Step 3: Mật khẩu mới */}
                    <div
                        style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            zIndex: 2,
                        }}
                    >
                        <div
                            style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                backgroundColor:
                                    step === 3 ? "#ffffff" : "#f1f5f9",
                                border: `2px solid ${step === 3 ? "#ef4444" : "#cbd5e1"}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: step === 3 ? "#ef4444" : "#94a3b8",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                boxSizing: "border-box",
                                transition: "all 0.3s",
                            }}
                        >
                            3
                        </div>
                        <span
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: step === 3 ? "#7f1d1d" : "#94a3b8",
                                transition: "color 0.3s",
                            }}
                        >
                            Hoàn tất
                        </span>
                    </div>
                </div>

                {/* Form fields based on step */}
                <div
                    style={{
                        marginBottom: "32px",
                        minHeight: "160px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    {step === 1 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    textAlign: "center",
                                }}
                            >
                                Xác thực Email
                            </h3>
                            <p
                                style={{
                                    margin: "0 0 16px",
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                    textAlign: "center",
                                }}
                            >
                                Vui lòng nhập địa chỉ email của tài khoản để
                                nhận mã xác thực (OTP).
                            </p>
                            <label
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                            >
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
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "14px 16px",
                                    borderRadius: "8px",
                                    border: "2px solid #cbd5e1",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    color: "#334155",
                                    transition: "border 0.2s",
                                }}
                                onFocus={(e) =>
                                    (e.target.style.border =
                                        "2px solid #ef4444")
                                }
                                onBlur={(e) =>
                                    (e.target.style.border =
                                        "2px solid #cbd5e1")
                                }
                            />
                        </div>
                    )}

                    {step === 2 && (
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: "1.2rem",
                                    fontWeight: 700,
                                    color: "#1e293b",
                                    textAlign: "center",
                                }}
                            >
                                Nhập mã OTP
                            </h3>
                            <p
                                style={{
                                    margin: "0 0 16px",
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                    textAlign: "center",
                                }}
                            >
                                Vui lòng kiểm tra hộp thư email{" "}
                                <strong>{passwordData.email}</strong> để lấy mã
                                xác nhận gồm 6 chữ số.
                            </p>
                            <label
                                style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                }}
                            >
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
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "14px 16px",
                                    borderRadius: "8px",
                                    border: "2px solid #cbd5e1",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    color: "#334155",
                                    transition: "border 0.2s",
                                    textAlign: "center",
                                    letterSpacing: "4px",
                                    fontWeight: 700,
                                }}
                                onFocus={(e) =>
                                    (e.target.style.border =
                                        "2px solid #ef4444")
                                }
                                onBlur={(e) =>
                                    (e.target.style.border =
                                        "2px solid #cbd5e1")
                                }
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    marginBottom: "16px",
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        color: "#1e293b",
                                    }}
                                >
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
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "14px 16px",
                                        borderRadius: "8px",
                                        border: "2px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        color: "#334155",
                                        transition: "border 0.2s",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.border =
                                            "2px solid #ef4444")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.border =
                                            "2px solid #cbd5e1")
                                    }
                                />
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                }}
                            >
                                <label
                                    style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        color: "#1e293b",
                                    }}
                                >
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
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "14px 16px",
                                        borderRadius: "8px",
                                        border: "2px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        color: "#334155",
                                        transition: "border 0.2s",
                                    }}
                                    onFocus={(e) =>
                                        (e.target.style.border =
                                            "2px solid #ef4444")
                                    }
                                    onBlur={(e) =>
                                        (e.target.style.border =
                                            "2px solid #cbd5e1")
                                    }
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Submit Buttons Action */}
                {step === 1 && (
                    <button
                        onClick={handleSendOtp}
                        disabled={isSubmitting || !passwordData.email}
                        style={{
                            width: "100%",
                            padding: "14px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor:
                                isSubmitting || !passwordData.email
                                    ? "#fca5a5"
                                    : "#ef4444",
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: "1rem",
                            cursor:
                                isSubmitting || !passwordData.email
                                    ? "not-allowed"
                                    : "pointer",
                            boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
                    </button>
                )}

                {step === 2 && (
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => setStep(1)}
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#ffffff",
                                color: "#334155",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: "pointer",
                            }}
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={handleNextToStep3}
                            disabled={
                                !passwordData.otp || passwordData.otp.length < 6
                            }
                            style={{
                                flex: 2,
                                padding: "14px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor:
                                    !passwordData.otp ||
                                    passwordData.otp.length < 6
                                        ? "#fca5a5"
                                        : "#ef4444",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor:
                                    !passwordData.otp ||
                                    passwordData.otp.length < 6
                                        ? "not-allowed"
                                        : "pointer",
                                boxShadow:
                                    "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
                            }}
                        >
                            Xác nhận
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: "flex", gap: "12px" }}>
                        <button
                            onClick={() => setStep(2)}
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#ffffff",
                                color: "#334155",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor: isSubmitting
                                    ? "not-allowed"
                                    : "pointer",
                            }}
                        >
                            Trở lại
                        </button>
                        <button
                            onClick={handleResetPassword}
                            disabled={
                                isSubmitting ||
                                !passwordData.newPassword ||
                                !passwordData.confirmPassword
                            }
                            style={{
                                flex: 2,
                                padding: "14px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor:
                                    isSubmitting ||
                                    !passwordData.newPassword ||
                                    !passwordData.confirmPassword
                                        ? "#fca5a5"
                                        : "#ef4444",
                                color: "#ffffff",
                                fontWeight: 700,
                                fontSize: "1rem",
                                cursor:
                                    isSubmitting ||
                                    !passwordData.newPassword ||
                                    !passwordData.confirmPassword
                                        ? "not-allowed"
                                        : "pointer",
                                boxShadow:
                                    "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
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
