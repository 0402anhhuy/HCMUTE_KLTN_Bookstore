import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const SecuritySettings = () => {
  const { showToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  // Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (newPassword !== confirmNewPassword) {
      showToast('Mật khẩu xác nhận không khớp.', 'error');
      setLoading(false);
      return;
    }
    try {
      await api.post('/users/change-password', { oldPassword, newPassword });
      showToast('Đổi mật khẩu thành công!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      showToast(err.response?.data?.error || 'Mật khẩu cũ không chính xác.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={18} style={{ color: '#0a422d' }} /> Bảo mật
      </h3>

      <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Đổi mật khẩu</div>
        <input 
          type="password" 
          placeholder="Mật khẩu hiện tại" 
          value={oldPassword} 
          onChange={(e) => setOldPassword(e.target.value)} 
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Mật khẩu mới" 
          value={newPassword} 
          onChange={(e) => setNewPassword(e.target.value)} 
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Xác nhận mật khẩu mới" 
          value={confirmNewPassword} 
          onChange={(e) => setConfirmNewPassword(e.target.value)} 
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} 
          required 
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '8px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', marginTop: '4px' }}
        >
          {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
        </button>
      </form>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '16px' }}>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Xác thực hai lớp</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>Đang hoạt động</div>
        </div>
        <button
          type="button"
          onClick={() => setTwoFactor(!twoFactor)}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            backgroundColor: twoFactor ? '#10b981' : '#d1d5db',
            border: 'none',
            position: 'relative',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: '#fff',
            position: 'absolute',
            top: '3px',
            left: twoFactor ? '23px' : '3px',
            transition: 'left 0.2s'
          }} />
        </button>
      </div>
    </div>
  );
};

export default SecuritySettings;
