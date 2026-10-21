import { useState } from "react";
import {
    DollarSign,
    CheckCircle2,
    CreditCard,
    TrendingUp,
    Calendar,
    Download,
    Search,
    Filter,
    ReceiptText,
    ChevronLeft,
    ChevronRight,
    Info,
    ArrowUpRight,
    PieChart,
    ShoppingBag,
} from "lucide-react";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import { useAdminRevenue } from "./useAdminRevenue";
import "./AdminRevenue.css";

const AdminRevenue = ({ orders = [] }) => {
    const {
        timeFilter,
        setTimeFilter,
        chartView,
        setChartView,
        searchTerm,
        setSearchTerm,
        paymentFilter,
        setPaymentFilter,
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
        recentTransactions,
        filteredTransactionsCount,
        exportToCSV,
        getOrderDate,
        getOrderAmount,
    } = useAdminRevenue({ orders });

    const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

    return (
        <div className="admin-revenue-container">
            {/* 1. Header Bar */}
            <div className="admin-revenue-header">
                <div className="admin-revenue-header-left">
                    <div className="admin-revenue-header-badge">
                        <DollarSign size={14} />
                        <span>Tài chính & Doanh thu</span>
                    </div>
                    <h1 className="admin-revenue-title">
                        Báo cáo Doanh thu & Dòng tiền
                    </h1>
                    <p className="admin-revenue-subtitle">
                        Thống kê chi tiết kết quả kinh doanh thực tế từ các đơn hàng đã giao thành công
                    </p>
                </div>

                <div className="admin-revenue-header-actions">
                    {/* Time filter selector */}
                    <div className="admin-revenue-time-filter-wrapper">
                        {["7 ngày", "30 ngày", "90 ngày", "12 tháng", "Tất cả"].map(
                            (filter) => (
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
                            )
                        )}
                    </div>

                    {/* Export CSV button */}
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="admin-revenue-export-btn"
                        title="Xuất báo cáo doanh thu ra file CSV (UTF-8)"
                    >
                        <Download size={16} />
                        <span>Xuất CSV</span>
                    </button>
                </div>
            </div>

            {/* 2. KPI Summary Cards Grid (4 Cards) */}
            <div className="admin-revenue-metrics-grid">
                {/* Card 1: Doanh thu trong kỳ */}
                <div className="admin-revenue-metric-card primary-kpi">
                    <div className="admin-revenue-metric-header">
                        <span className="admin-revenue-metric-label">
                            Doanh thu ({timeFilter.toLowerCase()})
                        </span>
                        <div className="admin-revenue-metric-icon-box red">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="admin-revenue-metric-value red-text">
                        {totalRevenue.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="admin-revenue-metric-footer">
                        <span className="admin-revenue-badge green-badge">
                            <ArrowUpRight size={12} />
                            Thực thu
                        </span>
                        <span className="admin-revenue-footer-text">
                            Từ {totalOrders} đơn giao thành công
                        </span>
                    </div>
                </div>

                {/* Card 2: Đơn hàng hoàn tất */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-header">
                        <span className="admin-revenue-metric-label">
                            Đơn giao thành công
                        </span>
                        <div className="admin-revenue-metric-icon-box green">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="admin-revenue-metric-value">
                        {totalOrders}{" "}
                        <span className="admin-revenue-unit">đơn</span>
                    </div>
                    <div className="admin-revenue-metric-footer">
                        <span className="admin-revenue-badge neutral-badge">
                            Tỷ lệ: {successRate}%
                        </span>
                        <span className="admin-revenue-footer-text">
                            Tổng đơn kỳ này
                        </span>
                    </div>
                </div>

                {/* Card 3: Giá trị TB / Đơn */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-header">
                        <span className="admin-revenue-metric-label">
                            Giá trị TB / Đơn (AOV)
                        </span>
                        <div className="admin-revenue-metric-icon-box blue">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <div className="admin-revenue-metric-value">
                        {Math.round(averageOrderValue).toLocaleString("vi-VN")} đ
                    </div>
                    <div className="admin-revenue-metric-footer">
                        <span className="admin-revenue-badge blue-badge">
                            AOV
                        </span>
                        <span className="admin-revenue-footer-text">
                            {totalOrders > 0
                                ? "Mức chi tiêu trung bình"
                                : "Chưa có đơn hoàn thành"}
                        </span>
                    </div>
                </div>

                {/* Card 4: Tổng doanh thu toàn sàn */}
                <div className="admin-revenue-metric-card">
                    <div className="admin-revenue-metric-header">
                        <span className="admin-revenue-metric-label">
                            Lũy kế toàn thời gian
                        </span>
                        <div className="admin-revenue-metric-icon-box amber">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="admin-revenue-metric-value">
                        {allTimeRevenue.toLocaleString("vi-VN")} đ
                    </div>
                    <div className="admin-revenue-metric-footer">
                        <span className="admin-revenue-badge amber-badge">
                            Toàn sàn
                        </span>
                        <span className="admin-revenue-footer-text">
                            {allTimeOrdersCount} đơn từ trước đến nay
                        </span>
                    </div>
                </div>
            </div>

            {/* 3. Payment Method Distribution Strip */}
            <div className="admin-revenue-payment-strip">
                <div className="admin-revenue-strip-title">
                    <PieChart size={16} />
                    <span>Cơ cấu doanh thu theo phương thức thanh toán ({timeFilter.toLowerCase()}):</span>
                </div>
                <div className="admin-revenue-strip-items">
                    <div className="admin-revenue-strip-pill">
                        <span className="strip-dot cod"></span>
                        <span className="strip-name">COD:</span>
                        <strong className="strip-value">
                            {paymentBreakdown.COD.revenue.toLocaleString("vi-VN")} đ
                        </strong>
                        <span className="strip-count">
                            ({paymentBreakdown.COD.count} đơn)
                        </span>
                    </div>
                    <div className="admin-revenue-strip-pill">
                        <span className="strip-dot vnpay"></span>
                        <span className="strip-name">VNPAY:</span>
                        <strong className="strip-value">
                            {paymentBreakdown.VNPAY.revenue.toLocaleString("vi-VN")} đ
                        </strong>
                        <span className="strip-count">
                            ({paymentBreakdown.VNPAY.count} đơn)
                        </span>
                    </div>
                    <div className="admin-revenue-strip-pill">
                        <span className="strip-dot momo"></span>
                        <span className="strip-name">MoMo:</span>
                        <strong className="strip-value">
                            {paymentBreakdown.MOMO.revenue.toLocaleString("vi-VN")} đ
                        </strong>
                        <span className="strip-count">
                            ({paymentBreakdown.MOMO.count} đơn)
                        </span>
                    </div>
                    {paymentBreakdown.OTHER.count > 0 && (
                        <div className="admin-revenue-strip-pill">
                            <span className="strip-dot other"></span>
                            <span className="strip-name">Khác:</span>
                            <strong className="strip-value">
                                {paymentBreakdown.OTHER.revenue.toLocaleString("vi-VN")} đ
                            </strong>
                            <span className="strip-count">
                                ({paymentBreakdown.OTHER.count} đơn)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* 4. Main Interactive Chart Card */}
            <div className="admin-revenue-chart-card">
                <div className="admin-revenue-chart-header">
                    <div className="admin-revenue-chart-header-info">
                        <div className="admin-revenue-chart-title-row">
                            <TrendingUp size={20} className="chart-icon" />
                            <h2 className="admin-revenue-chart-title">
                                {chartBars.title}
                            </h2>
                        </div>
                        <div className="admin-revenue-chart-meta">
                            <span className="admin-revenue-chart-pill">
                                Tổng chu kỳ:{" "}
                                <strong>
                                    {chartBars.totalPeriodRevenue.toLocaleString("vi-VN")} đ
                                </strong>
                            </span>
                            <span className="admin-revenue-chart-pill">
                                Đỉnh kỳ:{" "}
                                <strong>
                                    {chartBars.maxRev.toLocaleString("vi-VN")} đ
                                </strong>
                            </span>
                        </div>
                    </div>

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

                {/* Simulated SVG/Bar Chart Container */}
                <div className="admin-revenue-chart-container">
                    <div className="admin-revenue-chart-axis-line"></div>

                    {chartBars.bars.map((bar, idx) => {
                        const isHovered = hoveredBarIndex === idx;
                        return (
                            <div
                                key={idx}
                                className="admin-revenue-bar-item"
                                onMouseEnter={() => setHoveredBarIndex(idx)}
                                onMouseLeave={() => setHoveredBarIndex(null)}
                            >
                                {/* Tooltip on Hover or Value */}
                                {isHovered ? (
                                    <div className="admin-revenue-bar-tooltip">
                                        <div className="tooltip-sub">
                                            {bar.subLabel || bar.label}
                                        </div>
                                        <div className="tooltip-rev">
                                            {bar.revenue.toLocaleString("vi-VN")} đ
                                        </div>
                                        <div className="tooltip-count">
                                            {bar.orderCount} đơn hoàn thành
                                        </div>
                                    </div>
                                ) : (
                                    bar.revenue > 0 && (
                                        <span className="admin-revenue-bar-top-val">
                                            {bar.revenue >= 1000000
                                                ? `${(bar.revenue / 1000000).toFixed(1)}M`
                                                : `${Math.round(bar.revenue / 1000)}k`}
                                        </span>
                                    )
                                )}

                                <div
                                    style={{ height: bar.height }}
                                    className={`admin-revenue-bar-fill ${
                                        bar.active ? "active" : ""
                                    } ${bar.revenue > 0 ? "has-data" : "no-data"}`}
                                ></div>

                                <div className="admin-revenue-bar-labels">
                                    <span className="admin-revenue-bar-label">
                                        {bar.label}
                                    </span>
                                    {bar.subLabel && chartView !== "Tháng" && (
                                        <span className="admin-revenue-bar-sublabel">
                                            {bar.subLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="admin-revenue-chart-footer-note">
                    <Info size={14} />
                    <span>
                        Dữ liệu tổng hợp từ các đơn hàng có trạng thái "DELIVERED" hoặc "COMPLETED" trong cơ sở dữ liệu.
                    </span>
                </div>
            </div>

            {/* 5. Completed Transactions Table Card */}
            <div className="admin-revenue-table-card">
                <div className="admin-revenue-table-header">
                    <div className="admin-revenue-table-header-left">
                        <div className="table-title-row">
                            <ShoppingBag size={18} className="table-title-icon" />
                            <h2 className="admin-revenue-table-title">
                                Danh sách giao dịch hoàn thành
                            </h2>
                            <span className="admin-revenue-count-badge">
                                {filteredTransactionsCount} đơn
                            </span>
                        </div>
                        <p className="admin-revenue-table-desc">
                            Chi tiết các đơn hàng mang lại doanh thu trong khoảng thời gian đã chọn
                        </p>
                    </div>

                    <div className="admin-revenue-table-controls">
                        {/* Search Input */}
                        <div className="admin-revenue-search-box">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Tìm mã đơn (#123), khách hàng, SĐT..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="admin-revenue-search-input"
                            />
                        </div>

                        {/* Payment Filter */}
                        <div className="admin-revenue-filter-select-wrapper">
                            <Filter size={15} className="filter-select-icon" />
                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="admin-revenue-filter-select"
                            >
                                <option value="ALL">Tất cả phương thức</option>
                                <option value="COD">COD (Nhận hàng)</option>
                                <option value="VNPAY">VNPAY</option>
                                <option value="MOMO">Ví MoMo</option>
                                <option value="OTHER">Phương thức khác</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table View (Desktop) */}
                <div className="admin-revenue-table-scroll-wrapper">
                    {recentTransactions.length > 0 ? (
                        <table className="admin-revenue-table">
                            <thead className="admin-revenue-thead">
                                <tr>
                                    <th className="admin-revenue-th">Mã đơn</th>
                                    <th className="admin-revenue-th">Khách hàng</th>
                                    <th className="admin-revenue-th">Thời gian giao</th>
                                    <th className="admin-revenue-th">Phương thức</th>
                                    <th className="admin-revenue-th align-right">
                                        Số tiền
                                    </th>
                                    <th className="admin-revenue-th align-center">
                                        Trạng thái
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.map((order, index) => {
                                    const orderDate = getOrderDate(order);
                                    const amount = getOrderAmount(order);
                                    const payMethod =
                                        order.paymentMethod ||
                                        order.payment_method ||
                                        "COD";

                                    return (
                                        <tr
                                            key={order.id || index}
                                            className="admin-revenue-row"
                                        >
                                            <td className="admin-revenue-td-id">
                                                <span className="order-id-badge">
                                                    #{order.id}
                                                </span>
                                            </td>
                                            <td className="admin-revenue-td-customer">
                                                <div className="admin-revenue-customer-name">
                                                    {order.user?.fullName ||
                                                        order.recipientName ||
                                                        "Khách hàng"}
                                                </div>
                                                <div className="admin-revenue-customer-phone">
                                                    {order.recipientPhone ||
                                                        order.user?.phone ||
                                                        "Chưa cập nhật SĐT"}
                                                </div>
                                            </td>
                                            <td className="admin-revenue-td-time">
                                                <div className="admin-revenue-time-box">
                                                    <Calendar size={14} />
                                                    <span>
                                                        {orderDate
                                                            ? orderDate.toLocaleString(
                                                                  "vi-VN",
                                                                  {
                                                                      day: "2-digit",
                                                                      month: "2-digit",
                                                                      year: "numeric",
                                                                      hour: "2-digit",
                                                                      minute: "2-digit",
                                                                  }
                                                              )
                                                            : "---"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="admin-revenue-td-method">
                                                <span className="payment-method-tag">
                                                    {payMethod}
                                                </span>
                                            </td>
                                            <td className="admin-revenue-td-amount">
                                                {amount.toLocaleString("vi-VN")} đ
                                            </td>
                                            <td className="admin-revenue-td-status">
                                                <div className="admin-revenue-status-tag">
                                                    <CheckCircle2 size={13} />
                                                    <span>Hoàn thành</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="admin-revenue-empty-container">
                            <EmptyState
                                icon={ReceiptText}
                                title="Không tìm thấy giao dịch nào"
                                description={
                                    searchTerm || paymentFilter !== "ALL"
                                        ? "Không có đơn hàng thành công nào phù hợp với bộ lọc tìm kiếm hiện tại."
                                        : "Chưa ghi nhận đơn hàng thành công nào trong khoảng thời gian này."
                                }
                                actionText={
                                    searchTerm || paymentFilter !== "ALL"
                                        ? "Xóa bộ lọc"
                                        : undefined
                                }
                                onAction={() => {
                                    setSearchTerm("");
                                    setPaymentFilter("ALL");
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Mobile Cards View (<768px) */}
                <div className="admin-revenue-mobile-cards">
                    {recentTransactions.length > 0 ? (
                        recentTransactions.map((order, index) => {
                            const orderDate = getOrderDate(order);
                            const amount = getOrderAmount(order);
                            const payMethod =
                                order.paymentMethod ||
                                order.payment_method ||
                                "COD";

                            return (
                                <div
                                    key={order.id || index}
                                    className="admin-revenue-mobile-card"
                                >
                                    <div className="mobile-card-header">
                                        <span className="order-id-badge">
                                            #{order.id}
                                        </span>
                                        <div className="admin-revenue-status-tag">
                                            <CheckCircle2 size={13} />
                                            <span>Hoàn thành</span>
                                        </div>
                                    </div>

                                    <div className="mobile-card-customer">
                                        <div className="mobile-customer-name">
                                            {order.user?.fullName ||
                                                order.recipientName ||
                                                "Khách hàng"}
                                        </div>
                                        <div className="mobile-customer-phone">
                                            {order.recipientPhone ||
                                                order.user?.phone ||
                                                "---"}
                                        </div>
                                    </div>

                                    <div className="mobile-card-details">
                                        <div className="mobile-detail-row">
                                            <span className="detail-label">
                                                Thời gian:
                                            </span>
                                            <span className="detail-val">
                                                {orderDate
                                                    ? orderDate.toLocaleDateString(
                                                          "vi-VN"
                                                      )
                                                    : "---"}
                                            </span>
                                        </div>
                                        <div className="mobile-detail-row">
                                            <span className="detail-label">
                                                Thanh toán:
                                            </span>
                                            <span className="payment-method-tag">
                                                {payMethod}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mobile-card-footer">
                                        <span className="mobile-amount-label">
                                            Thực thu:
                                        </span>
                                        <strong className="mobile-amount-val">
                                            {amount.toLocaleString("vi-VN")} đ
                                        </strong>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="admin-revenue-empty-container">
                            <EmptyState
                                icon={ReceiptText}
                                title="Không tìm thấy giao dịch nào"
                                description="Không có đơn hàng thành công nào trong thời gian này."
                            />
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="admin-revenue-pagination">
                        <span className="pagination-info">
                            Trang <strong>{currentPage}</strong> /{" "}
                            <strong>{totalPages}</strong> ({filteredTransactionsCount}{" "}
                            giao dịch)
                        </span>

                        <div className="pagination-actions">
                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 1}
                                className="pagination-btn"
                                aria-label="Trang trước"
                            >
                                <ChevronLeft size={16} />
                                <span>Trước</span>
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => {
                                    return (
                                        p === 1 ||
                                        p === totalPages ||
                                        Math.abs(p - currentPage) <= 1
                                    );
                                })
                                .map((p, idx, arr) => (
                                    <span key={p} className="pagination-numbers">
                                        {idx > 0 &&
                                            arr[idx - 1] !== p - 1 && (
                                                <span className="pagination-ellipsis">
                                                    ...
                                                </span>
                                            )}
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(p)}
                                            className={`pagination-number-btn ${
                                                currentPage === p
                                                    ? "active"
                                                    : ""
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    </span>
                                ))}

                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage === totalPages}
                                className="pagination-btn"
                                aria-label="Trang tiếp"
                            >
                                <span>Tiếp</span>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminRevenue;
