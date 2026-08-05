import { useState } from "react";
import { User, Mail, Phone, Shield, X, Save, MapPin, Lock } from "lucide-react";
import api from "../../services/api";

const AdminAddUser = ({ onClose, onSave, showToast }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        role: "USER",
        password: "",
        confirmPassword: ""
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password.length < 6) {
            showToast("Mật khẩu phải từ 6 ký tự trở lên", "error");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            showToast("Mật khẩu xác nhận không khớp", "error");
            return;
        }

        setIsSaving(true);
        try {
            const dataToSubmit = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                role: formData.role,
                password: formData.password
            };
            const response = await api.post(`/admin/users`, dataToSubmit);
            showToast("Thêm mới người dùng thành công!", "success");
            onSave(response.data.user);
        } catch (error) {
            console.error("Lỗi thêm người dùng:", error);
            showToast(
                error.response?.data?.error ||
                    "Lỗi thêm người dùng. Vui lòng thử lại sau.",
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    width: "100%",
                    maxWidth: "600px",
                    maxHeight: "90vh",
                    overflow: "hidden",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "24px 32px",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        position: "sticky",
                        top: 0,
                        backgroundColor: "#ffffff",
                        zIndex: 10,
                        borderRadius: "16px 16px 0 0",
                    }}
                >
                    <h2
                        style={{
                            margin: 0,
                            fontSize: "1.25rem",
                            fontWeight: 800,
                            color: "#0f172a",
                        }}
                    >
                        Thêm người dùng mới
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            border: "none",
                            background: "none",
                            padding: "8px",
                            cursor: "pointer",
                            color: "#64748b",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f1f5f9")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                                "transparent")
                        }
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div
                    style={{
                        padding: "32px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "24px",
                        overflowY: "auto",
                        flex: 1
                    }}
                >
                    {/* Row 1: Full Name & Email */}
                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Họ và tên <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <User
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Nhập họ và tên..."
                                    required
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Email <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Mail
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ email..."
                                    required
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Phone & Role */}
                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Số điện thoại
                            </label>
                            <div style={{ position: "relative" }}>
                                <Phone
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Số điện thoại liên hệ..."
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Vai trò <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Shield
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        backgroundColor: "#fff",
                                        cursor: "pointer",
                                        appearance: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                >
                                    <option value="USER">Người dùng</option>
                                    <option value="MANAGER">
                                        Người quản lý
                                    </option>
                                    <option value="ADMIN">Quản trị viên</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row Address */}
                    <div style={{ width: "100%" }}>
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: "8px",
                            }}
                        >
                            Địa chỉ
                        </label>
                        <div style={{ position: "relative" }}>
                            <MapPin
                                size={18}
                                style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#94a3b8",
                                }}
                            />
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Nhập địa chỉ..."
                                style={{
                                    width: "100%",
                                    boxSizing: "border-box",
                                    padding: "12px 14px 12px 42px",
                                    borderRadius: "8px",
                                    border: "1px solid #cbd5e1",
                                    fontSize: "0.95rem",
                                    outline: "none",
                                    transition: "border 0.2s"
                                }}
                                onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                            />
                        </div>
                    </div>

                    <hr style={{ border: "0", borderTop: "1px dashed #e2e8f0", margin: "4px 0" }} />

                    {/* Security Info */}
                    <h3 style={{ margin: "0 -8px -12px", fontSize: "1rem", color: "#334155" }}>Thông tin bảo mật</h3>

                    <div
                        style={{
                            display: "flex",
                            gap: "24px",
                            flexWrap: "wrap",
                        }}
                    >
                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Mật khẩu <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Tối thiểu 6 ký tự"
                                    required
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: "200px" }}>
                            <label
                                style={{
                                    display: "block",
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "8px",
                                }}
                            >
                                Xác nhận mật khẩu <span style={{ color: "red" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Lock
                                    size={18}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        color: "#94a3b8",
                                    }}
                                />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Nhập lại mật khẩu"
                                    required
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "12px 14px 12px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Tasks */}
                <div
                    style={{
                        padding: "24px 32px",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "0 0 16px 16px",
                    }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                        }}
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSaving || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: (isSaving || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) ? "#93c5fd" : "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: (isSaving || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) ? "not-allowed" : "pointer",
                            transition: "background-color 0.2s"
                        }}
                    >
                        <Save size={18} />
                        {isSaving ? "Đang xử lý..." : "Lưu người dùng"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAddUser;
