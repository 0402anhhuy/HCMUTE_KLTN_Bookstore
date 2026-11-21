import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";
import "./Unauthorized.css";

const Unauthorized = ({ userRole, requiredRoles = [] }) => {
    const { logoutUser } = useApp();
    const navigate = useNavigate();

    const handleSwitchAccount = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <div className="unauthorized-container animate-fade-in">
            <div className="unauthorized-card">
                <div className="unauthorized-icon-box">
                    <ShieldAlert size={44} />
                </div>
                <span className="unauthorized-code-badge">HTTP 403 Forbidden</span>
                <h1 className="unauthorized-title">Quyền truy cập bị từ chối</h1>
                <p className="unauthorized-desc">
                    Tài khoản của bạn không có đặc quyền để truy cập vào phân vùng quản trị này.
                    Vui lòng liên hệ Quản trị viên hệ thống nếu bạn cho rằng đây là một sự nhầm lẫn.
                </p>

                {(userRole || requiredRoles.length > 0) && (
                    <div className="unauthorized-role-info">
                        {userRole && (
                            <div className="unauthorized-role-row">
                                <span>Vai trò tài khoản hiện tại:</span>
                                <span className="unauthorized-badge unauthorized-badge-current">
                                    {userRole}
                                </span>
                            </div>
                        )}
                        {requiredRoles.length > 0 && (
                            <div className="unauthorized-role-row">
                                <span>Yêu cầu quyền hạn:</span>
                                <span className="unauthorized-badge unauthorized-badge-required">
                                    {requiredRoles.join(", ")}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <div className="unauthorized-actions">
                    <Link to="/" className="unauthorized-btn-primary">
                        <Home size={18} />
                        Quay về trang chủ
                    </Link>
                    <button
                        type="button"
                        onClick={handleSwitchAccount}
                        className="unauthorized-btn-secondary"
                    >
                        <LogOut size={18} />
                        Đổi tài khoản khác
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
