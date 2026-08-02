import api from "./api";

export const orderService = {
    getOrders: () => api.get("/orders/all"),
};
