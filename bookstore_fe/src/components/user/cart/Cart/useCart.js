import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useCart = () => {
    const { cart, updateCartQty, removeFromCart, clearCart, user, showToast } =
        useApp();
    const navigate = useNavigate();
    const [couponCode, setCouponCode] = useState("");
    const [usePoints, setUsePoints] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState(new Set());

    useEffect(() => {
        if (cart?.items) {
            setSelectedItemIds((prev) => {
                const next = new Set(prev);
                const currentIds = new Set(cart.items.map((item) => item.id));
                next.forEach((id) => {
                    if (!currentIds.has(id)) {
                        next.delete(id);
                    }
                });
                return next;
            });
        }
    }, [cart?.items]);

    const toggleSelectItem = (itemId) => {
        setSelectedItemIds((prev) => {
            const next = new Set(prev);
            if (next.has(itemId)) {
                next.delete(itemId);
            } else {
                next.add(itemId);
            }
            return next;
        });
    };

    const isAllSelected =
        cart.items &&
        cart.items.length > 0 &&
        selectedItemIds.size === cart.items.length;

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItemIds(new Set());
        } else {
            setSelectedItemIds(new Set(cart.items.map((item) => item.id)));
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);
    };

    const totalAmount = (cart?.items || [])
        .filter((item) => item && item.product && selectedItemIds.has(item.id))
        .reduce(
            (sum, item) =>
                sum + (item.product.price || 0) * (item.quantity || 0),
            0,
        );

    const [coupons, setCoupons] = useState([]);
    const [bestCoupon, setBestCoupon] = useState(null);
    const couponVersionRef = useRef("");

    const fetchCoupons = async (notifyChange = false) => {
        try {
            const res = await api.get("/coupons");
            const nextCoupons = res.data || [];
            const nextVersion = JSON.stringify(
                nextCoupons.map((c) => ({
                    id: c.id,
                    code: c.code,
                    discountType: c.discountType,
                    discountValue: c.discountValue,
                    minOrderValue: c.minOrderValue,
                    maxDiscountAmount: c.maxDiscountAmount,
                    status: c.status,
                    endDate: c.endDate,
                    usageLimit: c.usageLimit,
                    usedCount: c.usedCount,
                })),
            );
            if (
                notifyChange &&
                couponVersionRef.current &&
                couponVersionRef.current !== nextVersion
            ) {
                showToast?.(
                    "Voucher đã được cập nhật. Hệ thống đang tính lại ưu đãi tốt nhất.",
                    "info",
                );
            }
            couponVersionRef.current = nextVersion;
            setCoupons(nextCoupons);
        } catch (err) {
            console.error("Failed to fetch coupons", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCoupons();
            const refreshTimer = setInterval(() => fetchCoupons(true), 10000);
            return () => clearInterval(refreshTimer);
        }
    }, [user]);

    const calculateDiscount = (coupon, currentSubtotal) => {
        if (!coupon) return 0;
        if (currentSubtotal < coupon.minOrderValue) return 0;

        const isExpired = new Date(coupon.endDate) < new Date();
        const isLimitReached = coupon.usedCount >= coupon.usageLimit;
        if (coupon.status !== "ACTIVE" || isExpired || isLimitReached) return 0;

        if (coupon.discountType === "PERCENT") {
            let disc = (currentSubtotal * coupon.discountValue) / 100;
            if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
                disc = coupon.maxDiscountAmount;
            }
            return disc;
        } else {
            return coupon.discountValue;
        }
    };

    useEffect(() => {
        if (coupons.length > 0) {
            let maxDisc = 0;
            let best = null;
            coupons.forEach((c) => {
                const disc = calculateDiscount(c, totalAmount);
                if (disc > maxDisc) {
                    maxDisc = disc;
                    best = c;
                }
            });
            if (best) {
                setBestCoupon(best);
                setCouponCode(best.code);
            }
        }
    }, [coupons, totalAmount]);

    const activeCouponObj = coupons.find((c) => c.code === couponCode);
    const couponDiscount = calculateDiscount(activeCouponObj, totalAmount);

    const savedAddresses =
        user && user.address ? user.address.split(" || ").filter(Boolean) : [];
    const defaultAddress = savedAddresses[0] || "";

    const getShippingFee = (address, subtotal) => {
        if (subtotal >= 500000) return 0;
        if (!address) return 30000;
        const addrLower = address.toLowerCase();

        // 1. Nội tỉnh HCMC
        if (
            addrLower.includes("hồ chí minh") ||
            addrLower.includes("hcm") ||
            addrLower.includes("sài gòn") ||
            addrLower.includes("sai gon")
        ) {
            return 15000;
        }

        // 2. Miền Nam & Lân cận
        const southernProvinces = [
            "bình dương",
            "binh duong",
            "bình phước",
            "binh phuoc",
            "tây ninh",
            "tay ninh",
            "đồng nai",
            "dong nai",
            "bà rịa",
            "ba ria",
            "vũng tàu",
            "vung tau",
            "brvt",
            "long an",
            "tiền giang",
            "tien giang",
            "bến tre",
            "ben tre",
            "trà vinh",
            "tra vinh",
            "vĩnh long",
            "vinh long",
            "đồng tháp",
            "dong thap",
            "an giang",
            "kiên giang",
            "kien giang",
            "cần thơ",
            "can tho",
            "hậu giang",
            "hau giang",
            "sóc trăng",
            "soc trang",
            "bạc liêu",
            "bac lieu",
            "cà mau",
            "ca mau",
        ];
        if (southernProvinces.some((p) => addrLower.includes(p))) {
            return 25000;
        }

        // 3. Miền Bắc
        const northernProvinces = [
            "hà nội",
            "ha noi",
            "hải phòng",
            "hai phong",
            "hải dương",
            "hai duong",
            "hưng yên",
            "hung yen",
            "thái bình",
            "thai binh",
            "nam định",
            "nam dinh",
            "hà nam",
            "ha nam",
            "ninh bình",
            "ninh binh",
            "vĩnh phúc",
            "vinh phuc",
            "bắc ninh",
            "bac ninh",
            "quảng ninh",
            "quang ninh",
            "lạng sơn",
            "lang son",
            "cao bằng",
            "cao bang",
            "hà giang",
            "ha giang",
            "tuyên quang",
            "tuyen quang",
            "bắc kạn",
            "bac kan",
            "thái nguyên",
            "thai nguyen",
            "phú thọ",
            "phu tho",
            "bắc giang",
            "bac giang",
            "lai châu",
            "lai chau",
            "điện biên",
            "dien bien",
            "sơn la",
            "son la",
            "hòa bình",
            "hoa binh",
            "yên bái",
            "yen bai",
            "lào cai",
            "lao cai",
        ];
        if (northernProvinces.some((p) => addrLower.includes(p))) {
            return 45000;
        }

        // 4. Miền Trung / Tây Nguyên
        return 35000;
    };

    const shippingFee = getShippingFee(defaultAddress, totalAmount);
    const rewardPoints = user?.rewardPoints || 0;
    const maxPointsValue = rewardPoints * 1000;
    const remainingAfterCoupon = Math.max(
        0,
        totalAmount + shippingFee - couponDiscount,
    );
    const pointsDiscount = usePoints
        ? Math.min(maxPointsValue, remainingAfterCoupon)
        : 0;
    const pointsUsed = usePoints ? Math.ceil(pointsDiscount / 1000) : 0;

    const total = Math.max(
        0,
        totalAmount + shippingFee - couponDiscount - pointsDiscount,
    );

    const handleCheckoutRedirect = () => {
        if (!user) {
            showToast?.(
                "Vui lòng đăng nhập trước khi tiến hành đặt hàng.",
                "error",
            );
            navigate("/login");
            return;
        }
        if (selectedItemIds.size === 0) {
            showToast?.(
                "Vui lòng chọn ít nhất một sản phẩm để thanh toán.",
                "error",
            );
            return;
        }
        let path = "/checkout";
        const params = [];
        if (couponCode.trim()) {
            params.push(`coupon=${encodeURIComponent(couponCode.trim())}`);
        }
        if (usePoints) {
            params.push(`usePoints=true`);
        }
        params.push(`cartItemIds=${Array.from(selectedItemIds).join(",")}`);

        if (params.length > 0) {
            path += `?${params.join("&")}`;
        }
        navigate(path);
    };

    // Thêm state mở modal vào trong useCart:
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [couponSearchInput, setCouponSearchInput] = useState("");

    const openCouponModal = () => setIsCouponModalOpen(true);
    const closeCouponModal = () => {
        setIsCouponModalOpen(false);
        setCouponSearchInput("");
    };

    const handleApplyCouponFromModal = (code) => {
        setCouponCode(code);
        closeCouponModal();
        showToast?.(`Đã áp dụng mã ${code}`, "success");
    };

    return {
        cart,
        updateCartQty,
        removeFromCart,
        clearCart,
        user,
        couponCode,
        setCouponCode,
        usePoints,
        setUsePoints,
        selectedItemIds,
        toggleSelectItem,
        isAllSelected,
        toggleSelectAll,
        formatPrice,
        totalAmount,
        coupons,
        bestCoupon,
        couponDiscount,
        shippingFee,
        rewardPoints,
        maxPointsValue,
        pointsDiscount,
        pointsUsed,
        total,
        calculateDiscount,
        handleCheckoutRedirect,
        isCouponModalOpen,
        openCouponModal,
        closeCouponModal,
        couponSearchInput,
        setCouponSearchInput,
        handleApplyCouponFromModal,
    };
};
