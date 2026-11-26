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
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("info");

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlTab = params.get("tab");
        if (urlTab) {
            const allowedTabs = ["info", "addresses", "favorites", "coupons", "security"];
            if (allowedTabs.includes(urlTab)) {
                setActiveTab(urlTab);
            }
        }
        if (params.get("tab") === "favorites") {
            setHighlightFavorites(true);
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
                clearTimeout(scrollTimer);
                clearTimeout(highlightTimer);
            };
        }
    }, [location]);

    const syncFormWithUser = (currentUser) => {
        const values = getProfileFormValues(currentUser);
        setFullName(values.fullName);
        setPhone(values.phone);
        setEmail(values.email);
    };

    useEffect(() => {
        if (user) {
            syncFormWithUser(user);
        }
    }, [user]);

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
