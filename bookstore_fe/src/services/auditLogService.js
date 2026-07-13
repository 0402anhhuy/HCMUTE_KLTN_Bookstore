import api from './api';

const auditLogService = {
  getAllAuditLogs: async (params = {}) => {
    return api.get('/admin/audit-logs', { params });
  },

  getAuditLogsByUser: async (userId, params = {}) => {
    return api.get(`/admin/audit-logs/user/${userId}`, { params });
  }
};

export default auditLogService;
