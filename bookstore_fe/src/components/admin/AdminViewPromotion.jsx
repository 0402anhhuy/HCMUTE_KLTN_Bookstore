import React, { useState, useEffect } from "react";
import { X, Calendar, Activity, ShoppingCart, DollarSign, Package } from "lucide-react";
import { promotionService } from "../../services/promotionService";

const AdminViewPromotion = ({ promotionId, onClose, showToast }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await promotionService.getPromotionReport(promotionId);
                setReport(res.data);
            } catch (error) {
                console.error("Lỗi tải báo cáo khuyến mãi", error);
                showToast("Không thể tải báo cáo hệ thống", "error");
                onClose();
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [promotionId, showToast, onClose]);

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        let bg = "#e2e8f0";
        let color = "#475569";
        let text = status;
        
        switch (status) {
            case "PENDING": bg = "#fef3c7"; color = "#d97706"; text = "CHỜ KÍCH HOẠT"; break;
            case "ACTIVE": bg = "#dcfce7"; color = "#16a34a"; text = "ĐANG DIỄN RA"; break;
            case "INACTIVE": bg = "#f1f5f9"; color = "#64748b"; text = "VÔ HIỆU HÓA"; break;
            case "EXPIRED": bg = "#fee2e2"; color = "#ef4444"; text = "HẾT CHƯƠNG TRÌNH"; break;
        }

        return (
            <span style={{
                backgroundColor: bg, color: color, padding: "6px 12px", 
                borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, 
                letterSpacing: "0.02em"
            }}>
                {text}
            </span>
        );
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
        }}>
            <div style={{
                backgroundColor: "#ffffff", borderRadius: "16px", width: "650px", maxWidth: "95vw",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column",
                overflow: "hidden"
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px", borderBottom: "1px solid #e2e8f0", 
                    display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc"
                }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
                        Báo cáo Hiệu quả Khuyến mãi
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", padding: "6px", cursor: "pointer", 
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                        color: "#64748b", transition: "background-color 0.2s"
                    }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px", overflowY: "auto", minHeight: "300px" }}>
                    {loading ? (
                        <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
                            Đang phân tích dữ liệu...
                        </div>
                    ) : report && report.promotion ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            
                            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e293b", margin: "0 0 12px" }}>
                                    {report.promotion.title}
                                </h3>
                                <div>{getStatusBadge(report.promotion.status)}</div>
                            </div>
                            
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                <div style={{ 
                                    backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", 
                                    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" 
                                }}>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#3b82f615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Calendar size={24} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Thời gian áp dụng</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "0.95rem", color: "#1e293b", fontWeight: 700 }}>
                                            {formatDateTime(report.promotion.startDate)}<br />
                                            đến {formatDateTime(report.promotion.endDate)}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ 
                                    backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", 
                                    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" 
                                }}>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#8b5cf615", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Package size={24} color="#8b5cf6" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Phạm vi áp dụng</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "1.1rem", color: "#1e293b", fontWeight: 800 }}>
                                            {report.promotion.applicableProducts?.length || 0} Sản phẩm
                                        </p>
                                    </div>
                                </div>
                                <div style={{ 
                                    backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", 
                                    border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "16px" 
                                }}>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#10b98115", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <ShoppingCart size={24} color="#10b981" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>Tổng lượt sử dụng</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "1.5rem", color: "#1e293b", fontWeight: 800 }}>
                                            {report.totalUses} <span style={{fontSize: "0.95rem", color:"#64748b", fontWeight: 600}}>đơn hàng</span>
                                        </p>
                                    </div>
                                </div>
                                <div style={{ 
                                    backgroundColor: "#fffbeb", padding: "16px", borderRadius: "12px", 
                                    border: "1px solid #fde68a", display: "flex", alignItems: "center", gap: "16px" 
                                }}>
                                    <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#f59e0b15", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <DollarSign size={24} color="#f59e0b" />
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.8rem", color: "#d97706", fontWeight: 600, textTransform: "uppercase" }}>Doanh thu mang lại</p>
                                        <p style={{ margin: "4px 0 0", fontSize: "1.5rem", color: "#b45309", fontWeight: 800 }}>
                                            {report.totalRevenue?.toLocaleString()}đ
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default AdminViewPromotion;
