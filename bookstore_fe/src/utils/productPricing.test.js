import test from "node:test";
import assert from "node:assert/strict";
import {
    buildActivePromoDiscountMap,
    getEffectivePromotionStatus,
    getProductDiscountPercent,
    getProductOriginalPrice,
} from "./productPricing.js";

test("getProductDiscountPercent returns 0 without an active admin promotion or explicit originalPrice", () => {
    for (const id of [1, 2, 3, 4, 5, 10, 42]) {
        const product = { id, price: 80000 };
        assert.equal(getProductDiscountPercent(product), 0);
        assert.equal(getProductOriginalPrice(product), null);
    }
});

test("getProductOriginalPrice computes consistent original price when admin promotion is active", () => {
    const now = new Date("2026-11-26T15:30:00");
    const promoMap = buildActivePromoDiscountMap(
        [
            {
                id: 1,
                title: "Flash Sale",
                discountType: "PERCENT",
                discountValue: 35,
                startDate: "2026-11-26T12:00:00",
                endDate: "2026-11-26T18:00:00",
                status: "ACTIVE",
                applicableProducts: [{ id: 7, price: 80000 }],
            },
            {
                id: 2,
                title: "Expired Sale",
                discountType: "PERCENT",
                discountValue: 50,
                startDate: "2026-08-29T04:25:00",
                endDate: "2026-08-29T06:25:00",
                status: "ACTIVE",
                applicableProducts: [{ id: 8, price: 80000 }],
            },
        ],
        now,
    );

    const bookInPromo = {
        id: 7,
        price: 80000,
        promotionDiscountPercent: promoMap.get("7")?.promotionDiscountPercent,
    };
    const bookInExpiredPromo = {
        id: 8,
        price: 80000,
        promotionDiscountPercent: promoMap.get("8")?.promotionDiscountPercent,
    };

    assert.equal(getProductDiscountPercent(bookInPromo), 35);
    assert.equal(getProductOriginalPrice(bookInPromo), 123000);
    assert.equal(getProductDiscountPercent(bookInExpiredPromo), 0);
    assert.equal(getProductOriginalPrice(bookInExpiredPromo), null);
});

test("getEffectivePromotionStatus marks past endDate promotions EXPIRED regardless of stale DB status", () => {
    const now = new Date("2026-11-26T15:30:00");
    assert.equal(
        getEffectivePromotionStatus(
            {
                status: "ACTIVE",
                startDate: "2026-08-29T04:25:00",
                endDate: "2026-08-29T06:25:00",
            },
            now,
        ),
        "EXPIRED",
    );
    assert.equal(
        getEffectivePromotionStatus(
            {
                status: "INACTIVE",
                startDate: "2026-08-29T04:25:00",
                endDate: "2026-08-29T06:25:00",
            },
            now,
        ),
        "INACTIVE",
    );
    assert.equal(
        getEffectivePromotionStatus(
            {
                status: "PENDING",
                startDate: "2026-11-26T12:00:00",
                endDate: "2026-11-26T18:00:00",
            },
            now,
        ),
        "ACTIVE",
    );
});
