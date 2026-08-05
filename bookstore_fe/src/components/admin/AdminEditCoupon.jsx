import React, { useState } from "react";
import { X } from "lucide-react";
import { couponService } from "../../services/couponService";

const AdminEditCoupon = ({ coupon, onClose, onSave, showToast }) => {
    const formatDate = (isoString) => {
        if (!isoString) return "";
        return isoString.split("T")[0];
    };

    const [formData, setFormData] = useState({
        code: coupon.code || "",
        discountPercentage: coupon.discountType === "PERCENT" ? coupon.discountValue : "",
        discountAmount: coupon.discountType === "FIXED" ? coupon.discountValue : "",
        minOrderAmount: coupon.minOrderValue || "0",
        maxDiscountAmount: coupon.maxDiscountAmount || "0",
        validFrom: formatDate(coupon.startDate),
        validTo: formatDate(coupon.endDate),
        usageLimit: coupon.usageLimit || "100",
        active: coupon.status === "ACTIVE"
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.code.trim()) {
            showToast("Vui lòng nhập mã giảm giá", "error");
            return;
        }

        if (formData.validFrom && formData.validTo) {
            if (new Date(formData.validTo) < new Date(formData.validFrom)) {
                showToast("Ngày hết hạn không được nhỏ hơn ngày bắt đầu", "error");
                return;
            }
        }

        if ((formData.discountPercentage && Number(formData.discountPercentage) < 0) || 
            (formData.discountAmount && Number(formData.discountAmount) < 0) ||
            (formData.usageLimit && Number(formData.usageLimit) < 0)) {
            showToast("Giá trị hoặc số lượng không được âm", "error");
            return;
        }

        try {
            const payload = {
                code: formData.code.toUpperCase().trim(),
                discountPercentage: formData.discountPercentage ? Number(formData.discountPercentage) : null,
                discountAmount: formData.discountAmount ? Number(formData.discountAmount) : null,
                minOrderAmount: Number(formData.minOrderAmount || 0),
                maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
                validFrom: formData.validFrom ? `${formData.validFrom}T00:00:00` : null,
                validTo: formData.validTo ? `${formData.validTo}T23:59:59` : null,
                usageLimit: Number(formData.usageLimit || 100),
                active: formData.active
            };
            await couponService.updateCoupon(coupon.id, payload);
            showToast("Cập nhật mã giảm giá thành công", "success");
            onSave();
        } catch (error) {
            console.error("Lỗi khi cập nhật mã giảm giá", error);
            showToast(error.response?.data?.error || "Lỗi cập nhật hệ thống", "error");
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000
        }}>
            <div style={{
                backgroundColor: "#ffffff", borderRadius: "16px", width: "800px", maxWidth: "95vw",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", display: "flex", flexDirection: "column",
                overflow: "hidden"
            }}>
                <div style={{
                    padding: "20px 24px", borderBottom: "1px solid #e2e8f0", 
                    display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#f8fafc"
                }}>
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
                        Cập nhật Mã Coupon
                    </h2>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", padding: "6px", cursor: "pointer", 
                        borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", 
                        color: "#64748b", transition: "background-color 0.2s"
                    }} onMouseOver={e => e.currentTarget.style.backgroundColor = "#e2e8f0"} onMouseOut={e => e.currentTarget.style.backgroundColor = "transparent"}>
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Mã Coupon</label>
                            <input type="text" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: 700, textTransform: "uppercase" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Trạng thái Kích hoạt</label>
                            <select value={formData.active} onChange={(e) => setFormData({...formData, active: e.target.value === "true"})} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#fff" }}>
                                <option value="true">Đang kích hoạt</option>
                                <option value="false">Tạm ngưng / Vô hiệu hóa</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Giảm theo %</label>
                            <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Hoặc Giảm số tiền cố định (VND)</label>
                            <input type="number" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Đơn hàng tối thiểu (VND)</label>
                            <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Giảm tối đa (VND)</label>
                            <input type="number" value={formData.maxDiscountAmount} onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Giới hạn lượt dùng</label>
                            <input type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Ngày Bắt đầu</label>
                            <input type="date" value={formData.validFrom} onChange={(e) => setFormData({...formData, validFrom: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                        <div>
                            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#475569", marginBottom: "6px" }}>Ngày Kết thúc</label>
                            <input type="date" value={formData.validTo} onChange={(e) => setFormData({...formData, validTo: e.target.value})} 
                            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "8px" }}>
                        <button type="button" onClick={onClose} style={{ padding: "9px 24px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#475569", fontWeight: 600, cursor: "pointer" }}>Hủy</button>
                        <button type="submit" style={{ padding: "9px 24px", borderRadius: "8px", border: "none", backgroundColor: "#3b82f6", color: "#ffffff", fontWeight: 600, cursor: "pointer" }}>Lưu Thay Đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AdminEditCoupon;
