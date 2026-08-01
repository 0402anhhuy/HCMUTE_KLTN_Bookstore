import { Users, Store, AlertTriangle } from "lucide-react";

const AdminHome = ({ user, users, userCount, products, orders, auditLogs }) => {
    const deliveredOrders = (orders || []).filter(o => o.status === 'delivered' || o.status === 'COMPLETED');
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || o.totalAmount || 0), 0);
    const totalUsers = userCount || 0;
    const totalOrders = (orders || []).length;
    const outOfStockProducts = (products || []).filter(p => p.stockQuantity === 0).length;

    return (
        <div style={{ padding: "10px 0" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1
                    style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        margin: "0 0 4px 0",
                        color: "#111827",
                    }}
                >
                    Tổng quan hệ thống
                </h1>
                <p
                    style={{
                        fontSize: "0.875rem",
                        margin: 0,
                        color: "#6b7280",
                    }}
                >
                    Trạng thái thời gian thực và các chỉ số vận hành của UTEShop
                </p>
            </div>

            {/* Main Chart Card */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e5e7eb",
                    padding: "24px",
                    marginBottom: "24px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "30px",
                    }}
                >
                    <h2
                        style={{
                            fontSize: "1.125rem",
                            fontWeight: 700,
                            margin: 0,
                            color: "#111827",
                        }}
                    >
                        Doanh số toàn hệ thống
                    </h2>

                    <div
                        style={{
                            display: "flex",
                            backgroundColor: "#f3f4f6",
                            borderRadius: "999px",
                            padding: "4px",
                        }}
                    >
                        <button
                            style={{
                                padding: "6px 16px",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#4b5563",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Ngày
                        </button>
                        <button
                            style={{
                                padding: "6px 16px",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: "#ef4444",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)",
                            }}
                        >
                            Tháng
                        </button>
                        <button
                            style={{
                                padding: "6px 16px",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: "transparent",
                                color: "#4b5563",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Năm
                        </button>
                    </div>
                </div>

                {/* Chart Bars */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                        height: "180px",
                        marginTop: "20px",
                        padding: "0 10px",
                    }}
                >
                    <div
                        style={{
                            width: "12%",
                            height: "40%",
                            backgroundColor: "#fee2e2",
                            borderRadius: "4px 4px 0 0",
                        }}
                    ></div>
                    <div
                        style={{
                            width: "12%",
                            height: "55%",
                            backgroundColor: "#fecaca",
                            borderRadius: "4px 4px 0 0",
                        }}
                    ></div>
                    <div
                        style={{
                            width: "12%",
                            height: "35%",
                            backgroundColor: "#fca5a5",
                            borderRadius: "4px 4px 0 0",
                        }}
                    ></div>
                    <div
                        style={{
                            width: "12%",
                            height: "70%",
                            backgroundColor: "#f87171",
                            borderRadius: "4px 4px 0 0",
                        }}
                    ></div>
                    <div
                        style={{
                            width: "12%",
                            height: "85%",
                            backgroundColor: "#f3f4f6",
                        }}
                    >
                        {" "}
                        {/* Wait, this bar in image is soft red */}{" "}
                    </div>
                    <div
                        style={{
                            width: "12%",
                            height: "100%",
                            backgroundColor: "#ef4444",
                            borderRadius: "4px 4px 0 0",
                        }}
                    ></div>
                </div>

                <div
                    style={{
                        height: "1px",
                        backgroundColor: "#e5e7eb",
                        margin: "24px 0",
                    }}
                ></div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                letterSpacing: "0.05em",
                                marginBottom: "4px",
                            }}
                        >
                            TỔNG GIÁ TRỊ
                        </div>
                        <div
                            style={{
                                fontSize: "1.75rem",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {totalRevenue.toLocaleString('vi-VN')}đ
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                letterSpacing: "0.05em",
                                marginBottom: "4px",
                            }}
                        >
                            TĂNG TRƯỞNG
                        </div>
                        <div
                            style={{
                                fontSize: "1.5rem",
                                fontWeight: 700,
                                color: "#10b981",
                            }}
                        >
                            +12.4%
                        </div>
                    </div>
                </div>
            </div>

            {/* Three Info Cards */}
            <div style={{ display: "flex", gap: "20px" }}>
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                marginBottom: "8px",
                            }}
                        >
                            Tổng người dùng
                        </div>
                        <div
                            style={{
                                fontSize: "1.375rem",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {totalUsers}
                        </div>
                    </div>
                    <div
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            backgroundColor: "#eff6ff",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Users size={20} color="#3b82f6" />
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                marginBottom: "8px",
                            }}
                        >
                            Tổng đơn hàng
                        </div>
                        <div
                            style={{
                                fontSize: "1.375rem",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {totalOrders}
                        </div>
                    </div>
                    <div
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            backgroundColor: "#ecfdf5",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Store size={20} color="#10b981" />
                    </div>
                </div>

                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                >
                    <div>
                        <div
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                marginBottom: "8px",
                            }}
                        >
                            Sản phẩm hết hàng
                        </div>
                        <div
                            style={{
                                fontSize: "1.375rem",
                                fontWeight: 700,
                                color: "#111827",
                            }}
                        >
                            {outOfStockProducts}
                        </div>
                        <div
                            style={{
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                color: "#ef4444",
                                marginTop: "4px",
                            }}
                        >
                            Cần chú ý
                        </div>
                    </div>
                    <div
                        style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            backgroundColor: "#fef2f2",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <AlertTriangle size={20} color="#ef4444" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
