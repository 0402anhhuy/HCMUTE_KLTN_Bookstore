import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

export const useCart = () => {
    const {
        cart,
        updateCartQty,
        removeFromCart,
        clearCart,
        user,
        showToast,
        fetchCart,
    } = useApp();
    const navigate = useNavigate();
    const [couponCode, setCouponCodeState] = useState("");
    const isManualCouponRef = useRef(false);

    useEffect(() => {
        fetchCart?.();
    }, []);

    const setCouponCode = (code, isManual = true) => {
        if (isManual) {
            isManualCouponRef.current = true;
        }
        setCouponCodeState(code);
    };
    const [usePoints, setUsePoints] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState(new Set());

    useEffect(() => {
        if (!cart?.items || cart.items.length === 0) {
            setSelectedItemIds(new Set());
            return;
        }
        setSelectedItemIds((prev) => {
            const currentIds = new Set(
                (cart.items || [])
                    .filter((item) => item && item.id !== undefined && item.id !== null)
                    .map((item) => item.id),
            );
            if (prev.size === 0) {
                return currentIds;
            }
            const next = new Set();
            prev.forEach((id) => {
                if (currentIds.has(id)) {
                    next.add(id);
                }
            });
            return next.size > 0 ? next : currentIds;
        });
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

    const formatPrice = (price) => {
        const num = Number(price);
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(Number.isFinite(num) ? num : 0);
    };

    // Luôn tính toán các ID đã chọn đồng bộ trực tiếp với danh sách item hiện có trong giỏ
    const activeSelectedItemIds = useMemo(() => {
        const availableIds = new Set(
            (cart?.items || [])
                .filter((item) => item && item.id !== undefined && item.id !== null)
                .map((item) => item.id),
        );
        const active = new Set();
        selectedItemIds.forEach((id) => {
            if (availableIds.has(id)) {
                active.add(id);
            }
        });
        return active;
    }, [cart?.items, selectedItemIds]);

    const isAllSelected = Boolean(
        cart?.items &&
        cart.items.length > 0 &&
        activeSelectedItemIds.size === cart.items.length
    );

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItemIds(new Set());
        } else {
            setSelectedItemIds(
                new Set(
                    (cart?.items || [])
                        .filter((item) => item && item.id !== undefined && item.id !== null)
                        .map((item) => item.id),
                ),
            );
        }
    };

    const totalAmount = (cart?.items || [])
        .filter((item) => item && item.product && activeSelectedItemIds.has(item.id))
        .reduce(
            (sum, item) =>
                sum + (Number(item?.product?.price) || 0) * (Number(item?.quantity) || 0),
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
                    id: c?.id,
                    code: c?.code,
                    discountType: c?.discountType,
                    discountValue: c?.discountValue,
                    minOrderValue: c?.minOrderValue,
                    maxDiscountAmount: c?.maxDiscountAmount,
                    status: c?.status,
                    endDate: c?.endDate,
                    usageLimit: c?.usageLimit,
                    usedCount: c?.usedCount,
                })),
            );
            if (
                notifyChange &&
                couponVersionRef.current &&
                couponVersionRef.current !== nextVersion
            ) {
                showToast?.(
                    "Voucher đã được cập nhật.",
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
        fetchCoupons();
        const refreshTimer = setInterval(() => fetchCoupons(true), 10000);
        return () => clearInterval(refreshTimer);
    }, []);

    const calculateDiscount = (coupon, currentSubtotal, rawShipping = 30000) => {
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
        } else if (coupon.discountType === "FREESHIP") {
            let val = coupon.discountValue || rawShipping;
            let disc = Math.min(rawShipping, val);
            if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
                disc = coupon.maxDiscountAmount;
            }
            return disc;
        } else {
            return coupon.discountValue;
        }
    };

    useEffect(() => {
        if (coupons.length > 0 && !isManualCouponRef.current && !couponCode) {
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
                setCouponCodeState(best.code);
            }
        }
    }, [coupons, totalAmount, couponCode]);

    const activeCouponObj = coupons.find((c) => c?.code === couponCode);
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

    const hasSelectedItems = activeSelectedItemIds && activeSelectedItemIds.size > 0;
    const rawShippingFee = hasSelectedItems ? getShippingFee(defaultAddress, totalAmount) : 0;
    const couponDiscount = hasSelectedItems ? calculateDiscount(activeCouponObj, totalAmount, rawShippingFee) : 0;
    const isFreeshipCoupon = activeCouponObj?.discountType === "FREESHIP";

    // For freeship coupons, discount is deducted from shipping fee
    const shippingFee = isFreeshipCoupon
        ? Math.max(0, rawShippingFee - couponDiscount)
        : rawShippingFee;
    const finalCouponDiscount = isFreeshipCoupon ? 0 : couponDiscount;

    const rewardPoints = user?.rewardPoints || 0;
    const maxPointsValue = rewardPoints * 1000;
    const remainingAfterCoupon = Math.max(
        0,
        totalAmount + shippingFee - finalCouponDiscount,
    );
    const pointsDiscount = (usePoints && hasSelectedItems)
        ? Math.min(maxPointsValue, remainingAfterCoupon)
        : 0;
    const pointsUsed = (usePoints && hasSelectedItems) ? Math.ceil(pointsDiscount / 1000) : 0;

    const total = hasSelectedItems
        ? Math.max(
            0,
            totalAmount + shippingFee - finalCouponDiscount - pointsDiscount,
        )
        : 0;

    const handleCheckoutRedirect = () => {
        if (!user) {
            showToast?.(
                "Vui lòng đăng nhập trước khi tiến hành đặt hàng.",
                "error",
            );
            navigate("/login");
            return;
        }
        if (activeSelectedItemIds.size === 0) {
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
        window.scrollTo(0, 0);
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

    // Sắp xếp mã giảm giá: ưu tiên các mã áp dụng được và có mức giảm cao nhất lên đầu
    const sortedCoupons = useMemo(() => {
        if (!coupons || coupons.length === 0) return [];
        return [...coupons].sort((a, b) => {
            const discB = calculateDiscount(b, totalAmount, rawShippingFee);
            const discA = calculateDiscount(a, totalAmount, rawShippingFee);
            if (discB !== discA) return discB - discA;

            const valB = Number(b.discountValue) || 0;
            const valA = Number(a.discountValue) || 0;
            return valB - valA;
        });
    }, [coupons, totalAmount, rawShippingFee]);

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
        selectedItemIds: activeSelectedItemIds,
        toggleSelectItem,
        isAllSelected,
        toggleSelectAll,
        formatPrice,
        totalAmount,
        coupons: sortedCoupons,
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
