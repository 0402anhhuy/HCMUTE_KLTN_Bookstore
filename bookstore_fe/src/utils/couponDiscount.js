export const calculateCouponDiscount = (
    coupon,
    currentSubtotal,
    rawShipping = 30000,
    now = new Date(),
) => {
    if (!coupon) return 0;
    if (currentSubtotal < coupon.minOrderValue) return 0;

    const isExpired = new Date(coupon.endDate) < now;
    const isLimitReached = coupon.usedCount >= coupon.usageLimit;
    if (coupon.status !== "ACTIVE" || isExpired || isLimitReached) return 0;

    if (coupon.discountType === "PERCENT") {
        let disc = (currentSubtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
            disc = coupon.maxDiscountAmount;
        }
        return disc;
    }
    if (coupon.discountType === "FREESHIP") {
        const val = coupon.discountValue || rawShipping;
        let disc = Math.min(rawShipping, val);
        if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
            disc = coupon.maxDiscountAmount;
        }
        return disc;
    }
    return coupon.discountValue;
};

export const findBestCoupon = (coupons, currentSubtotal, rawShipping = 30000) => {
    if (!Array.isArray(coupons) || coupons.length === 0) return null;
    let maxDisc = 0;
    let best = null;
    coupons.forEach((c) => {
        const disc = calculateCouponDiscount(c, currentSubtotal, rawShipping);
        if (disc > maxDisc) {
            maxDisc = disc;
            best = c;
        }
    });
    return best;
};
