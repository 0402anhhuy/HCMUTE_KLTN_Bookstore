import React, { useState, useEffect } from 'react';
import { Award, Ticket, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const CouponsRewards = () => {
  const { user } = useApp();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders/coupons');
      setCoupons(res.data || []);
    } catch (err) {
      console.error('Error fetching user coupons', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const rewardPoints = user?.rewardPoints || 0;
  const rewardValue = rewardPoints * 10000;

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ backgroundColor: '#0a422d', color: '#fff', padding: '14px 20px', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Award size={18} /> Kho Điểm & Ví Voucher
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '14px', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Điểm tích lũy</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{rewardPoints} điểm</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Giá trị quy đổi</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{formatPrice(rewardValue)}</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '10px' }}>
            Mã giảm giá của bạn ({coupons.length} voucher)
          </div>
          {loading ? (
            <div style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', padding: '10px' }}>Đang tải...</div>
          ) : coupons.length === 0 ? (
            <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#fafafa' }}>
              <Ticket size={24} style={{ color: '#9ca3af', margin: '0 auto 8px auto' }} />
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Bạn chưa có mã giảm giá nào.</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Đánh giá sản phẩm để nhận voucher tự động!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {coupons.map(coupon => {
                const isExpired = new Date(coupon.endDate) < new Date();
                const isLimitReached = coupon.usedCount >= coupon.usageLimit;
                const isInactive = coupon.status === 'INACTIVE' || isExpired || isLimitReached;

                return (
                  <div 
                    key={coupon.id} 
                    style={{ 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      backgroundColor: isInactive ? '#f9fafb' : '#fff',
                      opacity: isInactive ? 0.7 : 1
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0a422d', fontFamily: 'monospace', backgroundColor: '#e6f4ea', padding: '2px 6px', borderRadius: '4px' }}>
                          {coupon.code}
                        </span>
                        {isExpired && <span style={{ fontSize: '0.65rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '1px 4px', borderRadius: '3px' }}>Hết hạn</span>}
                        {isLimitReached && <span style={{ fontSize: '0.65rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '1px 4px', borderRadius: '3px' }}>Đã dùng</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#111827', marginTop: '4px', fontWeight: 600 }}>
                        {coupon.discountType === 'PERCENT' ? `Giảm ${coupon.discountValue}%` : `Giảm ${formatPrice(coupon.discountValue)}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px' }}>
                        Đơn tối thiểu: {formatPrice(coupon.minOrderValue)}
                      </div>
                    </div>
                    <button 
                      onClick={() => handleCopy(coupon.code)}
                      disabled={isInactive}
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: isInactive ? '#f3f4f6' : (copiedCode === coupon.code ? '#e6f4ea' : '#0a422d'),
                        color: isInactive ? '#9ca3af' : (copiedCode === coupon.code ? '#0a422d' : '#fff'),
                        border: 'none', 
                        borderRadius: '6px', 
                        fontSize: '0.75rem', 
                        fontWeight: 600, 
                        cursor: isInactive ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copiedCode === coupon.code ? (
                        <>
                          <Check size={12} /> Đã chép
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Sao chép
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponsRewards;
