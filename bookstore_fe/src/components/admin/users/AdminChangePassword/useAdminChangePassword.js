import { useState } from "react";
import api from "@/services/api";

export const useAdminChangePassword = ({ user, onClose, showToast }) => {
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
            showToast?.("Mã OTP đã được gửi đến email của bạn", "success");
            setStep(2);
        } catch (error) {
            console.error(error);
            showToast?.(
                error.response?.data?.error || "Lỗi gửi mã OTP",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextToStep3 = () => {
        if (!passwordData.otp || passwordData.otp.length < 6) {
            showToast?.("Vui lòng nhập mã OTP hợp lệ", "error");
            return;
        }
        setStep(3);
    };

    const handleResetPassword = async () => {
        if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
            showToast?.("Mật khẩu mới phải từ 6 ký tự trở lên", "error");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast?.("Mật khẩu xác nhận không khớp", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/auth/reset-password", {
                email: passwordData.email,
                otpCode: passwordData.otp,
                newPassword: passwordData.newPassword,
            });
            showToast?.("Thay đổi mật khẩu thành công!", "success");
            onClose?.();
        } catch (error) {
            console.error(error);
            showToast?.(
                error.response?.data?.error || "Lỗi khi đổi mật khẩu",
                "error",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        step,
        setStep,
        isSubmitting,
        passwordData,
        setPasswordData,
        handleSendOtp,
        handleNextToStep3,
        handleResetPassword,
    };
};
