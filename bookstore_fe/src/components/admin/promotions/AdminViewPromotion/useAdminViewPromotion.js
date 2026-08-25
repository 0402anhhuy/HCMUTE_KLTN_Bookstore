import { useState, useEffect } from "react";
import { promotionService } from "@/services/promotionService";

export const useAdminViewPromotion = ({ promotionId, onClose, showToast }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res =
                    await promotionService.getPromotionReport(promotionId);
                setReport(res.data);
            } catch (error) {
                console.error("Lỗi tải báo cáo khuyến mãi", error);
                showToast?.("Không thể tải báo cáo hệ thống", "error");
                onClose?.();
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [promotionId, showToast, onClose]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString("vi-VN");
    };

    const getStatusInfo = (status) => {
        let className = "status-default";
        let text = status;

        switch (status) {
            case "PENDING":
                className = "status-pending";
                text = "CHỜ KÍCH HOẠT";
                break;
            case "ACTIVE":
                className = "status-active";
                text = "ĐANG DIỄN RA";
                break;
            case "INACTIVE":
                className = "status-inactive";
                text = "VÔ HIỆU HÓA";
                break;
            case "EXPIRED":
                className = "status-expired";
                text = "HẾT CHƯƠNG TRÌNH";
                break;
            default:
                break;
        }

        return { className, text };
    };

    return {
        report,
        loading,
        formatDateTime,
        getStatusInfo,
    };
};
