import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useLogin = () => {
    const { loginUser, showToast } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [view, setView] = useState("login"); // login, forgot, reset

    // Form states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [otpCode, setOtpCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Sub-step for reset flow: 'otp' or 'new_password'
    const [resetStep, setResetStep] = useState("otp");

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập đầy đủ Email và Mật khẩu.");
            return;
        }
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await api.post("/auth/login", { email: email.trim(), password, rememberMe });
            const userData = {
                email: response.data.email,
                fullName: response.data.fullName,
                phone: response.data.phone || "",
                address: response.data.address || "",
                role: response.data.role,
                status: response.data.status,
            };
            loginUser(response.data.token, userData, rememberMe);
            const returnUrl = searchParams.get("returnUrl");
            if (returnUrl && !returnUrl.startsWith("//") && !returnUrl.includes("://")) {
                navigate(returnUrl);
            } else if (userData.role === "ADMIN") {
                navigate("/admin");
            } else if (userData.role === "MANAGER") {
                navigate("/manager");
            } else {
                navigate("/");
            }
        } catch (err) {
            let errorMsg = err.response?.data?.error;
            if (!errorMsg || errorMsg === "Bad Request") {
                errorMsg = "Email hoặc mật khẩu không chính xác.";
            } else if (errorMsg.includes("Bad credentials")) {
                errorMsg = "Email hoặc mật khẩu không chính xác.";
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await api.post("/auth/forgot-password", { email });
            setMessage(
                response.data.message ||
                    "Mã OTP khôi phục mật khẩu đã được gửi về Email.",
            );
            setTimeout(() => {
                setView("reset");
                setResetStep("otp");
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Không tìm thấy tài khoản với email này.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        setLoading(true);
        setError("");
        setMessage("");
        try {
            const response = await api.post("/auth/reset-password", {
                email,
                otpCode,
                newPassword,
            });
            showToast(
                response.data.message || "Đặt lại mật khẩu thành công!",
                "success",
            );
            setView("login");
            setResetStep("otp");
            setPassword("");
            setOtpCode("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Mã OTP không đúng hoặc đã hết hạn.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtpStep = () => {
        if (otpCode.length === 6) {
            setResetStep("new_password");
            setError("");
        } else {
            setError("Vui lòng nhập đủ 6 chữ số OTP.");
        }
    };

    const switchView = (targetView) => {
        setView(targetView);
        setError("");
        setMessage("");
    };

    const loginAsGuest = () => {
        navigate("/");
    };

    return {
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
        message,
        error,
        resetStep,
        handleLoginSubmit,
        handleForgotSubmit,
        handleResetSubmit,
        handleVerifyOtpStep,
        switchView,
        loginAsGuest,
    };
};
