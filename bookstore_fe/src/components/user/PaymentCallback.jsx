import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success' or 'failed'
  const [orderId, setOrderId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyTransaction();
  }, []);

  const verifyTransaction = async () => {
    // Collect all query parameters returned by VNPay
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    try {
      // Send parameters to backend callback endpoint to verify checksum and update order/payment status
      const response = await api.get('/payment/vnpay-callback', { params });
      
      if (response.data.status === 'success') {
        setPaymentStatus('success');
        setOrderId(response.data.orderId);
        setMessage(response.data.message || 'Thanh toán trực tuyến đơn hàng thành công!');
      } else {
        setPaymentStatus('failed');
        setOrderId(response.data.orderId);
        setMessage(response.data.message || 'Thanh toán không thành công.');
      }
    } catch (error) {
      setPaymentStatus('failed');
      setOrderId(params['vnp_TxnRef'] || null);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '40px 30px', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
        
        {verifying ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Đang xác thực giao dịch...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Vui lòng không tắt hoặc tải lại trang web trong khi hệ thống xác nhận thanh toán với ngân hàng.
            </p>
          </div>
        ) : paymentStatus === 'success' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--success)', filter: 'drop-shadow(0 0 10px var(--success-glow))' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>Thanh toán thành công</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {message} <br/>
              Mã đơn hàng của bạn là: <strong>#{orderId}</strong>.
            </p>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
              <Link to="/" className="btn-secondary" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                Trang chủ
              </Link>
              <Link to="/orders" className="btn-primary" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                Đơn hàng của tôi
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <XCircle size={64} style={{ color: 'var(--danger)', filter: 'drop-shadow(0 0 10px var(--danger-glow))' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>Thanh toán thất bại</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {message} <br/>
              {orderId && <span>Đơn hàng liên quan: <strong>#{orderId}</strong>.</span>}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '16px' }}>
              <Link to="/" className="btn-secondary" style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                Trang chủ
              </Link>
              <Link to="/cart" className="btn-primary" style={{ flex: 1, padding: '10px 0', textAlign: 'center', backgroundColor: 'var(--danger)', backgroundImage: 'none' }}>
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
