import { useEffect, useState } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useAdminDetailProduct = ({ productId, onBack, loadMainData }) => {
    const { showToast } = useApp();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectError, setRejectError] = useState("");
    const [submittingReject, setSubmittingReject] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);
            } catch (err) {
                console.error(err);
                showToast?.("Không thể tải chi tiết sản phẩm", "error");
            } finally {
                setLoading(false);
            }
        };
        if (productId) fetchProduct();
    }, [productId, showToast]);

    const handleApprove = async () => {
        try {
            await api.put(
                `/products/${productId}?categoryId=${product?.category?.id}`,
                {
                    ...product,
                    status: "ACTIVE",
                    rejectionReason: null,
                },
            );
            showToast?.("Đã duyệt sản phẩm thành công", "success");
            loadMainData?.();
            onBack?.();
        } catch (err) {
            console.error(err);
            showToast?.("Lỗi khi duyệt sản phẩm", "error");
        }
    };

    const openRejectModal = () => {
        setRejectReason("");
        setRejectError("");
        setIsRejectModalOpen(true);
    };

    const closeRejectModal = () => {
        if (submittingReject) return;
        setIsRejectModalOpen(false);
        setRejectError("");
    };

    const handleConfirmReject = async (e) => {
        e?.preventDefault?.();
        const trimmedReason = rejectReason.trim();
        if (!trimmedReason) {
            setRejectError("Vui lòng nhập lý do từ chối sản phẩm.");
            return;
        }
        setSubmittingReject(true);
        try {
            await api.put(
                `/products/${productId}?categoryId=${product?.category?.id}`,
                {
                    ...product,
                    status: "REJECTED",
                    rejectionReason: trimmedReason,
                },
            );
            showToast?.("Đã từ chối sản phẩm", "success");
            setIsRejectModalOpen(false);
            loadMainData?.();
            onBack?.();
        } catch (err) {
            console.error(err);
            const message = err?.response?.data?.message || "Lỗi khi từ chối sản phẩm";
            showToast?.(message, "error");
        } finally {
            setSubmittingReject(false);
        }
    };

    const handleDeactivate = async () => {
        try {
            await api.put(
                `/products/${productId}?categoryId=${product?.category?.id}`,
                {
                    ...product,
                    status: "INACTIVE",
                },
            );
            showToast?.("Đã tạm ẩn sản phẩm", "success");
            loadMainData?.();
            onBack?.();
        } catch (err) {
            console.error(err);
            showToast?.("Lỗi khi cập nhật trạng thái sản phẩm", "error");
        }
    };

    const images =
        Array.isArray(product?.imageUrls) && product.imageUrls.length > 0
            ? product.imageUrls
            : typeof product?.imageUrl === "string"
              ? product.imageUrl
                    .split("||")
                    .map((s) => s.trim())
                    .filter(Boolean)
              : [];

    const displayImage =
        images.length > 0
            ? images[0]
            : "https://via.placeholder.com/300x400?text=No+Image";

    return {
        product,
        loading,
        displayImage,
        isRejectModalOpen,
        rejectReason,
        rejectError,
        submittingReject,
        setRejectReason,
        openRejectModal,
        closeRejectModal,
        handleApprove,
        handleConfirmReject,
        handleDeactivate,
    };
};
