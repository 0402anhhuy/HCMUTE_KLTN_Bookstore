import { getProductDiscountPercent, getProductOriginalPrice } from "../../../utils/productPricing.js";

export const resolveBookCardPricing = ({
    product,
    originalPrice,
    showBadge,
    getDiscountPercent = getProductDiscountPercent,
    getOriginalPrice = getProductOriginalPrice,
} = {}) => {
    if (!product) {
        return { discountPercent: 0, computedOriginalPrice: null, hasDiscount: false };
    }

    const currentPrice = Number(product.price || 0);
    const explicitOriginal =
        originalPrice && Number(originalPrice) > currentPrice ? Number(originalPrice) : null;

    const discountPercent = (() => {
        if (showBadge && typeof showBadge === "string" && showBadge.includes("%")) {
            const parsed = parseInt(showBadge.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        if (explicitOriginal && explicitOriginal > currentPrice) {
            return Math.round(((explicitOriginal - currentPrice) / explicitOriginal) * 100);
        }
        return getDiscountPercent(product);
    })();

    const computedOriginalPrice = explicitOriginal ?? getOriginalPrice(product, discountPercent);
    const hasDiscount =
        Boolean(computedOriginalPrice) &&
        Number(computedOriginalPrice) > currentPrice &&
        discountPercent > 0;

    return {
        discountPercent: hasDiscount ? discountPercent : 0,
        computedOriginalPrice: hasDiscount ? computedOriginalPrice : null,
        hasDiscount,
    };
};
