import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { userService } from "@/services/userService";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { couponService } from "@/services/couponService";
import { auditLogService } from "@/services/auditLogService";
import { shipperService } from "@/services/shipperService";
import { useApp } from "@/context/AppContext";
import {
    LayoutDashboard,
    Users,
    Package,
    Percent,
    Megaphone,
    Banknote,
    FileText,
} from "lucide-react";

export const useAdminDashboard = () => {
    const { user, loading: appLoading, logoutUser, showToast } = useApp();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [activeTab, setActiveTab] = useState(
        () => searchParams.get("tab") || "dashboard"
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
        } else if (user.role === "ADMIN") {
            navigate("/admin");
        } else {
            navigate("/");
        }
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

            try {
                const catRes = await categoryService.getCategories();
                setCategories(catRes.data || []);
            } catch (err) {
                console.error("Error loading categories", err);
            }

            try {
                const prodRes = await productService.getProducts();
                setProducts(prodRes.data?.content || prodRes.data || []);
            } catch (err) {
                console.error("Error loading products", err);
            }

            try {
                const orderRes = await orderService.getOrders();
                setOrders(orderRes.data || []);
            } catch (err) {
                console.error("Error loading orders", err);
            }

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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            const timer = window.setTimeout(() => {
                loadData();
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, [user, loadData]);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const navTabs = [
        {
            id: "dashboard",
            label: "Tổng quan",
            icon: LayoutDashboard,
        },
        { id: "users", label: "Người dùng", icon: Users },
        { id: "products", label: "Sản phẩm", icon: Package },
        { id: "coupons", label: "Mã giảm giá", icon: Percent },
        { id: "promotions", label: "Khuyến mãi", icon: Megaphone },
        { id: "revenue", label: "Doanh thu", icon: Banknote },
        {
            id: "audit-logs",
            label: "Lịch sử hoạt động",
            icon: FileText,
        },
    ];

    return {
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
    };
};