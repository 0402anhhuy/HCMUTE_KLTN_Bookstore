import api from "./api";

export const auditLogService = {
    getAuditLogs: () => api.get("/admin/audit-logs"),
};
