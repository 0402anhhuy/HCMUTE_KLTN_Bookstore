import { CheckCircle2, Calendar } from "lucide-react";
import { useAdminRevenue } from "./useAdminRevenue";
import "./AdminRevenue.css";

const AdminRevenue = ({ orders }) => {
    const {
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
    } = useAdminRevenue({ orders });

    return (
        <div className="admin-revenue-container">
            {/* 1. Header Area with exact layout */}
            <div className="admin-revenue-header">
                <div>
                    <h1 className="admin-revenue-title">
                        Thống kê & Tài chính
                    </h1>
                    <p className="admin-revenue-subtitle">
                        Manage your business work
                    </p>
                </div>

                <div className="admin-revenue-header-actions">
                    {/* Time Filter Segmented Control */}
                    <div className="admin-revenue-time-filter-wrapper">
                        {["7 ngày", "30 ngày", "12 tháng"].map((filter) => (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setTimeFilter(filter)}
                                className={`admin-revenue-time-btn ${
                                    timeFilter === filter ? "active" : ""
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <button type="button" className="admin-revenue-report-btn">
                        Tạo báo cáo
                    </button>
                </div>
            </div>

            {/* 2. Top Metric Cards (DOANH THU, SỐ DƯ VÍ, GIÁ TRỊ ĐƠN) */}
            <div className="admin-revenue-metrics-grid">
                {/* Card 1: Doanh thu */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">DOANH THU</div>
                    <div className="admin-revenue-metric-value">
                        {totalRevenue.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <div className="admin-revenue-growth-badge">+12.5%</div>
                        <span className="admin-revenue-growth-compare">
                            so với tháng trước
                        </span>
                    </div>
                </div>

                {/* Card 2: Số dư ví */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">SỐ DƯ VÍ</div>
                    <div className="admin-revenue-metric-value">
                        {soDuVi.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <div className="admin-revenue-growth-badge">+8.2%</div>
                        <span className="admin-revenue-growth-compare">
                            so với tháng trước
                        </span>
                    </div>
                </div>

                {/* Card 3: Giá trị đơn */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">
                        GIÁ TRỊ ĐƠN
                    </div>
                    <div className="admin-revenue-metric-value">
                        {Math.round(averageOrderValue).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <div className="admin-revenue-orders-badge">
                            {totalOrders} Orders
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Main Chart Card */}
            <div className="admin-revenue-chart-card">
                <div className="admin-revenue-chart-header">
                    <h2 className="admin-revenue-chart-title">
                        Tổng quan doanh thu
                    </h2>

                    <div className="admin-revenue-chart-segmented-control">
                        {["Hằng ngày", "Tuần", "Tháng"].map((view) => (
                            <button
                                key={view}
                                type="button"
                                onClick={() => setChartView(view)}
                                className={`admin-revenue-chart-view-btn ${
                                    chartView === view ? "active" : ""
                                }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simulated Chart Container */}
                <div className="admin-revenue-chart-container">
                    <div className="admin-revenue-chart-axis-line"></div>

                    {/* Array of bars */}
                    {chartBars.map((bar, idx) => (
                        <div key={idx} className="admin-revenue-bar-item">
                            <div
                                style={{ height: bar.height }}
                                className={`admin-revenue-bar-fill ${
                                    bar.active ? "active" : ""
                                }`}
                            ></div>
                            <span className="admin-revenue-bar-label">
                                {bar.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Extra: Recent Transactions Table */}
            <div className="admin-revenue-table-card">
                <div className="admin-revenue-table-header">
                    <h2 className="admin-revenue-table-title">
                        Chi tiết đơn hàng hoàn thành
                    </h2>
                </div>
                <div className="admin-revenue-table-scroll-wrapper">
                    <table className="admin-revenue-table">
                        <thead className="admin-revenue-thead">
                            <tr>
                                <th className="admin-revenue-th">Mã đơn</th>
                                <th className="admin-revenue-th">Khách hàng</th>
                                <th className="admin-revenue-th">Thời gian</th>
                                <th className="admin-revenue-th align-right">
                                    Số tiền
                                </th>
                                <th className="admin-revenue-th align-center">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        className={`admin-revenue-row ${
                                            index ===
                                            recentTransactions.length - 1
                                                ? "last-row"
                                                : ""
                                        }`}
                                    >
                                        <td className="admin-revenue-td-id">
                                            #{order.id}
                                        </td>
                                        <td className="admin-revenue-td-customer">
                                            <div className="admin-revenue-customer-name">
                                                {order.user?.fullName ||
                                                    "Khách hàng"}
                                            </div>
                                        </td>
                                        <td className="admin-revenue-td-time">
                                            <div className="admin-revenue-time-box">
                                                <Calendar size={14} />
                                                {new Date(
                                                    order.deliveredAt ||
                                                        order.createdAt,
                                                ).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                        <td className="admin-revenue-td-amount">
                                            {(
                                                order.finalAmount ||
                                                order.totalAmount ||
                                                0
                                            ).toLocaleString("vi-VN")}
                                            đ
                                        </td>
                                        <td className="admin-revenue-td-status">
                                            <div className="admin-revenue-status-tag">
                                                <CheckCircle2 size={12} />
                                                Hoàn thành
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="admin-revenue-empty-cell"
                                    >
                                        Không có giao dịch nào.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRevenue;
