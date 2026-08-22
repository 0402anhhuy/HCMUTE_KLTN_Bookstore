import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

export const useNavbar = () => {
    const {
        user,
        loading,
        cart,
        logoutUser,
        notifications = [],
        unreadCount = 0,
        markNotificationRead,
        markAllNotificationsAsRead,
        favorites = [],
    } = useApp();

    const [showNotifications, setShowNotifications] = useState(false);
    const [navSearch, setNavSearch] = useState("");
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const handleNavSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (navSearch.trim()) {
            navigate(`/?keyword=${encodeURIComponent(navSearch.trim())}`);
        } else {
            navigate("/");
        }
    };

    const toggleNotifications = () => {
        setShowNotifications((prev) => !prev);
    };

    const handleNotificationClick = (n) => {
        if (!n.read) {
            markNotificationRead(n.id);
        }
        setShowNotifications(false);

        const isStaff =
            user && (user.role === "MANAGER" || user.role === "ADMIN");
        if (isStaff) {
            if (n.referenceType === "orders" || n.type === "ORDER") {
                navigate("/manager?tab=orders");
            } else if (n.referenceType === "products" || n.type === "PRODUCT") {
                navigate("/manager?tab=products");
            } else if (n.referenceType === "reviews" || n.type === "REVIEW") {
                navigate("/manager?tab=reviews");
            } else if (
                n.referenceType === "return_requests" ||
                n.type === "RETURN"
            ) {
                navigate("/manager?tab=orders");
            } else {
                navigate("/manager?tab=dashboard");
            }
        } else {
            if (
                n.referenceType === "orders" ||
                n.type === "ORDER" ||
                n.referenceType === "return_requests" ||
                n.type === "RETURN"
            ) {
                navigate("/orders");
            } else if (n.referenceType === "products" && n.referenceId) {
                navigate(`/product/${n.referenceId}`);
            } else {
                navigate("/profile");
            }
        }
    };

    const totalCartItems = cart?.items
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

    return {
        user,
        loading,
        navSearch,
        setNavSearch,
        showNotifications,
        notifications,
        unreadCount,
        favorites,
        totalCartItems,
        handleLogout,
        handleNavSearch,
        toggleNotifications,
        handleNotificationClick,
        markAllNotificationsAsRead,
    };
};
