import { LogOut, Bell, ShieldCheck } from "lucide-react";
import { useAdminDashboard } from "./useAdminDashboard";

import { AdminHome } from "@/components/admin/home";
import { AdminUsers } from "@/components/admin/users";
import { AdminCoupons } from "@/components/admin/coupons";
import { AdminAuditLogs } from "@/components/admin/auditLogs";
import { AdminProducts } from "@/components/admin/products";
import ManagerOrders from "@/components/manager/ManagerOrders";
import { AdminRevenue } from "@/components/admin/revenues";
import { AdminPromotions } from "@/components/admin/promotions";

import "./AdminDashboard.css";

const AdminDashboard = () => {
    const {
        user,
        activeTab,
        setActiveTab,
        loading,
        users,
        totalUsers,
        products,
        categories,
        orders,
        coupons,
        promotions,
        auditLogs,
        shippers,
        loadData,
        handleLogout,
        showToast,
        navTabs,
    } = useAdminDashboard();

    return (
        <div className="admin-dashboard-layout">
            {/* Sidebar */}
            <aside className="admin-dashboard-sidebar">
                <div className="admin-dashboard-brand-box">
                    <div className="admin-dashboard-brand-inner">
                        <div className="admin-dashboard-brand-icon-wrapper">
                            <ShieldCheck size={20} color="#ffffff" />
                        </div>
                        <div className="admin-dashboard-brand-text">
                            <span className="admin-dashboard-brand-title">
                                Quản trị UTEShop
                            </span>
                            <span className="admin-dashboard-brand-subtitle">
                                Quản trị hệ thống
                            </span>
                        </div>
                    </div>
                </div>

                <nav className="admin-dashboard-nav">
                    {navTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`admin-dashboard-nav-item ${
                                    isActive ? "active" : ""
                                }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="admin-dashboard-sidebar-footer">
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="admin-dashboard-logout-btn-sidebar"
                    >
                        <LogOut size={15} />
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            {/* Main Wrapper */}
            <div className="admin-dashboard-main-wrapper">
                <header className="admin-dashboard-header">
                    <div className="admin-dashboard-header-brand">
                        <span className="admin-dashboard-header-logo-text">
                            UTEShop
                        </span>
                    </div>

                    <div className="admin-dashboard-header-right">
                        <button
                            type="button"
                            className="admin-dashboard-bell-btn"
                        >
                            <Bell size={20} />
                        </button>
                        <div className="admin-dashboard-avatar-box">
                            {user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.fullName || "Admin"}
                                    className="admin-dashboard-avatar-img"
                                />
                            ) : null}
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="admin-dashboard-logout-btn-header"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <main className="admin-dashboard-content">
                    {loading ? (
                        <div className="admin-dashboard-loading-state">
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
                            {activeTab === "promotions" && <AdminPromotions />}
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
