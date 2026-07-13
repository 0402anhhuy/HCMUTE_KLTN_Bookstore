import api from './api';

const orderService = {
  createOrder: async (data) => {
    return api.post('/orders', data);
  },

  getAllOrders: async (params = {}) => {
    return api.get('/orders', { params });
  },

  getOrdersByUser: async (userId, params = {}) => {
    return api.get(`/orders/user/${userId}`, { params });
  },

  getOrderById: async (id) => {
    return api.get(`/orders/${id}`);
  },

  getOrderByCode: async (orderCode) => {
    return api.get(`/orders/code/${orderCode}`);
  },

  getOrderItems: async (orderId) => {
    return api.get(`/orders/${orderId}/items`);
  },

  updateOrderStatus: async (id, status) => {
    return api.put(`/orders/${id}/status`, null, { params: { status } });
  }
};

export default orderService;
