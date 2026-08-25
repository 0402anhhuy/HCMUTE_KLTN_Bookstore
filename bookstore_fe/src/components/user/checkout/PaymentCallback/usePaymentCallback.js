import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "@/services/api";

export const usePaymentCallback = () => {
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed'
    const [orderId, setOrderId] = useState(null);
    const [message, setMessage] = useState("");

    const verifyTransaction = async () => {
        // Thu thập tất cả query parameters do VNPay trả về
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }

        try {
            const response = await api.get("/payment/vnpay-callback", {
                params,
            });

            if (response.data?.status === "success") {
                setPaymentStatus("success");
                setOrderId(response.data.orderId);
                setMessage(
                    response.data.message ||
                        "Thanh toán trực tuyến đơn hàng thành công!",
                );
            } else {
                setPaymentStatus("failed");
                setOrderId(response.data?.orderId);
                setMessage(
                    response.data?.message || "Thanh toán không thành công.",
                );
            }
        } catch (error) {
            setPaymentStatus("failed");
            setOrderId(params["vnp_TxnRef"] || null);
            setMessage(
                error.response?.data?.message ||
                    "Có lỗi xảy ra khi xác thực giao dịch.",
            );
        } finally {
            setVerifying(false);
        }
    };

    useEffect(() => {
        verifyTransaction();
    }, []);

    return {
        verifying,
        paymentStatus,
        orderId,
        message,
    };
};
