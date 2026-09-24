import { useState, useMemo } from "react";

export const useAdminRevenue = ({ orders = [] }) => {
    const [timeFilter, setTimeFilter] = useState("30 ngày"); // "7 ngày", "30 ngày", "12 tháng"
    const [chartView, setChartView] = useState("Tháng"); // "Hằng ngày", "Tuần", "Tháng"

    // 1. LỌC ĐƠN GIAO THÀNH CÔNG (DELIVERED) THEO BỘ LỌC THỜI GIAN THẬT
    const deliveredOrders = useMemo(() => {
        const now = new Date();
        return (orders || []).filter((o) => {
            const status = (o.status || "").toLowerCase();
            if (status !== "delivered" && status !== "completed") return false;

            const dateStr =
                o.deliveredAt ||
                o.delivered_at ||
                o.shippingAt ||
                o.shipping_at ||
                o.createdAt ||
                o.created_at;
            if (!dateStr) return false;

            const orderDate = new Date(dateStr);
            const diffTime = now.getTime() - orderDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (timeFilter === "7 ngày") return diffDays <= 7;
            if (timeFilter === "30 ngày") return diffDays <= 30;
            if (timeFilter === "12 tháng") return diffDays <= 365;
            return true;
        });
    }, [orders, timeFilter]);

    // 2. TỔNG DOANH THU THẬT & GIÁ TRỊ TRUNG BÌNH
    const totalRevenue = useMemo(() => {
        return deliveredOrders.reduce((sum, o) => {
            const amount = Number(
                o.finalAmount ??
                    o.final_amount ??
                    o.totalAmount ??
                    o.total_amount ??
                    0,
            );
            return sum + amount;
        }, 0);
    }, [deliveredOrders]);

    const totalOrders = deliveredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Số dư ví hoặc doanh thu thực thu
    const soDuVi = totalRevenue;

    // 3. DANH SÁCH GIAO DỊCH THÀNH CÔNG GẦN ĐÂY
    const recentTransactions = useMemo(() => {
        return [...deliveredOrders]
            .sort((a, b) => {
                const dateA = new Date(
                    a.deliveredAt ||
                        a.delivered_at ||
                        a.shippingAt ||
                        a.shipping_at ||
                        a.createdAt ||
                        a.created_at,
                );
                const dateB = new Date(
                    b.deliveredAt ||
                        b.delivered_at ||
                        b.shippingAt ||
                        b.shipping_at ||
                        b.createdAt ||
                        b.created_at,
                );
                return dateB - dateA;
            })
            .slice(0, 10);
    }, [deliveredOrders]);

    // 4. TÍNH DỮ LIỆU CỘT BIỂU ĐỒ HOÀN TOÀN TỪ DỮ LIỆU THẬT
    const chartBars = useMemo(() => {
        const now = new Date();
        // Lấy tất cả đơn delivered không giới hạn bởi filter tab nhỏ để biểu đồ thể hiện rõ chu kỳ
        const allDelivered = (orders || []).filter((o) => {
            const st = (o.status || "").toLowerCase();
            return st === "delivered" || st === "completed";
        });

        // VIEW 1: HẰNG NGÀY (7 ngày gần nhất)
        if (chartView === "Hằng ngày") {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - i,
                );
                const dayOfWeek = d.getDay(); // 0 là Chủ Nhật, 1 là Thứ 2, ...

                days.push({
                    dateKey: d.toDateString(),
                    label:
                        i === 0
                            ? "Hôm nay"
                            : dayOfWeek === 0
                              ? "CN"
                              : `T${dayOfWeek + 1}`,
                    fullDate: `${d.getDate()}/${d.getMonth() + 1}`,
                    revenue: 0,
                });
            }

            allDelivered.forEach((o) => {
                const dStr =
                    o.deliveredAt ||
                    o.delivered_at ||
                    o.shippingAt ||
                    o.shipping_at ||
                    o.createdAt ||
                    o.created_at;
                if (!dStr) return;
                const d = new Date(dStr);
                const target = days.find(
                    (item) => item.dateKey === d.toDateString(),
                );
                if (target) {
                    target.revenue += Number(
                        o.finalAmount ??
                            o.final_amount ??
                            o.totalAmount ??
                            o.total_amount ??
                            0,
                    );
                }
            });

            const maxRev =
                days.reduce((max, d) => Math.max(max, d.revenue), 0) || 1;
            return days.map((d) => ({
                label: d.label,
                revenue: d.revenue,
                height:
                    d.revenue > 0
                        ? `${Math.max(Math.round((d.revenue / maxRev) * 100), 12)}%`
                        : "4px",
                active: d.revenue > 0 && d.revenue === maxRev,
            }));
        }

        // VIEW 2: TUẦN (4 tuần gần nhất)
        if (chartView === "Tuần") {
            const weeks = [
                {
                    label: "Tuần 1",
                    startDaysAgo: 28,
                    endDaysAgo: 21,
                    revenue: 0,
                },
                {
                    label: "Tuần 2",
                    startDaysAgo: 21,
                    endDaysAgo: 14,
                    revenue: 0,
                },
                {
                    label: "Tuần 3",
                    startDaysAgo: 14,
                    endDaysAgo: 7,
                    revenue: 0,
                },
                {
                    label: "Tuần 4 (gần đây)",
                    startDaysAgo: 7,
                    endDaysAgo: 0,
                    revenue: 0,
                },
            ];

            allDelivered.forEach((o) => {
                const dStr =
                    o.deliveredAt ||
                    o.delivered_at ||
                    o.shippingAt ||
                    o.shipping_at ||
                    o.createdAt ||
                    o.created_at;
                if (!dStr) return;
                const d = new Date(dStr);
                const diffDays =
                    (now.getTime() - d.getTime()) / (1000 * 3600 * 24);

                weeks.forEach((w) => {
                    if (diffDays >= w.endDaysAgo && diffDays < w.startDaysAgo) {
                        w.revenue += Number(
                            o.finalAmount ??
                                o.final_amount ??
                                o.totalAmount ??
                                o.total_amount ??
                                0,
                        );
                    }
                });
            });

            const maxRev =
                weeks.reduce((max, w) => Math.max(max, w.revenue), 0) || 1;
            return weeks.map((w) => ({
                label: w.label,
                revenue: w.revenue,
                height:
                    w.revenue > 0
                        ? `${Math.max(Math.round((w.revenue / maxRev) * 100), 12)}%`
                        : "4px",
                active: w.revenue > 0 && w.revenue === maxRev,
            }));
        }

        // VIEW 3: THÁNG (12 tháng gần nhất của năm hiện tại)
        const currentYear = now.getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            label: `T${i + 1}`,
            revenue: 0,
        }));

        allDelivered.forEach((o) => {
            const dStr =
                o.deliveredAt ||
                o.delivered_at ||
                o.shippingAt ||
                o.shipping_at ||
                o.createdAt ||
                o.created_at;
            if (!dStr) return;
            const d = new Date(dStr);
            if (d.getFullYear() === currentYear && months[d.getMonth()]) {
                months[d.getMonth()].revenue += Number(
                    o.finalAmount ??
                        o.final_amount ??
                        o.totalAmount ??
                        o.total_amount ??
                        0,
                );
            }
        });

        const maxRev =
            months.reduce((max, m) => Math.max(max, m.revenue), 0) || 1;
        return months.map((m) => ({
            label: m.label,
            revenue: m.revenue,
            height:
                m.revenue > 0
                    ? `${Math.max(Math.round((m.revenue / maxRev) * 100), 12)}%`
                    : "4px",
            active: m.revenue > 0 && m.revenue === maxRev,
        }));
    }, [orders, chartView]);

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
