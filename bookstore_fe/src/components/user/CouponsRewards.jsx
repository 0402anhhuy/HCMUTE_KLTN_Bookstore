import React from 'react';
import { Award, Ticket } from 'lucide-react';

const CouponsRewards = () => {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#0a422d', color: '#fff', padding: '14px 20px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={18} /> Kho Điểm & Ví Voucher
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Điểm tích lũy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>0</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Giá trị quy đổi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>0 đ</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '10px' }}>Mã giảm giá của bạn (0 voucher)</div>
          <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' }}>
            <Ticket size={24} style={{ color: '#9ca3af', margin: '0 auto 8px auto' }} />
            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Bạn chưa có mã giảm giá nào.</div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Đánh giá sản phẩm để nhận voucher 10%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponsRewards;
