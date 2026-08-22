import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useProfile = () => {
    const { user, updateUser, showToast } = useApp();
    const location = useLocation();
    const [highlightFavorites, setHighlightFavorites] = useState(false);

    // Profile Form States
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
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

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setPhone(user.phone || "0909123456");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone,
                address: user?.address,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ fullName: fullName.trim(), phone });
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
        getInitials,
    };
};
