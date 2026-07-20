import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Minus, ArrowLeft, Trash2, Coins, Ticket } from 'lucide-react';
import api from '../../services/api';

const Cart = () => {
  const { cart, updateCartQty, removeFromCart, clearCart, user, showToast } = useApp();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [usePoints, setUsePoints] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState(new Set());

  useEffect(() => {
    if (cart?.items) {
      setSelectedItemIds(prev => {
        const next = new Set(prev);
        const currentIds = new Set(cart.items.map(item => item.id));
        next.forEach(id => {
          if (!currentIds.has(id)) {
            next.delete(id);
          }
        });
        if (prev.size === 0 && cart.items.length > 0) {
          cart.items.forEach(item => next.add(item.id));
        }
        return next;
      });
    }
  }, [cart?.items]);

  const toggleSelectItem = (itemId) => {
    setSelectedItemIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const isAllSelected = cart.items && cart.items.length > 0 && selectedItemIds.size === cart.items.length;
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cart.items.map(item => item.id)));
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const totalAmount = cart.items
    .filter(item => selectedItemIds.has(item.id))
    .reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const [coupons, setCoupons] = useState([]);
  const [bestCoupon, setBestCoupon] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get('/orders/coupons');
        setCoupons(res.data || []);
      } catch (err) {
        console.error("Failed to fetch coupons", err);
      }
    };
    if (user) {
      fetchCoupons();
    }
  }, [user]);

  const calculateDiscount = (coupon, currentSubtotal) => {
    if (!coupon) return 0;
    if (currentSubtotal < coupon.minOrderValue) return 0;
    
    const isExpired = new Date(coupon.endDate) < new Date();
    const isLimitReached = coupon.usedCount >= coupon.usageLimit;
    if (coupon.status !== 'ACTIVE' || isExpired || isLimitReached) return 0;

    if (coupon.discountType === 'PERCENT') {
      let disc = (currentSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && disc > coupon.maxDiscountAmount) {
        disc = coupon.maxDiscountAmount;
      }
      return disc;
    } else {
      return coupon.discountValue;
    }
  };

  useEffect(() => {
    if (coupons.length > 0) {
      let maxDisc = 0;
      let best = null;
      coupons.forEach(c => {
        const disc = calculateDiscount(c, totalAmount);
        if (disc > maxDisc) {
          maxDisc = disc;
          best = c;
        }
      });
      if (best) {
        setBestCoupon(best);
        setCouponCode(best.code);
      }
    }
  }, [coupons, totalAmount]);

  const activeCouponObj = coupons.find(c => c.code === couponCode);
  const couponDiscount = calculateDiscount(activeCouponObj, totalAmount);

  const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
  const defaultAddress = savedAddresses[0] || '';
  const getShippingFee = (address, subtotal) => {
    if (subtotal >= 500000) return 0;
    if (!address) return 30000;
    const addrLower = address.toLowerCase();

    // 1. Nội tỉnh HCMC
    if (addrLower.includes('hồ chí minh') || addrLower.includes('hcm') || addrLower.includes('sài gòn') || addrLower.includes('sai gon')) {
      return 15000;
    }

    // 2. Miền Nam & Lân cận (BRVT, Đồng Nai, Bình Dương, Long An...)
    const southernProvinces = [
      'bình dương', 'binh duong', 'bình phước', 'binh phuoc', 'tây ninh', 'tay ninh', 
      'đồng nai', 'dong nai', 'bà rịa', 'ba ria', 'vũng tàu', 'vung tau', 'brvt',
      'long an', 'tiền giang', 'tien giang', 'bến tre', 'ben tre', 'trà vinh', 'tra vinh', 
      'vĩnh long', 'vinh long', 'đồng tháp', 'dong thap', 'an giang', 'kiên giang', 'kien giang', 
      'cần thơ', 'can tho', 'hậu giang', 'hau giang', 'sóc trăng', 'soc trang', 'bạc liêu', 'bac lieu', 
      'cà mau', 'ca mau'
    ];
    if (southernProvinces.some(p => addrLower.includes(p))) {
      return 25000;
    }

    // 3. Miền Bắc (Hà Nội, Hải Phòng...)
    const northernProvinces = [
      'hà nội', 'ha noi', 'hải phòng', 'hai phong', 'hải dương', 'hai duong', 'hưng yên', 'hung yen',
      'thái bình', 'thai binh', 'nam định', 'nam dinh', 'hà nam', 'ha nam', 'ninh bình', 'ninh binh',
      'vĩnh phúc', 'vinh phuc', 'bắc ninh', 'bac ninh', 'quảng ninh', 'quang ninh', 'lạng sơn', 'lang son',
      'cao bằng', 'cao bang', 'hà giang', 'ha giang', 'tuyên quang', 'tuyen quang', 'bắc kạn', 'bac kan',
      'thái nguyên', 'thai nguyen', 'phú thọ', 'phu tho', 'bắc giang', 'bac giang', 'lai châu', 'lai chau',
      'điện biên', 'dien bien', 'sơn la', 'son la', 'hòa bình', 'hoa binh', 'yên bái', 'yen bai', 'lào cai', 'lao cai'
    ];
    if (northernProvinces.some(p => addrLower.includes(p))) {
      return 45000;
    }

    // 4. Miền Trung / Tây Nguyên
    return 35000;
  };

  const shippingFee = getShippingFee(defaultAddress, totalAmount);
  const rewardPoints = user?.rewardPoints || 0;
  const maxPointsValue = rewardPoints * 1000;
  const remainingAfterCoupon = Math.max(0, totalAmount + shippingFee - couponDiscount);
  const pointsDiscount = usePoints ? Math.min(maxPointsValue, remainingAfterCoupon) : 0;
  const pointsUsed = usePoints ? Math.ceil(pointsDiscount / 1000) : 0;

  const total = Math.max(0, totalAmount + shippingFee - couponDiscount - pointsDiscount);

  const handleCheckoutRedirect = () => {
    if (!user) {
      showToast('Vui lòng đăng nhập trước khi tiến hành đặt hàng.', 'error');
      navigate('/login');
      return;
    }
    if (selectedItemIds.size === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm để thanh toán.', 'error');
      return;
    }
    let path = '/checkout';
    const params = [];
    if (couponCode.trim()) {
      params.push(`coupon=${encodeURIComponent(couponCode.trim())}`);
    }
    if (usePoints) {
      params.push(`usePoints=true`);
    }
    params.push(`cartItemIds=${Array.from(selectedItemIds).join(',')}`);
    
    if (params.length > 0) {
      path += `?${params.join('&')}`;
    }
    navigate(path);
  };

  if (cart.items.length === 0) {
    return (
      <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ 
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '60px 40px', 
          textAlign: 'center', 
          maxWidth: '480px',
          width: '100%'
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '20px' }}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '8px', color: '#111827' }}>Giỏ hàng trống</h2>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '28px' }}>
            Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy lướt xem các đầu sách hấp dẫn của chúng tôi!
          </p>
          <Link to="/" style={{ 
            display: 'inline-block',
            backgroundColor: '#0a422d',
            color: '#ffffff',
            padding: '12px 28px',
            borderRadius: '6px',
            fontWeight: 600,
            textDecoration: 'none'
          }}>
            Mua sắm ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', textAlign: 'left' }}>
      
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>Giỏ hàng của bạn</h2>
      <p style={{ color: '#6B7280', fontSize: '0.9rem', marginBottom: '24px' }}>
        Bạn có {cart.items.length} sản phẩm trong giỏ hàng
      </p>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* Cart Items List */}
        <div style={{ flex: '2 1 650px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Table Headers */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            padding: '0 20px 12px 20px', 
            borderBottom: '1px solid #e2e8f0', 
            color: '#4B5563', 
            fontSize: '0.75rem', 
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '16px',
            gap: '12px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: '2 1 0', textTransform: 'none' }}>
              <input 
                type="checkbox" 
                checked={isAllSelected}
                onChange={toggleSelectAll}
                style={{ 
                  width: '18px', 
                  height: '18px', 
                  cursor: 'pointer',
                  accentColor: '#10b981',
                  borderRadius: '4px'
                }}
              />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>Chọn tất cả ({cart.items.length})</span>
            </label>
            <div style={{ flex: '1 1 0', textAlign: 'right', color: '#9CA3AF' }}>GIÁ</div>
            <div style={{ flex: '1.2 1 0', textAlign: 'center', color: '#9CA3AF' }}>SỐ LƯỢNG</div>
            <div style={{ flex: '1 1 0', textAlign: 'right', color: '#9CA3AF' }}>TỔNG</div>
          </div>

          {/* Cards */}
          {cart.items.map(item => (
            <div 
              key={item.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: selectedItemIds.has(item.id) ? '#fbfdfc' : '#ffffff',
                borderRadius: '8px',
                border: selectedItemIds.has(item.id) ? '1px solid #10b981' : '1px solid #e2e8f0',
                padding: '20px',
                marginBottom: '16px',
                gap: '12px',
                transition: 'all 0.2s'
              }}
            >
              {/* Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox"
                  checked={selectedItemIds.has(item.id)}
                  onChange={() => toggleSelectItem(item.id)}
                  style={{ 
                    width: '18px', 
                    height: '18px', 
                    cursor: 'pointer',
                    accentColor: '#10b981',
                    borderRadius: '4px'
                  }}
                />
              </div>

              {/* Product (Image + Info) */}
              <div style={{ flex: '2 1 0', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ 
                  width: '80px', 
                  height: '110px', 
                  borderRadius: '6px', 
                  background: '#f4f5f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  flexShrink: 0
                }}>
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>UTEShop</span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', lineHeight: '1.4' }}>{item.product.name}</div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#ef4444', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      padding: 0,
                      width: 'fit-content'
                    }}
                  >
                    <Trash2 size={14} />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>

              {/* Price */}
              <div style={{ flex: '1 1 0', textAlign: 'right', fontWeight: 500, color: '#4b5563', fontSize: '0.95rem' }}>
                {formatPrice(item.product.price)}
              </div>

              {/* Quantity control */}
              <div style={{ flex: '1.2 1 0', display: 'flex', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f9fafb' }}>
                  <button 
                    onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                    style={{ padding: '6px 12px', background: 'none', color: '#4b5563', cursor: 'pointer' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ padding: '0 12px', fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                    style={{ padding: '6px 12px', background: 'none', color: '#4b5563', cursor: 'pointer' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div style={{ flex: '1 1 0', textAlign: 'right', fontWeight: 700, color: '#10b981', fontSize: '1rem' }}>
                {formatPrice(item.product.price * item.quantity)}
              </div>
            </div>
          ))}

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0056C6', fontWeight: 600, fontSize: '0.9rem' }}>
              <ArrowLeft size={16} />
              Tiếp tục mua sắm
            </Link>
            <button 
              onClick={clearCart}
              style={{ 
                backgroundColor: '#ffffff', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px', 
                padding: '8px 18px', 
                color: '#374151', 
                fontSize: '0.85rem', 
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              Xóa giỏ hàng
            </button>
          </div>

        </div>

        {/* Invoice Sidebar */}
        <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #e2e8f0', 
            padding: '24px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '20px' 
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>Tóm tắt đơn hàng</h3>

            {/* Invoice rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4b5563' }}>
                <span>Tạm tính</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{formatPrice(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#4b5563' }}>
                <span>Phí vận chuyển</span>
                <span style={{ fontWeight: 600, color: shippingFee === 0 ? '#10b981' : '#111827' }}>
                  {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                </span>
              </div>
              {couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981' }}>
                  <span>Giảm giá (Voucher)</span>
                  <span style={{ fontWeight: 600 }}>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              {pointsDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#10b981' }}>
                  <span>Dùng xu tích lũy ({pointsUsed} xu)</span>
                  <span style={{ fontWeight: 600 }}>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderTop: '1px solid #e2e8f0', 
                paddingTop: '16px', 
                marginTop: '8px' 
              }}>
                <span style={{ fontWeight: 600, color: '#111827', fontSize: '1rem' }}>Tổng cộng</span>
                <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.5rem' }}>
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* Checkout button */}
            <button 
              onClick={handleCheckoutRedirect}
              style={{ 
                width: '100%', 
                padding: '14px', 
                fontSize: '1rem', 
                fontWeight: 600, 
                backgroundColor: '#10b981', 
                color: 'white', 
                borderRadius: '6px', 
                border: 'none', 
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              Tiến hành thanh toán
            </button>

            {/* Reward Points inside summary */}
            {rewardPoints > 0 && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '10px'
              }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Coins size={16} style={{ color: '#166534' }} />
                    Dùng xu tích lũy
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#1b6b3e', marginTop: '2px' }}>
                    Có {rewardPoints} xu (-{formatPrice(maxPointsValue)})
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Dùng</span>
                </label>
              </div>
            )}

            {/* Promo code block */}
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', marginTop: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <input 
                  type="text" 
                  placeholder="Mã giảm giá..." 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ 
                    flex: 1, 
                    padding: '10px 12px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    fontSize: '0.85rem', 
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                />
                {couponCode && (
                  <button 
                    onClick={() => setCouponCode('')}
                    style={{ padding: '0 12px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#4b5563' }}
                  >
                    Xóa
                  </button>
                )}
              </div>

              {coupons.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#4b5563', marginBottom: '8px' }}>
                    Chọn mã giảm giá khả dụng:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {coupons.map(c => {
                      const isBest = bestCoupon && bestCoupon.id === c.id;
                      const discountVal = calculateDiscount(c, totalAmount);
                      const isEligible = discountVal > 0;

                      return (
                        <div 
                          key={c.id}
                          onClick={() => isEligible && setCouponCode(c.code)}
                          style={{
                            border: `1px solid ${couponCode === c.code ? '#10b981' : '#e5e7eb'}`,
                            backgroundColor: couponCode === c.code ? '#f0fdf4' : (isEligible ? '#fff' : '#f9fafb'),
                            borderRadius: '6px',
                            padding: '8px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: isEligible ? 'pointer' : 'not-allowed',
                            opacity: isEligible ? 1 : 0.6,
                            fontSize: '0.75rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontWeight: 700, color: '#0a422d', fontFamily: 'monospace' }}>
                                {c.code}
                              </span>
                              {isBest && (
                                <span style={{ fontSize: '0.6rem', color: '#ffffff', backgroundColor: '#ef4444', padding: '0 4px', borderRadius: '3px', fontWeight: 700 }}>
                                  Mã tốt nhất
                                </span>
                              )}
                            </div>
                            <div style={{ color: '#111827', marginTop: '2px', fontWeight: 600 }}>
                              {c.discountType === 'PERCENT' ? `Giảm ${c.discountValue}%` : `Giảm ${formatPrice(c.discountValue)}`}
                            </div>
                          </div>
                          <div>
                            {couponCode === c.code ? (
                              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Chọn</span>
                            ) : (
                              isEligible ? (
                                <span style={{ color: '#0a422d', fontWeight: 600 }}>Dùng</span>
                              ) : (
                                <span style={{ color: '#9ca3af' }}>KĐK</span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Shipping alert box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            backgroundColor: '#ffffff', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '16px 20px' 
          }}>
            <div style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-5.14a1 1 0 0 0-.29-.7L18.41 8.3a1 1 0 0 0-.7-.3H14"/><circle cx="7.5" cy="18" r="2.5"/><circle cx="16.5" cy="18" r="2.5"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#374151', textAlign: 'left' }}>Miễn phí giao hàng</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'left' }}>Đối với đơn hàng hơn 500.000đ</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
