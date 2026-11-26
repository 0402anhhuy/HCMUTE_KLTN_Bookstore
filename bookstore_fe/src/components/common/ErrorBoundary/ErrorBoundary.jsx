import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import "./ErrorBoundary.css";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[ErrorBoundary caught an error]:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container animate-fade-in">
                    <div className="error-boundary-card">
                        <div className="error-boundary-icon-box">
                            <AlertTriangle size={40} className="error-boundary-icon" />
                        </div>
                        <h2 className="error-boundary-title">
                            Đã xảy ra sự cố không mong muốn
                        </h2>
                        <p className="error-boundary-desc">
                            Hệ thống gặp sự cố khi hiển thị giao diện này.
                            Bạn có thể tải lại trang hoặc bấm quay về trang chủ để tiếp tục mua sắm.
                        </p>
                        <div className="error-boundary-actions">
                            <button
                                type="button"
                                onClick={this.handleReload}
                                className="error-boundary-btn-primary"
                            >
                                <RefreshCw size={16} />
                                Tải lại trang
                            </button>
                            <button
                                type="button"
                                onClick={this.handleGoHome}
                                className="error-boundary-btn-secondary"
                            >
                                <Home size={16} />
                                Về trang chủ
                            </button>
                        </div>
                        {import.meta.env?.DEV && this.state.error && (
                            <details className="error-boundary-details">
                                <summary>Chi tiết lỗi kỹ thuật (Chế độ phát triển)</summary>
                                <pre className="error-boundary-pre">
                                    {this.state.error?.toString()}
                                    {"\n"}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
