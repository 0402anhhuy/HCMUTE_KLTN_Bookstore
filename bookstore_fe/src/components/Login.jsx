import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { User as Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { loginUser, showToast } = useApp();
  const navigate = useNavigate();
  const [view, setView] = useState('login'); // login, forgot, reset

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sub-step for reset flow: 'otp' or 'new_password'
  const [resetStep, setResetStep] = useState('otp');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = {
        email: response.data.email,
        fullName: response.data.fullName,
        phone: response.data.phone || '',
        address: response.data.address || '',
        role: response.data.role,
        status: response.data.status
      };
      loginUser(response.data.token, userData);
      if (userData.role === 'ADMIN') {
        navigate('/admin');
      } else if (userData.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sai email hoặc mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Mã OTP khôi phục mật khẩu đã được gửi về Email.');
      setTimeout(() => {
        setView('reset');
        setResetStep('otp');
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Không tìm thấy tài khoản với email này.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/reset-password', { email, otpCode, newPassword });
      showToast(response.data.message || 'Đặt lại mật khẩu thành công!', 'success');
      setView('login');
      setResetStep('otp');
      setPassword('');
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in auth-page">
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 30px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        textAlign: 'left'
      }}>

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center', color: '#111827' }}>Chào mừng trở lại!</h2>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '28px' }}>Đăng nhập vào UTEShop</p>

            {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 44px 0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '14px', top: '13px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'end', marginBottom: '24px' }}>
              <button
                type="button"
                onClick={() => { setView('forgot'); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: '#0056C6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', borderRadius: '8px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '0.95rem' }} disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
              style={{ width: '100%', height: '46px', borderRadius: '8px', padding: '0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '0.95rem', marginTop: '12px', border: '1px solid #d1d5db', backgroundColor: '#ffffff', color: '#374151' }}
            >
              Đăng nhập với vai trò khách
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.85rem', marginTop: '24px' }}>
              Chưa có tài khoản? <Link to="/register" style={{ fontWeight: 600, color: '#0056C6' }}>Đăng ký tại đây</Link>
            </p>
          </form>
        )}

        {/* VIEW: FORGOT & RESET PASSWORD FLOW */}
        {(view === 'forgot' || view === 'reset') && (() => {
          const isDone1 = view === 'reset';
          const isActive1 = view === 'forgot';

          const isDone2 = view === 'reset' && resetStep === 'new_password';
          const isActive2 = view === 'reset' && resetStep === 'otp';

          const isActive3 = view === 'reset' && resetStep === 'new_password';

          return (
            <div>
              {/* Stepper */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDone1 ? '#0056C6' : 'white',
                    border: isActive1 ? '2px solid #0056C6' : (isDone1 ? 'none' : '1px solid #e5e7eb'),
                    color: isDone1 ? 'white' : (isActive1 ? '#0056C6' : '#9ca3af'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}>
                    {isDone1 ? '✓' : '1'}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: (isDone1 || isActive1) ? 600 : 500, color: (isDone1 || isActive1) ? '#0056C6' : '#9ca3af' }}>Email</span>
                </div>

                <div style={{ flex: 1, height: '2px', backgroundColor: isDone1 ? '#0056C6' : '#e5e7eb', maxWidth: '60px', marginTop: '-16px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDone2 ? '#0056C6' : 'white',
                    border: isActive2 ? '2px solid #0056C6' : (isDone2 ? 'none' : '1px solid #e5e7eb'),
                    color: isDone2 ? 'white' : (isActive2 ? '#0056C6' : '#9ca3af'),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}>
                    {isDone2 ? '✓' : '2'}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: (isDone2 || isActive2) ? 600 : 500, color: (isDone2 || isActive2) ? '#0056C6' : '#9ca3af' }}>Xác thực OTP</span>
                </div>

                <div style={{ flex: 1, height: '2px', backgroundColor: isDone2 ? '#0056C6' : '#e5e7eb', maxWidth: '60px', marginTop: '-16px' }} />

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    border: isActive3 ? '2px solid #0056C6' : '1px solid #e5e7eb',
                    color: isActive3 ? '#0056C6' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    boxSizing: 'border-box'
                  }}>
                    3
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: isActive3 ? 600 : 500, color: isActive3 ? '#0056C6' : '#9ca3af' }}>Mật khẩu mới</span>
                </div>
              </div>

              {/* Blue Key Icon Header */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#eef5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0056C6' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3M17 6l3 3" /></svg>
                </div>
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', textAlign: 'center', color: '#111827' }}>Quên mật khẩu?</h2>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', marginBottom: '24px' }}>Đừng lo, chúng tôi sẽ giúp bạn khôi phục</p>

              {error && <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #fee2e2' }}>{error}</div>}
              {message && <div style={{ background: '#ecfdf5', color: '#10b981', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid #a7f3d0' }}>{message}</div>}

              {/* Form Content depending on the step */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotSubmit}>
                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Email đã đăng ký</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="example@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: '600' }} disabled={loading}>
                    <span>{loading ? 'Đang gửi...' : 'Gửi mã OTP'}</span>
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => { setView('login'); setError(''); setMessage(''); }}
                      style={{ background: 'none', border: 'none', color: '#0056C6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}

              {view === 'reset' && resetStep === 'otp' && (
                <div>
                  {/* Info alert box */}
                  <div style={{ background: '#eef5ff', border: '1px solid #d0e3ff', color: '#0056C6', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.4' }}>
                    Đã gửi OTP đến <strong style={{ textDecoration: 'underline' }}>{email}</strong>
                  </div>

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
                      type="button"
                      onClick={() => {
                        if (otpCode.length === 6) {
                          setResetStep('new_password');
                          setError('');
                        } else {
                          setError('Vui lòng nhập đủ 6 chữ số OTP.');
                        }
                      }}
                      className="btn-primary"
                      style={{ flex: 2, height: '44px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}
                    >
                      Xác nhận OTP
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotSubmit}
                      style={{ flex: 1.2, height: '44px', borderRadius: '8px', backgroundColor: '#f3f4f6', border: 'none', color: '#4b5563', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Gửi lại
                    </button>
                  </div>

                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9ca3af' }}>
                    Không nhận được? <span style={{ color: '#0056C6', cursor: 'pointer', fontWeight: '600' }} onClick={handleForgotSubmit}>Gửi lại</span>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => { setView('login'); setError(''); setMessage(''); }}
                      style={{ background: 'none', border: 'none', color: '#0056C6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                </div>
              )}

              {view === 'reset' && resetStep === 'new_password' && (
                <form onSubmit={handleResetSubmit}>
                  <div className="form-group" style={{ marginBottom: '20px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Tối thiểu 6 ký tự"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '24px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '6px', display: 'block', color: '#374151' }}>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '0 14px', fontSize: '0.9rem', boxSizing: 'border-box' }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', height: '46px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600' }} disabled={loading}>
                    {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '24px' }}>
                    <button
                      type="button"
                      onClick={() => { setView('login'); setError(''); setMessage(''); }}
                      style={{ background: 'none', border: 'none', color: '#0056C6', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                </form>
              )}
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default Login;
