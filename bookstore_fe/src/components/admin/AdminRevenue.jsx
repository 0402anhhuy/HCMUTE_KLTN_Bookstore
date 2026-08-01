import { useState } from "react";
import { CheckCircle2, Calendar } from "lucide-react";

const AdminRevenue = ({ orders }) => {
    // Current state mappings
    const [timeFilter, setTimeFilter] = useState("30 ngày"); // "7 ngày", "30 ngày", "12 tháng"
    const [chartView, setChartView] = useState("Tuần"); // "Hằng ngày", "Tuần", "Tháng"

    const deliveredOrders = (orders || []).filter(o => o.status === 'delivered' || o.status === 'COMPLETED');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
    const totalOrders = deliveredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const soDuVi = totalRevenue * 0.68;

    const recentTransactions = [...deliveredOrders].sort((a, b) => {
        return new Date(b.deliveredAt || b.createdAt) - new Date(a.deliveredAt || a.createdAt);
    }).slice(0, 10);

    return (
        <div style={{ padding: "0" }}>
            
            {/* 1. Header Area with exact layout */}
            <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 4px 0", color: "#111827" }}>
                        Thống kê & Tài chính
                    </h1>
                    <p style={{ fontSize: "0.875rem", margin: 0, color: "#6b7280" }}>
                        Manage your business work
                    </p>
                </div>
                
                <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    {/* Time Filter Segmented Control */}
                    <div style={{ display: "flex", padding: "4px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                        {['7 ngày', '30 ngày', '12 tháng'].map(filter => (
                            <button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: "6px",
                                    border: "none",
                                    backgroundColor: timeFilter === filter ? "#cbd5e1" : "transparent",
                                    color: timeFilter === filter ? "#ef4444" : "#fca5a5", 
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    <button style={{
                        padding: "8px 20px",
                        backgroundColor: "#f43f5e",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        boxShadow: "0 2px 4px rgba(244, 63, 94, 0.2)"
                    }}>
                        Tạo báo cáo
                    </button>
                </div>
            </div>

            {/* 2. Top Metric Cards (DOANH THU, SỐ DƯ VÍ, GIÁ TRỊ ĐƠN) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "24px" }}>
                {/* Card 1: Doanh thu */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>DOANH THU</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
                        {totalRevenue.toLocaleString('vi-VN')}đ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <div style={{ padding: "2px 8px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                            +12.5%
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>so với tháng trước</span>
                    </div>
                </div>

                {/* Card 2: Số dư ví */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>SỐ DƯ VÍ</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
                        {soDuVi.toLocaleString('vi-VN')}đ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <div style={{ padding: "2px 8px", backgroundColor: "#dcfce7", color: "#166534", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                            +8.2%
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 500 }}>so với tháng trước</span>
                    </div>
                </div>

                {/* Card 3: Giá trị đơn */}
                <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>GIÁ TRỊ ĐƠN</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827" }}>
                        {Math.round(averageOrderValue).toLocaleString('vi-VN')}đ
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                        <div style={{ padding: "2px 8px", backgroundColor: "#f3f4f6", color: "#4b5563", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                            {totalOrders} Orders
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Main Chart Card */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", padding: "24px 32px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#1f2937" }}>
                        Tổng quan doanh thu
                    </h2>
                    
                    <div style={{ display: "flex", backgroundColor: "#f8fafc", borderRadius: "6px", border: "1px solid #e2e8f0", padding: "2px" }}>
                        {['Hằng ngày', 'Tuần', 'Tháng'].map(view => (
                            <button
                                key={view}
                                onClick={() => setChartView(view)}
                                style={{
                                    padding: "6px 14px",
                                    borderRadius: "4px",
                                    border: "none",
                                    backgroundColor: chartView === view ? "#ffffff" : "transparent",
                                    color: chartView === view ? "#2563eb" : "#64748b",
                                    boxShadow: chartView === view ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                                    fontSize: "0.8rem",
                                    fontWeight: chartView === view ? 700 : 500,
                                    cursor: "pointer"
                                }}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Simulated Chart Container */}
                <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: "300px", paddingBottom: "2px", position: "relative" }}>
                    
                    {/* Horizontal Line logic (fake axis line, but image has it slightly detached at the bottom) */}
                    <div style={{ position: "absolute", bottom: "34px", left: "20px", right: "20px", height: "1px", backgroundColor: "#cbd5e1" }}></div>

                    {/* Array of bars */}
                    {[
                        { height: "40%", label: "01/05" },
                        { height: "100%", label: "08/05", active: true },
                        { height: "80%", label: "15/05" },
                        { height: "65%", label: "22/05" },
                        { height: "90%", label: "29/05" }
                    ].map((bar, idx) => (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "16%", height: "100%", justifyContent: "flex-end", paddingBottom: "20px", zIndex: 10 }}>
                            <div style={{
                                width: "100%",
                                height: bar.height,
                                backgroundColor: bar.active ? "#f43f5e" : "#e0e7ff",
                                borderRadius: "4px 4px 0 0",
                                marginBottom: "14px",
                                transition: "height 0.5s ease"
                            }}></div>
                            <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: 600 }}>{bar.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 4. Extra: Recent Transactions Table (Kept for functionality) */}
            <div style={{ backgroundColor: "#ffffff", borderRadius: "8px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700, margin: 0, color: "#111827" }}>Chi tiết đơn hàng hoàn thành</h2>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead style={{ backgroundColor: "#f9fafb" }}>
                            <tr>
                                <th style={{ padding: "12px 24px", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Mã đơn</th>
                                <th style={{ padding: "12px 24px", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Khách hàng</th>
                                <th style={{ padding: "12px 24px", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>Thời gian</th>
                                <th style={{ padding: "12px 24px", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", textAlign: "right" }}>Số tiền</th>
                                <th style={{ padding: "12px 24px", fontSize: "0.75rem", fontWeight: 600, color: "#6b7280", textTransform: "uppercase", textAlign: "center" }}>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((order, index) => (
                                    <tr key={order.id} style={{ borderBottom: index < recentTransactions.length - 1 ? "1px solid #e5e7eb" : "none", backgroundColor: "#ffffff" }}>
                                        <td style={{ padding: "16px 24px", fontSize: "0.875rem", fontWeight: 600, color: "#111827" }}>#{order.id}</td>
                                        <td style={{ padding: "16px 24px" }}>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 500, color: "#111827" }}>{order.user?.fullName || "Khách hàng"}</div>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "0.875rem", color: "#6b7280" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                                <Calendar size={14} />
                                                {new Date(order.deliveredAt || order.createdAt).toLocaleDateString('vi-VN')}
                                            </div>
                                        </td>
                                        <td style={{ padding: "16px 24px", fontSize: "1rem", fontWeight: 700, color: "#111827", textAlign: "right" }}>
                                            {(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                                        </td>
                                        <td style={{ padding: "16px 24px", textAlign: "center" }}>
                                            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", backgroundColor: "#ecfdf5", color: "#10b981", padding: "4px 10px", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                <CheckCircle2 size={12} />
                                                Hoàn thành
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: "40px 24px", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>Không có giao dịch nào.</td>
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
