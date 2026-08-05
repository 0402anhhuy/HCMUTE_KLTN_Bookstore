import React, { useState, useEffect } from "react";
import { PlusCircle, Package, FileText, Edit2, Trash2, Search } from "lucide-react";
import AdminAddPromotion from "./AdminAddPromotion";
import AdminEditPromotion from "./AdminEditPromotion";
import AdminViewPromotion from "./AdminViewPromotion";
import { promotionService } from "../../services/promotionService";
import { useApp } from "../../context/AppContext";

const AdminPromotions = () => {
    const { showToast } = useApp();
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState(null);
    const [deletingPromotion, setDeletingPromotion] = useState(null);
    const [viewingPromotionId, setViewingPromotionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    const loadPromotions = async () => {
        setLoading(true);
        try {
            const res = await promotionService.getPromotions();
            setPromotions(res.data || []);
        } catch (error) {
            console.error("Lỗi tải promotion", error);
            showToast("Lỗi tải dữ liệu khuyến mãi", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPromotions();
    }, []);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleString('vi-VN');
    };

    const formatDateOnly = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN');
    };

    const formatTimeOnly = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING": return "#f59e0b"; // Yellow 
            case "ACTIVE": return "#4ade80"; // Green
            case "INACTIVE": return "#94a3b8"; // Gray
            case "EXPIRED": return "#ef4444"; // Red
            default: return "#94a3b8"; 
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "PENDING": return "CHỜ KÍCH HOẠT"; 
            case "ACTIVE": return "ĐANG DIỄN RA"; 
            case "INACTIVE": return "VÔ HIỆU HÓA"; 
            case "EXPIRED": return "HẾT CHƯƠNG TRÌNH"; 
            default: return status; 
        }
    };

    const handleSavePromotion = async (payload) => {
        try {
            const res = await promotionService.createPromotion(payload);
            showToast("Tạo chương trình khuyến mãi thành công", "success");
            // Optimistic update
            setPromotions(prev => [res.data.promotion, ...prev]);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Lỗi tạo promotion", error);
            showToast(error.response?.data?.error || "Lỗi tạo chương trình", "error");
        }
    };

    const handleUpdatePromotion = async (id, payload) => {
        try {
            const res = await promotionService.updatePromotion(id, payload);
            showToast("Cập nhật chương trình khuyến mãi thành công", "success");
            setPromotions(prev => prev.map(p => p.id === id ? res.data.promotion : p));
            setEditingPromotion(null);
        } catch (error) {
            console.error("Lỗi cập nhật promotion", error);
            showToast(error.response?.data?.error || "Lỗi cập nhật chương trình", "error");
        }
    };

    const handleDeletePromotion = async () => {
        if (!deletingPromotion) return;
        try {
            await promotionService.deletePromotion(deletingPromotion.id);
            showToast("Xóa chương trình khuyến mãi thành công", "success");
            setPromotions(prev => prev.filter(p => p.id !== deletingPromotion.id));
            setDeletingPromotion(null);
        } catch (error) {
            console.error("Lỗi xóa promotion", error);
            showToast(error.response?.data?.error || "Lỗi xóa chương trình", "error");
        }
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
    };

    const filteredPromotions = promotions.filter(promo => {
        const keyword = searchTerm.toLowerCase();
        const matchSearch = (promo.title || "").toLowerCase().includes(keyword);
        const matchStatus = statusFilter === "ALL" || promo.status === statusFilter;
        const matchType = typeFilter === "ALL" || promo.discountType === typeFilter;
        
        return matchSearch && matchStatus && matchType;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header section */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <h1
                    style={{
                        margin: 0,
                        fontSize: "1.75rem",
                        color: "#0f172a",
                        fontWeight: 800,
                    }}
                >
                    Quản lý khuyến mãi
                </h1>

                <button
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "10px 16px",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                        boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
                    }}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <PlusCircle size={18} />
                    Tạo chương trình khuyến mãi
                </button>
            </div>

            {/* Filter and Search Section */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ position: "relative" }}>
                    <Search
                        size={18}
                        color="#64748b"
                        style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm chương trình khuyến mãi theo tên..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "10px 14px 10px 40px",
                            borderRadius: "10px",
                            border: "1px solid #d7def0",
                            backgroundColor: "#ffffff",
                            outline: "none",
                            fontSize: "0.95rem",
                            boxSizing: "border-box"
                        }}
                    />
                </div>
                
                <div style={{
                    display: "flex", gap: "16px", flexWrap: "wrap", backgroundColor: "#ffffff",
                    padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    alignItems: "center"
                }}>
                    <div style={{
                        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", flex: 1
                    }}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>Loại khuyến mãi:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", cursor: "pointer", backgroundColor: "#f8fafc" }}
                            >
                                <option value="ALL">Tất cả các loại</option>
                                <option value="PERCENT">Theo phần trăm (%)</option>
                                <option value="FIXED_AMOUNT">Theo số tiền (VNĐ)</option>
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>Trạng thái:</span>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", cursor: "pointer", backgroundColor: "#f8fafc" }}
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ kích hoạt</option>
                                <option value="ACTIVE">Đang diễn ra</option>
                                <option value="INACTIVE">Vô hiệu hóa</option>
                                <option value="EXPIRED">Đã kết thúc</option>
                            </select>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleResetFilter}
                        style={{
                            padding: "8px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff",
                            color: "#475569", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer"
                        }}
                    >
                        Khôi phục
                    </button>
                </div>
            </div>

            {/* Table section */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Chương trình
                            </th>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Loại
                            </th>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Thời gian
                            </th>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Trạng thái
                            </th>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Sản phẩm áp dụng
                            </th>
                            <th
                                style={{
                                    padding: "16px 20px",
                                    color: "#94a3b8",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05em",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                Thao tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : filteredPromotions.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#64748b" }}>Không tìm thấy chương trình khuyến mãi nào phù hợp</td>
                            </tr>
                        ) : (
                            filteredPromotions.map((promo, index) => (
                            <tr
                                key={promo.id}
                                style={{
                                    borderBottom: index === promotions.length - 1 ? "none" : "1px solid #f1f5f9",
                                    backgroundColor: "#ffffff",
                                    transition: "background-color 0.2s",
                                }}
                            >
                                <td style={{ padding: "20px", fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                                    {promo.title}
                                </td>
                                <td style={{ padding: "20px", fontWeight: 700, color: "#1e293b", fontSize: "0.95rem", whiteSpace: "nowrap" }}>
                                    {promo.discountType === "PERCENT" ? `Giảm ${promo.discountValue}%` : `Giảm ${promo.discountValue.toLocaleString()}đ`}
                                </td>
                                <td style={{ padding: "20px", fontWeight: 700, color: "#1e293b", fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>{formatDateOnly(promo.startDate)}</span>
                                            <span style={{ margin: "0 8px" }}>-</span>
                                            <span>{formatDateOnly(promo.endDate)}</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", color: "#64748b", fontSize: "0.75rem", fontWeight: 500, padding: "0 10px" }}>
                                            <span>({formatTimeOnly(promo.startDate)})</span>
                                            <span>({formatTimeOnly(promo.endDate)})</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: "20px", whiteSpace: "nowrap" }}>
                                    <span
                                        style={{
                                            backgroundColor: getStatusColor(promo.status),
                                            color: "#ffffff",
                                            fontWeight: 700,
                                            fontSize: "0.7rem",
                                            padding: "6px 12px",
                                            borderRadius: "20px",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.02em"
                                        }}
                                    >
                                        {getStatusText(promo.status)}
                                    </span>
                                </td>
                                <td style={{ padding: "20px", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: 700, color: "#1e293b", fontSize: "0.95rem" }}>
                                        <Package size={20} color="#64748b" />
                                        {promo.applicableProducts?.length || 0} Sản phẩm
                                    </div>
                                </td>
                                <td style={{ padding: "20px", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
                                        <button 
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} 
                                            title="Chi tiết"
                                            onClick={() => setViewingPromotionId(promo.id)}
                                        >
                                            <FileText size={18} color="#64748b" />
                                        </button>
                                        <button 
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} 
                                            title="Sửa"
                                            onClick={() => setEditingPromotion(promo)}
                                        >
                                            <Edit2 size={18} color="#3b82f6" />
                                        </button>
                                        <button 
                                            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} 
                                            title="Xóa"
                                            onClick={() => setDeletingPromotion(promo)}
                                        >
                                            <Trash2 size={18} color="#ef4444" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )))}
                    </tbody>
                </table>
            </div>
            
            {isAddModalOpen && (
                <AdminAddPromotion 
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleSavePromotion}
                    showToast={showToast}
                />
            )}
            
            {editingPromotion && (
                <AdminEditPromotion 
                    promotion={editingPromotion}
                    onClose={() => setEditingPromotion(null)}
                    onSave={handleUpdatePromotion}
                    showToast={showToast}
                />
            )}

            {deletingPromotion && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3000
                }}>
                    <div style={{
                        backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px",
                        width: "400px", maxWidth: "90vw", textAlign: "center",
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                    }}>
                        <div style={{
                            width: "60px", height: "60px", borderRadius: "30px",
                            backgroundColor: "#fef2f2", display: "flex", alignItems: "center",
                            justifyContent: "center", margin: "0 auto 20px"
                        }}>
                            <Trash2 size={30} color="#ef4444" />
                        </div>
                        <h3 style={{ margin: "0 0 12px", fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
                            Xác nhận xóa
                        </h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                            Bạn có chắc chắn muốn xóa vĩnh viễn chương trình <strong>{deletingPromotion.title}</strong>? Các sản phẩm trong chương trình này sẽ tự động trở về giá gốc.
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => setDeletingPromotion(null)}
                                style={{
                                    padding: "10px 24px", borderRadius: "8px", border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff", color: "#334155", fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeletePromotion}
                                style={{
                                    padding: "10px 24px", borderRadius: "8px", border: "none",
                                    backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                Xóa vĩnh viễn
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingPromotionId && (
                <AdminViewPromotion 
                    promotionId={viewingPromotionId}
                    onClose={() => setViewingPromotionId(null)}
                    showToast={showToast}
                />
            )}
        </div>
    );
};

export default AdminPromotions;
