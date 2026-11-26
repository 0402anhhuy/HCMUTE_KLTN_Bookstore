import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveBookCardPricing } from './bookCardPricing.js';

test('resolveBookCardPricing derives discountPercent from showBadge or originalPrice without duplication', () => {
    const product = { id: 1, price: 127000 };
    const resultFromOriginal = resolveBookCardPricing({
        product,
        originalPrice: 195000,
        showBadge: 'Giảm sốc',
        getDiscountPercent: () => 0,
        getOriginalPrice: () => null,
    });

    assert.equal(resultFromOriginal.discountPercent, 35);
    assert.equal(resultFromOriginal.computedOriginalPrice, 195000);
    assert.equal(resultFromOriginal.hasDiscount, true);

    const resultFromBadge = resolveBookCardPricing({
        product: { id: 2, price: 116000 },
        originalPrice: 141000,
        showBadge: '-18%',
        getDiscountPercent: () => 0,
        getOriginalPrice: () => null,
    });

    assert.equal(resultFromBadge.discountPercent, 18);
    assert.equal(resultFromBadge.computedOriginalPrice, 141000);
    assert.equal(resultFromBadge.hasDiscount, true);
});

test('resolveBookCardPricing falls back to productPricing helpers and hides discount when unpromoted', () => {
    const result = resolveBookCardPricing({
        product: { id: 3, price: 188000 },
        getDiscountPercent: () => 15,
        getOriginalPrice: (_p, pct) => (pct === 15 ? 221000 : null),
    });

    assert.equal(result.discountPercent, 15);
    assert.equal(result.computedOriginalPrice, 221000);
    assert.equal(result.hasDiscount, true);

    const noPromo = resolveBookCardPricing({
        product: { id: 4, price: 100000 },
        getDiscountPercent: () => 0,
        getOriginalPrice: () => null,
    });

    assert.equal(noPromo.discountPercent, 0);
    assert.equal(noPromo.computedOriginalPrice, null);
    assert.equal(noPromo.hasDiscount, false);
});
