import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import {
    Navbar,
    Footer,
    Chatbot,
    ErrorBoundary,
    ProtectedRoute,
    Unauthorized,
} from "./components/common";
import { Home } from "./components/user/home";
import { Login, Register } from "./components/auth";
import { Profile } from "./components/user/profile/index";
import { Cart } from "./components/user/cart/index";
import { Checkout, PaymentCallback } from "./components/user/checkout/index";
import { OrderHistory } from "./components/user/order";
import { Catalog, ProductDetail } from "./components/user/products/index";
import ManagerDashboard from "./components/manager/ManagerDashboard";
import { AdminDashboard } from "./components/admin/dashboard";

function AppContent() {
    const location = useLocation();
    const { toast, user, loading: appLoading } = useApp();
    const navigate = useNavigate();
    const path = location.pathname.toLowerCase();
    const isAuthPage =
        path === "/login" || path === "/register";
    const isManagerAuthorized =
        path.startsWith("/manager") &&
        (user?.role === "MANAGER" || user?.role === "ADMIN");
    const isAdminAuthorized =
        path.startsWith("/admin") && user?.role === "ADMIN";
    const hideLayout = isAuthPage || isManagerAuthorized || isAdminAuthorized;

    // Trang hiện tại có phải khu vực quản trị không (bỏ hậu tố như /admin/...)
    const isAdminPage = path === "/admin" || path.startsWith("/admin/");
    const isManagerPage = path === "/manager" || path.startsWith("/manager/");
    const isStaffArea = isAdminPage || isManagerPage;

    useEffect(() => {
        if (appLoading) return;
        if (user) {
            if (user.role === 'ADMIN' && !isStaffArea) {
                navigate('/admin', { replace: true });
            } else if (user.role === 'MANAGER' && !isStaffArea) {
                navigate('/manager', { replace: true });
            }
        }
    }, [user, appLoading, isStaffArea, navigate]);

    // Cuộn lên đầu trang mỗi khi chuyển route, khắc phục lỗi bị giữ scroll ở chân trang footer trên mobile
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [location.pathname]);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                backgroundColor: isAuthPage ? "#f5f6f8" : "var(--bg-app)",
            }}
        >
            <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(120%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

            {/* Toast Notification */}
            {toast && (
                <div
                    style={{
                        position: "fixed",
                        top: "24px",
                        right: "24px",
                        zIndex: 99999,
                        padding: "16px 24px",
                        borderRadius: "12px",
                        backgroundColor:
                            toast.type === "error"
                                ? "#fef2f2"
                                : toast.type === "info"
                                    ? "#eff6ff"
                                    : "#ecfdf5",
                        border: `1px solid ${toast.type === "error" ? "#fee2e2" : toast.type === "info" ? "#dbeafe" : "#d1fae5"}`,
                        color:
                            toast.type === "error"
                                ? "#b91c1c"
                                : toast.type === "info"
                                    ? "#1e40af"
                                    : "#065f46",
                        boxShadow:
                            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        fontWeight: "500",
                        fontSize: "0.95rem",
                        maxWidth: "350px",
                        animation:
                            "slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                    }}
                >
                    {toast.type === "error" ? (
                        <svg
                            style={{
                                width: "20px",
                                height: "20px",
                                flexShrink: 0,
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    ) : toast.type === "info" ? (
                        <svg
                            style={{
                                width: "20px",
                                height: "20px",
                                flexShrink: 0,
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    ) : (
                        <svg
                            style={{
                                width: "20px",
                                height: "20px",
                                flexShrink: 0,
                            }}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Global Navbar Header */}
            {!hideLayout && <Navbar />}

            {/* Main App Content View Wrapper */}
            <main style={{ flex: 1, paddingTop: hideLayout ? "0" : "64px" }}>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route
                            path="/checkout"
                            element={
                                <ProtectedRoute>
                                    <Checkout />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute>
                                    <OrderHistory />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/payment/vnpay-callback"
                            element={<PaymentCallback />}
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/catalog" element={<Catalog />} />
                        <Route path="/product/:id" element={<ProductDetail />} />
                        <Route
                            path="/manager"
                            element={
                                <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                                    <ManagerDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute allowedRoles={["ADMIN"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/403" element={<Unauthorized />} />

                        {/* Fallback routing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </ErrorBoundary>
            </main>

            {/* Global Footer */}
            {!hideLayout && <Footer />}

            {/* Chatbot hỗ trợ khách hàng - nút nổi góc phải dưới */}
            {!hideLayout && <Chatbot />}
            {/* Vercel Analytics tracking */}
            <Analytics />
        </div>
    );
}

function App() {
    return (
        <AppProvider>
            <Router>
                <AppContent />
            </Router>
        </AppProvider>
    );
}

export default App;
