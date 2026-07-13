import api from './api';

const stockService = {
  getAllStockMovements: async () => {
    return api.get('/stock-movements');
  },

  getStockMovementsByProduct: async (productId, params = {}) => {
    return api.get(`/stock-movements/product/${productId}`, { params });
  },

  createStockMovement: async (data) => {
    return api.post('/stock-movements', data);
  }
};

export default stockService;
