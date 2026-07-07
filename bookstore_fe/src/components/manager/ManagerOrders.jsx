import React, { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerOrders = ({ orders, shippers, loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const handleDeliverOrder = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/deliver`);
      showToast(`Đơn hàng #${orderId} đã được chuyển sang trạng thái Giao thành công!`, 'success');
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt('Nhập lý do hủy đơn hàng:');
    if (reason === null) return;
    if (!reason.trim()) {
      showToast('Lý do hủy không được để trống!', 'error');
      return;
    }
    try {
      await api.post(`/orders/${orderId}/cancel?reason=${encodeURIComponent(reason.trim())}`);
      showToast(`Đơn hàng #${orderId} đã được hủy!`, 'success');
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi hủy đơn hàng!', 'error');
    }
  };

  const handleAssignShipper = async (orderId, shipperId) => {
    if (!shipperId) return;
    try {
      await api.post(`/orders/${orderId}/assign-shipper?shipperId=${shipperId}`);
      showToast('Phân công shipper thành công!', 'success');
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi phân công shipper!', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${status}`);
      showToast(`Đơn hàng #${orderId} đã được chuyển trạng thái thành công!`, 'success');
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi cập nhật trạng thái đơn hàng!', 'error');
    }
  };

  const handleViewDetails = async (orderId) => {
    setSelectedOrder(orderId);
    setLoadingDetails(true);
    try {
      const response = await api.get(`/orders/${orderId}`);
      setOrderDetails(response.data);
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi lấy chi tiết đơn hàng!', 'error');
      setSelectedOrder(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filtered and Paginated Orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'ALL') return true;
    return o.status === orderStatusFilter;
  });

  const totalOrderPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedOrders = filteredOrders.slice(
    (orderPage - 1) * ITEMS_PER_PAGE,
    orderPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Danh sách đơn hàng
        </h1>
        
        <select
          value={orderStatusFilter}
          onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '0.9rem',
            minWidth: '200px',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="pending">Chờ xác nhận</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="preparing">Đang chuẩn bị</option>
          <option value="shipping">Đang giao</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MÃ ĐH</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>KHÁCH HÀNG</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TỔNG TIỀN</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>THANH TOÁN</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SHIPPER GIAO HÀNG</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#475569' }}>
                  #{order.id}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.user?.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{order.shippingPhone || order.user?.phone}</div>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0f172a' }}>
                  {parseFloat(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')}đ
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                  {order.paymentMethod || 'COD'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: order.status === 'delivered' ? '#ecfdf5' : order.status === 'cancelled' ? '#fef2f2' : '#f1f5f9',
                    color: order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : '#475569'
                  }}>
                    {order.status === 'pending' ? 'Chờ xác nhận' :
                     order.status === 'confirmed' ? 'Đã xác nhận' :
                     order.status === 'preparing' ? 'Đang chuẩn bị' :
                     order.status === 'shipping' ? 'Đang giao' :
                     order.status === 'delivered' ? 'Đã giao hàng' :
                     order.status === 'cancelled' ? 'Đã hủy' : order.status}
                  </span>
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <select
                    value={order.shipper?.id || ''}
                    onChange={(e) => handleAssignShipper(order.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <option value="">-- Chọn shipper --</option>
                    {shippers.filter(s => s.status === 'ACTIVE').map(s => (
                      <option key={s.id} value={s.id}>{s.fullName} ({s.vehicle || 'Không rõ xe'})</option>
                    ))}
                  </select>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleViewDetails(order.id)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      Xem chi tiết
                    </button>
                    
                    {order.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Xác nhận
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    )}

                    {order.status === 'confirmed' && (
                      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#eab308',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Chuẩn bị hàng
                        </button>
                      </div>
                    )}

                    {order.status === 'preparing' && (
                      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'shipping')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#a855f7',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Giao hàng
                        </button>
                      </div>
                    )}

                    {order.status === 'shipping' && (
                      <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            flex: 1
                          }}
                        >
                          Đã giao
                        </button>
                      </div>
                    )}

                    {order.status === 'delivered' && (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <CheckCircle size={14} /> Hoàn thành
                      </span>
                    )}

                    {order.status === 'cancelled' && (
                      <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, marginTop: '4px' }}>
                        Đã hủy
                      </span>
                    )}

                    {order.status === 'refunded' && (
                      <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 600, marginTop: '4px' }}>
                        Đã hoàn tiền
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy đơn hàng nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {paginatedOrders.length} trên tổng số {filteredOrders.length} đơn hàng
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={orderPage === 1}
              onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: orderPage === 1 ? '#f1f5f9' : '#ffffff',
                color: orderPage === 1 ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: orderPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            {[...Array(totalOrderPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setOrderPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: orderPage === i + 1 ? '#7c3aed' : '#ffffff',
                  color: orderPage === i + 1 ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={orderPage === totalOrderPages}
              onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: orderPage === totalOrderPages ? '#f1f5f9' : '#ffffff',
                color: orderPage === totalOrderPages ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: orderPage === totalOrderPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Chi tiết đơn hàng #{selectedOrder}
              </h2>
              <button
                onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingDetails ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
                  <span style={{ fontSize: '0.95rem', color: '#475569' }}>Đang tải thông tin...</span>
                </div>
              ) : orderDetails ? (
                <>
                  {/* Customer & Shipping Info */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px',
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #f1f5f9',
                    textAlign: 'left'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 700 }}>Thông tin khách hàng</h4>
                      <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 600 }}>{orderDetails.order?.user?.fullName}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>Email: {orderDetails.order?.user?.email}</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>SĐT: {orderDetails.order?.shippingPhone || orderDetails.order?.user?.phone || 'N/A'}</div>
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px 0', fontWeight: 700 }}>Thông tin giao hàng & TT</h4>
                      <div style={{ fontSize: '0.85rem', color: '#475569' }}>Địa chỉ: <strong style={{ color: '#0f172a' }}>{orderDetails.order?.shippingAddress}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>Phương thức: <strong>{orderDetails.order?.paymentMethod}</strong></div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>Trạng thái: 
                        <span style={{
                          marginLeft: '6px',
                          display: 'inline-flex',
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569'
                        }}>
                          {orderDetails.order?.status === 'pending' ? 'Chờ xác nhận' :
                           orderDetails.order?.status === 'confirmed' ? 'Đã xác nhận' :
                           orderDetails.order?.status === 'preparing' ? 'Đang chuẩn bị' :
                           orderDetails.order?.status === 'shipping' ? 'Đang giao' :
                           orderDetails.order?.status === 'delivered' ? 'Đã giao hàng' :
                           orderDetails.order?.status === 'cancelled' ? 'Đã hủy' : orderDetails.order?.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 style={{ fontSize: '0.9rem', color: '#0f172a', margin: '0 0 12px 0', fontWeight: 700, textAlign: 'left' }}>Danh sách sách đã mua</h4>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>Tên sách</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, textAlign: 'center' }}>Số lượng</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Đơn giá</th>
                            <th style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600, textAlign: 'right' }}>Tổng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderDetails.items?.map(item => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  {item.product?.imageUrl && (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      style={{ width: '36px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                                    />
                                  )}
                                  <span>{item.product?.name}</span>
                                </div>
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569' }}>
                                {item.quantity}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#475569' }}>
                                {parseFloat(item.unitPrice).toLocaleString('vi-VN')}đ
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'right', color: '#0f172a', fontWeight: 600 }}>
                                {parseFloat(item.subtotal || (item.unitPrice * item.quantity)).toLocaleString('vi-VN')}đ
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignSelf: 'flex-end', minWidth: '240px', padding: '0 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Tổng tiền hàng:</span>
                      <span>{parseFloat(orderDetails.order?.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    {parseFloat(orderDetails.order?.discountAmount || 0) > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                        <span>Giảm giá:</span>
                        <span>-{parseFloat(orderDetails.order?.discountAmount).toLocaleString('vi-VN')}đ</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                      <span>Phí vận chuyển:</span>
                      <span>{parseFloat(orderDetails.order?.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: '#0f172a', borderTop: '1px solid #e2e8f0', paddingTop: '8px', marginTop: '4px' }}>
                      <span>Thành tiền:</span>
                      <span style={{ color: '#7c3aed' }}>{parseFloat(orderDetails.order?.finalAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                  Không tìm thấy chi tiết đơn hàng.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}>
              <button
                onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ManagerOrders;
