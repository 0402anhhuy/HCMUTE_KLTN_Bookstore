/**
 * Utility functions for deterministic product discounts and original pricing
 * Ensures consistent discount rates and struck-through original prices across all views:
 * Home (Flash Sale, Bestseller, Trends, Grids), Catalog, Product Detail, and Book Cards.
 */

export const getProductDiscountPercent = (product) => {
    if (!product) return 0;
    
    // Ưu tiên 1: Khuyến mãi thực tế từ hệ thống/sự kiện Admin
    if (product.promotionDiscountPercent !== undefined && product.promotionDiscountPercent !== null) {
        const promoDisc = Number(product.promotionDiscountPercent);
        if (!isNaN(promoDisc) && promoDisc > 0) return Math.round(promoDisc);
    }

    if (product.discountPercent !== undefined && product.discountPercent !== null) {
        const disc = Number(product.discountPercent);
        if (!isNaN(disc) && disc > 0) return Math.round(disc);
    }

    if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
        return Math.round(((Number(product.originalPrice) - Number(product.price)) / Number(product.originalPrice)) * 100);
    }

    // Ưu tiên 2: Tạo tỷ lệ giảm giá ngẫu nhiên có quy luật theo ID sản phẩm
    // Giúp giao diện hiển thị hiệu ứng giảm giá và gạch ngang giá gốc chân thực, hấp dẫn
    const id = Number(product.id) || 0;
    if (!id) return 0;

    // Khoảng 20% sách giữ nguyên giá gốc không giảm (ví dụ các đầu sách đặc biệt)
    if ((id * 3 + 1) % 5 === 0) return 0;

    // Các mức giảm giá thực tế thường gặp ở sàn sách: 10%, 15%, 18%, 20%, 22%, 24%, 25%, 30%, 35%, 40%
    const discounts = [20, 15, 24, 30, 10, 25, 35, 18, 40, 22];
    return discounts[id % discounts.length];
};

export const getProductOriginalPrice = (product, explicitDiscount) => {
    if (!product || !product.price) return null;
    if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
        return Number(product.originalPrice);
    }

    const discount = explicitDiscount !== undefined ? explicitDiscount : getProductDiscountPercent(product);
    if (discount > 0 && Number(product.price) > 0) {
        const rawOriginal = Number(product.price) / (1 - discount / 100);
        // Làm tròn đến hàng nghìn đồng để giá gốc đẹp mắt và tự nhiên
        return Math.round(rawOriginal / 1000) * 1000;
    }

    return null;
};
