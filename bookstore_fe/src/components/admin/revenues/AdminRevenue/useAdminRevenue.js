import { useState, useMemo } from "react";

export const useAdminRevenue = ({ orders = [] }) => {
    // Current state mappings
    const [timeFilter, setTimeFilter] = useState("30 ngày"); // "7 ngày", "30 ngày", "12 tháng"
    const [chartView, setChartView] = useState("Tuần"); // "Hằng ngày", "Tuần", "Tháng"

    const deliveredOrders = useMemo(() => {
        return (orders || []).filter(
            (o) => o.status === "delivered" || o.status === "COMPLETED",
        );
    }, [orders]);

    const totalRevenue = useMemo(() => {
        return deliveredOrders.reduce(
            (sum, o) => sum + (o.finalAmount || o.totalAmount || 0),
            0,
        );
    }, [deliveredOrders]);

    const totalOrders = deliveredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const soDuVi = totalRevenue * 0.68;

    const recentTransactions = useMemo(() => {
        return [...deliveredOrders]
            .sort((a, b) => {
                return (
                    new Date(b.deliveredAt || b.createdAt) -
                    new Date(a.deliveredAt || a.createdAt)
                );
            })
            .slice(0, 10);
    }, [deliveredOrders]);

    const chartBars = [
        { height: "40%", label: "01/05" },
        { height: "100%", label: "08/05", active: true },
        { height: "80%", label: "15/05" },
        { height: "65%", label: "22/05" },
        { height: "90%", label: "29/05" },
    ];

    return {
        timeFilter,
        setTimeFilter,
        chartView,
        setChartView,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        soDuVi,
        recentTransactions,
        chartBars,
    };
};
