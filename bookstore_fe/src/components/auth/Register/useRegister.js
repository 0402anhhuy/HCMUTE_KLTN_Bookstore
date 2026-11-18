import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useRegister = () => {
    const navigate = useNavigate();
    const { showToast } = useApp();

    // Form Fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // UI Flow State: 'register' or 'otp'
    const [view, setView] = useState("register");
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Countdown timer for resend OTP cooldown
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [resendCooldown]);

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            setLoading(false);
            return;
        }

        try {
            const response = await api.post("/auth/register", {
                fullName,
                email,
                phone,
                address,
                password,
            });
            setMessage(response.data.message || "Mã OTP đã được gửi.");
            setView("otp");
            setResendCooldown(60);
        } catch (err) {
            console.error("Register Error details:", err);
            setError(
                err.response?.data?.error ||
                    err.message ||
                    "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await api.post("/auth/verify-otp", {
                email,
                otpCode,
            });
            showToast(
                response.data.message || "Kích hoạt tài khoản thành công!",
                "success",
            );
            navigate("/login");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Mã OTP không hợp lệ hoặc đã hết hạn.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendLoading) return;
        setResendLoading(true);
        setError("");
        setMessage("");
        try {
            await api.post("/auth/register", {
                fullName,
                email,
                phone,
                address,
                password,
            });
            setMessage(
                "Mã OTP mới đã được gửi tới email. Vui lòng kiểm tra hộp thư.",
            );
            setResendCooldown(60);
        } catch (err) {
            setError(err.response?.data?.error || "Không thể gửi lại mã OTP.");
        } finally {
            setResendLoading(false);
        }
    };

    return {
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
    };
};
