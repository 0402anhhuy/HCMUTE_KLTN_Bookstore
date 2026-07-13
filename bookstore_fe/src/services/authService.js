import api from './api';

const authService = {
  login: async (credentials) => {
    return api.post('/v2/auth/login', credentials);
  },

  register: async (data) => {
    return api.post('/auth/register', data);
  },

  verifyOtp: async (data) => {
    return api.post('/auth/verify-otp', data);
  },

  forgotPassword: async (email) => {
    return api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (data) => {
    return api.post('/auth/reset-password', data);
  }
};

export default authService;
