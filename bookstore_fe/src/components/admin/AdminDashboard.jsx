import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { useApp } from "../../context/AppContext";
import {
    LayoutDashboard,
    Users,
    Tag,
    ShoppingBag,
    ClipboardList,
    ShieldAlert,
    LogOut,
    Home,
    Bell,
    ShieldCheck,
} from "lucide-react";

// Import Admin Subcomponents
import AdminHome from "./AdminHome";
import AdminUsers from "./AdminUsers";
import AdminCoupons from "./AdminCoupons";
import AdminAuditLogs from "./AdminAuditLogs";

// Reuse Catalog & Order management from manager for complete admin control
import ManagerProducts from "../manager/ManagerProducts";
import ManagerOrders from "../manager/ManagerOrders";

const AdminDashboard = () => {
    const {
        user,
        logoutUser,
        showToast,
        notifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsAsRead,
    } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Tab & Notification State
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [searchParams]);

    // Loading & Data State
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [shippers, setShippers] = useState([]);

    // Authorization Check
    useEffect(() => {
        if (!user) {
            navigate("/login");
        } else if (user.role !== "ADMIN") {
            showToast(
                "Kênh Quản Trị Viên (Admin) chỉ dành cho tài khoản ADMIN!",
                "error",
            );
            if (user.role === "MANAGER") navigate("/manager");
            else navigate("/");
        }
    }, [user, navigate]);

    useEffect(() => {
        if (user && user.role === "ADMIN") {
            loadData();
        }
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Users
            try {
                const userRes = await api.get("/admin/users");
                setUsers(userRes.data || []);
            } catch (err) {
                console.error("Error loading users", err);
            }

            // 2. Fetch Categories & Products
            const catRes = await api.get("/categories");
            setCategories(catRes.data || []);

            const prodRes = await api.get("/products");
            setProducts(prodRes.data.content || prodRes.data || []);

            // 3. Fetch Orders
            const orderRes = await api.get("/orders/all");
            setOrders(orderRes.data || []);

            // 4. Fetch Coupons
            try {
                const couponRes = await api.get("/coupons");
                setCoupons(couponRes.data || []);
            } catch (err) {
                console.error("Error loading coupons", err);
            }

            // 5. Fetch Audit Logs
            try {
                const logRes = await api.get("/admin/audit-logs");
                setAuditLogs(logRes.data || []);
            } catch (err) {
                console.error("Error loading audit logs", err);
            }

            // 6. Fetch Shippers
            try {
                const shipperRes = await api.get("/shippers");
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
    };

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                backgroundColor: "#f1f5f9",
                fontFamily: "'Outfit', sans-serif",
                color: "#0f172a",
            }}
        >
            {/* Executive Dark Sapphire Sidebar */}
            <aside
                style={{
                    width: "270px",
                    background:
                        "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
                    borderRight: "1px solid #334155",
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
                {/* Brand Header */}
                <div
                    style={{
                        padding: "24px 22px",
                        borderBottom: "1px solid #334155",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <div
                        style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "10px",
                            background:
                                "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                        }}
                    >
                        <ShieldCheck size={22} color="#ffffff" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <span
                            style={{
                                fontSize: "1.2rem",
                                fontWeight: 800,
                                color: "#ffffff",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Admin UTEShop
                        </span>
                        <span
                            style={{
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                color: "#93c5fd",
                                letterSpacing: "0.5px",
                            }}
                        >
                            EXECUTIVE PORTAL
                        </span>
                    </div>
                </div>

                {/* Navigation List */}
                <nav
                    style={{
                        padding: "24px 14px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                    }}
                >
                    {[
                        {
                            id: "dashboard",
                            label: "Tổng quan Hệ thống",
                            icon: LayoutDashboard,
                        },
                        {
                            id: "users",
                            label: "Người dùng & Quyền",
                            icon: Users,
                        },
                        {
                            id: "coupons",
                            label: "Mã Giảm Giá & Khuyến Mãi",
                            icon: Tag,
                        },
                        {
                            id: "products",
                            label: "Kho Sách & Danh Mục",
                            icon: ShoppingBag,
                        },
                        {
                            id: "orders",
                            label: "Đơn Hàng Toàn Sàn",
                            icon: ClipboardList,
                        },
                        {
                            id: "audit-logs",
                            label: "Nhật Ký Giám Sát",
                            icon: ShieldAlert,
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
                                    gap: "14px",
                                    width: "100%",
                                    padding: "13px 18px",
                                    borderRadius: "10px",
                                    border: "none",
                                    backgroundColor: isActive
                                        ? "#1e40af"
                                        : "transparent",
                                    color: isActive ? "#ffffff" : "#cbd5e1",
                                    fontWeight: isActive ? 700 : 500,
                                    fontSize: "0.925rem",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "all 0.2s ease",
                                    boxShadow: isActive
                                        ? "0 4px 12px rgba(30, 64, 175, 0.35)"
                                        : "none",
                                }}
                            >
                                <Icon
                                    size={19}
                                    style={{
                                        color: isActive ? "#ffffff" : "#94a3b8",
                                    }}
                                />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer Actions */}
                <div
                    style={{
                        padding: "20px 16px",
                        borderTop: "1px solid #334155",
                    }}
                >
                    <button
                        onClick={handleLogout}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #ef4444",
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            color: "#f87171",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            transition: "all 0.2s",
                        }}
                    >
                        <LogOut size={16} />
                        <span>Đăng xuất Admin</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                style={{
                    flex: 1,
                    marginLeft: "270px",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Top Navbar */}
                <header
                    style={{
                        height: "68px",
                        backgroundColor: "#ffffff",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 36px",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                        }}
                    >
                        <span
                            style={{
                                padding: "4px 12px",
                                borderRadius: "6px",
                                backgroundColor: "#1e40af",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: 800,
                                letterSpacing: "1px",
                            }}
                        >
                            ADMIN EXECUTIVE
                        </span>
                        <span
                            style={{
                                fontWeight: 700,
                                fontSize: "1.15rem",
                                color: "#0f172a",
                            }}
                        >
                            Trung Tâm Quản Trị Tối Cao
                        </span>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "18px",
                        }}
                    >
                        {/* Home button */}
                        <Link
                            to="/"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "38px",
                                height: "38px",
                                borderRadius: "10px",
                                backgroundColor: "#f1f5f9",
                                color: "#475569",
                                transition: "all 0.2s",
                            }}
                        >
                            <Home size={18} />
                        </Link>

                        {/* Notifications */}
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() =>
                                    setShowNotifDropdown(!showNotifDropdown)
                                }
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#475569",
                                    position: "relative",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "4px",
                                    borderRadius: "10px",
                                }}
                            >
                                <Bell size={21} />
                                {unreadCount > 0 && (
                                    <span
                                        style={{
                                            position: "absolute",
                                            top: "-2px",
                                            right: "-2px",
                                            width: "17px",
                                            height: "17px",
                                            backgroundColor: "#ef4444",
                                            color: "#ffffff",
                                            borderRadius: "50%",
                                            fontSize: "0.65rem",
                                            fontWeight: 700,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            border: "1.5px solid #ffffff",
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Admin Avatar */}
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
                                    backgroundColor: "#1e40af",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: 800,
                                    fontSize: "0.9rem",
                                }}
                            >
                                {user
                                    ? user.fullName.charAt(0).toUpperCase()
                                    : "A"}
                            </div>
                            <div>
                                <div
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: 700,
                                        color: "#0f172a",
                                    }}
                                >
                                    {user ? user.fullName : "Admin Executive"}
                                </div>
                                <div
                                    style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                        color: "#2563eb",
                                    }}
                                >
                                    Quản Trị Viên
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <main style={{ padding: "36px", flex: 1 }}>
                    {loading ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "350px",
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
                                <ManagerProducts
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
