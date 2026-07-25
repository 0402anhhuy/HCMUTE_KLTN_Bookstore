import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Clock, ShoppingBag, Package, Truck, RefreshCcw } from 'lucide-react';
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

  useEffect(() => {
    const handleOrderUpdated = (event) => {
      const { orderId } = event.detail || {};
      setTimeout(() => {
        loadData();
        if (selectedOrder && selectedOrder === orderId) {
          handleViewDetails(orderId);
        }
      }, 300);
    };
    window.addEventListener('order-updated', handleOrderUpdated);
    return () => {
      window.removeEventListener('order-updated', handleOrderUpdated);
    };
  }, [selectedOrder, loadData]);

  // Reject Return Request Modal state
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Approve Return Request Modal state
  const [approvingRequest, setApprovingRequest] = useState(null);

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
      let returnRequest = null;
      if (response.data.order?.status === 'cancel_requested' || response.data.order?.status === 'refunded') {
        try {
          const retResponse = await api.get(`/orders/${orderId}/return`);
          returnRequest = retResponse.data;
        } catch (e) {
          console.error("Failed to load return request details:", e);
        }
      }
      setOrderDetails({ ...response.data, returnRequest });
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi lấy chi tiết đơn hàng!', 'error');
      setSelectedOrder(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleOpenApproveModal = (requestId, orderId) => {
    setApprovingRequest({ requestId, orderId });
  };

  const handleApproveSubmit = async () => {
    if (!approvingRequest) return;
    try {
      const { requestId } = approvingRequest;
      await api.post(`/orders/returns/${requestId}/process?status=APPROVED`);
      showToast("Duyệt yêu cầu đổi trả thành công!", "success");
      setApprovingRequest(null);
      setSelectedOrder(null);
      setOrderDetails(null);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || "Lỗi khi duyệt yêu cầu đổi trả!", "error");
      setApprovingRequest(null);
    }
  };

  const handleOpenRejectModal = (requestId, orderId) => {
    setRejectingRequest({ requestId, orderId });
    setRejectReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      showToast("Lý do từ chối không được để trống!", "error");
      return;
    }
    try {
      const { requestId } = rejectingRequest;
      await api.post(`/orders/returns/${requestId}/process?status=REJECTED&rejectedReason=${encodeURIComponent(rejectReason.trim())}`);
      showToast("Đã từ chối yêu cầu đổi trả!", "success");
      setRejectingRequest(null);
      setRejectReason('');
      setSelectedOrder(null);
      setOrderDetails(null);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || "Lỗi khi từ chối yêu cầu đổi trả!", "error");
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
          <option value="cancel_requested">Yêu cầu đổi trả</option>
          <option value="refunded">Đã hoàn tiền / Đổi trả</option>
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
                    backgroundColor: 
                      order.status === 'delivered' ? '#ecfdf5' : 
                      order.status === 'cancelled' ? '#fef2f2' : 
                      order.status === 'cancel_requested' ? '#fffbeb' : 
                      order.status === 'refunded' ? '#eff6ff' : '#f1f5f9',
                    color: 
                      order.status === 'delivered' ? '#10b981' : 
                      order.status === 'cancelled' ? '#ef4444' : 
                      order.status === 'cancel_requested' ? '#d97706' : 
                      order.status === 'refunded' ? '#3b82f6' : '#475569'
                  }}>
                    {order.status === 'pending' ? 'Chờ xác nhận' :
                     order.status === 'confirmed' ? 'Đã xác nhận' :
                     order.status === 'preparing' ? 'Đang chuẩn bị' :
                     order.status === 'shipping' ? 'Đang giao' :
                     order.status === 'delivered' ? 'Đã giao hàng' :
                     order.status === 'cancel_requested' ? 'Yêu cầu đổi trả' :
                     order.status === 'refunded' ? 'Đã hoàn tiền' :
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
                          onClick={() => {
                            if (!order.shipper) {
                              showToast('Vui lòng chọn shipper trước khi giao hàng!', 'error');
                              return;
                            }
                            handleUpdateStatus(order.id, 'shipping');
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: !order.shipper ? '#e2e8f0' : '#a855f7',
                            color: !order.shipper ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: !order.shipper ? 'not-allowed' : 'pointer',
                            flex: 1
                          }}
                          title={!order.shipper ? "Vui lòng chọn shipper trước" : ""}
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
                          backgroundColor: 
                            orderDetails.order?.status === 'delivered' ? '#ecfdf5' : 
                            orderDetails.order?.status === 'cancelled' ? '#fef2f2' : 
                            orderDetails.order?.status === 'cancel_requested' ? '#fffbeb' : 
                            orderDetails.order?.status === 'refunded' ? '#eff6ff' : '#f1f5f9',
                          color: 
                            orderDetails.order?.status === 'delivered' ? '#10b981' : 
                            orderDetails.order?.status === 'cancelled' ? '#ef4444' : 
                            orderDetails.order?.status === 'cancel_requested' ? '#d97706' : 
                            orderDetails.order?.status === 'refunded' ? '#3b82f6' : '#475569'
                        }}>
                          {orderDetails.order?.status === 'pending' ? 'Chờ xác nhận' :
                           orderDetails.order?.status === 'confirmed' ? 'Đã xác nhận' :
                           orderDetails.order?.status === 'preparing' ? 'Đang chuẩn bị' :
                           orderDetails.order?.status === 'shipping' ? 'Đang giao' :
                           orderDetails.order?.status === 'delivered' ? 'Đã giao hàng' :
                           orderDetails.order?.status === 'cancel_requested' ? 'Yêu cầu đổi trả' :
                           orderDetails.order?.status === 'refunded' ? 'Đã hoàn tiền' :
                           orderDetails.order?.status === 'cancelled' ? 'Đã hủy' : orderDetails.order?.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Trạng Thái Đơn Hàng */}
                  {(() => {
                    const order = orderDetails.order;
                    if (!order) return null;
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
                      steps.push({ label: 'Đã hoàn tiền', time: order.refundedAt, done: true, icon: RefreshCcw, color: '#7c3aed', isRefunded: true });
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
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
                          <Clock size={16} style={{ color: '#7c3aed' }} />
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
                              backgroundColor: isCancelled ? '#ef4444' : '#7c3aed',
                              transition: 'width 0.3s ease'
                            }}></div>
                          </div>

                          {/* Stepper Dots & Labels */}
                          {steps.map((step, idx) => {
                            const IconComponent = step.icon;
                            const isDone = step.done;
                            const circleColor = step.isError ? '#ef4444' : (step.isRefunded ? '#7c3aed' : (isDone ? '#10b981' : '#cbd5e1'));
                            const textColor = isDone ? '#0f172a' : '#94a3b8';

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
                                  color: isDone ? '#ffffff' : '#94a3b8',
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
                                    color: '#64748b', 
                                    marginTop: '4px',
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                    maxWidth: '90px'
                                  }}>
                                    {(() => {
                                      const date = new Date(step.time);
                                      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                                    })()}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {orderDetails.returnRequest && (
                    <div style={{
                      backgroundColor: '#fffbeb',
                      padding: '18px',
                      borderRadius: '12px',
                      border: '1px solid #fef3c7',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#b45309', margin: 0, fontWeight: 700 }}>
                          Yêu cầu đổi trả ({orderDetails.returnRequest.returnType === 'EXCHANGE' ? 'Đổi hàng mới' : 'Trả hàng & Hoàn tiền'})
                        </h4>
                        <span style={{
                          display: 'inline-flex',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: 
                            orderDetails.returnRequest.status === 'PENDING' ? '#fff3cd' : 
                            orderDetails.returnRequest.status === 'APPROVED' ? '#d1e7dd' : '#f8d7da',
                          color: 
                            orderDetails.returnRequest.status === 'PENDING' ? '#856404' : 
                            orderDetails.returnRequest.status === 'APPROVED' ? '#0f5132' : '#842029'
                        }}>
                          {orderDetails.returnRequest.status === 'PENDING' ? 'Chờ xét duyệt' : 
                           orderDetails.returnRequest.status === 'APPROVED' ? 'Đã chấp nhận' : 'Đã từ chối'}
                        </span>
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: '1.5' }}>
                        <strong>Lý do của khách:</strong> {orderDetails.returnRequest.reason}
                      </div>

                      {orderDetails.returnRequest.rejectedReason && (
                        <div style={{ fontSize: '0.875rem', color: '#ef4444' }}>
                          <strong>Lý do từ chối:</strong> {orderDetails.returnRequest.rejectedReason}
                        </div>
                      )}

                      {orderDetails.returnRequest.evidenceImages && (
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#78350f', marginBottom: '6px' }}>Hình ảnh bằng chứng:</div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {orderDetails.returnRequest.evidenceImages.split(' || ').map((img, idx) => (
                              <a key={idx} href={img} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '70px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #fcd34d' }}>
                                <img src={img} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Approval / Rejection buttons for Manager */}
                      {orderDetails.returnRequest.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                          <button
                            onClick={() => handleOpenApproveModal(orderDetails.returnRequest.id, orderDetails.order.id)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '8px',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            Đồng ý đổi trả & Hoàn tiền
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(orderDetails.returnRequest.id, orderDetails.order.id)}
                            style={{
                              flex: 1,
                              padding: '10px',
                              borderRadius: '8px',
                              backgroundColor: '#ffffff',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              fontWeight: 600,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              textAlign: 'center'
                            }}
                          >
                            Từ chối yêu cầu
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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

      {/* REJECT RETURN REQUEST MODAL */}
      {rejectingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 2100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ef4444', marginBottom: '8px' }}>Từ chối yêu cầu đổi trả</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '20px' }}>Vui lòng nhập lý do từ chối yêu cầu đổi trả của khách hàng để gửi phản hồi.</p>
            <form onSubmit={handleRejectSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <textarea 
                rows={4} 
                placeholder="Nhập lý do từ chối cụ thể..." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', fontSize: '0.9rem', boxSizing: 'border-box', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                required
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setRejectingRequest(null)} style={{ flex: 1, padding: '10px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Hủy bỏ</button>
                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Xác nhận từ chối</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* APPROVE RETURN REQUEST MODAL */}
      {approvingRequest && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 2100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '50%', marginBottom: '16px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '12px', marginTop: 0 }}>Duyệt yêu cầu đổi trả</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5', marginBottom: '24px', textAlign: 'left' }}>
              Bạn có chắc chắn muốn <strong>DUYỆT</strong> yêu cầu đổi trả này? Đơn hàng sẽ được chuyển sang trạng thái <strong>Đã hoàn tiền</strong> và tự động khôi phục số lượng sách tương ứng vào kho hàng.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setApprovingRequest(null)} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}>Hủy bỏ</button>
              <button onClick={handleApproveSubmit} style={{ flex: 1, padding: '10px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}>Xác nhận duyệt</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};

export default ManagerOrders;
