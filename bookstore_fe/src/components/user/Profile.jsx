import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { ShieldAlert } from 'lucide-react';

// Import subcomponents
import ProfileInfo from './ProfileInfo';
import AddressList from './AddressList';
import CouponsRewards from './CouponsRewards';
import FavoriteProducts from './FavoriteProducts';
import SecuritySettings from './SecuritySettings';

const Profile = () => {
  const { user, updateUser, showToast } = useApp();

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '0909123456');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', {
        fullName: fullName.trim(),
        phone,
        address: user.address,
        avatarUrl: user.avatarUrl
      });
      updateUser({ fullName: fullName.trim(), phone });
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (!user) {
    return (
      <div className="page-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: '#ef4444', margin: '0 auto 16px auto' }} />
        <h2 style={{ color: '#111827' }}>Vui lòng đăng nhập để xem thông tin</h2>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left', backgroundColor: '#f9fafb', paddingTop: '20px' }}>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: '30px', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Box 1: Avatar Card */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#0a422d', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700 }}>
              {getInitials(user.fullName)}
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{user.fullName}</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '2px' }}>{user.email}</div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button style={{ padding: '6px 14px', backgroundColor: '#0a422d', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Upload New Photo</button>
                <button style={{ padding: '6px 14px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Xóa ảnh</button>
              </div>
            </div>
          </div>

          {/* Box 2: Personal Info Form */}
          <ProfileInfo 
            fullName={fullName} 
            setFullName={setFullName} 
            email={email} 
            phone={phone} 
            setPhone={setPhone} 
          />

          {/* Box 3: Address List */}
          <AddressList 
            user={user} 
            phone={phone} 
            fullName={fullName} 
          />

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button style={{ padding: '10px 24px', backgroundColor: '#fff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              Hủy
            </button>
            <button onClick={handleProfileSubmit} disabled={loading} style={{ padding: '10px 24px', backgroundColor: '#0a422d', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Box 1: Rewards & Coupons */}
          <CouponsRewards />

          {/* Box 2: Favorite Products */}
          <FavoriteProducts />

          {/* Box 3: Security */}
          <SecuritySettings />

        </div>

      </div>
    </div>
  );
};

export default Profile;
