import { X } from "lucide-react";
import { useAdminEditCoupon } from "./useAdminEditCoupon";
import "./AdminEditCoupon.css";

const AdminEditCoupon = ({ coupon, onClose, onSave, showToast }) => {
    const { formData, setFormData, handleSubmit } =
        useAdminEditCoupon({ coupon, onSave, showToast });

    return (
        <div className="admin-edit-coupon-overlay">
            <div className="admin-edit-coupon-modal">
                <div className="admin-edit-coupon-header">
                    <h2 className="admin-edit-coupon-title">
                        Cập nhật Mã Coupon
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-edit-coupon-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="admin-edit-coupon-form">
                    <div className="admin-edit-coupon-grid">
                        <div>
                            <label className="admin-edit-coupon-label">
                                Mã Coupon
                            </label>
                            <input
                                type="text"
                                name="code"
                                required
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        code: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input-code"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Trạng thái Kích hoạt
                            </label>
                            <select
                                name="active"
                                value={formData.active}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        active: e.target.value === "true",
                                    })
                                }
                                className="admin-edit-coupon-select"
                            >
                                <option value="true">Đang kích hoạt</option>
                                <option value="false">
                                    Tạm ngưng / Vô hiệu hóa
                                </option>
                            </select>
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Giảm theo %
                            </label>
                            <input
                                type="number"
                                name="discountPercentage"
                                value={formData.discountPercentage}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountPercentage: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Hoặc Giảm số tiền cố định (VND)
                            </label>
                            <input
                                type="number"
                                name="discountAmount"
                                value={formData.discountAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        discountAmount: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Đơn hàng tối thiểu (VND)
                            </label>
                            <input
                                type="number"
                                name="minOrderAmount"
                                value={formData.minOrderAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        minOrderAmount: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Giảm tối đa (VND)
                            </label>
                            <input
                                type="number"
                                name="maxDiscountAmount"
                                value={formData.maxDiscountAmount}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        maxDiscountAmount: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Giới hạn lượt dùng
                            </label>
                            <input
                                type="number"
                                name="usageLimit"
                                value={formData.usageLimit}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        usageLimit: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Ngày Bắt đầu
                            </label>
                            <input
                                type="date"
                                name="validFrom"
                                value={formData.validFrom}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        validFrom: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>

                        <div>
                            <label className="admin-edit-coupon-label">
                                Ngày Kết thúc
                            </label>
                            <input
                                type="date"
                                name="validTo"
                                value={formData.validTo}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        validTo: e.target.value,
                                    })
                                }
                                className="admin-edit-coupon-input"
                            />
                        </div>
                    </div>

                    <div className="admin-edit-coupon-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="admin-edit-coupon-btn-cancel"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="admin-edit-coupon-btn-submit"
                        >
                            Lưu Thay Đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminEditCoupon;