/**
 * Helpers for filtering and formatting product reviews on ProductDetail.
 */

export function filterReviewsByRating(reviews = [], ratingFilter = "Tất cả") {
    if (!Array.isArray(reviews)) return [];
    if (!ratingFilter || ratingFilter === "Tất cả") {
        return reviews;
    }
    const target = Number(String(ratingFilter).replace(/[^0-9]/g, ""));
    if (!target) return reviews;
    return reviews.filter((r) => Number(r?.rating) === target);
}

export function getRatingCounts(reviews = []) {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!Array.isArray(reviews)) return counts;
    reviews.forEach((r) => {
        const star = Number(r?.rating);
        if (counts[star] !== undefined) {
            counts[star] += 1;
        }
    });
    return counts;
}

export function formatReviewDate(dateStr) {
    if (!dateStr) return "";
    const normalizedStr =
        typeof dateStr === "string" &&
        !dateStr.endsWith("Z") &&
        !/[+-]\d{2}:\d{2}$/.test(dateStr)
            ? `${dateStr}Z`
            : dateStr;
    const parsed = new Date(normalizedStr);
    const date = Number.isNaN(parsed.getTime()) ? new Date(dateStr) : parsed;
    if (Number.isNaN(date.getTime())) return String(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
    });
}
