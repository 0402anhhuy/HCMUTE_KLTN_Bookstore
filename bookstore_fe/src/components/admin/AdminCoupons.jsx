import { useState } from "react";
import { Tag, Plus, Trash2, Edit2, Search } from "lucide-react";
import { couponService } from "../../services/couponService";
import AdminEditCoupon from "./AdminEditCoupon";

const AdminCoupons = ({
    coupons = [],
    promotions = [],
    loadData,
    showToast,
}) => {
    const [activeSubTab, setActiveSubTab] = useState("coupons");
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [deletingCoupon, setDeletingCoupon] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [typeFilter, setTypeFilter] = useState("ALL");

    // New Coupon Form state
    const [formData, setFormData] = useState({
        code: "",
        discountPercentage: "",
        discountAmount: "",
        minOrderAmount: "100000",
        maxDiscountAmount: "50000",
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 30 * 86400000)
            .toISOString()
            .split("T")[0],
        usageLimit: "100",
    });

    const formatPrice = (price) => {
        if (!price) return "0 đ";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    const handleCreateCoupon = async (e) => {
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
            (formData.discountAmount && Number(formData.discountAmount) < 0)) {
            showToast("Giá trị giảm giá không hợp lệ (không được âm)", "error");
            return;
        }

        try {
            await couponService.createCoupon({
                code: formData.code.toUpperCase().trim(),
                discountPercentage: formData.discountPercentage
                    ? Number(formData.discountPercentage)
                    : null,
                discountAmount: formData.discountAmount
                    ? Number(formData.discountAmount)
                    : null,
                minOrderAmount: Number(formData.minOrderAmount || 0),
                maxDiscountAmount: Number(formData.maxDiscountAmount || 0),
                validFrom: formData.validFrom
                    ? `${formData.validFrom}T00:00:00`
                    : null,
                validTo: formData.validTo
                    ? `${formData.validTo}T23:59:59`
                    : null,
                usageLimit: Number(formData.usageLimit || 100),
                active: true,
            });
            showToast("Tạo mã giảm giá thành công!", "success");
            setShowForm(false);
            setFormData({
                code: "",
                discountPercentage: "",
                discountAmount: "",
                minOrderAmount: "100000",
                maxDiscountAmount: "50000",
                validFrom: new Date().toISOString().split("T")[0],
                validTo: new Date(Date.now() + 30 * 86400000)
                    .toISOString()
                    .split("T")[0],
                usageLimit: "100",
            });
            if (loadData) loadData();
        } catch (error) {
            console.error("Failed to create coupon", error);
            showToast("Lỗi khi tạo mã giảm giá", "error");
        }
    };

    const handleDeleteCoupon = async () => {
        if (!deletingCoupon) return;
        try {
            await couponService.deleteCoupon(deletingCoupon.id);
            showToast("Đã xóa mã giảm giá", "success");
            setDeletingCoupon(null);
            if (loadData) loadData();
        } catch (error) {
            console.error("Failed to delete coupon", error);
            showToast("Không thể xóa mã giảm giá", "error");
        }
    };

    const handleResetFilter = () => {
        setSearchTerm("");
        setStatusFilter("ALL");
        setTypeFilter("ALL");
    };

    const filteredCoupons = coupons.filter(coupon => {
        const keyword = searchTerm.toLowerCase();
        const matchSearch = (coupon.code || "").toLowerCase().includes(keyword);
        
        let matchStatus = true;
        if (statusFilter === "ACTIVE") matchStatus = coupon.status === "ACTIVE";
        if (statusFilter === "INACTIVE") matchStatus = coupon.status === "INACTIVE";

        let matchType = true;
        if (typeFilter === "PERCENT") matchType = coupon.discountType === "PERCENT";
        if (typeFilter === "AMOUNT") matchType = coupon.discountType === "FIXED";
        
        return matchSearch && matchStatus && matchType;
    });

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px",
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: 0,
                        }}
                    >
                        Quản Lý Mã Giảm Giá & Khuyến Mãi
                    </h2>
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Thiết lập mã coupon ưu đãi và chương trình khuyến mãi
                        cho toàn sàn
                    </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        style={{
                            padding: "10px 18px",
                            borderRadius: "8px",
                            backgroundColor: "#1e40af",
                            color: "#ffffff",
                            border: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            boxShadow: "0 4px 10px rgba(30, 64, 175, 0.2)",
                        }}
                    >
                        <Plus size={16} /> Tạo Mã Giảm Giá
                    </button>
                </div>
            </div>

            {/* New Coupon Modal / Expand Form */}
            {showForm && (
                <form
                    onSubmit={handleCreateCoupon}
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "14px",
                        border: "1px solid #93c5fd",
                        padding: "24px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                    }}
                >
                    <h3
                        style={{
                            fontSize: "1.05rem",
                            fontWeight: 700,
                            color: "#1e40af",
                            margin: 0,
                        }}
                    >
                        Tạo Mã Coupon Ưu Đãi Mới
                    </h3>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "16px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Mã Coupon (VD: BOOKSUMMER)
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="BOOKSUMMER"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        code: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    fontWeight: 700,
                                    textTransform: "uppercase",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Giảm theo %
                            </label>
                            <input
                                type="number"
                                placeholder="VD: 15 (%)"
                                value={formData.discountPercentage}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountPercentage: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Hoặc Giảm số tiền cố định (VND)
                            </label>
                            <input
                                type="number"
                                placeholder="VD: 30000"
                                value={formData.discountAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountAmount: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Đơn hàng tối thiểu (VND)
                            </label>
                            <input
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minOrderAmount: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Giảm tối đa (VND)
                            </label>
                            <input
                                type="number"
                                value={formData.maxDiscountAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxDiscountAmount: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>

                        <div>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    color: "#475569",
                                    marginBottom: "6px",
                                }}
                            >
                                Giới hạn lượt dùng
                            </label>
                            <input
                                type="number"
                                value={formData.usageLimit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        usageLimit: e.target.value,
                                    })
                                }
                                style={{
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "12px",
                            marginTop: "8px",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            style={{
                                padding: "9px 18px",
                                borderRadius: "8px",
                                border: "1px solid #cbd5e1",
                                backgroundColor: "#ffffff",
                                color: "#475569",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: "9px 24px",
                                borderRadius: "8px",
                                border: "none",
                                backgroundColor: "#1e40af",
                                color: "#ffffff",
                                fontWeight: 600,
                                cursor: "pointer",
                            }}
                        >
                            Lưu Mã Coupon
                        </button>
                    </div>
                </form>
            )}

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
                        placeholder="Tìm kiếm mã giảm giá..."
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
                            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569", whiteSpace: "nowrap" }}>Loại giảm giá:</span>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                style={{ flex: 1, padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", cursor: "pointer", backgroundColor: "#f8fafc" }}
                            >
                                <option value="ALL">Tất cả các loại</option>
                                <option value="PERCENT">Theo phần trăm (%)</option>
                                <option value="AMOUNT">Theo số tiền (VNĐ)</option>
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
                                <option value="ACTIVE">Đang hoạt động</option>
                                <option value="INACTIVE">Tạm khóa</option>
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

            {/* Coupons Table */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "14px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)",
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                            }}
                        >
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Mã Code
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Ưu Đãi Giảm
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Đơn Tối Thiểu
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Giới Hạn
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                }}
                            >
                                Trạng Thái
                            </th>
                            <th
                                style={{
                                    padding: "14px 20px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#475569",
                                    textTransform: "uppercase",
                                    textAlign: "right",
                                }}
                            >
                                Thao Tác
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCoupons.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        padding: "40px",
                                        textAlign: "center",
                                        color: "#64748b",
                                    }}
                                >
                                    Chưa có mã giảm giá nào. Hãy nhấn "Tạo Mã
                                    Giảm Giá" để thêm mới.
                                </td>
                            </tr>
                        ) : (
                            filteredCoupons.map((c) => (
                                <tr
                                    key={c.id}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <td style={{ padding: "16px 20px" }}>
                                        <span
                                            style={{
                                                padding: "6px 12px",
                                                borderRadius: "8px",
                                                backgroundColor: "#eff6ff",
                                                color: "#1e40af",
                                                fontWeight: 800,
                                                fontSize: "0.85rem",
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                            }}
                                        >
                                            <Tag size={14} /> {c.code}
                                        </span>
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            fontWeight: 700,
                                            color: "#0f172a",
                                        }}
                                    >
                                        {c.discountType === 'PERCENT'
                                            ? `${c.discountValue}% (Tối đa ${formatPrice(c.maxDiscountAmount)})`
                                            : formatPrice(c.discountValue)}
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            color: "#475569",
                                        }}
                                    >
                                        {formatPrice(c.minOrderValue)}
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            color: "#475569",
                                        }}
                                    >
                                        {c.usedCount || 0} /{" "}
                                        {c.usageLimit || "∞"} lượt
                                    </td>

                                    <td style={{ padding: "16px 20px" }}>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                fontWeight: 700,
                                                backgroundColor:
                                                    c.status === "ACTIVE"
                                                        ? "#ecfdf5"
                                                        : "#fef2f2",
                                                color:
                                                    c.status === "ACTIVE"
                                                        ? "#059669"
                                                        : "#dc2626",
                                            }}
                                        >
                                            {c.status === "ACTIVE"
                                                ? "Hoạt động"
                                                : "Đã khóa"}
                                        </span>
                                    </td>

                                    <td
                                        style={{
                                            padding: "16px 20px",
                                            textAlign: "right",
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            gap: "10px",
                                        }}
                                    >
                                        <button
                                            onClick={() => setEditingCoupon(c)}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                border: "1px solid #bfdbfe",
                                                backgroundColor: "#eff6ff",
                                                color: "#3b82f6",
                                                cursor: "pointer",
                                            }}
                                            title="Sửa Coupon"
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeletingCoupon(c)}
                                            style={{
                                                padding: "6px 10px",
                                                borderRadius: "6px",
                                                border: "1px solid #fecaca",
                                                backgroundColor: "#fef2f2",
                                                color: "#dc2626",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {editingCoupon && (
                <AdminEditCoupon
                    coupon={editingCoupon}
                    onClose={() => setEditingCoupon(null)}
                    onSave={() => {
                        setEditingCoupon(null);
                        if (loadData) loadData();
                    }}
                    showToast={showToast}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingCoupon && (
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
                            Xác nhận xóa mã giảm giá
                        </h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b", fontSize: "0.95rem", lineHeight: 1.5 }}>
                            Bạn có chắc chắn muốn xóa vĩnh viễn giới hạn mã <strong>{deletingCoupon.code}</strong> khỏi hệ thống? Khách hàng sẽ không thể sử dụng mã này được nữa.
                        </p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button
                                onClick={() => setDeletingCoupon(null)}
                                style={{
                                    padding: "10px 24px", borderRadius: "8px", border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff", color: "#334155", fontWeight: 600, cursor: "pointer"
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteCoupon}
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
        </div>
    );
};

export default AdminCoupons;
