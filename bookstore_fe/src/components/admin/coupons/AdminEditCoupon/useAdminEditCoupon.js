import { useState } from "react";
import { couponService } from "@/services/couponService";

export const useAdminEditCoupon = ({ coupon, onSave, showToast }) => {
    const formatDate = (isoString) => {
        if (!isoString) return "";
        return isoString.split("T")[0];
    };

    const [formData, setFormData] = useState({
        code: coupon?.code || "",
        discountPercentage:
            coupon?.discountType === "PERCENT" ? coupon.discountValue : "",
        discountAmount:
            coupon?.discountType === "FIXED" ? coupon.discountValue : "",
        minOrderAmount: coupon?.minOrderValue || "0",
        maxDiscountAmount: coupon?.maxDiscountAmount || "0",
        validFrom: formatDate(coupon?.startDate),
        validTo: formatDate(coupon?.endDate),
        usageLimit: coupon?.usageLimit || "100",
        active: coupon?.status === "ACTIVE",
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "select-one" && (value === "true" || value === "false")
                ? value === "true"
                : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            showToast?.("Vui lòng nhập mã giảm giá", "error");
            return;
        }

        if (formData.validFrom && formData.validTo) {
            if (new Date(formData.validTo) < new Date(formData.validFrom)) {
                showToast?.("Ngày hết hạn không được nhỏ hơn ngày bắt đầu", "error");
                return;
            }
        }

        if (
            (formData.discountPercentage && Number(formData.discountPercentage) < 0) ||
            (formData.discountAmount && Number(formData.discountAmount) < 0) ||
            (formData.usageLimit && Number(formData.usageLimit) < 0)
        ) {
            showToast?.("Giá trị hoặc số lượng không được âm", "error");
            return;
        }

        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                discountPercentage: formData.discountPercentage
                    ? Number(formData.discountPercentage)
                    : null,
                discountAmount: formData.discountAmount
                    ? Number(formData.discountAmount)
                    : null,
                minOrderAmount: Number(formData.minOrderAmount || 0),
                maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
                validFrom: formData.validFrom ? `${formData.validFrom}T00:00:00` : null,
                validTo: formData.validTo ? `${formData.validTo}T23:59:59` : null,
                usageLimit: Number(formData.usageLimit || 100),
                active: formData.active,
            };
            await couponService.updateCoupon(coupon.id, payload);
            showToast?.("Cập nhật mã giảm giá thành công", "success");
            onSave?.();
        } catch (error) {
            console.error("Lỗi khi cập nhật mã giảm giá", error);
            showToast?.(
                error.response?.data?.error || "Lỗi cập nhật hệ thống",
                "error"
            );
        }
    };

    return {
        formData,
        setFormData,
        handleChange,
        handleSubmit,
    };
};