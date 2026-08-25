import { useState } from "react";

export const useAdminEditProfile = ({ user, onSave }) => {
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [passwordData, setPasswordData] = useState({
        email: user?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePasswordDataChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const openPasswordModal = () => {
        setStep(1);
        setPasswordData({
            email: user?.email || "",
            otp: "",
            newPassword: "",
            confirmPassword: "",
        });
        setIsPasswordModalOpen(true);
    };

    const closePasswordModal = () => {
        setIsPasswordModalOpen(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
    };

    const handleCompletePasswordReset = () => {
        alert("Mật khẩu đã được đặt lại thành công (Mock UI)!");
        setIsPasswordModalOpen(false);
    };

    return {
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
    };
};
