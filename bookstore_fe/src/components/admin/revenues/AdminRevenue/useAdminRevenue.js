import { useState, useMemo, useCallback } from "react";

export const useAdminRevenue = ({ orders = [] }) => {
    // 1. STATE BỘ LỌC THỜI GIAN & CHẾ ĐỘ BIỂU ĐỒ
    const [timeFilter, setTimeFilter] = useState("30 ngày"); // "7 ngày" | "30 ngày" | "90 ngày" | "12 tháng" | "Tất cả"
    const [chartView, setChartView] = useState("Tháng"); // "Hằng ngày" | "Tuần" | "Tháng"
    const [searchTerm, setSearchTerm] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("ALL"); // "ALL" | "COD" | "VNPAY" | "MOMO" | "OTHER"
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Helper: kiểm tra đơn hàng đã giao thành công
    const isDelivered = useCallback((o) => {
        if (!o) return false;
        const status = (o.status || "").toLowerCase();
        return status === "delivered" || status === "completed";
    }, []);

    // Helper: trích xuất ngày giao hoặc ngày tạo đơn
    const getOrderDate = useCallback((o) => {
        if (!o) return null;
        const dateStr =
            o.deliveredAt ||
            o.delivered_at ||
            o.shippingAt ||
            o.shipping_at ||
            o.createdAt ||
            o.created_at;
        return dateStr ? new Date(dateStr) : null;
    }, []);

    // Helper: lấy số tiền thanh toán thực tế của đơn
    const getOrderAmount = useCallback((o) => {
        if (!o) return 0;
        return Number(
            o.finalAmount ??
                o.final_amount ??
                o.totalAmount ??
                o.total_amount ??
                0
        );
    }, []);

    // 2. TỔNG HỢP TOÀN BỘ ĐƠN DELIVERED (LŨY KẾ TOÀN THỜI GIAN)
    const allDeliveredOrders = useMemo(() => {
        return (orders || []).filter(isDelivered);
    }, [orders, isDelivered]);

    const allTimeRevenue = useMemo(() => {
        return allDeliveredOrders.reduce(
            (sum, o) => sum + getOrderAmount(o),
            0
        );
    }, [allDeliveredOrders, getOrderAmount]);

    const allTimeOrdersCount = allDeliveredOrders.length;

    // 3. LỌC ĐƠN HOÀN THÀNH THEO BỘ LỌC THỜI GIAN (7 ngày / 30 ngày / 90 ngày / 12 tháng / Tất cả)
    const periodDeliveredOrders = useMemo(() => {
        const now = new Date();
        return allDeliveredOrders.filter((o) => {
            if (timeFilter === "Tất cả") return true;

            const orderDate = getOrderDate(o);
            if (!orderDate) return false;

            const diffTime = now.getTime() - orderDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (timeFilter === "7 ngày") return diffDays <= 7;
            if (timeFilter === "30 ngày") return diffDays <= 30;
            if (timeFilter === "90 ngày") return diffDays <= 90;
            if (timeFilter === "12 tháng") return diffDays <= 365;
            return true;
        });
    }, [allDeliveredOrders, timeFilter, getOrderDate]);

    // 4. CÁC CHỈ SỐ KPI THEO KỲ
    const totalRevenue = useMemo(() => {
        return periodDeliveredOrders.reduce(
            (sum, o) => sum + getOrderAmount(o),
            0
        );
    }, [periodDeliveredOrders, getOrderAmount]);

    const totalOrders = periodDeliveredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Tỷ lệ hoàn thành đơn trong kỳ (so với toàn bộ đơn đặt trong cùng khoảng thời gian)
    const periodAllOrdersCount = useMemo(() => {
        const now = new Date();
        return (orders || []).filter((o) => {
            if (timeFilter === "Tất cả") return true;
            const orderDate = getOrderDate(o);
            if (!orderDate) return false;
            const diffTime = now.getTime() - orderDate.getTime();
            const diffDays = diffTime / (1000 * 3600 * 24);

            if (timeFilter === "7 ngày") return diffDays <= 7;
            if (timeFilter === "30 ngày") return diffDays <= 30;
            if (timeFilter === "90 ngày") return diffDays <= 90;
            if (timeFilter === "12 tháng") return diffDays <= 365;
            return true;
        }).length;
    }, [orders, timeFilter, getOrderDate]);

    const successRate = useMemo(() => {
        if (periodAllOrdersCount === 0) {
            return totalOrders > 0 ? 100 : 0;
        }
        return Math.min(
            100,
            Math.round((totalOrders / periodAllOrdersCount) * 100)
        );
    }, [totalOrders, periodAllOrdersCount]);

    // 5. CƠ CẤU DOANH THU THEO PHƯƠNG THỨC THANH TOÁN
    const paymentBreakdown = useMemo(() => {
        const map = {
            COD: { name: "Thanh toán khi nhận hàng (COD)", count: 0, revenue: 0 },
            VNPAY: { name: "Cổng VNPAY", count: 0, revenue: 0 },
            MOMO: { name: "Ví MoMo", count: 0, revenue: 0 },
            OTHER: { name: "Khác / Chuyển khoản", count: 0, revenue: 0 },
        };

        periodDeliveredOrders.forEach((o) => {
            const rawMethod = (
                o.paymentMethod ||
                o.payment_method ||
                "COD"
            ).toUpperCase();
            const amt = getOrderAmount(o);

            if (rawMethod.includes("COD") || rawMethod.includes("DELIVERY")) {
                map.COD.count += 1;
                map.COD.revenue += amt;
            } else if (rawMethod.includes("VNPAY")) {
                map.VNPAY.count += 1;
                map.VNPAY.revenue += amt;
            } else if (rawMethod.includes("MOMO")) {
                map.MOMO.count += 1;
                map.MOMO.revenue += amt;
            } else {
                map.OTHER.count += 1;
                map.OTHER.revenue += amt;
            }
        });

        return map;
    }, [periodDeliveredOrders, getOrderAmount]);

    // 6. TÍNH DỮ LIỆU BIỂU ĐỒ (CHART BARS) THEO CHẾ ĐỘ XEM
    const chartBars = useMemo(() => {
        const now = new Date();

        // VIEW 1: HẰNG NGÀY (7 ngày gần nhất)
        if (chartView === "Hằng ngày") {
            const days = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate() - i
                );
                const dayOfWeek = d.getDay();

                days.push({
                    dateKey: d.toDateString(),
                    label:
                        i === 0
                            ? "Hôm nay"
                            : dayOfWeek === 0
                              ? "CN"
                              : `T${dayOfWeek + 1}`,
                    subLabel: `${d.getDate()}/${d.getMonth() + 1}`,
                    revenue: 0,
                    orderCount: 0,
                });
            }

            allDeliveredOrders.forEach((o) => {
                const orderDate = getOrderDate(o);
                if (!orderDate) return;

                const target = days.find(
                    (item) => item.dateKey === orderDate.toDateString()
                );
                if (target) {
                    target.revenue += getOrderAmount(o);
                    target.orderCount += 1;
                }
            });

            const maxRev =
                days.reduce((max, d) => Math.max(max, d.revenue), 0) || 1;
            const totalPeriodRevenue = days.reduce((sum, d) => sum + d.revenue, 0);

            return {
                title: "Doanh thu 7 ngày gần nhất",
                bars: days.map((d) => ({
                    label: d.label,
                    subLabel: d.subLabel,
                    revenue: d.revenue,
                    orderCount: d.orderCount,
                    height:
                        d.revenue > 0
                            ? `${Math.max(Math.round((d.revenue / maxRev) * 100), 12)}%`
                            : "4px",
                    active: d.revenue > 0 && d.revenue === maxRev,
                })),
                maxRev,
                totalPeriodRevenue,
            };
        }

        // VIEW 2: TUẦN (4 tuần gần nhất)
        if (chartView === "Tuần") {
            const weeks = [
                {
                    label: "Tuần 1",
                    subLabel: "28 - 21 ngày trước",
                    startDaysAgo: 28,
                    endDaysAgo: 21,
                    revenue: 0,
                    orderCount: 0,
                },
                {
                    label: "Tuần 2",
                    subLabel: "21 - 14 ngày trước",
                    startDaysAgo: 21,
                    endDaysAgo: 14,
                    revenue: 0,
                    orderCount: 0,
                },
                {
                    label: "Tuần 3",
                    subLabel: "14 - 7 ngày trước",
                    startDaysAgo: 14,
                    endDaysAgo: 7,
                    revenue: 0,
                    orderCount: 0,
                },
                {
                    label: "Tuần 4",
                    subLabel: "7 ngày gần đây",
                    startDaysAgo: 7,
                    endDaysAgo: 0,
                    revenue: 0,
                    orderCount: 0,
                },
            ];

            allDeliveredOrders.forEach((o) => {
                const orderDate = getOrderDate(o);
                if (!orderDate) return;

                const diffDays =
                    (now.getTime() - orderDate.getTime()) / (1000 * 3600 * 24);

                weeks.forEach((w) => {
                    if (diffDays >= w.endDaysAgo && diffDays < w.startDaysAgo) {
                        w.revenue += getOrderAmount(o);
                        w.orderCount += 1;
                    }
                });
            });

            const maxRev =
                weeks.reduce((max, w) => Math.max(max, w.revenue), 0) || 1;
            const totalPeriodRevenue = weeks.reduce((sum, w) => sum + w.revenue, 0);

            return {
                title: "Doanh thu 4 tuần gần nhất",
                bars: weeks.map((w) => ({
                    label: w.label,
                    subLabel: w.subLabel,
                    revenue: w.revenue,
                    orderCount: w.orderCount,
                    height:
                        w.revenue > 0
                            ? `${Math.max(Math.round((w.revenue / maxRev) * 100), 12)}%`
                            : "4px",
                    active: w.revenue > 0 && w.revenue === maxRev,
                })),
                maxRev,
                totalPeriodRevenue,
            };
        }

        // VIEW 3: THÁNG (12 tháng trong năm hiện tại)
        const currentYear = now.getFullYear();
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i,
            label: `T${i + 1}`,
            subLabel: `Tháng ${i + 1}`,
            revenue: 0,
            orderCount: 0,
        }));

        allDeliveredOrders.forEach((o) => {
            const orderDate = getOrderDate(o);
            if (!orderDate) return;

            if (
                orderDate.getFullYear() === currentYear &&
                months[orderDate.getMonth()]
            ) {
                months[orderDate.getMonth()].revenue += getOrderAmount(o);
                months[orderDate.getMonth()].orderCount += 1;
            }
        });

        const maxRev =
            months.reduce((max, m) => Math.max(max, m.revenue), 0) || 1;
        const totalPeriodRevenue = months.reduce((sum, m) => sum + m.revenue, 0);

        return {
            title: `Doanh thu 12 tháng - Năm ${currentYear}`,
            bars: months.map((m) => ({
                label: m.label,
                subLabel: m.subLabel,
                revenue: m.revenue,
                orderCount: m.orderCount,
                height:
                    m.revenue > 0
                        ? `${Math.max(Math.round((m.revenue / maxRev) * 100), 12)}%`
                        : "4px",
                active: m.revenue > 0 && m.revenue === maxRev,
            })),
            maxRev,
            totalPeriodRevenue,
        };
    }, [allDeliveredOrders, chartView, getOrderDate, getOrderAmount]);

    // 7. DANH SÁCH GIAO DỊCH HOÀN THÀNH VỚI TÌM KIẾM, LỌC PHƯƠNG THỨC & PHÂN TRANG
    const filteredTransactions = useMemo(() => {
        let result = [...periodDeliveredOrders];

        // Lọc theo từ khóa (Mã đơn, Tên khách hàng, SĐT)
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            result = result.filter((o) => {
                const idMatch = String(o.id).toLowerCase().includes(term);
                const name = (
                    o.user?.fullName ||
                    o.recipientName ||
                    ""
                ).toLowerCase();
                const phone = (
                    o.recipientPhone ||
                    o.user?.phone ||
                    ""
                ).toLowerCase();
                return idMatch || name.includes(term) || phone.includes(term);
            });
        }

        // Lọc theo phương thức thanh toán
        if (paymentFilter !== "ALL") {
            result = result.filter((o) => {
                const rawMethod = (
                    o.paymentMethod ||
                    o.payment_method ||
                    "COD"
                ).toUpperCase();
                if (paymentFilter === "COD") {
                    return (
                        rawMethod.includes("COD") ||
                        rawMethod.includes("DELIVERY")
                    );
                }
                if (paymentFilter === "VNPAY") {
                    return rawMethod.includes("VNPAY");
                }
                if (paymentFilter === "MOMO") {
                    return rawMethod.includes("MOMO");
                }
                if (paymentFilter === "OTHER") {
                    return (
                        !rawMethod.includes("COD") &&
                        !rawMethod.includes("DELIVERY") &&
                        !rawMethod.includes("VNPAY") &&
                        !rawMethod.includes("MOMO")
                    );
                }
                return true;
            });
        }

        // Sắp xếp: Đơn mới nhất lên đầu
        result.sort((a, b) => {
            const dateA = getOrderDate(a) || new Date(0);
            const dateB = getOrderDate(b) || new Date(0);
            return dateB - dateA;
        });

        return result;
    }, [periodDeliveredOrders, searchTerm, paymentFilter, getOrderDate]);

    // Phân trang
    const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
    const paginatedTransactions = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredTransactions.slice(start, start + pageSize);
    }, [filteredTransactions, currentPage, pageSize]);

    // Xử lý đổi trang
    const handlePageChange = useCallback(
        (page) => {
            if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
            }
        },
        [totalPages]
    );

    // 8. XUẤT BÁO CÁO CSV (UTF-8 có BOM)
    const exportToCSV = useCallback(() => {
        if (!periodDeliveredOrders || periodDeliveredOrders.length === 0) {
            alert("Không có dữ liệu giao dịch hoàn thành để xuất báo cáo!");
            return;
        }

        const headers = [
            "Mã đơn hàng",
            "Khách hàng",
            "Số điện thoại",
            "Thời gian giao",
            "Phương thức thanh toán",
            "Doanh thu (VNĐ)",
            "Trạng thái",
        ];

        const rows = periodDeliveredOrders.map((o) => {
            const id = `#${o.id}`;
            const customer = `"${(o.user?.fullName || o.recipientName || "Khách hàng").replace(/"/g, '""')}"`;
            const phone = `"${(o.recipientPhone || o.user?.phone || "").replace(/"/g, '""')}"`;
            const orderDate = getOrderDate(o);
            const timeStr = orderDate
                ? `"${orderDate.toLocaleString("vi-VN")}"`
                : '""';
            const payMethod = `"${(o.paymentMethod || o.payment_method || "COD").replace(/"/g, '""')}"`;
            const amt = getOrderAmount(o);
            const status = '"Hoàn thành"';

            return [id, customer, phone, timeStr, payMethod, amt, status].join(
                ","
            );
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `bao-cao-doanh-thu-admin-${timeFilter.replace(/\s+/g, "_")}-${dateStr}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [periodDeliveredOrders, timeFilter, getOrderDate, getOrderAmount]);

    return {
        timeFilter,
        setTimeFilter: (val) => {
            setTimeFilter(val);
            setCurrentPage(1);
        },
        chartView,
        setChartView,
        searchTerm,
        setSearchTerm: (val) => {
            setSearchTerm(val);
            setCurrentPage(1);
        },
        paymentFilter,
        setPaymentFilter: (val) => {
            setPaymentFilter(val);
            setCurrentPage(1);
        },
        currentPage,
        totalPages,
        handlePageChange,
        totalRevenue,
        totalOrders,
        averageOrderValue,
        successRate,
        allTimeRevenue,
        allTimeOrdersCount,
        paymentBreakdown,
        chartBars,
        recentTransactions: paginatedTransactions,
        filteredTransactionsCount: filteredTransactions.length,
        exportToCSV,
        getOrderDate,
        getOrderAmount,
    };
};
