import React from 'react';
import { User } from 'lucide-react';

const ProfileInfo = ({ fullName, setFullName, email, phone, setPhone }) => {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <User size={18} style={{ color: '#0a422d' }} /> Thông tin cá nhân
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Tên</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
            required 
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '6px', display: 'block' }}>Địa chỉ email</label>
          <input 
            type="email" 
            value={email} 
            disabled 
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px', display: 'block' }}>Số điện thoại</label>
          <input 
            type="text" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value)} 
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
