import React from 'react';
import { Heart } from 'lucide-react';

const FavoriteProducts = () => {
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Heart size={18} style={{ color: '#ef4444' }} /> Sản phẩm yêu thích <span style={{ fontSize: '0.8rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>0 món</span>
      </h3>
      <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '30px', textAlign: 'center', backgroundColor: '#fafafa' }}>
        <Heart size={28} style={{ color: '#fca5a5', margin: '0 auto 10px auto' }} />
        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Chưa có sản phẩm yêu thích.</div>
        <a href="/catalog" style={{ fontSize: '0.8rem', color: '#0a422d', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '6px' }}>Khám phá ngay</a>
      </div>
    </div>
  );
};

export default FavoriteProducts;
