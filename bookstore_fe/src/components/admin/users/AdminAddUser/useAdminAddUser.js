import { useState } from "react";
import api from "@/services/api";

export const useAdminAddUser = ({ onSave, showToast }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "USER",
        password: "",
        confirmPassword: "",
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

        if (formData.password.length < 6) {
            showToast("Mật khẩu phải từ 6 ký tự trở lên", "error");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp", "error");
            return;
        }

        const phoneTrimmed = formData.phone ? formData.phone.trim() : "";
        if (phoneTrimmed) {
            const phoneRegex = /^(0|\+84)[35789]\d{8}$/;
            if (!phoneRegex.test(phoneTrimmed)) {
                showToast("Số điện thoại không hợp lệ", "error");
                return;
            }
        }

        setIsSaving(true);

        try {
            const dataToSubmit = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: formData.role,
                password: formData.password,
            };

            const response = await api.post(`/admin/users`, dataToSubmit);

            showToast("Thêm mới người dùng thành công!", "success");
            onSave(response.data.user);
        } catch (error) {
            console.error("Lỗi thêm người dùng:", error);

            showToast(
                error.response?.data?.error ||
                    "Lỗi thêm người dùng. Vui lòng thử lại sau.",
                "error"
            );
        } finally {
            setIsSaving(false);
        }
    };

    const isFormInvalid =
        isSaving ||
        !formData.fullName ||
        !formData.email ||
        !formData.password ||
        !formData.confirmPassword;

    return {
        formData,
        isSaving,
        handleChange,
        handleSubmit,
        isFormInvalid,
    };
};
