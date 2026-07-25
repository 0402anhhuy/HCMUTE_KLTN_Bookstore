import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Phone, MapPin, Lock, CheckCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Register = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI Flow State: 'register' or 'otp'
  const [view, setView] = useState('register');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        phone,
        address,
        password
      });
      setMessage(response.data.message || 'Mã OTP đã được gửi.');
      setView('otp');
    } catch (err) {
      console.error("Register Error details:", err);
      setError(err.response?.data?.error || err.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', {
        email,
        otpCode
      });
      showToast(response.data.message || 'Kích hoạt tài khoản thành công!', 'success');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/register', {
        fullName,
        email,
        phone,
        address,
        password
      });
      setMessage('Mã OTP mới đã được gửi tới email. Vui lòng kiểm tra hộp thư.');
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể gửi lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in auth-page">
      <div style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 30px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      }}>

        {/* VIEW: REGISTER FORM */}
        {view === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center', color: '#111827' }}>
              Tạo tài khoản <span style={{ color: '#0056C6' }}>UTEShop</span>
            </h2>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0056C6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>1</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0056C6' }}>Thông tin</span>
              </div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#e5e7eb', maxWidth: '60px', marginTop: '-16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e5e7eb', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>2</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af' }}>Xác thực OTP</span>
              </div>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Họ và tên</label>
              <input
                type="text"
                className="form-input"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Số điện thoại</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Ví dụ: 0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Xác nhận mật khẩu</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Địa chỉ</label>
              <input
                type="text"
                className="form-input"
                placeholder="VD: 123 Lê Lợi, Phường 1, Quận 1, TP.HCM"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ width: '100%', height: '42px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600' }} disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: '24px' }}>
              Đã có tài khoản? <Link to="/login" style={{ fontWeight: 600, color: '#0056C6' }}>Đăng nhập ngay</Link>
            </p>
          </form>
        )}

        {/* VIEW: OTP VERIFICATION VIEW */}
        {view === 'otp' && (
          <form onSubmit={handleOtpSubmit}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '20px', textAlign: 'center', color: '#111827' }}>
              Tạo tài khoản <span style={{ color: '#0056C6' }}>UTEShop</span>
            </h2>

            {/* Stepper */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0056C6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>✓</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af' }}>Thông tin</span>
              </div>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#0056C6', maxWidth: '60px', marginTop: '-16px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0056C6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>2</div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0056C6' }}>Xác thực OTP</span>
              </div>
            </div>

            {/* Info Box */}
            <div style={{ background: '#eef5ff', border: '1px solid #d0e3ff', color: '#0056C6', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
              Đã gửi OTP đến <strong style={{ textDecoration: 'underline' }}>{email}</strong>
            </div>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151', textAlign: 'center' }}>Mã OTP</label>
              <input
                type="text"
                className="form-input"
                placeholder="0  0  0  0  0  0"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{ width: '100%', height: '48px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '1.25rem', letterSpacing: '8px', textAlign: 'center', fontWeight: 'bold', boxSizing: 'border-box' }}
                maxLength={6}
                required
              />
              <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', marginTop: '6px' }}>Nhập mã 6 chữ số được gửi đến email của bạn</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ flex: 2, height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}
                disabled={loading}
              >
                {loading ? 'Đang xác thực...' : 'Xác nhận OTP'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                style={{ flex: 1.2, height: '44px', borderRadius: '8px', backgroundColor: '#f3f4f6', border: 'none', color: '#4b5563', fontWeight: '600', cursor: 'pointer' }}
              >
                Gửi lại
              </button>
            </div>

            {/* Alert box */}
            {message && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#10b981', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'center' }}>
                {message}
              </div>
            )}

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: '24px' }}>
              Đã có tài khoản? <Link to="/login" style={{ fontWeight: 600, color: '#0056C6' }}>Đăng nhập ngay</Link>
            </p>
          </form>
        )}

      </div>
    </div>
  );
};

export default Register;
