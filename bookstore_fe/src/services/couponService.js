import api from "./api";

export const couponService = {
    getCoupons: () => api.get("/coupons"),
};
