import api from "./api";

export const couponService = {
    getCoupons: () => api.get("/coupons"),
    createCoupon: (couponData) => api.post("/coupons", couponData),
    updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
    deleteCoupon: (id) => api.delete(`/coupons/${id}`),
};
