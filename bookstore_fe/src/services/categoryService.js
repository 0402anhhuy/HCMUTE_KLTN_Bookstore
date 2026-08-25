import api from "./api";

export const categoryService = {
    getCategories: () => api.get("/categories"),
    getRootCategories: () => api.get("/categories/roots"),
    getChildCategories: (parentId) => api.get(`/categories/children/${parentId}`),
    getCategoryById: (id) => api.get(`/categories/${id}`),
    createCategory: (data) => api.post("/categories", data),
    updateCategory: (id, data) => api.put(`/categories/${id}`, data),
    deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export default categoryService;