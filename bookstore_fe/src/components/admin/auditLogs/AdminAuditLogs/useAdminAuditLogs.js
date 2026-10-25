import { useState, useMemo, useCallback } from "react";

export const useAdminAuditLogs = ({ auditLogs = [], loadData }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [entityFilter, setEntityFilter] = useState("ALL");
    const [currentPage, setCurrentPage] = useState(1);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const pageSize = 10;

    // 1. TỔNG HỢP KPI THỐNG KÊ LOGS
    const kpiMetrics = useMemo(() => {
        const total = (auditLogs || []).length;
        let createCount = 0;
        let updateCount = 0;
        let sensitiveCount = 0;

        (auditLogs || []).forEach((log) => {
            const act = (log.action || "").toUpperCase();
            if (act.includes("CREATE") || act.includes("ADD") || act.includes("INSERT")) {
                createCount += 1;
            } else if (
                act.includes("UPDATE") ||
                act.includes("EDIT") ||
                act.includes("MODIFY") ||
                act.includes("TOGGLE") ||
                act.includes("STATUS")
            ) {
                updateCount += 1;
            } else if (
                act.includes("DELETE") ||
                act.includes("REMOVE") ||
                act.includes("REJECT") ||
                act.includes("BLOCK") ||
                act.includes("BAN")
            ) {
                sensitiveCount += 1;
            }
        });

        return {
            total,
            createCount,
            updateCount,
            sensitiveCount,
        };
    }, [auditLogs]);

    // 2. LỌC DANH SÁCH LOGS THEO TỪ KHÓA, HÀNH ĐỘNG VÀ THỰC THỂ
    const filteredLogs = useMemo(() => {
        return (auditLogs || []).filter((log) => {
            const term = searchTerm.trim().toLowerCase();
            const actionStr = (log.action || "").toLowerCase();
            const entityStr = (log.entityName || "").toLowerCase();
            const usernameStr = (log.username || "").toLowerCase();
            const descStr = (log.description || "").toLowerCase();
            const entityIdStr = String(log.entityId || "").toLowerCase();

            const matchesSearch =
                !term ||
                actionStr.includes(term) ||
                entityStr.includes(term) ||
                usernameStr.includes(term) ||
                descStr.includes(term) ||
                entityIdStr.includes(term);

            let matchesAction = true;
            if (actionFilter !== "ALL") {
                const act = (log.action || "").toUpperCase();
                if (actionFilter === "CREATE") {
                    matchesAction =
                        act.includes("CREATE") ||
                        act.includes("ADD") ||
                        act.includes("INSERT");
                } else if (actionFilter === "UPDATE") {
                    matchesAction =
                        act.includes("UPDATE") ||
                        act.includes("EDIT") ||
                        act.includes("MODIFY") ||
                        act.includes("TOGGLE") ||
                        act.includes("STATUS");
                } else if (actionFilter === "DELETE") {
                    matchesAction =
                        act.includes("DELETE") ||
                        act.includes("REMOVE");
                } else if (actionFilter === "SECURITY") {
                    matchesAction =
                        act.includes("REJECT") ||
                        act.includes("BLOCK") ||
                        act.includes("BAN") ||
                        act.includes("APPROVE");
                } else if (actionFilter === "LOGIN") {
                    matchesAction =
                        act.includes("LOGIN") ||
                        act.includes("AUTH");
                }
            }

            let matchesEntity = true;
            if (entityFilter !== "ALL") {
                const ent = (log.entityName || "").toUpperCase();
                matchesEntity = ent.includes(entityFilter.toUpperCase());
            }

            return matchesSearch && matchesAction && matchesEntity;
        });
    }, [auditLogs, searchTerm, actionFilter, entityFilter]);

    // 3. PHÂN TRANG
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));

    const paginatedLogs = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredLogs.slice(start, start + pageSize);
    }, [filteredLogs, currentPage, pageSize]);

    // 4. LÀM MỚI DỮ LIỆU
    const handleRefresh = useCallback(async () => {
        if (!loadData) return;
        setIsRefreshing(true);
        try {
            await loadData();
        } catch (error) {
            console.error("Lỗi khi tải lại nhật ký:", error);
        } finally {
            setTimeout(() => {
                setIsRefreshing(false);
            }, 400);
        }
    }, [loadData]);

    // 5. KHÔI PHỤC BỘ LỌC
    const handleResetFilter = useCallback(() => {
        setSearchTerm("");
        setActionFilter("ALL");
        setEntityFilter("ALL");
        setCurrentPage(1);
    }, []);

    // 6. XUẤT BÁO CÁO CSV (UTF-8 có BOM)
    const exportToCSV = useCallback(() => {
        if (!filteredLogs || filteredLogs.length === 0) {
            alert("Không có nhật ký nào để xuất báo cáo!");
            return;
        }

        const headers = [
            "Mã Log",
            "Thời gian",
            "Hành động",
            "Đối tượng",
            "ID Đối tượng",
            "Người thực hiện",
            "Mô tả chi tiết",
        ];

        const rows = filteredLogs.map((log) => {
            const id = `#${log.id || ""}`;
            const time = log.createdAt
                ? `"${new Date(log.createdAt).toLocaleString("vi-VN")}"`
                : '""';
            const action = `"${(log.action || "").replace(/"/g, '""')}"`;
            const entity = `"${(log.entityName || "").replace(/"/g, '""')}"`;
            const entityId = `"${String(log.entityId || "").replace(/"/g, '""')}"`;
            const username = `"${(log.username || "").replace(/"/g, '""')}"`;
            const desc = `"${(log.description || "").replace(/"/g, '""')}"`;

            return [id, time, action, entity, entityId, username, desc].join(
                ","
            );
        });

        const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
        const blob = new Blob([csvContent], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const dateStr = new Date().toISOString().slice(0, 10);
        link.setAttribute("href", url);
        link.setAttribute(
            "download",
            `nhat-ky-giam-sat-admin-${dateStr}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [filteredLogs]);

    return {
        searchTerm,
        setSearchTerm: (val) => {
            setSearchTerm(val);
            setCurrentPage(1);
        },
        actionFilter,
        setActionFilter: (val) => {
            setActionFilter(val);
            setCurrentPage(1);
        },
        entityFilter,
        setEntityFilter: (val) => {
            setEntityFilter(val);
            setCurrentPage(1);
        },
        currentPage,
        setCurrentPage,
        totalPages,
        pageSize,
        filteredLogs,
        paginatedLogs,
        kpiMetrics,
        isRefreshing,
        selectedLog,
        setSelectedLog,
        handleRefresh,
        handleResetFilter,
        exportToCSV,
    };
};
