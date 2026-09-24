import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import api from "@/services/api";

const parseAddress = (addrStr, defaultName = "", defaultPhone = "") => {
    if (!addrStr) return { name: defaultName, phone: defaultPhone, address: "" };
    const parts = addrStr.split("|").map((s) => s.trim());
    if (parts.length >= 3) {
        return {
            name: parts[0],
            phone: parts[1],
            address: parts.slice(2).join(" | "),
        };
    }
    return {
        name: defaultName,
        phone: defaultPhone,
        address: addrStr,
    };
};

export const useCheckout = () => {
    const { user, cart, fetchCart, showToast, reloadUserProfile } = useApp();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const initialCoupon = searchParams.get("coupon") || "";
    const productId = searchParams.get("productId");
    const qty = parseInt(searchParams.get("qty") || "1", 10);

    const [buyNowProduct, setBuyNowProduct] = useState(null);
    const [fetchingProduct, setFetchingProduct] = useState(!!productId);

    // Lấy danh sách địa chỉ thực tế từ User profile (Không dùng mock)
    const savedAddresses = useMemo(() => {
        if (!user || !user.address) return [];
        return user.address
            .split(" || ")
            .map((s) => s.trim())
            .filter(Boolean);
    }, [user]);

    const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
    const [customAddress, setCustomAddress] = useState("");
    const [useCustomAddress, setUseCustomAddress] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [couponCode, setCouponCodeState] = useState(initialCoupon);
    const [couponInput, setCouponInput] = useState(initialCoupon);
    const isManualCouponRef = useRef(!!initialCoupon);

    const setCouponCode = (code, isManual = true) => {
        if (isManual) {
            isManualCouponRef.current = true;
        }
        setCouponCodeState(code);
        setCouponInput(code);
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [coupons, setCoupons] = useState([]);
    const [usePoints, setUsePoints] = useState(
        searchParams.get("usePoints") === "true",
    );
    const [bestCoupon, setBestCoupon] = useState(null);
    const [recipientName, setRecipientName] = useState("");
    const [recipientPhone, setRecipientPhone] = useState("");
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

    useEffect(() => {
        if (user) {
            // Nếu tài khoản chưa có địa chỉ nào được lưu, bật form nhập địa chỉ
            if (!user.address || savedAddresses.length === 0) {
                setUseCustomAddress(true);
                setRecipientName(user.fullName || "");
                setRecipientPhone(user.phone || "");
            } else {
                setUseCustomAddress(false);
                setSelectedAddressIdx(0);
            }
        }
    }, [user, savedAddresses]);

    useEffect(() => {
        if (!useCustomAddress && savedAddresses[selectedAddressIdx]) {
            const parsed = parseAddress(savedAddresses[selectedAddressIdx], user?.fullName, user?.phone);
            setRecipientName(parsed.name || user?.fullName || "");
            setRecipientPhone(parsed.phone || user?.phone || "");
        } else if (useCustomAddress && user) {
            if (!recipientName) setRecipientName(user.fullName || "");
            if (!recipientPhone) setRecipientPhone(user.phone || "");
        }
    }, [selectedAddressIdx, useCustomAddress, savedAddresses, user]);

    useEffect(() => {
        if (productId) {
            const fetchProduct = async () => {
                try {
                    const res = await api.get(`/products/${productId}`);
                    setBuyNowProduct(res.data);
                } catch (err) {
                    console.error(
                        "Failed to fetch buy-now product details",
                        err,
                    );
                    showToast?.(
                        err.response?.data?.error ||
                        "Sản phẩm này không còn khả dụng hoặc đã được tạm ẩn.",
                        "error",
                    );
                    setError("Không thể tải thông tin sản phẩm mua ngay.");
                } finally {
                    setFetchingProduct(false);
                }
            };
            fetchProduct();
        }
    }, [productId]);

    const addressOnly = useCustomAddress
        ? customAddress
        : parseAddress(savedAddresses[selectedAddressIdx], user?.fullName, user?.phone).address;

    const shippingAddress = addressOnly.trim()
        ? `${recipientName.trim()} | ${recipientPhone.trim()} | ${addressOnly.trim()}`
        : "";

    const formatPrice = (price) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price || 0);

    const cartItemIdsParam = searchParams.get("cartItemIds") || "";
    const selectedCartItemIds = cartItemIdsParam
        ? cartItemIdsParam.split(",").map(Number)
        : [];

    const checkoutItems = buyNowProduct
        ? []
        : selectedCartItemIds.length > 0
            ? (cart?.items || []).filter((item) =>
                selectedCartItemIds.includes(item.id),
            )
            : cart?.items || [];

    const subtotal = buyNowProduct
        ? buyNowProduct.price * qty
        : checkoutItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0,
        );

    const getShippingFee = (address, amt) => {
        if (amt >= 500000) return 0;
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

    const rawShippingFee = getShippingFee(addressOnly, subtotal);

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
                const disc = calculateDiscount(c, subtotal, rawShippingFee);
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
    }, [coupons, subtotal, couponCode, rawShippingFee]);

    const activeCouponObj = coupons.find((c) => c.code === couponCode);
    const couponDiscount = calculateDiscount(activeCouponObj, subtotal, rawShippingFee);
    const isFreeshipCoupon = activeCouponObj?.discountType === "FREESHIP";

    // For freeship coupons, discount reduces shipping fee
    const shippingFee = isFreeshipCoupon
        ? Math.max(0, rawShippingFee - couponDiscount)
        : rawShippingFee;
    const finalCouponDiscount = isFreeshipCoupon ? 0 : couponDiscount;

    const rewardPoints = user?.rewardPoints || 0;
    const maxPointsValue = rewardPoints * 1000;
    const remainingAfterCoupon = Math.max(
        0,
        subtotal + shippingFee - finalCouponDiscount,
    );
    const pointsDiscount = usePoints
        ? Math.min(maxPointsValue, remainingAfterCoupon)
        : 0;
    const pointsUsed = usePoints ? Math.ceil(pointsDiscount / 1000) : 0;

    const total = Math.max(
        0,
        subtotal + shippingFee - finalCouponDiscount - pointsDiscount,
    );

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            setError("Vui lòng chọn hoặc nhập địa chỉ nhận hàng.");
            return;
        }
        if (paymentMethod === "WALLET" && (user?.walletBalance || 0) < total) {
            setError(
                "Số dư ví không đủ để thanh toán đơn hàng này. Vui lòng nạp thêm tiền hoặc chọn phương thức khác.",
            );
            return;
        }
        setLoading(true);
        setError("");
        try {
            const payload = {
                shippingAddress: shippingAddress.trim(),
                recipientPhone: recipientPhone.trim(),
                paymentMethod,
                couponCode: couponCode.trim() || null,
                couponSnapshot: activeCouponObj
                    ? {
                        id: activeCouponObj.id,
                        discountType: activeCouponObj.discountType,
                        discountValue: activeCouponObj.discountValue,
                        minOrderValue: activeCouponObj.minOrderValue,
                        maxDiscountAmount: activeCouponObj.maxDiscountAmount,
                    }
                    : null,
                usePoints,
                ...(productId
                    ? { productId: Number(productId), quantity: qty }
                    : { cartItemIds: selectedCartItemIds }),
            };
            const response = await api.post("/orders/checkout", payload);
            await fetchCart?.();
            await reloadUserProfile?.();
            if (paymentMethod === "VNPAY" && response.data?.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                showToast?.(
                    "Đặt hàng thành công! Cảm ơn quý khách.",
                    "success",
                );
                navigate("/orders");
            }
        } catch (err) {
            const message =
                err.response?.data?.error ||
                "Không thể đặt hàng. Vui lòng thử lại.";
            setError(message);
            showToast?.(message, "error");
            await fetchCart?.();
            if (message.toLowerCase().includes("mã giảm giá")) {
                setCouponCode("");
                await fetchCoupons();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleApplyManualCoupon = (inputCode = couponInput) => {
        const code = (inputCode || "").trim().toUpperCase();
        if (!code) {
            setCouponCode("");
            showToast?.("Đã gỡ bỏ mã giảm giá", "info");
            return;
        }
        const targetCoupon = coupons.find((c) => c.code.toUpperCase() === code);
        if (!targetCoupon) {
            showToast?.(`Mã giảm giá "${code}" không tồn tại hoặc đã hết hạn`, "error");
            return;
        }
        const disc = calculateDiscount(targetCoupon, subtotal, rawShippingFee);
        if (disc <= 0) {
            if (subtotal < targetCoupon.minOrderValue) {
                showToast?.(
                    `Đơn hàng chưa đạt mức tối thiểu ${formatPrice(targetCoupon.minOrderValue)} để áp dụng mã này`,
                    "warning",
                );
            } else {
                showToast?.("Mã giảm giá chưa đủ điều kiện áp dụng", "warning");
            }
            return;
        }
        setCouponCode(targetCoupon.code);
        showToast?.(`Áp dụng thành công mã giảm giá ${targetCoupon.code}!`, "success");
    };

    return {
        user,
        cart,
        productId,
        qty,
        buyNowProduct,
        fetchingProduct,
        savedAddresses,
        selectedAddressIdx,
        setSelectedAddressIdx,
        customAddress,
        setCustomAddress,
        useCustomAddress,
        setUseCustomAddress,
        paymentMethod,
        setPaymentMethod,
        couponCode,
        setCouponCode,
        couponInput,
        setCouponInput,
        handleApplyManualCoupon,
        loading,
        error,
        coupons,
        usePoints,
        setUsePoints,
        bestCoupon,
        recipientName,
        setRecipientName,
        recipientPhone,
        setRecipientPhone,
        shippingAddress,
        formatPrice,
        checkoutItems,
        subtotal,
        shippingFee,
        calculateDiscount,
        couponDiscount,
        rewardPoints,
        maxPointsValue,
        pointsDiscount,
        pointsUsed,
        total,
        handlePlaceOrder,
    };
};
