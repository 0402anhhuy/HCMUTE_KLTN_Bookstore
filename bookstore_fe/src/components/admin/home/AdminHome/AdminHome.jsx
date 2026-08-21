import { Users, Store, AlertTriangle } from "lucide-react";
import { useAdminHome } from "./useAdminHome";
import "./AdminHome.css";

const AdminHome = ({ user, users, userCount, products, orders, auditLogs }) => {
    const {
        timeRange,
        setTimeRange,
        totalRevenue,
        totalUsers,
        totalOrders,
        outOfStockProducts,
        chartBars,
    } = useAdminHome({
        user,
        users,
        userCount,
        products,
        orders,
        auditLogs,
    });

    return (
        <div className="admin-home-container">
            {/* Header Area */}
            <div className="admin-home-header">
                <h1 className="admin-home-title">Tổng quan hệ thống</h1>
                <p className="admin-home-subtitle">
                    Trạng thái thời gian thực và các chỉ số vận hành của UTEShop
                </p>
            </div>

            {/* Main Chart Card */}
            <div className="admin-home-chart-card">
                <div className="admin-home-chart-header">
                    <h2 className="admin-home-chart-title">
                        Doanh số toàn hệ thống
                    </h2>

                    <div className="admin-home-time-segmented-control">
                        {["Ngày", "Tháng", "Năm"].map((range) => (
                            <button
                                key={range}
                                type="button"
                                onClick={() => setTimeRange(range)}
                                className={`admin-home-time-btn ${
                                    timeRange === range ? "active" : ""
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart Bars */}
                <div className="admin-home-chart-bars-container">
                    {chartBars.map((bar, idx) => (
                        <div
                            key={idx}
                            style={{
                                height: bar.height,
                                backgroundColor: bar.bg,
                            }}
                            className="admin-home-chart-bar"
                        ></div>
                    ))}
                </div>

                <div className="admin-home-divider"></div>

                <div className="admin-home-chart-bottom">
                    <div>
                        <div className="admin-home-stat-label">
                            TỔNG GIÁ TRỊ
                        </div>
                        <div className="admin-home-stat-value">
                            {totalRevenue.toLocaleString("vi-VN")}đ
                        </div>
                    </div>
                    <div className="admin-home-growth-container">
                        <div className="admin-home-stat-label">TĂNG TRƯỞNG</div>
                        <div className="admin-home-growth-value">+12.4%</div>
                    </div>
                </div>
            </div>

            {/* Three Info Cards */}
            <div className="admin-home-cards-grid">
                <div className="admin-home-info-card">
                    <div>
                        <div className="admin-home-card-title">
                            Tổng người dùng
                        </div>
                        <div className="admin-home-card-value">
                            {totalUsers}
                        </div>
                    </div>
                    <div className="admin-home-icon-box users">
                        <Users size={20} color="#3b82f6" />
                    </div>
                </div>

                <div className="admin-home-info-card">
                    <div>
                        <div className="admin-home-card-title">
                            Tổng đơn hàng
                        </div>
                        <div className="admin-home-card-value">
                            {totalOrders}
                        </div>
                    </div>
                    <div className="admin-home-icon-box orders">
                        <Store size={20} color="#10b981" />
                    </div>
                </div>

                <div className="admin-home-info-card align-start">
                    <div>
                        <div className="admin-home-card-title">
                            Sản phẩm hết hàng
                        </div>
                        <div className="admin-home-card-value">
                            {outOfStockProducts}
                        </div>
                        <div className="admin-home-card-warning-sub">
                            Cần chú ý
                        </div>
                    </div>
                    <div className="admin-home-icon-box out-of-stock">
                        <AlertTriangle size={20} color="#ef4444" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
