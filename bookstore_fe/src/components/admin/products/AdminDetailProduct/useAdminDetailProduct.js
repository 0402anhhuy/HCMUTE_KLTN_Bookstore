import { useEffect, useState } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useAdminDetailProduct = ({ productId, onBack, loadMainData }) => {
    const { showToast } = useApp();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

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

    const handleReject = async () => {
        try {
            await api.put(
                `/products/${productId}?categoryId=${product?.category?.id}`,
                {
                    ...product,
                    status: "INACTIVE",
                },
            );
            showToast?.("Đã từ chối sản phẩm", "success");
            loadMainData?.();
            onBack?.();
        } catch (err) {
            console.error(err);
            showToast?.("Lỗi khi từ chối sản phẩm", "error");
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
        handleApprove,
        handleReject,
    };
};
