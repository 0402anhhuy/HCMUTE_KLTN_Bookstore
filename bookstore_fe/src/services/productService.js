import api from './api';

const productService = {
  searchProducts: async (params = {}) => {
    return api.get('/products', { params });
  },

  getProductById: async (id) => {
    return api.get(`/products/${id}`);
  },

  createProduct: async (data, categoryId) => {
    return api.post('/products', data, { params: { categoryId } });
  },

  updateProduct: async (id, data, categoryId) => {
    return api.put(`/products/${id}`, data, { params: { categoryId } });
  },

  deleteProduct: async (id) => {
    return api.delete(`/products/${id}`);
  },

  getCategories: async () => {
    return api.get('/categories');
  },

  getRootCategories: async () => {
    return api.get('/categories/root');
  },

  createCategory: async (data) => {
    return api.post('/categories', data);
  },

  deleteCategory: async (id) => {
    return api.delete(`/categories/${id}`);
  }
};

export default productService;
