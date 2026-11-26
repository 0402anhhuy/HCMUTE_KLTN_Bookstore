/**
 * Utility functions for real admin-configured product discounts and original pricing.
 */

export const getEffectivePromotionStatus = (promo, now = new Date()) => {
    if (!promo) return "";
    if (promo.status === "INACTIVE") return "INACTIVE";
    const currentMs = now instanceof Date ? now.getTime() : new Date(now).getTime();
    if (promo.endDate) {
        const endMs = new Date(promo.endDate).getTime();
        if (!Number.isNaN(endMs) && endMs <= currentMs) {
            return "EXPIRED";
        }
    }
    if (promo.status === "PENDING" && promo.startDate) {
        const startMs = new Date(promo.startDate).getTime();
        if (!Number.isNaN(startMs) && startMs <= currentMs) {
            return "ACTIVE";
        }
    }
    return promo.status || "";
};

export const buildActivePromoDiscountMap = (promotions = [], now = new Date()) => {
    const map = new Map();
    if (!Array.isArray(promotions) || promotions.length === 0) {
        return map;
    }

    promotions.forEach((promo) => {
        if (getEffectivePromotionStatus(promo, now) !== "ACTIVE") {
            return;
        }
        if (Array.isArray(promo.applicableProducts) && promo.applicableProducts.length > 0) {
            promo.applicableProducts.forEach((p) => {
                if (!p || p.id == null) return;
                let discount = 0;
                if (promo.discountType === "PERCENT") {
                    discount = Number(promo.discountValue) || 0;
                } else if (promo.discountType === "FIXED" && Number(p.price) > 0) {
                    discount = Math.round(
                        ((Number(promo.discountValue) || 0) / Number(p.price)) * 100,
                    );
                }
                if (discount <= 0) return;

                const pId = String(p.id);
                const existing = map.get(pId);
                if (!existing || discount > existing.promotionDiscountPercent) {
                    map.set(pId, {
                        ...p,
                        promotionDiscountPercent: Math.round(discount),
                        promotionTitle: promo.title,
                        promotionEndDate: promo.endDate,
                        promoUsedCount: promo.usedCount || 0,
                    });
                }
            });
        }
    });

    return map;
};

export const getProductDiscountPercent = (product) => {
    if (!product) return 0;

    if (
        product.promotionDiscountPercent !== undefined &&
        product.promotionDiscountPercent !== null
    ) {
        const promoDisc = Number(product.promotionDiscountPercent);
        if (!isNaN(promoDisc) && promoDisc > 0) return Math.round(promoDisc);
    }

    if (
        product.discountPercent !== undefined &&
        product.discountPercent !== null
    ) {
        const disc = Number(product.discountPercent);
        if (!isNaN(disc) && disc > 0) return Math.round(disc);
    }

    if (
        product.originalPrice &&
        Number(product.originalPrice) > Number(product.price)
    ) {
        return Math.round(
            ((Number(product.originalPrice) - Number(product.price)) /
                Number(product.originalPrice)) *
                100,
        );
    }

    return 0;
};

export const getProductOriginalPrice = (product, explicitDiscount) => {
    if (!product || !product.price) return null;
    if (
        product.originalPrice &&
        Number(product.originalPrice) > Number(product.price)
    ) {
        return Number(product.originalPrice);
    }

    const discount =
        explicitDiscount !== undefined
            ? explicitDiscount
            : getProductDiscountPercent(product);
    if (discount > 0 && Number(product.price) > 0) {
        const rawOriginal = Number(product.price) / (1 - discount / 100);
        // Làm tròn đến hàng nghìn đồng để giá gốc hiển thị tự nhiên
        return Math.round(rawOriginal / 1000) * 1000;
    }

    return null;
};
