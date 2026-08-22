import { useState } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useSecuritySettings = () => {
    const { showToast } = useApp();
    const [loading, setLoading] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

    // Password States
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (newPassword === oldPassword) {
            showToast?.(
                "Mật khẩu mới không được trùng với mật khẩu cũ.",
                "error",
            );
            setLoading(false);
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showToast?.("Mật khẩu xác nhận không khớp.", "error");
            setLoading(false);
            return;
        }

        try {
            await api.post("/users/change-password", {
                oldPassword,
                newPassword,
            });
            showToast?.("Đổi mật khẩu thành công!", "success");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (err) {
            showToast?.(
                err.response?.data?.error || "Mật khẩu cũ không chính xác.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        twoFactor,
        setTwoFactor,
        oldPassword,
        setOldPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        handlePasswordSubmit,
    };
};
