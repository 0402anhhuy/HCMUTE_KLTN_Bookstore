import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, MapPin, CreditCard, Truck, AlertTriangle, RefreshCcw, Star, X, CheckCircle, Package, ShoppingBag, Clock } from 'lucide-react';

const OrderHistory = () => {
  const { user, showToast, reloadUserProfile } = useApp();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Expanded items loading cache
  const [orderItems, setOrderItems] = useState({});

  // Modals state
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnType, setReturnType] = useState('RETURN_REFUND');
  const [returnReasonCategory, setReturnReasonCategory] = useState('Sách bị hỏng/rách trong quá trình vận chuyển');
  const [returnReasonDetail, setReturnReasonDetail] = useState('');
  const [evidenceImages, setEvidenceImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [reviewProduct, setReviewProduct] = useState(null); 
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [activeReturnRequest, setActiveReturnRequest] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState('');
  const [editPhoneValue, setEditPhoneValue] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    const handleOrderUpdated = (event) => {
      const { orderId } = event.detail || {};
      setTimeout(async () => {
        try {
          const response = await api.get('/orders');
          const fetchedOrders = (response.data || []).sort((a, b) => b.id - a.id);
          setOrders(fetchedOrders);
          
          const itemPromises = fetchedOrders.map(o => api.get(`/orders/${o.id}`).then(res => ({ id: o.id, items: res.data.items })));
          const itemsResponses = await Promise.all(itemPromises);
          const newItemsMap = {};
          itemsResponses.forEach(res => {
            newItemsMap[res.id] = res.items;
          });
          setOrderItems(newItemsMap);

          if (selectedOrderDetail && selectedOrderDetail.id === orderId) {
            const updatedOrder = fetchedOrders.find(o => o.id === orderId);
            if (updatedOrder) {
              setSelectedOrderDetail(updatedOrder);
              if (updatedOrder.status === 'cancel_requested' || updatedOrder.status === 'refunded') {
                const res = await api.get(`/orders/${orderId}/return`);
                setActiveReturnRequest(res.data);
              } else {
                setActiveReturnRequest(null);
              }
            }
          }
          reloadUserProfile();
        } catch (err) {
          console.error('Error auto-refreshing order list/details:', err);
        }
      }, 300);
    };

    window.addEventListener('order-updated', handleOrderUpdated);
    return () => {
      window.removeEventListener('order-updated', handleOrderUpdated);
    };
  }, [selectedOrderDetail]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders');
      const fetchedOrders = (response.data || []).sort((a, b) => b.id - a.id);
      setOrders(fetchedOrders);
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
      reloadUserProfile();
    } catch (err) {
      showToast(err.response?.data?.error || 'Không thể hủy đơn hàng này.', 'error');
    }
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newUrl = response.data.url;
      setEvidenceImages(prev => [...prev, newUrl]);
      showToast('Tải ảnh minh chứng thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Lỗi khi tải ảnh minh chứng!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveEvidence = (index) => {
    setEvidenceImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    const finalReason = `[${returnReasonCategory}] ${returnReasonDetail.trim()}`;
    const imagesStr = evidenceImages.join(' || ');
    try {
      await api.post(`/orders/${returnOrderId}/return?reason=${encodeURIComponent(finalReason)}&returnType=${returnType}&evidenceImages=${encodeURIComponent(imagesStr)}`);
      showToast('Yêu cầu đổi trả đã được gửi đi thành công.', 'success');
      setReturnOrderId(null);
      setReturnReasonDetail('');
      setEvidenceImages([]);
      setReturnType('RETURN_REFUND');
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.error || 'Gửi yêu cầu đổi trả thất bại.', 'error');
    }
  };

  const handleOpenDetails = async (order) => {
    setSelectedOrderDetail(order);
    setActiveReturnRequest(null);
    setIsEditingAddress(false);
    setEditAddressValue(order.shippingAddress || '');
    setEditPhoneValue(order.recipientPhone || order.user?.phone || '');
    if (order.status === 'cancel_requested' || order.status === 'refunded') {
      try {
        const res = await api.get(`/orders/${order.id}/return`);
        setActiveReturnRequest(res.data);
      } catch (err) {
        console.error('Failed to load return request details:', err);
      }
    }
  };

  const handleUpdateAddress = async () => {
    if (!editAddressValue.trim()) return;
    try {
      await api.put(`/orders/${selectedOrderDetail.id}/address?address=${encodeURIComponent(editAddressValue.trim())}&phone=${encodeURIComponent(editPhoneValue.trim())}`);
      showToast('Cập nhật địa chỉ nhận hàng thành công.', 'success');
      setSelectedOrderDetail(prev => ({ 
        ...prev, 
        shippingAddress: editAddressValue.trim(),
        recipientPhone: editPhoneValue.trim()
      }));
      setIsEditingAddress(false);
      fetchOrders();
    } catch (err) {
      showToast(err.response?.data?.error || 'Cập nhật địa chỉ thất bại.', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    try {
      await api.post('/reviews', {
        orderId: reviewProduct.orderId,
        productId: reviewProduct.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      showToast('Cảm ơn bạn đã gửi nhận xét đánh giá! (+10 điểm tích lũy)', 'success');
      setReviewProduct(null);
      setReviewComment('');
      setReviewRating(5);
      await reloadUserProfile();
      fetchOrders();
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
    return diffDays <= 30;
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
    <>
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
                            item.reviewed ? (
                              <button 
                                disabled
                                style={{ marginTop: '8px', padding: '6px 12px', border: '1px solid #d1d5db', backgroundColor: '#f3f4f6', color: '#9ca3af', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'not-allowed' }}
                              >
                                Đã đánh giá
                              </button>
                            ) : (
                              <button 
                                onClick={() => setReviewProduct({ id: item.product.id, name: item.product.name, orderId: order.id })}
                                style={{ marginTop: '8px', padding: '6px 12px', border: '1px solid #0a422d', backgroundColor: '#fff', color: '#0a422d', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                              >
                                Đánh giá
                              </button>
                            )
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
                  Thanh toán: <span style={{ fontWeight: 600, color: '#374151' }}>{order.paymentMethod === 'VNPAY' ? 'VNPay' : (order.paymentMethod === 'WALLET' ? 'Ví điện tử' : 'COD')}</span>
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
                    <button 
                      onClick={() => handleOpenDetails(order)}
                      style={{ padding: '8px 16px', backgroundColor: '#fff', color: '#0a422d', border: '1px solid #0a422d', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
      </div>

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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0a422d', marginBottom: '8px' }}>Yêu cầu đổi trả đơn hàng #{returnOrderId}</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '20px' }}>Yêu cầu đổi trả hợp lệ trong 07 ngày kể từ khi nhận hàng. Vui lòng cung cấp đầy đủ thông tin và hình ảnh minh chứng lỗi để được duyệt nhanh nhất.</p>
            <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bạn muốn đổi hay trả hàng?</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => setReturnType('RETURN_REFUND')} 
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: returnType === 'RETURN_REFUND' ? '2px solid #0a422d' : '1px solid #d1d5db', 
                      backgroundColor: returnType === 'RETURN_REFUND' ? '#ecfdf5' : '#fff', 
                      color: returnType === 'RETURN_REFUND' ? '#0a422d' : '#374151',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Trả hàng & Hoàn tiền
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReturnType('EXCHANGE')} 
                    style={{ 
                      flex: 1, 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: returnType === 'EXCHANGE' ? '2px solid #0a422d' : '1px solid #d1d5db', 
                      backgroundColor: returnType === 'EXCHANGE' ? '#ecfdf5' : '#fff', 
                      color: returnType === 'EXCHANGE' ? '#0a422d' : '#374151',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Đổi sản phẩm mới
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nhóm lý do *</label>
                <select 
                  value={returnReasonCategory}
                  onChange={(e) => setReturnReasonCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', backgroundColor: '#fff', fontSize: '0.9rem' }}
                  required
                >
                  <option value="Sách bị hỏng/rách trong quá trình vận chuyển">Sách bị hỏng/rách trong quá trình vận chuyển</option>
                  <option value="Giao sai sách (không đúng tựa đề, tập sách...)">Giao sai sách (không đúng tựa đề, tập sách...)</option>
                  <option value="Chất lượng in ấn kém (mất trang, chữ bị nhòe mờ)">Chất lượng in ấn kém (mất trang, chữ bị nhòe mờ)</option>
                  <option value="Sách giả, không giống mô tả">Sách giả, không giống mô tả</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Mô tả chi tiết lỗi *</label>
                <textarea 
                  rows={3} 
                  placeholder="Vui lòng cung cấp chi tiết như: trang bị lỗi, chỗ rách, sai sách thế nào..." 
                  value={returnReasonDetail}
                  onChange={(e) => setReturnReasonDetail(e.target.value)}
                  style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'none', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hình ảnh minh chứng *</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                    display: 'inline-block'
                  }}>
                    Tải ảnh lên
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleEvidenceUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                  {uploadingImage && <span style={{ fontSize: '0.8rem', color: '#0a422d' }}>Đang tải lên...</span>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {evidenceImages.map((url, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                      <img src={url} alt="Minh chứng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEvidence(idx)} 
                        style={{ position: 'absolute', top: '2px', right: '2px', backgroundColor: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => { setReturnOrderId(null); setEvidenceImages([]); }} style={{ flex: 1, padding: '12px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Bỏ qua</button>
                <button type="submit" disabled={evidenceImages.length === 0} style={{ flex: 1, padding: '12px', backgroundColor: evidenceImages.length === 0 ? '#9ca3af' : '#0a422d', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: evidenceImages.length === 0 ? 'not-allowed' : 'pointer' }}>Gửi yêu cầu</button>
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

      {/* ORDER DETAILS MODAL */}
      {selectedOrderDetail && (() => {
        const order = selectedOrderDetail;
        const items = orderItems[order.id] || [];
        const pointsDiscount = order.pointsDiscount || 0;
        const couponDiscount = Math.max(0, (order.discountAmount || 0) - pointsDiscount);

        return (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '580px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', maxHeight: '90vh', overflowY: 'auto' }}>
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedOrderDetail(null)} 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}
              >
                <X size={22}/>
              </button>

              {/* Title & Status */}
              <div style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>Chi tiết đơn hàng #{order.id}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13}/> {formatDate(order.createdAt)}</span>
                  <span style={{ color: '#d1d5db' }}>|</span>
                  <span style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: 700, 
                    color: getStatusColor(order.status),
                    backgroundColor: getStatusColor(order.status) + '15',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              </div>

              {/* Info Blocks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', fontSize: '0.9rem', color: '#374151' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={16} style={{ color: '#0a422d', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>Thông tin nhận hàng</div>
                      {order.status === 'pending' && !isEditingAddress && (
                        <button 
                          onClick={() => {
                            setEditAddressValue(order.shippingAddress || '');
                            setEditPhoneValue(order.recipientPhone || order.user?.phone || '');
                            setIsEditingAddress(true);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0a422d',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Chỉnh sửa
                        </button>
                      )}
                    </div>
                    {isEditingAddress ? (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Địa chỉ nhận hàng</label>
                          <input 
                            type="text" 
                            value={editAddressValue}
                            onChange={(e) => setEditAddressValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                              marginTop: '2px'
                            }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4b5563' }}>Số điện thoại nhận hàng</label>
                          <input 
                            type="text" 
                            value={editPhoneValue}
                            onChange={(e) => setEditPhoneValue(e.target.value)}
                            style={{
                              width: '100%',
                              padding: '6px 10px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              outline: 'none',
                              boxSizing: 'border-box',
                              marginTop: '2px'
                            }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button 
                            onClick={() => setIsEditingAddress(false)}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Hủy
                          </button>
                          <button 
                            onClick={handleUpdateAddress}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: '#0a422d',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.85rem', marginTop: '4px', lineHeight: '1.5' }}>
                        <div style={{ color: '#4b5563' }}><span style={{ fontWeight: 500 }}>Địa chỉ:</span> {order.shippingAddress}</div>
                        <div style={{ color: '#4b5563', marginTop: '2px' }}><span style={{ fontWeight: 500 }}>SĐT:</span> {order.recipientPhone || order.user?.phone || 'Chưa cập nhật'}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CreditCard size={16} style={{ color: '#0a422d', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#111827' }}>Phương thức thanh toán</div>
                    <div style={{ color: '#4b5563', fontSize: '0.85rem', marginTop: '2px' }}>
                      {order.paymentMethod === 'VNPAY' ? 'Thanh toán trực tuyến VNPay' : 'Thanh toán khi nhận hàng (COD)'}
                    </div>
                  </div>
                </div>

                {order.cancelledReason && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '10px 14px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <AlertTriangle size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                    <div>
                      <div style={{ fontWeight: 600, color: '#991b1b' }}>Lý do hủy / từ chối</div>
                      <div style={{ color: '#b91c1c', fontSize: '0.85rem', marginTop: '2px' }}>{order.cancelledReason}</div>
                    </div>
                  </div>
                )}

                {activeReturnRequest && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '10px', border: '1px solid #fef3c7' }}>
                    <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ width: '100%' }}>
                      <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.925rem' }}>Yêu cầu đổi trả ({activeReturnRequest.returnType === 'EXCHANGE' ? 'Đổi hàng mới' : 'Trả hàng hoàn tiền'})</div>
                      <div style={{ color: '#78350f', fontSize: '0.85rem', marginTop: '6px', lineHeight: '1.4' }}>
                        <strong>Lý do:</strong> {activeReturnRequest.reason}
                      </div>
                      <div style={{ color: '#78350f', fontSize: '0.85rem', marginTop: '4px' }}>
                        <strong>Trạng thái yêu cầu:</strong>{' '}
                        <span style={{ 
                          fontWeight: 700, 
                          color: activeReturnRequest.status === 'PENDING' ? '#d97706' : activeReturnRequest.status === 'APPROVED' ? '#10b981' : '#ef4444' 
                        }}>
                          {activeReturnRequest.status === 'PENDING' ? 'Chờ duyệt' : activeReturnRequest.status === 'APPROVED' ? 'Đã duyệt' : 'Bị từ chối'}
                        </span>
                      </div>
                      
                      {activeReturnRequest.rejectedReason && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px' }}>
                          <strong>Lý do từ chối:</strong> {activeReturnRequest.rejectedReason}
                        </div>
                      )}

                      {activeReturnRequest.evidenceImages && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ fontWeight: 600, color: '#78350f', fontSize: '0.8rem', marginBottom: '4px' }}>Ảnh minh chứng:</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {activeReturnRequest.evidenceImages.split(' || ').map((img, i) => (
                              <a key={i} href={img} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #fcd34d' }}>
                                <img src={img} alt="Minh chứng" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline Trạng Thái Đơn Hàng */}
              {(() => {
                const isCancelled = order.status === 'cancelled';
                const isRefunded = order.status === 'refunded';

                const steps = [
                  { label: 'Đặt hàng thành công', time: order.createdAt, done: true, icon: ShoppingBag, color: '#10b981' }
                ];

                if (order.confirmedAt) {
                  steps.push({ label: 'Đã xác nhận', time: order.confirmedAt, done: true, icon: CheckCircle, color: '#10b981' });
                } else if (!isCancelled && !isRefunded) {
                  steps.push({ label: 'Đã xác nhận', time: null, done: false, icon: CheckCircle, color: '#cbd5e1' });
                }

                if (order.preparingAt) {
                  steps.push({ label: 'Đang chuẩn bị', time: order.preparingAt, done: true, icon: Package, color: '#10b981' });
                } else if (!isCancelled && !isRefunded) {
                  steps.push({ label: 'Đang chuẩn bị', time: null, done: false, icon: Package, color: '#cbd5e1' });
                }

                if (order.shippingAt) {
                  steps.push({ label: 'Đang giao hàng', time: order.shippingAt, done: true, icon: Truck, color: '#10b981' });
                } else if (!isCancelled && !isRefunded) {
                  steps.push({ label: 'Đang giao hàng', time: null, done: false, icon: Truck, color: '#cbd5e1' });
                }

                if (isCancelled) {
                  steps.push({ label: 'Đã hủy', time: order.cancelledAt, done: true, icon: X, color: '#ef4444', isError: true });
                } else if (isRefunded) {
                  if (order.deliveredAt) {
                    steps.push({ label: 'Đã giao hàng', time: order.deliveredAt, done: true, icon: CheckCircle, color: '#10b981' });
                  }
                  steps.push({ label: 'Đã hoàn tiền', time: order.refundedAt, done: true, icon: RefreshCcw, color: '#6366f1', isRefunded: true });
                } else {
                  steps.push({ label: 'Đã giao hàng', time: order.deliveredAt, done: !!order.deliveredAt, icon: CheckCircle, color: '#10b981' });
                }

                // Find index of the last completed step
                let lastDoneIndex = 0;
                for (let i = steps.length - 1; i >= 0; i--) {
                  if (steps[i].done) {
                    lastDoneIndex = i;
                    break;
                  }
                }
                const totalSegments = steps.length - 1;
                const activeProgressPercent = totalSegments > 0 ? (lastDoneIndex / totalSegments) * 100 : 0;

                return (
                  <div style={{ 
                    marginBottom: '32px', 
                    backgroundColor: '#f8fafc', 
                    borderRadius: '16px', 
                    padding: '24px 16px', 
                    border: '1px solid #e2e8f0' 
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={16} style={{ color: '#0a422d' }} />
                      Theo dõi trạng thái đơn hàng
                    </div>
                    
                    {/* Stepper Progress Bar Row */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start', 
                      position: 'relative',
                      width: '100%'
                    }}>
                      
                      {/* Progress Line Background */}
                      <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: `${100 / (steps.length * 2)}%`,
                        right: `${100 / (steps.length * 2)}%`,
                        height: '4px',
                        backgroundColor: '#e2e8f0',
                        zIndex: 1
                      }}>
                        {/* Active Progress Line */}
                        <div style={{
                          width: `${activeProgressPercent}%`,
                          height: '100%',
                          backgroundColor: isCancelled ? '#ef4444' : '#10b981',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>

                      {/* Stepper Dots & Labels */}
                      {steps.map((step, idx) => {
                        const IconComponent = step.icon;
                        const isDone = step.done;
                        const circleColor = step.isError ? '#ef4444' : (step.isRefunded ? '#6366f1' : (isDone ? '#10b981' : '#cbd5e1'));
                        const textColor = isDone ? '#111827' : '#9ca3af';

                        return (
                          <div key={idx} style={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center', 
                            position: 'relative', 
                            zIndex: 2,
                            flex: 1
                          }}>
                            {/* Circle dot containing icon */}
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              backgroundColor: isDone ? circleColor : '#ffffff',
                              border: `3px solid ${circleColor}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isDone ? '#ffffff' : '#9ca3af',
                              boxShadow: isDone ? `0 0 0 4px ${circleColor}20` : 'none',
                              transition: 'all 0.3s ease'
                            }}>
                              <IconComponent size={20} />
                            </div>

                            {/* Step Label */}
                            <div style={{ 
                              marginTop: '10px', 
                              fontSize: '0.75rem', 
                              fontWeight: 700, 
                              color: textColor,
                              textAlign: 'center',
                              lineHeight: '1.2',
                              maxWidth: '90px',
                              wordWrap: 'break-word'
                            }}>
                              {step.label}
                            </div>

                            {/* Step Timestamp */}
                            {step.time && (
                              <div style={{ 
                                fontSize: '0.65rem', 
                                color: '#6b7280', 
                                marginTop: '4px',
                                textAlign: 'center',
                                lineHeight: '1.2',
                                maxWidth: '90px'
                              }}>
                                {formatDate(step.time)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Items List */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111827', marginBottom: '12px', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>Sản phẩm đã mua</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '200px', overflowY: 'auto', paddingRight: '6px' }}>
                  {items.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '50px', height: '65px', backgroundColor: '#f3f4f6', borderRadius: '4px', border: '1px solid #e5e7eb', overflow: 'hidden', flexShrink: 0 }}>
                        {item.product?.imageUrl && <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', margin: '0 0 3px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product?.name || 'Sách đã bị xóa'}</h4>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Đơn giá: {formatPrice(item.unitPrice)} | Số lượng: x{item.quantity}</div>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                        {formatPrice(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4b5563' }}>
                  <span>Tạm tính (Giá gốc)</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{formatPrice(order.totalAmount)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#4b5563' }}>
                  <span>Phí vận chuyển</span>
                  <span style={{ fontWeight: 500, color: '#111827' }}>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Voucher giảm giá {order.coupon?.code ? `(Mã: ${order.coupon.code})` : ''}</span>
                    <span style={{ fontWeight: 600 }}>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {pointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#10b981' }}>
                    <span>Xu tích lũy đã dùng {order.pointsUsed ? `(${order.pointsUsed} xu)` : ''}</span>
                    <span style={{ fontWeight: 600 }}>-{formatPrice(pointsDiscount)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '6px' }}>
                  <span style={{ fontWeight: 700, color: '#111827', fontSize: '1rem' }}>Thành tiền</span>
                  <span style={{ fontWeight: 800, color: '#0a422d', fontSize: '1.35rem' }}>{formatPrice(order.finalAmount)}</span>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </>
  );
};

export default OrderHistory;
