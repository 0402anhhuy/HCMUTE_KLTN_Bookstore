import { Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { usePaymentCallback } from "./usePaymentCallback";
import "./PaymentCallback.css";

const PaymentCallback = () => {
    const { verifying, paymentStatus, orderId, message } = usePaymentCallback();

    return (
        <div className="page-container animate-fade-in payment-callback-page-container">
            <div className="glass-panel payment-callback-panel">
                {verifying ? (
                    <div className="payment-callback-stack">
                        <Loader2
                            size={48}
                            className="payment-callback-spinner"
                        />
                        <h3 className="payment-callback-title">
                            Đang xác thực giao dịch...
                        </h3>
                        <p className="payment-callback-desc-verifying">
                            Vui lòng không tắt hoặc tải lại trang web trong khi
                            hệ thống xác nhận thanh toán với ngân hàng.
                        </p>
                    </div>
                ) : paymentStatus === "success" ? (
                    <div className="payment-callback-stack">
                        <CheckCircle2
                            size={64}
                            className="payment-callback-icon-success"
                        />
                        <h3 className="payment-callback-title-success">
                            Thanh toán thành công
                        </h3>
                        <p className="payment-callback-desc">
                            {message} <br />
                            Mã đơn hàng của bạn là: <strong>#{orderId}</strong>.
                        </p>

                        <div className="payment-callback-actions-row">
                            <Link
                                to="/"
                                className="btn-secondary payment-callback-btn-secondary"
                            >
                                Trang chủ
                            </Link>
                            <Link
                                to="/orders"
                                className="btn-primary payment-callback-btn-primary"
                            >
                                Đơn hàng của tôi
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="payment-callback-stack">
                        <XCircle
                            size={64}
                            className="payment-callback-icon-failed"
                        />
                        <h3 className="payment-callback-title-failed">
                            Thanh toán thất bại
                        </h3>
                        <p className="payment-callback-desc">
                            {message} <br />
                            {orderId && (
                                <span>
                                    Đơn hàng liên quan:{" "}
                                    <strong>#{orderId}</strong>.
                                </span>
                            )}
                        </p>

                        <div className="payment-callback-actions-row">
                            <Link
                                to="/"
                                className="btn-secondary payment-callback-btn-secondary"
                            >
                                Trang chủ
                            </Link>
                            <Link
                                to="/cart"
                                className="btn-primary payment-callback-btn-danger"
                            >
                                Trở lại giỏ hàng
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCallback;
