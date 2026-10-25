import { useState, useEffect } from "react";
import { promotionService } from "@/services/promotionService";
import { useApp } from "@/context/AppContext";

export const useAdminPromotions = () => {
    const { showToast } = useApp();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [deletingPromotion, setDeletingPromotion] = useState(null);
    const [viewingPromotionId, setViewingPromotionId] = useState(null);
    const [expandedPromoId, setExpandedPromoId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const toggleExpandRow = (id) => {
        setExpandedPromoId((prev) => (prev === id ? null : id));
    };

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionService.getPromotions();
            const rawPromotions = res.data || [];

            // Sync totalRevenue from promotion report endpoint for guaranteed accuracy
            const promotionsWithRevenue = await Promise.all(
                rawPromotions.map(async (promo) => {
                    try {
                        const reportRes = await promotionService.getPromotionReport(promo.id);
                        return {
                            ...promo,
                            totalRevenue: reportRes.data?.totalRevenue ?? promo.totalRevenue ?? 0,
                            totalUses: reportRes.data?.totalUses ?? promo.totalUses ?? 0,
                        };
                    } catch {
                        return promo;
                    }
                })
            );

            setPromotions(promotionsWithRevenue);
        } catch (error) {
            console.error("Lỗi tải promotion", error);
            showToast("Lỗi tải dữ liệu khuyến mãi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString("vi-VN");
    };

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN");
    };

    const formatTimeOnly = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "PENDING":
                return { className: "status-pending", text: "CHỜ KÍCH HOẠT" };
            case "ACTIVE":
                return { className: "status-active", text: "ĐANG DIỄN RA" };
            case "INACTIVE":
                return { className: "status-inactive", text: "VÔ HIỆU HÓA" };
            case "EXPIRED":
                return { className: "status-expired", text: "HẾT CHƯƠNG TRÌNH" };
            default:
                return { className: "status-inactive", text: status };
        }
    };

    const handleSavePromotion = async (payload) => {
        try {
            await promotionService.createPromotion(payload);
            showToast("Tạo chương trình khuyến mãi thành công", "success");
            setIsAddModalOpen(false);
            await loadPromotions();
        } catch (error) {
            console.error("Lỗi tạo promotion", error);
            showToast(
                error.response?.data?.error || "Lỗi tạo chương trình",
                "error"
            );
        }
    };

    const handleUpdatePromotion = async (id, payload) => {
        try {
            await promotionService.updatePromotion(id, payload);
            showToast("Cập nhật chương trình khuyến mãi thành công", "success");
            setEditingPromotion(null);
            await loadPromotions();
        } catch (error) {
            console.error("Lỗi cập nhật promotion", error);
            showToast(
                error.response?.data?.error || "Lỗi cập nhật chương trình",
                "error"
            );
        }
    };

    const handleDeletePromotion = async () => {
        if (!deletingPromotion) return;
        try {
            await promotionService.deletePromotion(deletingPromotion.id);
            showToast("Xóa chương trình khuyến mãi thành công", "success");
            setPromotions((prev) =>
                prev.filter((p) => p.id !== deletingPromotion.id)
            );
            setDeletingPromotion(null);
        } catch (error) {
            console.error("Lỗi xóa promotion", error);
            showToast(
                error.response?.data?.error || "Lỗi xóa chương trình",
                "error"
            );
        }
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
    };

    const filteredPromotions = promotions.filter((promo) => {
        const keyword = searchTerm.toLowerCase();
        const matchSearch = (promo.title || "").toLowerCase().includes(keyword);
        const matchStatus =
            statusFilter === "ALL" || promo.status === statusFilter;
        const matchType =
            typeFilter === "ALL" || promo.discountType === typeFilter;

        return matchSearch && matchStatus && matchType;
    });

    const stats = {
        total: promotions.length,
        active: promotions.filter((p) => p.status === "ACTIVE").length,
        pending: promotions.filter((p) => p.status === "PENDING").length,
        totalRevenue: promotions.reduce(
            (sum, p) => sum + (p.totalRevenue || 0),
            0
        ),
    };

    return {
        showToast,
        promotions,
        loading,
        isAddModalOpen,
        setIsAddModalOpen,
        editingPromotion,
        setEditingPromotion,
        deletingPromotion,
        setDeletingPromotion,
        viewingPromotionId,
        setViewingPromotionId,
        expandedPromoId,
        setExpandedPromoId,
        toggleExpandRow,
        searchTerm,
        setSearchTerm,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        filteredPromotions,
        formatDateTime,
        formatDateOnly,
        formatTimeOnly,
        getStatusStyle,
        handleSavePromotion,
        handleUpdatePromotion,
        handleDeletePromotion,
        handleResetFilter,
        stats,
    };
};