import api from "./api";

export const promotionService = {
    getPromotions: () => api.get("/admin/promotions"),
    createPromotion: (promoData) => api.post("/admin/promotions", promoData),
    updatePromotion: (id, promoData) => api.put(`/admin/promotions/${id}`, promoData),
    deletePromotion: (id) => api.delete(`/admin/promotions/${id}`),
    getPromotionReport: (id) => api.get(`/admin/promotions/${id}/report`),
};
