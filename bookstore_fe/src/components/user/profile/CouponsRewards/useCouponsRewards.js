import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useCouponsRewards = () => {
    const { user } = useApp();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    useEffect(() => {
        if (user) {
            fetchCoupons();
        }
    }, [user]);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await api.get("/orders/coupons");
            setCoupons(res.data || []);
        } catch (err) {
            console.error("Error fetching user coupons", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);
    };

    const rewardPoints = user?.rewardPoints || 0;
    const rewardValue = rewardPoints * 1000;
    const walletBalance = user?.walletBalance || 0;

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 4;

    const totalPages = Math.ceil(coupons.length / ITEMS_PER_PAGE) || 1;

    const paginatedCoupons = coupons.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    return {
        coupons,
        loading,
        copiedCode,
        rewardPoints,
        rewardValue,
        walletBalance,
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedCoupons,
        handleCopy,
        formatPrice,
    };
};
