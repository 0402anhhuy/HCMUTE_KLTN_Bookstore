import api from './api';

const shipperService = {
  getAllShippers: async (params = {}) => {
    return api.get('/shippers', { params });
  },

  getShippersList: async () => {
    return api.get('/shippers/all');
  },

  getShipperById: async (id) => {
    return api.get(`/shippers/${id}`);
  },

  createOrUpdateShipper: async (data) => {
    return api.post('/shippers', data);
  },

  deleteShipper: async (id) => {
    return api.delete(`/shippers/${id}`);
  }
};

export default shipperService;
