import api from './api';

const promotionService = {
  getAllPromotions: async (params = {}) => {
    return api.get('/promotions', { params });
  },

  getPromotionById: async (id) => {
    return api.get(`/promotions/${id}`);
  },

  createPromotion: async (data) => {
    return api.post('/promotions', data);
  },

  deletePromotion: async (id) => {
    return api.delete(`/promotions/${id}`);
  }
};

export default promotionService;
