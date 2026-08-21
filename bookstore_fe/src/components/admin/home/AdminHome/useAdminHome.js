import { useState, useMemo } from "react";

export const useAdminHome = ({
    user,
    users = [],
    userCount = 0,
    products = [],
    orders = [],
    auditLogs = [],
}) => {
    const [timeRange, setTimeRange] = useState("Tháng"); // "Ngày", "Tháng", "Năm"

    const deliveredOrders = useMemo(() => {
        return (orders || []).filter(
            (o) => o.status === "delivered" || o.status === "COMPLETED"
        );
    }, [orders]);

    const totalRevenue = useMemo(() => {
        return deliveredOrders.reduce(
            (sum, o) => sum + (o.finalAmount || o.totalAmount || 0),
            0
        );
    }, [deliveredOrders]);

    const totalUsers = userCount || (users ? users.length : 0);
    const totalOrders = (orders || []).length;
    const outOfStockProducts = useMemo(() => {
        return (products || []).filter((p) => p.stockQuantity === 0).length;
    }, [products]);

    const chartBars = [
        { height: "40%", bg: "#fee2e2" },
        { height: "55%", bg: "#fecaca" },
        { height: "35%", bg: "#fca5a5" },
        { height: "70%", bg: "#f87171" },
        { height: "85%", bg: "#f3f4f6" },
        { height: "100%", bg: "#ef4444" },
    ];

    return {
        timeRange,
        setTimeRange,
        totalRevenue,
        totalUsers,
        totalOrders,
        outOfStockProducts,
        chartBars,
    };
};