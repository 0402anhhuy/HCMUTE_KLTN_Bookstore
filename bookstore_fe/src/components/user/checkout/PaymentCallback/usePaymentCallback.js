import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const usePaymentCallback = () => {
    const { fetchCart } = useApp();
    const [searchParams] = useSearchParams();
    const [verifying, setVerifying] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'success' | 'failed'
    const [orderId, setOrderId] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        const verifyTransaction = async () => {
            const params = {};
            for (const [key, value] of searchParams.entries()) {
                params[key] = value;
            }

            try {
                const response = await api.get("/payment/vnpay-callback", {
                    params,
                });
                if (!active) return;

                if (response.data?.status === "success") {
                    setPaymentStatus("success");
                    setOrderId(response.data.orderId);
                    setMessage(
                        response.data.message ||
                            "Thanh toán trực tuyến đơn hàng thành công!",
                    );
                    await fetchCart?.();
                } else {
                    setPaymentStatus("failed");
                    setOrderId(response.data?.orderId);
                    setMessage(
                        response.data?.message || "Thanh toán không thành công.",
                    );
                }
            } catch (error) {
                if (!active) return;
                setPaymentStatus("failed");
                setOrderId(params["vnp_TxnRef"] || null);
                setMessage(
                    error.response?.data?.message ||
                        "Có lỗi xảy ra khi xác thực giao dịch.",
                );
            } finally {
                if (active) setVerifying(false);
            }
        };

        verifyTransaction();
        return () => {
            active = false;
        };
    }, [searchParams, fetchCart]);

    return {
        verifying,
        paymentStatus,
        orderId,
        message,
    };
};
