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
            {/* 1. Header */}
            <div className="admin-revenue-header">
                <div>
                    <h1 className="admin-revenue-title">
                        Thống kê & Tài chính
                    </h1>
                    <p className="admin-revenue-subtitle">
                        Báo cáo kết quả kinh doanh thực tế từ đơn hàng
                    </p>
                </div>

                <div className="admin-revenue-header-actions">
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
                </div>
            </div>

            {/* 2. Top Metric Cards */}
            <div className="admin-revenue-metrics-grid">
                {/* Doanh thu */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">
                        DOANH THU ({timeFilter.toUpperCase()})
                    </div>
                    <div className="admin-revenue-metric-value">
                        {totalRevenue.toLocaleString("vi-VN")}đ
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <div className="admin-revenue-growth-badge">
                            Thực tế
                        </div>
                        <span className="admin-revenue-growth-compare">
                            từ các đơn hoàn thành
                        </span>
                    </div>
                </div>

                {/* Số đơn hoàn thành */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">
                        SỐ ĐƠN HOÀN THÀNH
                    </div>
                    <div className="admin-revenue-metric-value">
                        {totalOrders}
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <div className="admin-revenue-orders-badge">
                            Đã giao thành công
                        </div>
                    </div>
                </div>

                {/* Giá trị trung bình mỗi đơn */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-label">
                        GIÁ TRỊ TRUNG BÌNH / ĐƠN
                    </div>
                    <div className="admin-revenue-metric-value">
                        {Math.round(averageOrderValue).toLocaleString("vi-VN")}đ
                    </div>
                    <div className="admin-revenue-metric-growth-row">
                        <span className="admin-revenue-growth-compare">
                            {totalOrders > 0
                                ? "Doanh thu / Đơn hàng"
                                : "Chưa có đơn hoàn thành"}
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Main Chart Card */}
            <div className="admin-revenue-chart-card">
                <div className="admin-revenue-chart-header">
                    <h2 className="admin-revenue-chart-title">
                        Biểu đồ Doanh thu theo {chartView.toLowerCase()}
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

                    {chartBars.map((bar, idx) => (
                        <div key={idx} className="admin-revenue-bar-item">
                            {bar.revenue > 0 && (
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        color: bar.active
                                            ? "#f43f5e"
                                            : "#4b5563",
                                        marginBottom: "4px",
                                    }}
                                >
                                    {bar.revenue >= 1000000
                                        ? `${(bar.revenue / 1000000).toFixed(1)}M`
                                        : `${Math.round(bar.revenue / 1000)}k`}
                                </span>
                            )}
                            <div
                                style={{ height: bar.height }}
                                title={`${bar.label}: ${(bar.revenue || 0).toLocaleString("vi-VN")} đ`}
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

            {/* 4. Transactions Table Card */}
            <div className="admin-revenue-table-card">
                <div className="admin-revenue-table-header">
                    <h2 className="admin-revenue-table-title">
                        Chi tiết các đơn hàng hoàn thành gần đây
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
                                                    order.recipientPhone ||
                                                    "Khách hàng"}
                                            </div>
                                        </td>
                                        <td className="admin-revenue-td-time">
                                            <div className="admin-revenue-time-box">
                                                <Calendar size={14} />
                                                {new Date(
                                                    order.deliveredAt ||
                                                        order.delivered_at ||
                                                        order.shippingAt ||
                                                        order.shipping_at ||
                                                        order.createdAt ||
                                                        order.created_at,
                                                ).toLocaleDateString("vi-VN")}
                                            </div>
                                        </td>
                                        <td className="admin-revenue-td-amount">
                                            {Number(
                                                order.finalAmount ??
                                                    order.final_amount ??
                                                    order.totalAmount ??
                                                    order.total_amount ??
                                                    0,
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
                                        Không có giao dịch thành công nào trong
                                        thời gian này.
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
