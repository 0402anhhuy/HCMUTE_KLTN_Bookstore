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

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [
                userRes,
                usersRes,
                catRes,
                prodRes,
                pendingRes,
                inactiveRes,
                rejectedRes,
                orderRes,
                couponRes,
                logRes,
                shipperRes,
            ] = await Promise.all([
                userService.getTotalUsers().catch(() => ({ data: 0 })),
                userService.getUsers().catch(() => ({ data: [] })),
                categoryService.getCategories().catch(() => ({ data: [] })),
                productService.getProducts({ size: 1000 }).catch(() => ({ data: [] })),
                productService.getPendingProducts().catch(() => ({ data: [] })),
                productService
                    .getProductsByStatus("INACTIVE")
                    .catch(() => ({ data: [] })),
                productService.getRejectedProducts().catch(() => ({ data: [] })),
                orderService.getOrders().catch(() => ({ data: [] })),
                couponService.getCoupons().catch(() => ({ data: [] })),
                auditLogService.getAuditLogs().catch(() => ({ data: [] })),
                shipperService.getShippers().catch(() => ({ data: [] })),
            ]);

            setUsers(usersRes.data || []);
            setTotalUsers(userRes.data || 0);
            setCategories(catRes.data || []);

            const activeList =
                prodRes.data?.content ||
                (Array.isArray(prodRes.data) ? prodRes.data : []);
            const pendingList = Array.isArray(pendingRes.data)
                ? pendingRes.data
                : [];
            const inactiveList = Array.isArray(inactiveRes.data)
                ? inactiveRes.data
                : [];
            const rejectedList = Array.isArray(rejectedRes.data)
                ? rejectedRes.data
                : [];

            const productMap = new Map();
            [
                ...activeList,
                ...pendingList,
                ...inactiveList,
                ...rejectedList,
            ].forEach((p) => {
                if (p && p.id) productMap.set(p.id, p);
            });
            setProducts(Array.from(productMap.values()));

            setOrders(orderRes.data || []);
            setCoupons(couponRes.data || []);
            setAuditLogs(logRes.data || []);
            setShippers(shipperRes.data || []);
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
    }, [user?.id, user?.role, loadData]);

    useEffect(() => {
        if (user?.role !== "ADMIN") return;
        let timer;
        const handleRealtimeRefresh = () => {
            if (timer) window.clearTimeout(timer);
            timer = window.setTimeout(() => {
                loadData();
            }, 250);
        };
        window.addEventListener("order-updated", handleRealtimeRefresh);
        window.addEventListener("product-updated", handleRealtimeRefresh);
        return () => {
            if (timer) window.clearTimeout(timer);
            window.removeEventListener("order-updated", handleRealtimeRefresh);
            window.removeEventListener("product-updated", handleRealtimeRefresh);
        };
    }, [user?.role, loadData]);

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