import { useState, useEffect } from "react";
import { User, Mail, Phone, Shield, Power, X, Save } from "lucide-react";
import api from "../../services/api";

const AdminEditUser = ({ user, onClose, onSave, showToast }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        role: "USER",
        status: "ACTIVE",
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "USER",
                status: user.status || "ACTIVE",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.put(`/admin/users/${user.id}`, formData);
            showToast("Cập nhật thông tin người dùng thành công!", "success");
            onSave(response.data.user || formData);
        } catch (error) {
            console.error("Lỗi cập nhật người dùng:", error);
            showToast(
                error.response?.data?.error ||
                    "Lỗi cập nhật người dùng. Vui lòng thử lại sau.",
                "error",
            );
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

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
                        Chỉnh sửa tài khoản
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
                                Họ và tên
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
                                    }}
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
                                Email
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
                                    }}
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
                                    }}
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
                                Vai trò
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
                                    }}
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

                    {/* Row 3: Status */}
                    <div
                        style={{
                            width: "50%",
                            paddingRight: "12px",
                            boxSizing: "border-box",
                            minWidth: "200px",
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                color: "#1e293b",
                                marginBottom: "8px",
                            }}
                        >
                            Trạng thái tài khoản
                        </label>
                        <div style={{ position: "relative" }}>
                            <Power
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
                                name="status"
                                value={formData.status}
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
                                }}
                            >
                                <option value="ACTIVE">Mở khóa</option>
                                <option value="LOCKED">Khóa tài khoản</option>
                            </select>
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
                        disabled={isSaving}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#2563eb",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: isSaving ? "not-allowed" : "pointer",
                            opacity: isSaving ? 0.7 : 1,
                        }}
                    >
                        <Save size={18} />
                        {isSaving ? "Đang xử lý..." : "Lưu thay đổi"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminEditUser;
