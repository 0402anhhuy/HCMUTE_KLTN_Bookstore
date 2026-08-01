import React, { useState } from "react";
import { User, Mail, Phone, MapPin, Save, X, Lock } from "lucide-react";

const AdminEditProfile = ({ user, onCancel, onSave }) => {
    // Form state initialized with the selected user's data
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
    });

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [passwordData, setPasswordData] = useState({
        email: user?.email || "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSave) {
            onSave(formData);
        }
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <h1 style={{ margin: "0 0 8px 0", fontSize: "1.5rem", lineHeight: 1.2, color: "#0f172a", fontWeight: 800 }}>
                        Cập nhật hồ sơ tài khoản
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#64748b" }}>
                        Chỉnh sửa thông tin cá nhân của quản trị viên hệ thống
                    </p>
                </div>
                <button
                    onClick={onCancel}
                    type="button"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                        color: "#475569",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}
                >
                    <X size={16} />
                    <span>Đóng</span>
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "32px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                
                <div style={{ display: "flex", gap: "32px", marginBottom: "32px" }}>
                    {/* Fake Avatar Upload / Preview */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", width: "140px" }}>
                        <div style={{ 
                            width: "100px", 
                            height: "100px", 
                            borderRadius: "50%", 
                            backgroundColor: "#f1f5f9", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center",
                            border: "4px solid #ffffff",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                        }}>
                            <span style={{ fontSize: "2.5rem", fontWeight: 700, color: "#94a3b8" }}>
                                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "U"}
                            </span>
                        </div>
                        <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500, textAlign: "center" }}>
                            Ảnh đại diện
                        </span>
                        <button
                            type="button"
                            onClick={() => {
                                setStep(1);
                                setPasswordData(prev => ({ ...prev, email: user?.email || "", otp: "", newPassword: "", confirmPassword: "" }));
                                setIsPasswordModalOpen(true);
                            }}
                            style={{
                                marginTop: "8px",
                                padding: "6px 14px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                backgroundColor: "#f8fafc",
                                color: "#0f172a",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s"
                            }}
                        >
                            Đổi mật khẩu
                        </button>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Row 1: FullName & Email */}
                        <div style={{ display: "flex", gap: "20px" }}>
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>Họ và tên</label>
                                <div style={{ position: "relative" }}>
                                    <User size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Nhập họ và tên..."
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
                                        onFocus={(e) => e.target.style.border = "1px solid #ef4444"}
                                        onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>Email hòm thư (Định danh)</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        disabled
                                        style={{
                                            width: "100%",
                                            boxSizing: "border-box",
                                            padding: "12px 14px 12px 42px",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                            backgroundColor: "#f8fafc",
                                            color: "#64748b",
                                            fontSize: "0.95rem",
                                            cursor: "not-allowed"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Phone */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>Số điện thoại</label>
                            <div style={{ position: "relative" }}>
                                <Phone size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Ví dụ: 0912345678"
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
                                    onFocus={(e) => e.target.style.border = "1px solid #ef4444"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                />
                            </div>
                        </div>

                        {/* Row 3: Address */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" }}>Địa chỉ</label>
                            <div style={{ position: "relative" }}>
                                <MapPin size={18} style={{ position: "absolute", left: "14px", top: "16px", color: "#94a3b8" }} />
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Nhập địa chỉ nhận hàng/liên hệ..."
                                    rows="4"
                                    style={{
                                        width: "100%",
                                        boxSizing: "border-box",
                                        padding: "14px 14px 14px 42px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        resize: "vertical",
                                        fontFamily: "inherit",
                                        transition: "border 0.2s"
                                    }}
                                    onFocus={(e) => e.target.style.border = "1px solid #ef4444"}
                                    onBlur={(e) => e.target.style.border = "1px solid #cbd5e1"}
                                ></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                    <button
                        type="button"
                        onClick={onCancel}
                        style={{
                            padding: "10px 20px",
                            borderRadius: "8px",
                            border: "1px solid #cbd5e1",
                            backgroundColor: "#ffffff",
                            color: "#334155",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer"
                        }}
                    >
                        Hủy thay đổi
                    </button>
                    <button
                        type="submit"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 24px",
                            borderRadius: "8px",
                            border: "none",
                            backgroundColor: "#ef4444",
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                            cursor: "pointer",
                            boxShadow: "0 2px 4px rgba(239, 68, 68, 0.2)"
                        }}
                    >
                        <Save size={18} />
                        Lưu thông tin
                    </button>
                </div>
            </form>

            {/* Change Password Modal (Multi-step OTP) */}
            {isPasswordModalOpen && (
                <div style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(15, 23, 42, 0.4)",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }} onClick={() => setIsPasswordModalOpen(false)}>
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            width: "100%",
                            maxWidth: "420px",
                            padding: "32px 32px 24px",
                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                            position: "relative"
                        }}
                    >
                        <button 
                            onClick={() => setIsPasswordModalOpen(false)} 
                            style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}
                        >
                            <X size={20} />
                        </button>

                        {/* Stepper */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "40px", position: "relative", padding: "0 10px" }}>
                            {/* Connecting Lines */}
                            <div style={{ position: "absolute", top: "12px", left: "40px", right: "50%", height: "2px", backgroundColor: step >= 2 ? "#ef4444" : "#f1f5f9", zIndex: 1, transition: "background-color 0.3s" }}></div>
                            <div style={{ position: "absolute", top: "12px", left: "50%", right: "40px", height: "2px", backgroundColor: step >= 3 ? "#ef4444" : "#f1f5f9", zIndex: 1, transition: "background-color 0.3s" }}></div>

                            {/* Step 1: Email */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2 }}>
                                <div style={{ 
                                    width: "24px", height: "24px", borderRadius: "50%", 
                                    backgroundColor: step > 1 ? "#ef4444" : (step === 1 ? "#ffffff" : "#f1f5f9"), 
                                    border: `2px solid ${step >= 1 ? "#ef4444" : "#cbd5e1"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: step === 1 ? "#ef4444" : "#fff", fontWeight: 700, fontSize: "0.8rem", boxSizing: "border-box", transition: "all 0.3s"
                                }}>
                                    {step > 1 ? (
                                        <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 5.33333L4.82353 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : "1"}
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: step >= 1 ? "#7f1d1d" : "#94a3b8", transition: "color 0.3s" }}>Email</span>
                            </div>

                            {/* Step 2: OTP */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2 }}>
                                <div style={{ 
                                    width: "24px", height: "24px", borderRadius: "50%", 
                                    backgroundColor: step > 2 ? "#ef4444" : (step === 2 ? "#ffffff" : "#f8fafc"), 
                                    border: `2px solid ${step >= 2 ? "#ef4444" : "#e2e8f0"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: step === 2 ? "#ef4444" : "#94a3b8", fontWeight: 700, fontSize: "0.8rem", boxSizing: "border-box", transition: "all 0.3s"
                                }}>
                                    {step > 2 ? (
                                        <svg width="12" height="9" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M1 5.33333L4.82353 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    ) : "2"}
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: step >= 2 ? "#7f1d1d" : "#94a3b8", transition: "color 0.3s" }}>Xác thực OTP</span>
                            </div>

                            {/* Step 3: New Password */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 2 }}>
                                <div style={{ 
                                    width: "24px", height: "24px", borderRadius: "50%", 
                                    backgroundColor: step === 3 ? "#ffffff" : "#f8fafc", 
                                    border: `2px solid ${step === 3 ? "#ef4444" : "#e2e8f0"}`,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: step === 3 ? "#ef4444" : "#94a3b8", fontWeight: 700, fontSize: "0.8rem", boxSizing: "border-box", transition: "all 0.3s"
                                }}>
                                    3
                                </div>
                                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: step === 3 ? "#7f1d1d" : "#94a3b8", transition: "color 0.3s" }}>Mật khẩu mới</span>
                            </div>
                        </div>

                        {/* Form Fields: Step Content Swapping */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px", marginBottom: "32px", minHeight: "150px" }}>
                            {step === 1 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>Quên mật khẩu?</h3>
                                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
                                        Nhập địa chỉ email của tài khoản đang đăng nhập để nhận mã OTP xác thực.
                                    </p>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>Email xác thực</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={passwordData.email}
                                        onChange={(e) => setPasswordData({...passwordData, email: e.target.value})}
                                        placeholder="Nhập email..."
                                        style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "8px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", color: "#334155", transition: "border 0.2s" }}
                                        onFocus={(e) => e.target.style.border = "2px solid #ef4444"}
                                        onBlur={(e) => e.target.style.border = "2px solid #cbd5e1"}
                                    />
                                </div>
                            )}

                            {step === 2 && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <h3 style={{ margin: "0 0 8px", fontSize: "1.2rem", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>Nhập mã OTP</h3>
                                    <p style={{ margin: "0 0 16px", fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
                                        Vui lòng kiểm tra hộp thư email <strong>{passwordData.email}</strong> để lấy mã xác nhận gồm 6 chữ số.
                                    </p>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>Mã OTP</label>
                                    <input
                                        type="text"
                                        name="otp"
                                        value={passwordData.otp}
                                        onChange={(e) => setPasswordData({...passwordData, otp: e.target.value})}
                                        placeholder="Nhập mã xác thực (VD: 123456)"
                                        style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "8px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", color: "#334155", transition: "border 0.2s", textAlign: "center", letterSpacing: "4px", fontWeight: 700 }}
                                        maxLength="6"
                                        onFocus={(e) => e.target.style.border = "2px solid #ef4444"}
                                        onBlur={(e) => e.target.style.border = "2px solid #cbd5e1"}
                                    />
                                </div>
                            )}

                            {step === 3 && (
                                <>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>Mật khẩu mới</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                            placeholder="Tối thiểu 6 ký tự"
                                            style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "8px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", color: "#334155", transition: "border 0.2s" }}
                                            onFocus={(e) => e.target.style.border = "2px solid #ef4444"}
                                            onBlur={(e) => e.target.style.border = "2px solid #cbd5e1"}
                                        />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                        <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>Xác nhận mật khẩu mới</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                            placeholder="Nhập lại mật khẩu"
                                            style={{ width: "100%", boxSizing: "border-box", padding: "14px 16px", borderRadius: "8px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", color: "#334155", transition: "border 0.2s" }}
                                            onFocus={(e) => e.target.style.border = "2px solid #ef4444"}
                                            onBlur={(e) => e.target.style.border = "2px solid #cbd5e1"}
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Submit Buttons Action */}
                        {step === 1 && (
                            <button
                                onClick={() => setStep(2)}
                                style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)" }}
                            >
                                Gửi mã OTP
                            </button>
                        )}
                        {step === 2 && (
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => setStep(1)}
                                    style={{ flex: "1", padding: "14px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "#ffffff", color: "#64748b", fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" }}
                                >
                                    Quay lại
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    style={{ flex: "2", padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)" }}
                                >
                                    Xác nhận OTP
                                </button>
                            </div>
                        )}
                        {step === 3 && (
                            <button
                                onClick={() => {
                                    alert("Mật khẩu đã được đặt lại thành công (Mock UI)!");
                                    setIsPasswordModalOpen(false);
                                }}
                                style={{ width: "100%", padding: "14px", borderRadius: "8px", border: "none", backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 700, fontSize: "1rem", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)" }}
                            >
                                Hoàn tất
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEditProfile;
