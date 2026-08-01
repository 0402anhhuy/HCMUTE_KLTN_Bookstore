import api from "./api";

export const shipperService = {
    getShippers: () => api.get("/shippers"),
};
