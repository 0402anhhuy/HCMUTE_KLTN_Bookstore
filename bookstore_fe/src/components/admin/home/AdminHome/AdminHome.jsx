import React, { useState, useMemo, useEffect } from "react";
import {
    Users,
    Package,
    ShoppingCart,
    Banknote,
    TrendingUp,
    Calendar,
    CreditCard,
    CheckCircle2,
    AlertTriangle,
    Download,
    Target,
} from "lucide-react";
import { exportToCSV } from "@/utils/exportUtils";
import "./AdminHome.css";

export const AdminHome = ({
    user,
    users = [],
    userCount = 0,
    products = [],
    orders = [],
    auditLogs = [],
    setActiveTab = () => {},
    showToast,
}) => {
    // 1. TỰ ĐỘNG TẠO DẢI NĂM TỪ 2023 ĐẾN NĂM HIỆN TẠI (TỰ TĂNG KHI SANG NĂM MỚI)
    const availableYears = useMemo(() => {
        const startYear = 2023;
        const currentYear = new Date().getFullYear();
        const yearsSet = new Set();

        for (let yr = startYear; yr <= currentYear; yr++) {
            yearsSet.add(yr);
        }

        (orders || []).forEach((o) => {
            const d =
                o.deliveredAt ||
                o.delivered_at ||
                o.shippingAt ||
                o.shipping_at ||
                o.createdAt ||
                o.created_at;
            if (d) {
                const orderYr = new Date(d).getFullYear();
                if (orderYr >= startYear) yearsSet.add(orderYr);
            }
        });

        return Array.from(yearsSet).sort((a, b) => b - a);
    }, [orders]);

    // LƯU BỘ LỌC VÀO LOCALSTORAGE
    const [selectedYear, setSelectedYear] = useState(() => {
        const saved = localStorage.getItem("admin_home_selected_year");
        return saved ? Number(saved) : new Date().getFullYear();
    });

    const [selectedMonth, setSelectedMonth] = useState(() => {
        const saved = localStorage.getItem("admin_home_selected_month");
        return saved ? Number(saved) : new Date().getMonth() + 1;
    });

    useEffect(() => {
        localStorage.setItem("admin_home_selected_year", selectedYear);
    }, [selectedYear]);

    useEffect(() => {
        localStorage.setItem("admin_home_selected_month", selectedMonth);
    }, [selectedMonth]);

    // QUẢN LÝ MỤC TIÊU DOANH THU (KPI)
    const [monthlyTarget, setMonthlyTarget] = useState(() => {
        const saved = localStorage.getItem(
            `kpi_target_${selectedYear}_${selectedMonth}`,
        );
        return saved ? Number(saved) : 2000000;
    });

    const handleTargetChange = (e) => {
        const val = Number(e.target.value) || 0;
        setMonthlyTarget(val);
        localStorage.setItem(
            `kpi_target_${selectedYear}_${selectedMonth}`,
            val,
        );
    };

    // 2. THỐNG KÊ DOANH THU 12 THÁNG - HOÀN TOÀN TỪ DATA THẬT
    const yearlyData = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            name: `T${i + 1}`,
            revenue: 0,
            deliveredOrders: 0,
            totalOrders: 0,
        }));

        (orders || []).forEach((order) => {
            const dStr =
                order.deliveredAt ||
                order.delivered_at ||
                order.shippingAt ||
                order.shipping_at ||
                order.createdAt ||
                order.created_at;
            if (!dStr) return;
            const d = new Date(dStr);

            if (d.getFullYear() === Number(selectedYear)) {
                const m = d.getMonth();
                if (m >= 0 && m < 12) {
                    months[m].totalOrders += 1;
                    const st = (order.status || "").toLowerCase();
                    if (st === "delivered" || st === "completed") {
                        const amt = Number(
                            order.finalAmount ??
                                order.final_amount ??
                                order.totalAmount ??
                                order.total_amount ??
                                0,
                        );
                        months[m].revenue += amt;
                        months[m].deliveredOrders += 1;
                    }
                }
            }
        });

        const maxRev = months.reduce((max, m) => Math.max(max, m.revenue), 0);
        const totalYearRevenue = months.reduce((sum, m) => sum + m.revenue, 0);

        return { months, maxRev: maxRev > 0 ? maxRev : 1, totalYearRevenue };
    }, [orders, selectedYear]);

    // 3. THỐNG KÊ TUẦN TRONG THÁNG - HOÀN TOÀN TỪ DATA THẬT
    const weeklyData = useMemo(() => {
        const weeks = [
            { name: "Tuần 1 (1-7)", revenue: 0, count: 0 },
            { name: "Tuần 2 (8-14)", revenue: 0, count: 0 },
            { name: "Tuần 3 (15-21)", revenue: 0, count: 0 },
            { name: "Tuần 4 (22-28)", revenue: 0, count: 0 },
            { name: "Tuần 5 (29-Cuối)", revenue: 0, count: 0 },
        ];

        (orders || []).forEach((order) => {
            const dStr =
                order.deliveredAt ||
                order.delivered_at ||
                order.shippingAt ||
                order.shipping_at ||
                order.createdAt ||
                order.created_at;
            if (!dStr) return;
            const d = new Date(dStr);

            if (
                d.getFullYear() === Number(selectedYear) &&
                d.getMonth() + 1 === Number(selectedMonth)
            ) {
                const day = d.getDate();
                let weekIdx = 0;
                if (day <= 7) weekIdx = 0;
                else if (day <= 14) weekIdx = 1;
                else if (day <= 21) weekIdx = 2;
                else if (day <= 28) weekIdx = 3;
                else weekIdx = 4;

                const st = (order.status || "").toLowerCase();
                if (st === "delivered" || st === "completed") {
                    const amt = Number(
                        order.finalAmount ??
                            order.final_amount ??
                            order.totalAmount ??
                            order.total_amount ??
                            0,
                    );
                    weeks[weekIdx].revenue += amt;
                    weeks[weekIdx].count += 1;
                }
            }
        });

        const totalMonthRevenue = weeks.reduce((sum, w) => sum + w.revenue, 0);
        return { weeks, totalMonthRevenue };
    }, [orders, selectedYear, selectedMonth]);

    // 4. TIẾN ĐỘ ĐẠT KPI
    const kpiProgress = useMemo(() => {
        const rev = weeklyData.totalMonthRevenue;
        const target = monthlyTarget > 0 ? monthlyTarget : 1;
        const pct = Math.min(Math.round((rev / target) * 100), 100);
        const remaining = Math.max(target - rev, 0);
        return { rev, target: monthlyTarget, pct, remaining };
    }, [weeklyData.totalMonthRevenue, monthlyTarget]);

    // 5. XUẤT BÁO CÁO CSV (UTF-8 BOM hỗ trợ tiếng Việt)
    const handleExportCSV = () => {
        const headers = [
            "Tháng",
            "Doanh Thu (VNĐ)",
            "Số Đơn Giao Thành Công",
            "Tổng Đơn Phát Sinh",
        ];
        const rows = yearlyData.months.map((m) => [
            `${m.name}/${selectedYear}`,
            m.revenue,
            m.deliveredOrders,
            m.totalOrders,
        ]);
        rows.push([
            `Tổng Năm ${selectedYear}`,
            yearlyData.totalYearRevenue,
            "",
            "",
        ]);
        exportToCSV(
            `BaoCao_DoanhThu_${selectedYear}.csv`,
            headers,
            rows,
            showToast,
        );
    };

    // 6. PHÂN BỔ TRẠNG THÁI ĐƠN HÀNG (DONUT SVG)
    const statusStats = useMemo(() => {
        const config = {
            delivered: { label: "Đã giao", count: 0, color: "#10b981" },
            pending: { label: "Chờ duyệt", count: 0, color: "#f59e0b" },
            preparing: { label: "Chuẩn bị", count: 0, color: "#3b82f6" },
            shipping: { label: "Đang giao", count: 0, color: "#8b5cf6" },
            cancelled: { label: "Đã hủy", count: 0, color: "#ef4444" },
            refunded: { label: "Hoàn tiền", count: 0, color: "#6b7280" },
        };

        let total = 0;
        orders.forEach((o) => {
            const st = (o.status || "").toLowerCase();
            if (config[st]) {
                config[st].count += 1;
                total += 1;
            }
        });

        let currentAngle = 0;
        const items = Object.values(config)
            .filter((c) => c.count > 0)
            .map((item) => {
                const percent = total > 0 ? (item.count / total) * 100 : 0;
                const strokeDasharray = `${percent} ${100 - percent}`;
                const strokeDashoffset = -currentAngle;
                currentAngle += percent;
                return {
                    ...item,
                    percent: percent.toFixed(1),
                    strokeDasharray,
                    strokeDashoffset,
                };
            });

        const deliveredRate =
            total > 0 ? Math.round((config.delivered.count / total) * 100) : 0;

        return { items, total, deliveredRate };
    }, [orders]);

    // 7. PHƯƠNG THỨC THANH TOÁN
    const paymentStats = useMemo(() => {
        const methods = {
            COD: {
                label: "Thanh toán COD",
                count: 0,
                total: 0,
                color: "#10b981",
            },
            VNPAY: {
                label: "Cổng VNPAY",
                count: 0,
                total: 0,
                color: "#2563eb",
            },
            WALLET: {
                label: "Ví Bookstore",
                count: 0,
                total: 0,
                color: "#f59e0b",
            },
        };

        let count = 0;
        orders.forEach((o) => {
            const pm = (
                o.paymentMethod ||
                o.payment_method ||
                "COD"
            ).toUpperCase();
            if (methods[pm]) {
                methods[pm].count += 1;
                const amt = Number(
                    o.finalAmount ??
                        o.final_amount ??
                        o.totalAmount ??
                        o.total_amount ??
                        0,
                );
                methods[pm].total += amt;
                count += 1;
            }
        });

        return { list: Object.values(methods), totalCount: count };
    }, [orders]);

    // 8. TỒN KHO SẢN PHẨM
    const stockStats = useMemo(() => {
        let outOfStock = 0;
        let lowStock = 0;
        let inStock = 0;

        products.forEach((p) => {
            const qty = Number(p.stockQuantity ?? p.stock_quantity ?? 0);
            if (qty <= 0) outOfStock += 1;
            else if (qty < 10) lowStock += 1;
            else inStock += 1;
        });

        return { outOfStock, lowStock, inStock, total: products.length };
    }, [products]);

    return (
        <div className="admin-home-container">
            {/* Header & Bộ Lọc */}
            <div className="admin-home-topbar">
                <div>
                    <h2 className="admin-home-title">
                        Trung tâm kiểm soát dữ liệu 👋
                    </h2>
                    <p className="admin-home-desc">
                        Báo cáo phân tích doanh thu theo năm, tuần và trạng thái
                        hệ thống.
                    </p>
                </div>

                <div className="admin-home-header-actions">
                    <button
                        type="button"
                        className="admin-btn-export"
                        onClick={handleExportCSV}
                        title="Tải về file báo cáo Doanh thu dạng Excel/CSV"
                    >
                        <Download size={15} />
                        <span>Xuất báo cáo</span>
                    </button>

                    <div className="admin-home-filter-box">
                        <Calendar size={16} color="#64748b" />
                        <span className="admin-home-filter-label">Bộ lọc:</span>
                        <select
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(Number(e.target.value))
                            }
                            className="admin-home-select"
                        >
                            {availableYears.map((yr) => (
                                <option key={yr} value={yr}>
                                    Năm {yr}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(Number(e.target.value))
                            }
                            className="admin-home-select"
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Tháng {i + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI GOAL TRACKER */}
            <div className="admin-kpi-card">
                <div className="admin-kpi-header">
                    <div className="admin-kpi-title-box">
                        <Target size={18} color="#2563eb" />
                        <h4 className="admin-kpi-title">
                            Mục tiêu Doanh thu Tháng {selectedMonth}/
                            {selectedYear}
                        </h4>
                    </div>
                    <div className="admin-kpi-input-box">
                        <span>Chỉ tiêu:</span>
                        <input
                            type="number"
                            value={monthlyTarget}
                            onChange={handleTargetChange}
                            className="admin-kpi-input"
                            step="500000"
                        />
                        <span>đ</span>
                    </div>
                </div>

                <div className="admin-kpi-bar-bg">
                    <div
                        className="admin-kpi-bar-fill"
                        style={{ width: `${kpiProgress.pct}%` }}
                    />
                </div>

                <div className="admin-kpi-footer">
                    <span>
                        Thực tế:{" "}
                        <strong>
                            {kpiProgress.rev.toLocaleString("vi-VN")} đ
                        </strong>{" "}
                        ({kpiProgress.pct}%)
                    </span>
                    <span>
                        {kpiProgress.remaining > 0
                            ? `Còn thiếu ${kpiProgress.remaining.toLocaleString("vi-VN")} đ để đạt KPI`
                            : "🎉 Đã hoàn thành chỉ tiêu tháng!"}
                    </span>
                </div>
            </div>

            {/* 4 Cards Stats */}
            <div className="admin-home-stat-grid">
                <div
                    className="admin-stat-card clickable-hover"
                    onClick={() => setActiveTab("users")}
                    title="Bấm để xem danh sách Khách hàng"
                >
                    <div className="admin-stat-icon-wrapper blue">
                        <Users size={22} />
                    </div>
                    <div>
                        <div className="admin-stat-label">Tổng khách hàng</div>
                        <div className="admin-stat-value">
                            {userCount || users.length}
                        </div>
                    </div>
                </div>

                <div
                    className="admin-stat-card clickable-hover"
                    onClick={() => setActiveTab("products")}
                    title="Bấm để xem Quản lý Sản phẩm"
                >
                    <div className="admin-stat-icon-wrapper green">
                        <Package size={22} />
                    </div>
                    <div>
                        <div className="admin-stat-label">Tổng sản phẩm</div>
                        <div className="admin-stat-value">
                            {products.length}
                        </div>
                    </div>
                </div>

                <div
                    className="admin-stat-card clickable-hover"
                    onClick={() => setActiveTab("orders")}
                    title="Bấm để xem Quản lý Đơn hàng"
                >
                    <div className="admin-stat-icon-wrapper purple">
                        <ShoppingCart size={22} />
                    </div>
                    <div>
                        <div className="admin-stat-label">
                            Đơn hàng toàn thời gian
                        </div>
                        <div className="admin-stat-value">{orders.length}</div>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrapper orange">
                        <Banknote size={22} />
                    </div>
                    <div>
                        <div className="admin-stat-label">
                            Doanh thu năm {selectedYear}
                        </div>
                        <div className="admin-stat-value highlight">
                            {yearlyData.totalYearRevenue.toLocaleString(
                                "vi-VN",
                            )}{" "}
                            đ
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Hàng 1: Doanh thu 12 tháng & Thống kê tuần */}
            <div className="admin-home-row-charts">
                <div className="admin-chart-box">
                    <div className="admin-chart-header">
                        <div className="admin-chart-header-left">
                            <TrendingUp size={18} color="#ef4444" />
                            <h3 className="admin-chart-title">
                                Doanh thu 12 tháng - Năm {selectedYear}
                            </h3>
                        </div>
                        <span className="admin-chart-header-tag red">
                            Tổng:{" "}
                            {yearlyData.totalYearRevenue.toLocaleString(
                                "vi-VN",
                            )}{" "}
                            đ
                        </span>
                    </div>

                    <div className="admin-bar-chart-container">
                        {yearlyData.months.map((m) => {
                            const hasRevenue = m.revenue > 0;
                            const isSelected = m.month === selectedMonth;
                            const h = hasRevenue
                                ? Math.max(
                                      Math.round(
                                          (m.revenue / yearlyData.maxRev) * 100,
                                      ),
                                      14,
                                  )
                                : 4;

                            return (
                                <div
                                    key={m.name}
                                    className={`admin-bar-col ${isSelected ? "selected" : ""}`}
                                    onClick={() => setSelectedMonth(m.month)}
                                    title={`Tháng ${m.month}/${selectedYear}: ${m.revenue.toLocaleString("vi-VN")} đ (${m.deliveredOrders} đơn hoàn thành / ${m.totalOrders} tổng đơn) - Nhấp để xem tuần`}
                                >
                                    {hasRevenue ? (
                                        <span className="admin-bar-val">
                                            {m.revenue >= 1000000
                                                ? `${(m.revenue / 1000000).toFixed(1)}M`
                                                : `${Math.round(m.revenue / 1000)}k`}
                                        </span>
                                    ) : (
                                        <span className="admin-bar-val zero">0</span>
                                    )}
                                    <div
                                        className={`admin-bar-shape ${hasRevenue ? "has-revenue" : "zero-revenue"} ${isSelected ? "active" : ""}`}
                                        style={{
                                            height: `${h}%`,
                                        }}
                                    />
                                    <span
                                        className={`admin-bar-label ${hasRevenue ? "active" : "inactive"} ${isSelected ? "selected" : ""}`}
                                    >
                                        {m.name} {isSelected && "•"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="admin-bar-chart-note">
                        <span>
                            💡 Nhấp vào từng cột tháng để xem thống kê theo tuần chi tiết bên cạnh (Dữ liệu từ đơn hàng thực tế)
                        </span>
                    </div>
                </div>

                <div className="admin-chart-box">
                    <div className="admin-chart-header">
                        <div className="admin-chart-header-left">
                            <Calendar size={18} color="#059669" />
                            <h3 className="admin-chart-title">
                                Chi tiết Tháng {selectedMonth}/{selectedYear}{" "}
                                theo Tuần
                            </h3>
                        </div>
                        <span className="admin-chart-header-tag green">
                            Tháng {selectedMonth}:{" "}
                            {weeklyData.totalMonthRevenue.toLocaleString(
                                "vi-VN",
                            )}{" "}
                            đ
                        </span>
                    </div>

                    <div className="admin-weekly-list">
                        {weeklyData.weeks.map((w) => {
                            const pct =
                                weeklyData.totalMonthRevenue > 0
                                    ? Math.round(
                                          (w.revenue /
                                              weeklyData.totalMonthRevenue) *
                                              100,
                                      )
                                    : 0;
                            return (
                                <div key={w.name}>
                                    <div className="admin-weekly-row-info">
                                        <span className="admin-weekly-name">
                                            {w.name} ({w.count} đơn)
                                        </span>
                                        <span className="admin-weekly-val">
                                            {w.revenue.toLocaleString("vi-VN")}{" "}
                                            đ ({pct}%)
                                        </span>
                                    </div>
                                    <div className="admin-progress-bg">
                                        <div
                                            className="admin-progress-fill-green"
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Charts Hàng 2: Donut Trạng Thái, Thanh Toán & Tồn Kho */}
            <div className="admin-home-row-bottom">
                {/* Donut Chart: Trạng thái đơn */}
                <div className="admin-chart-box">
                    <div
                        className="admin-chart-header-left"
                        style={{ marginBottom: "16px" }}
                    >
                        <CheckCircle2 size={18} color="#9333ea" />
                        <h3 className="admin-chart-title">
                            Tỉ lệ trạng thái đơn hàng (Đường tròn)
                        </h3>
                    </div>

                    <div className="admin-donut-wrapper">
                        <div className="admin-donut-chart-box">
                            <svg
                                viewBox="0 0 36 36"
                                className="admin-donut-svg"
                            >
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="15.9155"
                                    fill="none"
                                    stroke="#f1f5f9"
                                    strokeWidth="3.8"
                                />
                                {statusStats.items.map((entry, idx) => (
                                    <circle
                                        key={idx}
                                        cx="18"
                                        cy="18"
                                        r="15.9155"
                                        fill="none"
                                        stroke={entry.color}
                                        strokeWidth="3.8"
                                        strokeDasharray={entry.strokeDasharray}
                                        strokeDashoffset={
                                            entry.strokeDashoffset
                                        }
                                    />
                                ))}
                            </svg>
                            <div className="admin-donut-center-info">
                                <span className="admin-donut-center-pct">
                                    {statusStats.deliveredRate}%
                                </span>
                                <span className="admin-donut-center-label">
                                    Thành công
                                </span>
                            </div>
                        </div>

                        <div className="admin-donut-legend">
                            {statusStats.items.map((it) => (
                                <div
                                    key={it.label}
                                    className="admin-donut-legend-item clickable-hover"
                                    onClick={() => setActiveTab("orders")}
                                    title="Nhấp để xem danh sách đơn hàng"
                                >
                                    <div className="admin-donut-legend-left">
                                        <div
                                            className="admin-donut-dot"
                                            style={{ background: it.color }}
                                        />
                                        <span className="admin-donut-legend-name">
                                            {it.label}
                                        </span>
                                    </div>
                                    <span className="admin-donut-legend-count">
                                        {it.count} ({it.percent}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Phương thức thanh toán */}
                <div className="admin-chart-box">
                    <div
                        className="admin-chart-header-left"
                        style={{ marginBottom: "16px" }}
                    >
                        <CreditCard size={18} color="#2563eb" />
                        <h3 className="admin-chart-title">
                            Phương thức thanh toán
                        </h3>
                    </div>

                    <div className="admin-payment-list">
                        {paymentStats.list.map((p) => {
                            const pct =
                                paymentStats.totalCount > 0
                                    ? Math.round(
                                          (p.count / paymentStats.totalCount) *
                                              100,
                                      )
                                    : 0;
                            return (
                                <div
                                    key={p.label}
                                    className="admin-payment-item"
                                >
                                    <div className="admin-payment-row-top">
                                        <span className="admin-payment-name">
                                            {p.label}
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: "700",
                                                color: p.color,
                                            }}
                                        >
                                            {p.count} đơn ({pct}%)
                                        </span>
                                    </div>
                                    <div className="admin-payment-row-sub">
                                        <span>Tổng giao dịch</span>
                                        <span>
                                            {p.total.toLocaleString("vi-VN")} đ
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Tình trạng tồn kho */}
                <div className="admin-chart-box">
                    <div
                        className="admin-chart-header-left"
                        style={{ marginBottom: "16px" }}
                    >
                        <AlertTriangle size={18} color="#ea580c" />
                        <h3 className="admin-chart-title">
                            Tình trạng tồn kho sản phẩm
                        </h3>
                    </div>

                    <div className="admin-stock-list">
                        <div
                            className="admin-stock-item good clickable-hover"
                            onClick={() => setActiveTab("products")}
                            title="Xem danh sách sản phẩm còn hàng"
                        >
                            <span className="admin-stock-name">
                                Còn hàng dồi dào (&ge; 10)
                            </span>
                            <span className="admin-stock-val">
                                {stockStats.inStock}
                            </span>
                        </div>

                        <div
                            className="admin-stock-item warning clickable-hover"
                            onClick={() => setActiveTab("products")}
                            title="Xem danh sách sản phẩm sắp hết hàng"
                        >
                            <span className="admin-stock-name">
                                Sắp hết hàng (&lt; 10)
                            </span>
                            <span className="admin-stock-val">
                                {stockStats.lowStock}
                            </span>
                        </div>

                        <div
                            className="admin-stock-item danger clickable-hover"
                            onClick={() => setActiveTab("products")}
                            title="Xem danh sách sản phẩm đã hết hàng để nhập kho"
                        >
                            <span className="admin-stock-name">
                                Đã hết hàng (0)
                            </span>
                            <span className="admin-stock-val">
                                {stockStats.outOfStock}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
