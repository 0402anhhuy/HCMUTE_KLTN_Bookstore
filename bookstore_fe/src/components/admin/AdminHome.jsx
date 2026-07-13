import {
    Users,
    BookOpen,
    ShoppingBag,
    DollarSign,
    ShieldAlert,
    Activity,
    ArrowUpRight,
} from "lucide-react";

const AdminHome = ({
    user,
    users = [],
    products = [],
    orders = [],
    auditLogs = [],
}) => {
    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const totalUsers = users.length;
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalRevenue = orders
        .filter((o) => o.status === "COMPLETED" || o.status === "PAID")
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            {/* Banner Executive Header */}
            <div
                style={{
                    background:
                        "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
                    borderRadius: "16px",
                    padding: "32px",
                    color: "#ffffff",
                    boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.25)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div>
                    <span
                        style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            letterSpacing: "1.5px",
                            textTransform: "uppercase",
                            color: "#93c5fd",
                        }}
                    >
                        EXECUTIVE CONTROL CENTER
                    </span>
                    <h1
                        style={{
                            fontSize: "1.85rem",
                            fontWeight: 800,
                            margin: "8px 0 6px 0",
                            color: "#ffffff",
                        }}
                    >
                        Xin chào, Quản trị viên {user?.fullName || "Admin"}
                    </h1>
                    <p
                        style={{
                            margin: 0,
                            fontSize: "0.95rem",
                            color: "#cbd5e1",
                        }}
                    >
                        Giám sát toàn diện hoạt động kinh doanh, người dùng và
                        nhật ký bảo mật của hệ thống.
                    </p>
                </div>
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Activity size={28} color="#93c5fd" />
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                }}
            >
                {/* Total Revenue */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "22px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#64748b",
                            }}
                        >
                            Tổng Doanh Thu
                        </span>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <DollarSign size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        {formatPrice(totalRevenue)}
                    </div>
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#10b981",
                            fontWeight: 600,
                            marginTop: "8px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        <ArrowUpRight size={14} /> Hệ thống hoạt động ổn định
                    </div>
                </div>

                {/* Total Users */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "22px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#64748b",
                            }}
                        >
                            Tổng Người Dùng
                        </span>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Users size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        {totalUsers}{" "}
                        <span
                            style={{
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: "#64748b",
                            }}
                        >
                            tài khoản
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            marginTop: "8px",
                        }}
                    >
                        Khách hàng & nhân sự
                    </div>
                </div>

                {/* Total Books */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "22px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#64748b",
                            }}
                        >
                            Đầu Sách
                        </span>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BookOpen size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        {totalProducts}{" "}
                        <span
                            style={{
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: "#64748b",
                            }}
                        >
                            cuốn
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            marginTop: "8px",
                        }}
                    >
                        Trong kho sách
                    </div>
                </div>

                {/* Total Orders */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        padding: "22px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                color: "#64748b",
                            }}
                        >
                            Tổng Đơn Hàng
                        </span>
                        <div
                            style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#eff6ff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ShoppingBag size={20} color="#2563eb" />
                        </div>
                    </div>
                    <div
                        style={{
                            fontSize: "1.5rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        {totalOrders}{" "}
                        <span
                            style={{
                                fontSize: "0.9rem",
                                fontWeight: 500,
                                color: "#64748b",
                            }}
                        >
                            đơn
                        </span>
                    </div>
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#64748b",
                            marginTop: "8px",
                        }}
                    >
                        Toàn bộ giao dịch
                    </div>
                </div>
            </div>

            {/* Recent System Activity / Audit Preview */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    padding: "24px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "18px",
                    }}
                >
                    <div>
                        <h3
                            style={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#0f172a",
                                margin: 0,
                            }}
                        >
                            Hoạt Động Bảo Mật & Hệ Thống Gần Đây
                        </h3>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                            Nhật ký giám sát tự động của hệ thống
                        </span>
                    </div>
                </div>

                {auditLogs && auditLogs.length > 0 ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {auditLogs.slice(0, 5).map((log, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "12px 16px",
                                    backgroundColor: "#f8fafc",
                                    borderRadius: "8px",
                                    border: "1px solid #f1f5f9",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                    }}
                                >
                                    <ShieldAlert size={18} color="#2563eb" />
                                    <div>
                                        <div
                                            style={{
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                color: "#0f172a",
                                            }}
                                        >
                                            {log.action}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "0.75rem",
                                                color: "#64748b",
                                            }}
                                        >
                                            Đối tượng: {log.entityName || "N/A"}{" "}
                                            (ID: {log.entityId || "N/A"}) • Thực
                                            hiện bởi:{" "}
                                            {log.username || "Hệ thống"}
                                        </div>
                                    </div>
                                </div>
                                <span
                                    style={{
                                        fontSize: "0.75rem",
                                        color: "#64748b",
                                        fontWeight: 500,
                                    }}
                                >
                                    {log.createdAt
                                        ? new Date(
                                              log.createdAt,
                                          ).toLocaleString("vi-VN")
                                        : ""}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        style={{
                            padding: "36px 0",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: "0.9rem",
                        }}
                    >
                        Chưa có ghi nhận nhật ký hệ thống nào.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminHome;
