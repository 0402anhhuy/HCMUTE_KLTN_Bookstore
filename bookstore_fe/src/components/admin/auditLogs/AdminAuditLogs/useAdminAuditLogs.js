import { useState, useMemo } from "react";

export const useAdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const filteredLogs = useMemo(() => {
        return (auditLogs || []).filter((log) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                (log.action || "").toLowerCase().includes(term) ||
                (log.entityName || "").toLowerCase().includes(term) ||
                (log.username || "").toLowerCase().includes(term);

            const matchesAction =
                actionFilter === "ALL" ||
                (log.action || "").toUpperCase().includes(actionFilter.toUpperCase());

            return matchesSearch && matchesAction;
        });
    }, [auditLogs, searchTerm, actionFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLogs.slice(start, start + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    const handleRefresh = () => {
        if (loadData) {
            loadData();
        }
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setActionFilter("ALL");
        setCurrentPage(1);
    };

    return {
        searchTerm,
        setSearchTerm,
        actionFilter,
        setActionFilter,
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,
        filteredLogs,
        paginatedLogs,
        handleRefresh,
        handleResetFilter,
    };
};
