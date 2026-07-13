import api from './api';

const returnService = {
  getAllReturnRequests: async (params = {}) => {
    return api.get('/returns', { params });
  },

  getReturnsByOrderId: async (orderId) => {
    return api.get(`/returns/order/${orderId}`);
  },

  getReturnsByUserId: async (userId, params = {}) => {
    return api.get(`/returns/user/${userId}`, { params });
  },

  createReturnRequest: async (data) => {
    return api.post('/returns', data);
  },

  updateReturnStatus: async (id, status) => {
    return api.put(`/returns/${id}/status`, null, { params: { status } });
  }
};

export default returnService;
