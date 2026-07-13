import api from './api';

const couponService = {
  getAllCoupons: async (params = {}) => {
    return api.get('/coupons', { params });
  },

  getCouponByCode: async (code) => {
    return api.get(`/coupons/code/${code}`);
  },

  createCoupon: async (data) => {
    return api.post('/coupons', data);
  },

  deleteCoupon: async (id) => {
    return api.delete(`/coupons/${id}`);
  }
};

export default couponService;
