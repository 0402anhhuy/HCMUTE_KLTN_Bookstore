import api from './api';

const notificationService = {
  getNotificationsByUser: async (userId, params = {}) => {
    return api.get(`/notifications/user/${userId}`, { params });
  },

  getUnreadCount: async (userId) => {
    return api.get(`/notifications/user/${userId}/unread-count`);
  },

  markAsRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  }
};

export default notificationService;
