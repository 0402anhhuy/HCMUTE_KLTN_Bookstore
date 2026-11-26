import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";
import { getProfileFormValues } from "./profileForm";

export const useProfile = () => {
    const { user, updateUser, showToast } = useApp();
    const location = useLocation();
    const [highlightFavorites, setHighlightFavorites] = useState(false);

    // Profile Form States
    const [fullName, setFullName] = useState(() => getProfileFormValues(user).fullName);
    const [phone, setPhone] = useState(() => getProfileFormValues(user).phone);
    const [email, setEmail] = useState(() => getProfileFormValues(user).email);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(() => {
        const urlTab = new URLSearchParams(location.search).get("tab");
        const allowedTabs = ["info", "addresses", "favorites", "coupons", "security"];
        return urlTab && allowedTabs.includes(urlTab) ? urlTab : "info";
    });
    const [prevSearch, setPrevSearch] = useState(location.search);
    const [prevUser, setPrevUser] = useState(user);

    if (location.search !== prevSearch) {
        setPrevSearch(location.search);
        const urlTab = new URLSearchParams(location.search).get("tab");
        const allowedTabs = ["info", "addresses", "favorites", "coupons", "security"];
        if (urlTab && allowedTabs.includes(urlTab)) {
            setActiveTab(urlTab);
        }
    }

    const syncFormWithUser = (currentUser) => {
        const values = getProfileFormValues(currentUser);
        setFullName(values.fullName);
        setPhone(values.phone);
        setEmail(values.email);
    };

    if (user !== prevUser) {
        setPrevUser(user);
        if (user) {
            syncFormWithUser(user);
        }
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get("tab") === "favorites") {
            let active = true;
            const highlightStart = Promise.resolve().then(() => {
                if (active) setHighlightFavorites(true);
            });
            void highlightStart;
            const scrollTimer = setTimeout(() => {
                const el = document.getElementById("favorite-section");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 300);

            const highlightTimer = setTimeout(() => {
                setHighlightFavorites(false);
            }, 4000);

            return () => {
                active = false;
                clearTimeout(scrollTimer);
                clearTimeout(highlightTimer);
            };
        }
    }, [location.search]);

    const handleResetForm = () => {
        if (!user) return;
        syncFormWithUser(user);
        showToast?.("Đã khôi phục lại thông tin ban đầu.", "success");
    };

    const handleProfileSubmit = async (e) => {
        if (e) e.preventDefault();
        
        const trimmedPhone = phone ? phone.trim() : "";
        if (trimmedPhone !== "") {
            const phoneRegex = /^(0|\+84)[35789]\d{8}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                showToast?.("Số điện thoại không đúng định dạng Việt Nam (10 chữ số, ví dụ: 0909123456).", "error");
                return;
            }
        }

        setLoading(true);
        try {
            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone: trimmedPhone,
                address: user?.address,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ fullName: fullName.trim(), phone: trimmedPhone });
            showToast?.("Cập nhật thông tin cá nhân thành công!", "success");
        } catch (err) {
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi cập nhật.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return {
        user,
        fullName,
        setFullName,
        phone,
        setPhone,
        email,
        loading,
        highlightFavorites,
        handleProfileSubmit,
        handleResetForm,
        getInitials,
        activeTab,
        setActiveTab,
    };
};
