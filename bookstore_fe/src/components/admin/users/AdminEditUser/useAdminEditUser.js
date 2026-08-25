import { useState } from "react";
import api from "@/services/api";

export const useAdminEditUser = ({ user, onSave, showToast }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        role: "USER",
        status: "ACTIVE",
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put(`/admin/users/${user.id}`, formData);
            showToast?.("Cập nhật thông tin người dùng thành công!", "success");
            onSave?.(response.data.user || formData);
        } catch (error) {
            console.error("Lỗi cập nhật người dùng:", error);
            showToast?.(
                error.response?.data?.error ||
                    "Lỗi cập nhật người dùng. Vui lòng thử lại sau.",
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return {
        formData,
        isSaving,
        handleChange,
        handleSubmit,
    };
};
