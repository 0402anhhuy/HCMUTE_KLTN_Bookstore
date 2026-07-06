import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, MapPin, Truck, AlertTriangle, RefreshCcw, Star, X, CheckCircle, Package, ShoppingBag } from 'lucide-react';

const OrderHistory = () => {
  const { user, showToast } = useApp();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Expanded items loading cache
  const [orderItems, setOrderItems] = useState({});

  // Modals state
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnReason, setReturnReason] = useState('');

  const [reviewProduct, setReviewProduct] = useState(null); 
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const fetchedOrders = response.data || [];
      setOrders(fetchedOrders);
      // Pre-fetch items for all orders to make the UI look like a real eCommerce app (without needing to click "Expand")
      // In a real app this might be returned by the GET /orders API directly. 
      // Assuming they aren't, we fetch them here in parallel.
      const itemPromises = fetchedOrders.map(o => api.get(`/orders/${o.id}`).then(res => ({ id: o.id, items: res.data.items })));
      const itemsResponses = await Promise.all(itemPromises);
      const newItemsMap = {};
      itemsResponses.forEach(res => {
        newItemsMap[res.id] = res.items;
      });
      setOrderItems(newItemsMap);

    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    try {
      await api.post(`/orders/${cancelOrderId}/cancel?reason=${encodeURIComponent(cancelReason)}`);
      showToast('Đơn hàng đã được hủy thành công.', 'success');
      setCancelOrderId(null);
      setCancelReason('');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.error || 'Không thể hủy đơn hàng này.', 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) return;
    try {
      await api.post(`/orders/${returnOrderId}/return?reason=${encodeURIComponent(returnReason)}`);
      showToast('Yêu cầu đổi trả đã được gửi đi thành công.', 'success');
      setReturnOrderId(null);
      setReturnReason('');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.error || 'Gửi yêu cầu đổi trả thất bại.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    try {
      await api.post('/reviews', {
        productId: reviewProduct.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      showToast('Cảm ơn bạn đã gửi nhận xét đánh giá!', 'success');
      setReviewProduct(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      showToast(err.response?.data?.error || 'Gửi đánh giá không thành công.', 'error');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'preparing': return 'Đang đóng gói';
      case 'shipping': return 'Đang vận chuyển';
      case 'delivered': return 'Giao hàng thành công';
      case 'cancelled': return 'Đã hủy';
      case 'cancel_requested': return 'Yêu cầu đổi trả';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': 
      case 'preparing':
      case 'shipping': return '#3b82f6';
      case 'delivered': return '#10b981';
      case 'cancelled': 
      case 'refunded': return '#ef4444';
      case 'cancel_requested': return '#f97316';
      default: return '#6b7280';
    }
  };

  const isReturnable = (order) => {
    if (order.status !== 'delivered') return false;
    const createdDate = new Date(order.createdAt);
    const diffTime = Math.abs(new Date() - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const tabs = [
    { id: 'ALL', label: 'Tất cả' },
    { id: 'pending', label: 'Chờ xác nhận' },
    { id: 'shipping', label: 'Đang giao' },
    { id: 'delivered', label: 'Hoàn thành' },
    { id: 'cancelled', label: 'Đã hủy' }
  ];

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'shipping' && (o.status === 'confirmed' || o.status === 'preparing' || o.status === 'shipping')) return true;
    return o.status === activeTab;
  });

  if (!user) {
    return (
      <div className="page-container animate-fade-in" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ color: '#111827', marginBottom: '10px' }}>Vui lòng đăng nhập</h2>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>Bạn cần đăng nhập để xem lịch sử mua hàng.</p>
        <Link to="/login" style={{ padding: '10px 24px', backgroundColor: '#0a422d', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
      
      <div style={{ marginBottom: '24px', marginTop: '10px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0a422d', margin: '0 0 6px 0' }}>Đơn hàng của tôi</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', margin: 0 }}>Quản lý và theo dõi trạng thái các đơn hàng bạn đã đặt.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #0a422d' : '2px solid transparent',
              color: activeTab === tab.id ? '#0a422d' : '#6b7280',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#6b7280' }}>Đang tải lịch sử đơn hàng...</div>
      ) : filteredOrders.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
          <ShoppingBag size={48} style={{ color: '#d1d5db', margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#374151', marginBottom: '8px' }}>Chưa có đơn hàng nào</h3>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '24px' }}>Bạn chưa có đơn hàng nào trong trạng thái này.</p>
          <Link to="/catalog" style={{ padding: '10px 24px', backgroundColor: '#0a422d', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 600 }}>Tiếp tục mua sắm</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, color: '#111827' }}>Mã đơn: #{order.id}</span>
                  <span style={{ color: '#d1d5db' }}>|</span>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {formatDate(order.createdAt)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getStatusColor(order.status), fontWeight: 600, fontSize: '0.9rem' }}>
                  {order.status === 'delivered' ? <CheckCircle size={16} /> : order.status === 'shipping' ? <Truck size={16} /> : <Package size={16} />}
                  {getStatusText(order.status).toUpperCase()}
                </div>
              </div>

              {/* Order Items */}
              <div style={{ padding: '20px' }}>
                {orderItems[order.id] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {orderItems[order.id].map((item, idx) => (
                      <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: idx !== orderItems[order.id].length - 1 ? '16px' : '0', borderBottom: idx !== orderItems[order.id].length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                        <div style={{ width: '60px', height: '80px', backgroundColor: '#f3f4f6', borderRadius: '6px', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                          {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>{item.product?.name || 'Sách đã bị xóa'}</h4>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '8px' }}>Phân loại: Sách bìa mềm</div>
                          <div style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>x{item.quantity}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{formatPrice(item.subtotal)}</div>
                          {order.status === 'delivered' && (
                            <button 
                              onClick={() => setReviewProduct({ id: item.product.id, name: item.product.name })}
                              style={{ marginTop: '8px', padding: '6px 12px', border: '1px solid #0a422d', backgroundColor: '#fff', color: '#0a422d', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Đánh giá
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Đang tải sản phẩm...</div>
                )}
              </div>

              {/* Order Footer & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid #f3f4f6', backgroundColor: '#fdfdfd' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Thanh toán: <span style={{ fontWeight: 600, color: '#374151' }}>{order.paymentMethod === 'VNPAY' ? 'VNPay' : 'COD'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Thành tiền:</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0a422d' }}>{formatPrice(order.finalAmount)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(order.status === 'pending' || order.status === 'confirmed') && (
                      <button 
                        onClick={() => setCancelOrderId(order.id)}
                        style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Hủy đơn
                      </button>
                    )}
                    {isReturnable(order) && (
                      <button 
                        onClick={() => setReturnOrderId(order.id)}
                        style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                      >
                        Đổi trả
                      </button>
                    )}

                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CANCEL MODAL */}
      {cancelOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Hủy đơn hàng #{cancelOrderId}</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>Bạn có chắc chắn muốn hủy đơn hàng này? Vui lòng nhập lý do.</p>
            <form onSubmit={handleCancelSubmit}>
              <textarea 
                rows={3} 
                placeholder="Lý do hủy đơn..." 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '20px', resize: 'none', outline: 'none' }}
                required
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setCancelOrderId(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Bỏ qua</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Xác nhận hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnOrderId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Yêu cầu đổi trả</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px' }}>Yêu cầu hoàn trả chỉ áp dụng trong 7 ngày. Nhập lý do chi tiết.</p>
            <form onSubmit={handleReturnSubmit}>
              <textarea 
                rows={3} 
                placeholder="Lý do đổi trả..." 
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '20px', resize: 'none', outline: 'none' }}
                required
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setReturnOrderId(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Bỏ qua</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>Gửi yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setReviewProduct(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20}/></button>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', marginBottom: '4px', textAlign: 'center' }}>Đánh giá sản phẩm</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '20px', textAlign: 'center' }}>{reviewProduct.name}</p>
            <form onSubmit={handleReviewSubmit}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" onClick={() => setReviewRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: star <= reviewRating ? '#f59e0b' : '#d1d5db' }}>
                    <Star size={32} fill="currentColor" stroke="none" />
                  </button>
                ))}
              </div>
              <textarea 
                rows={4} 
                placeholder="Chia sẻ nhận xét của bạn..." 
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', boxSizing: 'border-box', marginBottom: '20px', resize: 'none', outline: 'none' }}
                required
              />
              <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#0a422d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Gửi đánh giá</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default OrderHistory;
