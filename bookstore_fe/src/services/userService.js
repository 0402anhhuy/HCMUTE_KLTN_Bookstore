import api from './api';

const userService = {
  getProfile: async () => {
    return api.get('/users/profile');
  },

  updateProfile: async (data) => {
    return api.put('/users/profile', data);
  },

  // Admin APIs
  getAllUsers: async (params = {}) => {
    return api.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return api.get(`/admin/users/${id}`);
  },

  updateUserStatus: async (id, status) => {
    return api.put(`/admin/users/${id}/status`, null, { params: { status } });
  },

  updateUserRole: async (id, role) => {
    return api.put(`/admin/users/${id}/role`, null, { params: { role } });
  }
};

export default userService;
