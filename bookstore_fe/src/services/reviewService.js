import api from './api';

const reviewService = {
  getReviewsByProduct: async (productId, params = {}) => {
    return api.get(`/reviews/product/${productId}`, { params });
  },

  createReview: async (data) => {
    return api.post('/reviews', data);
  },

  deleteReview: async (id) => {
    return api.delete(`/reviews/${id}`);
  }
};

export default reviewService;
