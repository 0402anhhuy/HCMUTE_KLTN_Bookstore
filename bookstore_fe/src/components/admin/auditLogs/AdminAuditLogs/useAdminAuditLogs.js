import { useState, useMemo } from "react";

export const useAdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLogs = useMemo(() => {
        return (auditLogs || []).filter((log) => {
            const term = searchTerm.toLowerCase();
            return (
                (log.action || "").toLowerCase().includes(term) ||
                (log.entityName || "").toLowerCase().includes(term) ||
                (log.username || "").toLowerCase().includes(term)
            );
        });
    }, [auditLogs, searchTerm]);

    const handleRefresh = () => {
        if (loadData) {
            loadData();
        }
    };

    return {
        searchTerm,
        setSearchTerm,
        filteredLogs,
        handleRefresh,
    };
};
