import api from './api';

const paymentService = {
  getPaymentByOrder: async (orderId) => {
    return api.get(`/payments/order/${orderId}`);
  },

  getPaymentById: async (id) => {
    return api.get(`/payments/${id}`);
  },

  createPayment: async (data) => {
    return api.post('/payments', data);
  }
};

export default paymentService;
