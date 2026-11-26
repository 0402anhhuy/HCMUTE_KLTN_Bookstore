import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { prepareEvidenceFileForUpload, validateEvidenceFile } from "./returnUpload";

export const useOrderHistory = () => {
    const { user, showToast, reloadUserProfile } = useApp();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("ALL");

    // Expanded items loading cache
    const [orderItems, setOrderItems] = useState({});

    // Modals state
    const [cancelOrderId, setCancelOrderId] = useState(null);
    const [cancelReason, setCancelReason] = useState("");

    const [returnOrderId, setReturnOrderId] = useState(null);
    const [returnType, setReturnType] = useState("RETURN_REFUND");
    const [returnReasonCategory, setReturnReasonCategory] = useState(
        "Sách bị hỏng/rách trong quá trình vận chuyển",
    );
    const [returnReasonDetail, setReturnReasonDetail] = useState("");
    const [evidenceImages, setEvidenceImages] = useState([]);
    const [uploadingImage, setUploadingImage] = useState(false);

    const [reviewProduct, setReviewProduct] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [activeReturnRequest, setActiveReturnRequest] = useState(null);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [editAddressValue, setEditAddressValue] = useState("");
    const [editPhoneValue, setEditPhoneValue] = useState("");

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get("/orders");
            const fetchedOrders = (response.data || []).sort(
                (a, b) => b.id - a.id,
            );
            setOrders(fetchedOrders);
            const itemPromises = fetchedOrders.map((o) =>
                api.get(`/orders/${o.id}`).then((res) => ({
                    id: o.id,
                    items: res.data.items,
                })),
            );
            const itemsResponses = await Promise.all(itemPromises);
            const newItemsMap = {};
            itemsResponses.forEach((res) => {
                newItemsMap[res.id] = res.items;
            });
            setOrderItems(newItemsMap);
        } catch (e) {
            console.error("Failed to load orders:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        let active = true;
        Promise.resolve().then(() => {
            if (active) fetchOrders();
        });
        return () => {
            active = false;
        };
    }, [user]);

    useEffect(() => {
        const handleOrderUpdated = (event) => {
            const { orderId } = event.detail || {};
            setTimeout(async () => {
                try {
                    const response = await api.get("/orders");
                    const fetchedOrders = (response.data || []).sort(
                        (a, b) => b.id - a.id,
                    );
                    setOrders(fetchedOrders);

                    if (orderId) {
                        const detailRes = await api
                            .get(`/orders/${orderId}`)
                            .catch(() => null);
                        if (detailRes?.data?.items) {
                            setOrderItems((prev) => ({
                                ...prev,
                                [orderId]: detailRes.data.items,
                            }));
                        }
                    }

                    if (
                        selectedOrderDetail &&
                        selectedOrderDetail.id === orderId
                    ) {
                        const updatedOrder = fetchedOrders.find(
                            (o) => o.id === orderId,
                        );
                        if (updatedOrder) {
                            setSelectedOrderDetail(updatedOrder);
                            if (
                                updatedOrder.status === "cancel_requested" ||
                                updatedOrder.status === "refunded"
                            ) {
                                const res = await api.get(
                                    `/orders/${orderId}/return`,
                                );
                                setActiveReturnRequest(res.data);
                            } else {
                                setActiveReturnRequest(null);
                            }
                        }
                    }
                    reloadUserProfile?.();
                } catch (err) {
                    console.error(
                        "Error auto-refreshing order list/details:",
                        err,
                    );
                }
            }, 300);
        };

        window.addEventListener("order-updated", handleOrderUpdated);
        return () => {
            window.removeEventListener("order-updated", handleOrderUpdated);
        };
    }, [selectedOrderDetail, reloadUserProfile]);

    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!cancelReason.trim()) return;
        try {
            await api.post(
                `/orders/${cancelOrderId}/cancel?reason=${encodeURIComponent(
                    cancelReason,
                )}`,
            );
            showToast?.("Đơn hàng đã được hủy thành công.", "success");
            setCancelOrderId(null);
            setCancelReason("");
            fetchOrders();
            reloadUserProfile?.();
        } catch (err) {
            showToast?.(
                err.response?.data?.error || "Không thể hủy đơn hàng này.",
                "error",
            );
        }
    };

    const handleEvidenceUpload = async (e) => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const validation = validateEvidenceFile(file);
        if (!validation.valid) {
            showToast?.(validation.error, "error");
            input.value = "";
            return;
        }

        setUploadingImage(true);
        try {
            const fileToUpload = await prepareEvidenceFileForUpload(file);
            const formData = new FormData();
            formData.append("file", fileToUpload);

            const response = await api.post("/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            const newUrl = response.data.url;
            setEvidenceImages((prev) => [...prev, newUrl]);
            showToast?.("Tải ảnh minh chứng thành công!", "success");
        } catch (err) {
            console.error(err);
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    "Lỗi khi tải ảnh minh chứng!",
                "error",
            );
        } finally {
            setUploadingImage(false);
            if (input) {
                input.value = "";
            }
        }
    };

    const handleRemoveEvidence = (index) => {
        setEvidenceImages((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        const finalReason = `[${returnReasonCategory}] ${returnReasonDetail.trim()}`;
        const imagesStr = evidenceImages.join(" || ");
        try {
            await api.post(
                `/orders/${returnOrderId}/return?reason=${encodeURIComponent(
                    finalReason,
                )}&returnType=${returnType}&evidenceImages=${encodeURIComponent(
                    imagesStr,
                )}`,
            );
            showToast?.(
                "Yêu cầu đổi trả đã được gửi đi thành công.",
                "success",
            );
            setReturnOrderId(null);
            setReturnReasonDetail("");
            setEvidenceImages([]);
            setReturnType("RETURN_REFUND");
            fetchOrders();
        } catch (err) {
            showToast?.(
                err.response?.data?.error || "Gửi yêu cầu đổi trả thất bại.",
                "error",
            );
        }
    };

    const handleOpenDetails = async (order) => {
        setSelectedOrderDetail(order);
        setActiveReturnRequest(null);
        setIsEditingAddress(false);
        setEditAddressValue(order.shippingAddress || "");
        setEditPhoneValue(order.recipientPhone || order.user?.phone || "");
        if (
            order.status === "cancel_requested" ||
            order.status === "refunded"
        ) {
            try {
                const res = await api.get(`/orders/${order.id}/return`);
                setActiveReturnRequest(res.data);
            } catch (err) {
                console.error("Failed to load return request details:", err);
            }
        }
    };

    const handleUpdateAddress = async () => {
        if (!editAddressValue.trim()) return;
        try {
            await api.put(
                `/orders/${selectedOrderDetail.id}/address?address=${encodeURIComponent(
                    editAddressValue.trim(),
                )}&phone=${encodeURIComponent(editPhoneValue.trim())}`,
            );
            showToast?.("Cập nhật địa chỉ nhận hàng thành công.", "success");
            setSelectedOrderDetail((prev) => ({
                ...prev,
                shippingAddress: editAddressValue.trim(),
                recipientPhone: editPhoneValue.trim(),
            }));
            setIsEditingAddress(false);
            fetchOrders();
        } catch (err) {
            showToast?.(
                err.response?.data?.error || "Cập nhật địa chỉ thất bại.",
                "error",
            );
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!reviewComment.trim()) return;
        try {
            await api.post("/reviews", {
                orderId: reviewProduct.orderId,
                productId: reviewProduct.id,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            showToast?.(
                "Cảm ơn bạn đã gửi nhận xét đánh giá! (+10 điểm tích lũy)",
                "success",
            );
            setReviewProduct(null);
            setReviewComment("");
            setReviewRating(5);
            await reloadUserProfile?.();
            fetchOrders();
        } catch (err) {
            showToast?.(
                err.response?.data?.error || "Gửi đánh giá không thành công.",
                "error",
            );
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        const normalizedStr =
            typeof dateStr === "string" &&
            !dateStr.endsWith("Z") &&
            !/[+-]\d{2}:\d{2}$/.test(dateStr)
                ? `${dateStr}Z`
                : dateStr;
        const date = new Date(normalizedStr);
        if (isNaN(date.getTime())) {
            const fallbackDate = new Date(dateStr);
            if (isNaN(fallbackDate.getTime())) return dateStr;
            return (
                fallbackDate.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }) +
                " " +
                fallbackDate.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                })
            );
        }
        return (
            date.toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: "Asia/Ho_Chi_Minh",
            }) +
            " " +
            date.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Ho_Chi_Minh",
            })
        );
    };

    const getStatusText = (status) => {
        switch (status) {
            case "pending":
                return "Chờ xác nhận";
            case "confirmed":
                return "Đã xác nhận";
            case "preparing":
                return "Đang đóng gói";
            case "shipping":
                return "Đang giao";
            case "delivered":
                return "Hoàn thành";
            case "cancelled":
                return "Đã hủy";
            case "cancel_requested":
                return "Yêu cầu đổi trả";
            case "refunded":
                return "Trả hàng";
            default:
                return status;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "#f59e0b";
            case "confirmed":
            case "preparing":
            case "shipping":
                return "#3b82f6";
            case "delivered":
                return "#10b981";
            case "cancelled":
            case "refunded":
                return "#ef4444";
            case "cancel_requested":
                return "#f97316";
            default:
                return "#6b7280";
        }
    };

    const isReturnable = (order) => {
        if (order.status !== "delivered") return false;
        const createdDate = new Date(order.createdAt);
        const diffTime = Math.abs(new Date() - createdDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
    };

    const tabs = [
        { id: "ALL", label: "Tất cả" },
        { id: "pending", label: "Chờ xác nhận" },
        { id: "preparing", label: "Đang đóng gói" },
        { id: "shipping", label: "Đang giao" },
        { id: "delivered", label: "Hoàn thành" },
        { id: "cancelled", label: "Đã hủy" },
        { id: "refunded", label: "Trả hàng" },
    ];

    const filteredOrders = orders.filter((o) => {
        if (activeTab === "ALL") return true;
        if (activeTab === "preparing") {
            return o.status === "confirmed" || o.status === "preparing";
        }
        if (activeTab === "refunded") {
            return o.status === "refunded" || o.status === "cancel_requested";
        }
        return o.status === activeTab;
    });

    return {
        user,
        orders,
        loading,
        activeTab,
        setActiveTab,
        orderItems,
        cancelOrderId,
        setCancelOrderId,
        cancelReason,
        setCancelReason,
        returnOrderId,
        setReturnOrderId,
        returnType,
        setReturnType,
        returnReasonCategory,
        setReturnReasonCategory,
        returnReasonDetail,
        setReturnReasonDetail,
        evidenceImages,
        setEvidenceImages,
        uploadingImage,
        reviewProduct,
        setReviewProduct,
        reviewRating,
        setReviewRating,
        reviewComment,
        setReviewComment,
        selectedOrderDetail,
        setSelectedOrderDetail,
        activeReturnRequest,
        isEditingAddress,
        setIsEditingAddress,
        editAddressValue,
        setEditAddressValue,
        editPhoneValue,
        setEditPhoneValue,
        handleCancelSubmit,
        handleEvidenceUpload,
        handleRemoveEvidence,
        handleReturnSubmit,
        handleOpenDetails,
        handleUpdateAddress,
        handleReviewSubmit,
        formatPrice,
        formatDate,
        getStatusText,
        getStatusColor,
        isReturnable,
        tabs,
        filteredOrders,
    };
};
