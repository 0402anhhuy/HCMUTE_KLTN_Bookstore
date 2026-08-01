import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "../../services/userService";
import { categoryService } from "../../services/categoryService";
import { productService } from "../../services/productService";
import { orderService } from "../../services/orderService";
import { couponService } from "../../services/couponService";
import { auditLogService } from "../../services/auditLogService";
import { shipperService } from "../../services/shipperService";
import { useApp } from "../../context/AppContext";
import {
    LayoutDashboard,
    Users,
    Package,
    Percent,
    Megaphone,
    Banknote,
    LogOut,
    Bell,
    ShieldCheck,
    FileText,
} from "lucide-react";

import AdminHome from "./AdminHome";
import AdminUsers from "./AdminUsers";
import AdminCoupons from "./AdminCoupons";
import AdminAuditLogs from "./AdminAuditLogs";
import AdminProducts from "./AdminProducts";
import ManagerOrders from "../manager/ManagerOrders";
import AdminRevenue from "./AdminRevenue";

const AdminDashboard = () => {
    const { user, loading: appLoading, logoutUser, showToast } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(
        () => searchParams.get("tab") || "dashboard",
    );

    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [promotions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [shippers, setShippers] = useState([]);

    useEffect(() => {
        if (appLoading) return;
        if (!user) {
            navigate("/login");
        } else if (user.role == "ADMIN") navigate("/admin");
        else navigate("/");
    }, [user, appLoading, navigate]);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            try {
                const userRes = await userService.getTotalUsers();
                const usersRes = await userService.getUsers();
                setUsers(usersRes.data || []);
                setTotalUsers(userRes.data || 0);
            } catch (err) {
                console.error("Error loading total users", err);
            }

            const catRes = await categoryService.getCategories();
            setCategories(catRes.data || []);

            const prodRes = await productService.getPendingProducts();
            setProducts(prodRes.data.content || prodRes.data || []);

            const orderRes = await orderService.getOrders();
            setOrders(orderRes.data || []);

            try {
                const couponRes = await couponService.getCoupons();
                setCoupons(couponRes.data || []);
            } catch (err) {
                console.error("Error loading coupons", err);
            }

            try {
                const logRes = await auditLogService.getAuditLogs();
                setAuditLogs(logRes.data || []);
            } catch (err) {
                console.error("Error loading audit logs", err);
            }

            try {
                const shipperRes = await shipperService.getShippers();
                setShippers(shipperRes.data || []);
            } catch (err) {
                console.error("Error loading shippers", err);
            }
        } catch (error) {
            console.error("Error loading admin dashboard data", error);
            showToast("Lỗi tải dữ liệu kênh Quản trị viên!", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            const timer = window.setTimeout(() => {
                loadData();
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, [user, activeTab, loadData]);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f4f6f8",
                fontFamily: "'Outfit', sans-serif",
                color: "#111827",
            }}
        >
            <aside
                style={{
                    width: "240px",
                    backgroundColor: "#f8fafc",
                    borderRight: "1px solid #e5e7eb",
                    display: "flex",
                    flexDirection: "column",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    zIndex: 100,
                    color: "#ffffff",
                }}
            >
                <div
                    style={{
                        padding: "18px 14px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "10px",
                                backgroundColor: "#ef4444",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <ShieldCheck size={20} color="#ffffff" />
                        </div>
                        <div
                            style={{ display: "flex", flexDirection: "column" }}
                        >
                            <span
                                style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#ef4444",
                                    letterSpacing: "-0.01em",
                                    lineHeight: 1.2,
                                }}
                            >
                                Quản trị UTEShop
                            </span>
                            <span
                                style={{
                                    fontSize: "0.72rem",
                                    color: "#6b7280",
                                    fontWeight: 500,
                                }}
                            >
                                Quản trị hệ thống
                            </span>
                        </div>
                    </div>
                </div>

                <nav
                    style={{
                        padding: "16px 12px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    {[
                        {
                            id: "dashboard",
                            label: "Tổng quan",
                            icon: LayoutDashboard,
                        },
                        { id: "users", label: "Người dùng", icon: Users },
                        { id: "products", label: "Sản phẩm", icon: Package },
                        { id: "coupons", label: "Mã giảm giá", icon: Percent },
                        { id: "orders", label: "Đơn hàng", icon: Megaphone },
                        { id: "revenue", label: "Doanh thu", icon: Banknote },
                        {
                            id: "audit-logs",
                            label: "Lịch sử hoạt động",
                            icon: FileText,
                        },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "12px",
                                    width: "100%",
                                    padding: "12px 14px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor: isActive
                                        ? "#ef4444"
                                        : "transparent",
                                    color: isActive ? "#ffffff" : "#4b5563",
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: "0.875rem",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div style={{ padding: "12px 12px 16px" }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "8px 10px",
                            borderRadius: "10px",
                            border: "1px solid #ffb4b1",
                            backgroundColor: "#ffffff",
                            color: "#ff5a57",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                        }}
                    >
                        <LogOut size={15} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <div
                style={{
                    flex: 1,
                    marginLeft: "240px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <header
                    style={{
                        height: "64px",
                        backgroundColor: "#f4f6f8",
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 24px",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 800,
                                fontSize: "1.25rem",
                                color: "#ef4444",
                                letterSpacing: "-0.5px",
                            }}
                        >
                            UTEShop
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                        }}
                    >
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                color: "#4b5563",
                                cursor: "pointer",
                            }}
                        >
                            <Bell size={20} />
                        </button>
                        <div
                            style={{
                                width: "34px",
                                height: "34px",
                                borderRadius: "999px",
                                overflow: "hidden",
                                border: "1px solid #d7def0",
                                backgroundColor: "#f3f4f6",
                            }}
                        >
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName || "Admin"}
                                    style={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : null}
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "6px 16px",
                                borderRadius: "6px",
                                border: "1px solid #fca5a5",
                                backgroundColor: "transparent",
                                color: "#ef4444",
                                fontWeight: 500,
                                fontSize: "0.875rem",
                                cursor: "pointer",
                            }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <main
                    style={{
                        padding: "24px 32px",
                        flex: 1,
                        maxWidth: "1200px",
                    }}
                >
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "300px",
                                color: "#64748b",
                                fontWeight: 600,
                            }}
                        >
                            Đang tải dữ liệu Quản trị viên...
                        </div>
                    ) : (
                        <>
                            {activeTab === "dashboard" && (
                                <AdminHome
                                    user={user}
                                    users={users}
                                    userCount={totalUsers}
                                    products={products}
                                    orders={orders}
                                    auditLogs={auditLogs}
                                />
                            )}
                            {activeTab === "users" && (
                                <AdminUsers
                                    users={users}
                                    loadData={loadData}
                                    showToast={showToast}
                                />
                            )}
                            {activeTab === "coupons" && (
                                <AdminCoupons
                                    coupons={coupons}
                                    promotions={promotions}
                                    loadData={loadData}
                                    showToast={showToast}
                                />
                            )}
                            {activeTab === "products" && (
                                <AdminProducts
                                    products={products}
                                    categories={categories}
                                    loadData={loadData}
                                />
                            )}
                            {activeTab === "orders" && (
                                <ManagerOrders
                                    orders={orders}
                                    shippers={shippers}
                                    loadData={loadData}
                                />
                            )}
                            {activeTab === "revenue" && (
                                <AdminRevenue orders={orders} />
                            )}
                            {activeTab === "audit-logs" && (
                                <AdminAuditLogs
                                    auditLogs={auditLogs}
                                    loadData={loadData}
                                />
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
