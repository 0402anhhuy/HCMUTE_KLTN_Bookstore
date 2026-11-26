import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCouponDiscount, findBestCoupon } from './couponDiscount.js';

test('findBestCoupon selects highest valid coupon discount and ignores expired/ineligible ones', () => {
    const coupons = [
        {
            code: 'EXPIRED50',
            status: 'ACTIVE',
            discountType: 'PERCENT',
            discountValue: 50,
            minOrderValue: 0,
            endDate: '2020-01-01T00:00:00Z',
            usageLimit: 10,
            usedCount: 0,
        },
        {
            code: 'SAVE20K',
            status: 'ACTIVE',
            discountType: 'FIXED',
            discountValue: 20000,
            minOrderValue: 100000,
            endDate: '2099-01-01T00:00:00Z',
            usageLimit: 10,
            usedCount: 0,
        },
        {
            code: 'PCT15',
            status: 'ACTIVE',
            discountType: 'PERCENT',
            discountValue: 15,
            maxDiscountAmount: 50000,
            minOrderValue: 100000,
            endDate: '2099-01-01T00:00:00Z',
            usageLimit: 10,
            usedCount: 0,
        },
    ];

    assert.equal(calculateCouponDiscount(coupons[0], 200000), 0);
    const best = findBestCoupon(coupons, 200000, 30000);
    assert.equal(best?.code, 'PCT15');
    assert.equal(calculateCouponDiscount(best, 200000, 30000), 30000);
});
