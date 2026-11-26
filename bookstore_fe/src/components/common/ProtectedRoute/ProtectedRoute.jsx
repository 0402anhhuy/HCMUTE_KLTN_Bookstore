import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import Unauthorized from "../Unauthorized/Unauthorized";

/**
 * ProtectedRoute: Route middleware kiểm tra trạng thái xác thực và phân quyền (RBAC).
 * Chặn đứng triệt để hiện tượng chớp nháy (flash) giao diện nội bộ khi user thường truy cập link /admin hoặc /manager.
 */
const ProtectedRoute = ({ allowedRoles = [], children }) => {
    const { user, loading } = useApp();
    const location = useLocation();

    // 1. Khi đang tải phiên xác thực từ storage:
    // Hiển thị loading nhẹ, tuyệt đối KHÔNG render component để không lộ bất kỳ khung hình nào
    if (loading) {
        return (
            <div
                style={{
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    color: "#0a422d",
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        border: "3px solid #e5e7eb",
                        borderTopColor: "#0a422d",
                        borderRadius: "50%",
                        animation: "authSpin 0.7s linear infinite",
                    }}
                />
                <style>{`@keyframes authSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ fontSize: "0.9rem", color: "#4b5563", fontWeight: 500 }}>
                    Đang kiểm tra quyền truy cập...
                </p>
            </div>
        );
    }

    // 2. Chưa đăng nhập -> Chuyển hướng an toàn về /login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Đã đăng nhập nhưng không đủ quyền -> Chặn đứng bằng trang 403 Forbidden
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return <Unauthorized userRole={user.role} requiredRoles={allowedRoles} />;
    }

    // 4. Đầy đủ quyền hạn -> Render component được bảo vệ
    return children;
};

export default ProtectedRoute;
