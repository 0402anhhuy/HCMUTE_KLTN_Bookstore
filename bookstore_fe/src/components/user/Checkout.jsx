import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { MapPin, CreditCard, ShoppingBag, Truck, ChevronRight, Banknote, Wallet, Ticket, Coins } from 'lucide-react';

const Checkout = () => {
  const { user, cart, fetchCart, showToast, reloadUserProfile } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialCoupon = searchParams.get('coupon') || '';
  const productId = searchParams.get('productId');
  const qty = parseInt(searchParams.get('qty') || '1', 10);

  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [fetchingProduct, setFetchingProduct] = useState(!!productId);

  // User's saved addresses
  const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
  if (savedAddresses.length === 0) {
    savedAddresses.push('Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam');
  }

  const [selectedAddressIdx, setSelectedAddressIdx] = useState(0);
  const [customAddress, setCustomAddress] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [coupons, setCoupons] = useState([]);
  const [usePoints, setUsePoints] = useState(searchParams.get('usePoints') === 'true');
  const [bestCoupon, setBestCoupon] = useState(null);
  const [recipientPhone, setRecipientPhone] = useState('');

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

  useEffect(() => {
    if (user) {
      setRecipientPhone(user.phone || '');
    }
    if (savedAddresses.length === 0) setUseCustomAddress(true);
  }, [user]);

  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          const res = await api.get(`/products/${productId}`);
          setBuyNowProduct(res.data);
        } catch (err) {
          console.error("Failed to fetch buy-now product details", err);
          setError("Không thể tải thông tin sản phẩm mua ngay.");
        } finally {
          setFetchingProduct(false);
        }
      };
      fetchProduct();
    }
  }, [productId]);

  const shippingAddress = useCustomAddress
    ? customAddress
    : (savedAddresses[selectedAddressIdx] || '');

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const cartItemIdsParam = searchParams.get('cartItemIds') || '';
  const selectedCartItemIds = cartItemIdsParam ? cartItemIdsParam.split(',').map(Number) : [];

  const checkoutItems = buyNowProduct 
    ? [] 
    : (selectedCartItemIds.length > 0 
        ? cart.items.filter(item => selectedCartItemIds.includes(item.id)) 
        : cart.items);

  const subtotal = buyNowProduct
    ? buyNowProduct.price * qty
    : checkoutItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const getShippingFee = (address, amt) => {
    if (amt >= 500000) return 0;
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

  const shippingFee = getShippingFee(shippingAddress, subtotal);

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
        const disc = calculateDiscount(c, subtotal);
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
  }, [coupons, subtotal]);

  const activeCouponObj = coupons.find(c => c.code === couponCode);
  const couponDiscount = calculateDiscount(activeCouponObj, subtotal);

  const rewardPoints = user?.rewardPoints || 0;
  const maxPointsValue = rewardPoints * 1000;
  const remainingAfterCoupon = Math.max(0, subtotal + shippingFee - couponDiscount);
  const pointsDiscount = usePoints ? Math.min(maxPointsValue, remainingAfterCoupon) : 0;
  const pointsUsed = usePoints ? Math.ceil(pointsDiscount / 1000) : 0;

  const total = Math.max(0, subtotal + shippingFee - couponDiscount - pointsDiscount);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError('Vui lòng chọn hoặc nhập địa chỉ nhận hàng.');
      return;
    }
    if (paymentMethod === 'WALLET' && (user?.walletBalance || 0) < total) {
      setError('Số dư ví không đủ để thanh toán đơn hàng này. Vui lòng nạp thêm tiền hoặc chọn phương thức khác.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        shippingAddress: shippingAddress.trim(),
        recipientPhone: recipientPhone.trim(),
        paymentMethod,
        couponCode: couponCode.trim() || null,
        usePoints,
        ...(productId ? { productId: Number(productId), quantity: qty } : { cartItemIds: selectedCartItemIds })
      };
      const response = await api.post('/orders/checkout', payload);
      await fetchCart();
      await reloadUserProfile();
      if (paymentMethod === 'VNPAY' && response.data.paymentUrl) {
        window.location.href = response.data.paymentUrl;
      } else {
        showToast('Đặt hàng thành công! Cảm ơn quý khách.', 'success');
        navigate('/orders');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#6b7280' }}>Vui lòng <Link to="/login" style={{ color: '#0056C6', fontWeight: 600 }}>đăng nhập</Link> để tiếp tục thanh toán.</p>
    </div>
  );

  if (fetchingProduct) return (
    <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#6b7280' }}>Đang tải thông tin sản phẩm...</p>
    </div>
  );

  if (!productId && cart.items.length === 0) return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <ShoppingBag size={48} style={{ color: '#9CA3AF' }} />
      <p style={{ color: '#6b7280' }}>Giỏ hàng của bạn đang trống.</p>
      <Link to="/" style={{ backgroundColor: '#0a422d', color: '#fff', padding: '10px 24px', borderRadius: '6px', fontWeight: 600 }}>Quay lại trang chủ</Link>
    </div>
  );

  const paymentOptions = [
    { value: 'COD', label: 'COD', desc: 'Thanh toán khi nhận hàng', icon: <Banknote size={24} style={{ color: '#0a422d' }} /> },
    { value: 'VNPAY', label: 'VNPay', desc: 'Thanh toán qua VNPay', icon: <CreditCard size={24} style={{ color: '#0a422d' }} /> },
    { value: 'WALLET', label: 'Ví điện tử', desc: `Số dư: ${formatPrice(user?.walletBalance || 0)}`, icon: <Wallet size={24} style={{ color: '#0a422d' }} /> },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', textAlign: 'left' }}>

      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#9CA3AF', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/cart" style={{ color: '#9CA3AF', textDecoration: 'none' }}>Giỏ hàng</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#374151', fontWeight: 600 }}>Thanh toán</span>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0', marginBottom: '36px' }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>1</div>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Giao hàng</span>
        </div>
        <div style={{ width: '80px', height: '2px', backgroundColor: '#e5e7eb', margin: '0 4px', marginBottom: '18px' }} />
        {/* Step 2 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #9CA3AF', color: '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', backgroundColor: '#fff' }}>2</div>
          <span style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 500 }}>Thanh toán</span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fee2e2', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePlaceOrder} style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT: Form */}
        <div style={{ flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Section 1: Customer info (read-only) */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <Truck size={20} style={{ color: '#0a422d' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Thông tin giao hàng</h3>
            </div>

            {/* Tên (Họ và tên) (from user account) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Họ và tên</label>
              <input
                type="text"
                value={user.fullName || ''}
                readOnly
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: '#f9fafb', color: '#374151', boxSizing: 'border-box' }}
              />
            </div>

            {/* Phone (contact for delivery) */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>Số điện thoại nhận hàng</label>
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Nhập số điện thoại nhận hàng..."
                required
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Address selection */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '10px' }}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                Địa chỉ nhận hàng
              </label>

              {/* Saved addresses */}
              {savedAddresses.map((addr, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelectedAddressIdx(idx); setUseCustomAddress(false); }}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px 14px', border: `1.5px solid ${!useCustomAddress && selectedAddressIdx === idx ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '8px', cursor: 'pointer', marginBottom: '10px',
                    backgroundColor: !useCustomAddress && selectedAddressIdx === idx ? '#f0fdf4' : '#fff',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    checked={!useCustomAddress && selectedAddressIdx === idx}
                    onChange={() => { setSelectedAddressIdx(idx); setUseCustomAddress(false); }}
                    style={{ marginTop: '2px', accentColor: '#10b981' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#111827' }}>
                      {idx === 0 ? 'Địa chỉ mặc định' : `Địa chỉ ${idx}`}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '2px' }}>{addr}</div>
                  </div>
                </div>
              ))}

              {/* Option: use different address */}
              <div
                onClick={() => setUseCustomAddress(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', border: `1.5px solid ${useCustomAddress ? '#10b981' : '#e5e7eb'}`,
                  borderRadius: '8px', cursor: 'pointer', marginBottom: '10px',
                  backgroundColor: useCustomAddress ? '#f0fdf4' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                <input
                  type="radio"
                  checked={useCustomAddress}
                  onChange={() => setUseCustomAddress(true)}
                  style={{ accentColor: '#10b981' }}
                />
                <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#374151' }}>Giao đến địa chỉ khác</span>
              </div>

              {useCustomAddress && (
                <input
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng cụ thể..."
                  value={customAddress}
                  onChange={(e) => setCustomAddress(e.target.value)}
                  required={useCustomAddress}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              )}
            </div>
          </div>

          {/* Section 2: Payment method */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
              <CreditCard size={20} style={{ color: '#0a422d' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0 }}>Phương thức thanh toán</h3>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {paymentOptions.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setPaymentMethod(opt.value)}
                  style={{
                    flex: '1 1 120px', padding: '16px 12px', border: `2px solid ${paymentMethod === opt.value ? '#10b981' : '#e5e7eb'}`,
                    borderRadius: '10px', cursor: 'pointer', textAlign: 'center',
                    backgroundColor: paymentMethod === opt.value ? '#f0fdf4' : '#fafafa',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>{opt.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>{opt.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>{opt.desc}</div>
                </div>
              ))}
            </div>
            {paymentMethod === 'WALLET' && (user?.walletBalance || 0) < total && (
              <div style={{
                marginTop: '16px',
                padding: '12px 14px',
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#be123c',
                fontWeight: 600,
                lineHeight: '1.5'
              }}>
                ⚠️ Số dư ví hiện tại ({formatPrice(user?.walletBalance || 0)}) không đủ để thanh toán đơn hàng này ({formatPrice(total)}). Vui lòng nạp thêm tiền hoặc chọn phương thức thanh toán khác.
              </div>
            )}
          </div>

        </div>

        {/* RIGHT: Order summary */}
        <div style={{ flex: '1 1 340px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                Tóm tắt đơn hàng
              </h3>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
                {buyNowProduct ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '50px', height: '66px', borderRadius: '4px', background: '#f3f4f6', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                      {buyNowProduct.imageUrl && <img src={buyNowProduct.imageUrl} alt={buyNowProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{buyNowProduct.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>Số lượng: {qty}</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap' }}>{formatPrice(buyNowProduct.price * qty)}</div>
                  </div>
                ) : (
                  checkoutItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '66px', borderRadius: '4px', background: '#f3f4f6', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                        {item.product.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>Số lượng: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', whiteSpace: 'nowrap' }}>{formatPrice(item.product.price * item.quantity)}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Totals */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f3f4f6', paddingTop: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                  <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#6b7280' }}>
                  <span>Vận chuyển</span>
                  <span style={{ color: shippingFee === 0 ? '#10b981' : '#111827' }}>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Giảm giá (Voucher)</span><span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {pointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Dùng xu tích lũy ({pointsUsed} xu)</span><span>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', color: '#111827', borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '4px' }}>
                  <span>Tổng cộng</span><span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e2e8f0' }} />

            {/* Reward Points inside summary */}
            {rewardPoints > 0 && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
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

            {/* Voucher input & list inside summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ticket size={16} style={{ color: '#0a422d' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>Mã giảm giá (Voucher)</span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã giảm giá..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flex: 1, padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.8rem', outline: 'none' }}
                />
                {couponCode && (
                  <button
                    type="button"
                    onClick={() => setCouponCode('')}
                    style={{ padding: '0 10px', background: '#f3f4f6', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', color: '#4b5563' }}
                  >
                    Xóa
                  </button>
                )}
              </div>

              {coupons.length > 0 ? (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563', marginBottom: '6px' }}>
                    Chọn mã giảm giá khả dụng:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                    {coupons.map(c => {
                      const isBest = bestCoupon && bestCoupon.id === c.id;
                      const discountVal = calculateDiscount(c, subtotal);
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
                                  Tốt nhất
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
              ) : (
                <div style={{ fontSize: '0.7rem', color: '#6b7280', fontStyle: 'italic' }}>
                  Mua sách tích điểm để nhận thêm nhiều ưu đãi!
                </div>
              )}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #e2e8f0' }} />

            {/* Checkout Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'background-color 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#059669'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#10b981'; }}
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
            </button>

            <Link to="/cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', color: '#6b7280', textDecoration: 'none' }}>
              ← Quay lại giỏ hàng
            </Link>

          </div>
        </div>

      </form>
    </div>
  );
};

export default Checkout;
