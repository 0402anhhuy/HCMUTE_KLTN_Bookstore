import test from "node:test";
import assert from "node:assert/strict";
import {
    filterReviewsByRating,
    formatReviewDate,
    getRatingCounts,
} from "./productReviews.js";

test("filterReviewsByRating returns all reviews for 'Tất cả' and filters by selected star rating", () => {
    const sample = [
        { id: 1, rating: 5, comment: "hay" },
        { id: 2, rating: 4, comment: "tạm ổn" },
        { id: 3, rating: 5, comment: "rất thích" },
    ];

    assert.equal(filterReviewsByRating(sample, "Tất cả").length, 3);
    assert.deepEqual(
        filterReviewsByRating(sample, "5 sao").map((r) => r.id),
        [1, 3],
    );
    assert.deepEqual(
        filterReviewsByRating(sample, 4).map((r) => r.id),
        [2],
    );
});

test("getRatingCounts calculates counts per star rating 5..1", () => {
    const sample = [
        { id: 1, rating: 5 },
        { id: 2, rating: 5 },
        { id: 3, rating: 3 },
    ];
    assert.deepEqual(getRatingCounts(sample), {
        5: 2,
        4: 0,
        3: 1,
        2: 0,
        1: 0,
    });
});

test("formatReviewDate formats ISO timestamps and handles empty values gracefully", () => {
    assert.equal(formatReviewDate(""), "");
    assert.equal(formatReviewDate(null), "");
    assert.ok(formatReviewDate("2026-11-26T15:00:00").includes("26/11/2026"));
});
