import { useState } from "react";
import { couponService } from "@/services/couponService";

export const useAdminCoupons = ({ coupons = [], loadData, showToast }) => {
    const [activeSubTab, setActiveSubTab] = useState("coupons");
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deletingCoupon, setDeletingCoupon] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    // New Coupon Form state
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        discountAmount: "",
        minOrderAmount: "100000",
        maxDiscountAmount: "50000",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 30 * 86400000)
            .toISOString()
            .split("T")[0],
        usageLimit: "100",
    });

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCreateCoupon = async (e) => {
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
            (formData.discountAmount && Number(formData.discountAmount) < 0)
        ) {
            showToast?.("Giá trị giảm giá không hợp lệ (không được âm)", "error");
            return;
        }

        try {
            await couponService.createCoupon({
                code: formData.code.toUpperCase().trim(),
                discountPercentage: formData.discountPercentage
                    ? Number(formData.discountPercentage)
                    : null,
                discountAmount: formData.discountAmount
                    ? Number(formData.discountAmount)
                    : null,
                minOrderAmount: Number(formData.minOrderAmount || 0),
                maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
                validFrom: formData.validFrom
                    ? `${formData.validFrom}T00:00:00`
                    : null,
                validTo: formData.validTo
                    ? `${formData.validTo}T23:59:59`
                    : null,
                usageLimit: Number(formData.usageLimit || 100),
                active: true,
            });
            showToast?.("Tạo mã giảm giá thành công!", "success");
            setShowForm(false);
            setFormData({
                code: "",
                discountPercentage: "",
                discountAmount: "",
                minOrderAmount: "100000",
                maxDiscountAmount: "50000",
                validFrom: new Date().toISOString().split("T")[0],
                validTo: new Date(Date.now() + 30 * 86400000)
                    .toISOString()
                    .split("T")[0],
                usageLimit: "100",
            });
            loadData?.();
        } catch (error) {
            console.error("Failed to create coupon", error);
            showToast?.("Lỗi khi tạo mã giảm giá", "error");
        }
    };

    const handleDeleteCoupon = async () => {
        if (!deletingCoupon) return;
        try {
            await couponService.deleteCoupon(deletingCoupon.id);
            showToast?.("Đã xóa mã giảm giá", "success");
            setDeletingCoupon(null);
            loadData?.();
        } catch (error) {
            console.error("Failed to delete coupon", error);
            showToast?.("Không thể xóa mã giảm giá", "error");
        }
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
    };

    const filteredCoupons = coupons.filter((coupon) => {
        const keyword = searchTerm.toLowerCase();
        const matchSearch = (coupon.code || "").toLowerCase().includes(keyword);

        let matchStatus = true;
        if (statusFilter === "ACTIVE") matchStatus = coupon.status === "ACTIVE";
        if (statusFilter === "INACTIVE") matchStatus = coupon.status === "INACTIVE";

        let matchType = true;
        if (typeFilter === "PERCENT") matchType = coupon.discountType === "PERCENT";
        if (typeFilter === "AMOUNT") matchType = coupon.discountType === "FIXED";

        return matchSearch && matchStatus && matchType;
    });

    return {
        activeSubTab,
        setActiveSubTab,
        showForm,
        setShowForm,
        editingCoupon,
        setEditingCoupon,
        deletingCoupon,
        setDeletingCoupon,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        formData,
        setFormData,
        filteredCoupons,
        formatPrice,
        handleFormChange,
        handleCreateCoupon,
        handleDeleteCoupon,
        handleResetFilter,
    };
};