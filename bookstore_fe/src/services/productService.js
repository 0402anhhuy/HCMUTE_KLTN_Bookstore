import api from "./api";

export const productService = {
    getProducts: (params = {}) =>
        api.get("/products", { params: { size: 1000, ...params } }),
    getBestsellers: (params = {}) => api.get("/products/bestsellers", { params }),
    getProductsByStatus: (status) => api.get(`/products/status/${status}`),
    getPendingProducts: () => api.get("/products/status/PENDING"),
    getApprovedProducts: () => api.get("/products/status/ACTIVE"),
    getRejectedProducts: () => api.get("/products/status/REJECTED"),
    getProductsCountByStatus: (status) => api.get(`/products/count/status/${status}`),
    getPendingCount: () => api.get("/products/count/status/PENDING"),
    getApprovedCount: () => api.get("/products/count/status/ACTIVE"),
    getRejectedCount: () => api.get("/products/count/status/REJECTED"),
};
