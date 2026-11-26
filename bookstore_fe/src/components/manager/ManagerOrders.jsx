import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  X, 
  Clock, 
  ShoppingBag, 
  Package, 
  Truck, 
  RotateCcw, 
  XCircle,
  Eye,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import { EmptyState } from '../common';

const ManagerOrders = ({ orders = [], shippers = [], loadData }) => {
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

  // Cancel Order Modal state
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

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

  const handleCancelOrder = (orderId) => {
    setCancelReason('');
    setCancellingOrderId(orderId);
  };

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      showToast('Lý do hủy không được để trống!', 'error');
      return;
    }
    try {
      await api.post(`/orders/${cancellingOrderId}/cancel?reason=${encodeURIComponent(trimmed)}`);
      showToast(`Đơn hàng #${cancellingOrderId} đã được hủy!`, 'success');
      setCancellingOrderId(null);
      setCancelReason('');
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi hủy đơn hàng!', 'error');
    }
  };

  const handleAssignShipper = async (orderId, shipperId) => {
    if (!shipperId) return;

    const order = orders?.find(o => o.id === orderId) || (orderDetails?.order?.id === orderId ? orderDetails.order : null);
    if (order && order.status === 'shipping') {
      const currentShipperName = order.shipper?.fullName 
        ? `${order.shipper.fullName}${order.shipper.vehicle ? ` (${order.shipper.vehicle})` : ''}` 
        : 'shipper khác';
      showToast(`Đơn hàng đang giao và đã được gán cho shipper "${currentShipperName}"`, 'error');
      loadData();
      return;
    }

    if (order && order.status === 'delivered') {
      showToast('Không được chọn thông tin shipper ở đơn hàng đã giao thành công', 'error');
      loadData();
      return;
    }

    if (order && order.status === 'cancelled') {
      showToast('Không được chọn thông tin shipper ở đơn hàng đã giao thành công', 'error');
      loadData();
      return;
    }

    try {
      await api.post(`/orders/${orderId}/assign-shipper?shipperId=${shipperId}`);
      showToast('Phân công shipper thành công!', 'success');
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi phân công shipper!', 'error');
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

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="manager-badge manager-badge-amber">
            <Clock size={12} /> Chờ xác nhận
          </span>
        );
      case 'confirmed':
        return (
          <span className="manager-badge manager-badge-blue">
            <CheckCircle size={12} /> Đã xác nhận
          </span>
        );
      case 'preparing':
        return (
          <span className="manager-badge manager-badge-purple">
            <Package size={12} /> Đang chuẩn bị
          </span>
        );
      case 'shipping':
        return (
          <span className="manager-badge manager-badge-indigo">
            <Truck size={12} /> Đang giao hàng
          </span>
        );
      case 'delivered':
        return (
          <span className="manager-badge manager-badge-emerald">
            <CheckCircle size={12} /> Đã giao hàng
          </span>
        );
      case 'cancel_requested':
        return (
          <span className="manager-badge manager-badge-amber">
            <RotateCcw size={12} /> Yêu cầu đổi trả
          </span>
        );
      case 'refunded':
        return (
          <span className="manager-badge manager-badge-purple">
            <RotateCcw size={12} /> Đã hoàn tiền
          </span>
        );
      case 'cancelled':
        return (
          <span className="manager-badge manager-badge-red">
            <XCircle size={12} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="manager-badge manager-badge-slate">
            {status}
          </span>
        );
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
        
        {/* Header and Filter */}
        <div className="manager-flex-responsive-row">
          <div className="manager-header-title-group">
            <h1>
              Quản lý đơn hàng
            </h1>
            <p>
              Theo dõi, xác nhận và phân công người giao hàng cho các đơn đặt sách.
            </p>
          </div>
          
          <select
            className="manager-select manager-filter-select"
            value={orderStatusFilter}
            onChange={(e) => { setOrderStatusFilter(e.target.value); setOrderPage(1); }}
            style={{ minWidth: '200px' }}
          >
            <option value="ALL">Tất cả trạng thái ({orders.length})</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="preparing">Đang chuẩn bị</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancel_requested">Yêu cầu đổi trả</option>
            <option value="refunded">Đã hoàn tiền / Đổi trả</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Orders Table (Desktop / Laptop 1366-1440px) */}
        <div className="manager-desktop-table manager-table-responsive">
          <table className="manager-table">
            <thead>
              <tr>
                <th>MÃ ĐH</th>
                <th>KHÁCH HÀNG</th>
                <th>TỔNG TIỀN</th>
                <th>THANH TOÁN</th>
                <th>TRẠNG THÁI</th>
                <th>SHIPPER GIAO HÀNG</th>
                <th style={{ textAlign: 'center' }}>HÀNH ĐỘNG</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 700, color: 'var(--mgr-primary)' }}>
                    #{order.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--mgr-text-dark)' }}>
                      {order.user?.fullName || 'Khách vãng lai'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', marginTop: '2px' }}>
                      {order.shippingPhone || order.user?.phone || 'Chưa có SĐT'}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--mgr-text-dark)', fontSize: '0.95rem' }}>
                    {parseFloat(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.8rem', 
                      fontWeight: 600, 
                      color: order.paymentMethod === 'VNPAY' ? '#0284c7' : 'var(--mgr-text-main)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#f1f5f9'
                    }}>
                      {order.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td>
                    {renderStatusBadge(order.status)}
                  </td>
                  <td>
                    <select
                      value={order.shipper?.id || ''}
                      onChange={(e) => handleAssignShipper(order.id, e.target.value)}
                      className="manager-select"
                      style={{
                        padding: '6px 10px',
                        fontSize: '0.825rem',
                        minWidth: '150px'
                      }}
                    >
                      <option value="">-- Chọn shipper --</option>
                      {shippers.filter(s => s.status === 'ACTIVE').map(s => (
                        <option key={s.id} value={s.id}>
                          {s.fullName} ({s.vehicle || 'Xe máy'})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleViewDetails(order.id)}
                        className="manager-btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          width: '100%'
                        }}
                      >
                        <Eye size={14} />
                        <span>Xem chi tiết</span>
                      </button>
                      
                      {order.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                            className="manager-btn-primary"
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.78rem',
                              flex: 1
                            }}
                          >
                            Xác nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="manager-btn-danger"
                            style={{
                              padding: '6px 8px',
                              fontSize: '0.78rem',
                              flex: 1
                            }}
                          >
                            Hủy
                          </button>
                        </div>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--mgr-radius-md)',
                            backgroundColor: '#f59e0b',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <Package size={14} />
                          <span>Chuẩn bị hàng</span>
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (!order.shipper) {
                              showToast('Vui lòng chọn shipper trước khi giao hàng!', 'error');
                              return;
                            }
                            handleUpdateStatus(order.id, 'shipping');
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--mgr-radius-md)',
                            backgroundColor: !order.shipper ? '#e2e8f0' : 'var(--mgr-primary)',
                            color: !order.shipper ? '#94a3b8' : '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: !order.shipper ? 'not-allowed' : 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                          title={!order.shipper ? "Vui lòng chọn shipper trước" : ""}
                        >
                          <Truck size={14} />
                          <span>Giao hàng</span>
                        </button>
                      )}

                      {order.status === 'shipping' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--mgr-radius-md)',
                            backgroundColor: 'var(--mgr-success)',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle size={14} />
                          <span>Đã giao</span>
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--mgr-success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Hoàn thành
                        </span>
                      )}

                      {order.status === 'cancelled' && (
                        <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>
                          Đã hủy
                        </span>
                      )}

                      {order.status === 'refunded' && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--mgr-primary)', fontWeight: 600 }}>
                          Đã hoàn tiền
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '48px 16px' }}>
                    <EmptyState
                      icon={Package}
                      title="Không tìm thấy đơn hàng nào"
                      description={
                        orderStatusFilter === 'ALL'
                          ? "Hệ thống hiện chưa ghi nhận đơn hàng nào."
                          : `Không có đơn hàng nào phù hợp với bộ lọc đã chọn.`
                      }
                      actionText={orderStatusFilter !== 'ALL' ? "Xem tất cả đơn hàng" : undefined}
                      onAction={orderStatusFilter !== 'ALL' ? () => { setOrderStatusFilter('ALL'); setOrderPage(1); } : undefined}
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredOrders.length > 0 && (
            <div className="manager-pagination-bar">
              <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
                Hiển thị {paginatedOrders.length} trên tổng số {filteredOrders.length} đơn hàng
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  disabled={orderPage === 1}
                  onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
                  className="manager-page-btn"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalOrderPages)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setOrderPage(i + 1)}
                    className={`manager-page-btn ${orderPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={orderPage === totalOrderPages}
                  onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
                  className="manager-page-btn"
                  aria-label="Trang tiếp"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Orders Mobile Card View (iPhone 14 Pro Max & screens <= 768px) */}
        <div className="manager-mobile-card-list">
          {paginatedOrders.map(order => (
            <div key={order.id} className="manager-card-item">
              <div className="manager-card-header">
                <span className="manager-card-title" style={{ color: 'var(--mgr-primary)' }}>
                  Đơn hàng #{order.id}
                </span>
                {renderStatusBadge(order.status)}
              </div>

              <div className="manager-card-body">
                <div className="manager-card-row">
                  <span className="manager-card-label">Khách hàng:</span>
                  <span className="manager-card-value">
                    {order.user?.fullName || 'Khách vãng lai'}
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">SĐT liên hệ:</span>
                  <span className="manager-card-value">
                    {order.shippingPhone || order.user?.phone || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Thanh toán:</span>
                  <span className="manager-card-value" style={{ color: 'var(--mgr-primary)' }}>
                    {order.paymentMethod || 'COD'}
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Tổng tiền:</span>
                  <span className="manager-card-value" style={{ color: 'var(--mgr-text-dark)', fontSize: '1.05rem', fontWeight: 800 }}>
                    {parseFloat(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                
                <div style={{ marginTop: '6px' }}>
                  <span className="manager-card-label" style={{ display: 'block', marginBottom: '6px' }}>
                    Shipper phụ trách:
                  </span>
                  <select
                    value={order.shipper?.id || ''}
                    onChange={(e) => handleAssignShipper(order.id, e.target.value)}
                    className="manager-select"
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    <option value="">-- Chọn shipper giao hàng --</option>
                    {shippers.filter(s => s.status === 'ACTIVE').map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.vehicle || 'Xe máy'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="manager-card-footer">
                <button
                  type="button"
                  onClick={() => handleViewDetails(order.id)}
                  className="manager-btn-secondary"
                  style={{ flex: 1, minHeight: '44px' }}
                >
                  <Eye size={16} />
                  <span>Chi tiết</span>
                </button>

                {order.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      className="manager-btn-primary"
                      style={{ flex: 1, minHeight: '44px' }}
                    >
                      Xác nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelOrder(order.id)}
                      className="manager-btn-danger"
                      style={{ minHeight: '44px', padding: '0 16px' }}
                    >
                      Hủy
                    </button>
                  </>
                )}

                {order.status === 'confirmed' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'preparing')}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      borderRadius: 'var(--mgr-radius-md)',
                      backgroundColor: '#f59e0b',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Chuẩn bị hàng
                  </button>
                )}

                {order.status === 'preparing' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (!order.shipper) {
                        showToast('Vui lòng chọn shipper trước khi giao hàng!', 'error');
                        return;
                      }
                      handleUpdateStatus(order.id, 'shipping');
                    }}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      borderRadius: 'var(--mgr-radius-md)',
                      backgroundColor: !order.shipper ? '#e2e8f0' : 'var(--mgr-primary)',
                      color: !order.shipper ? '#94a3b8' : '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: !order.shipper ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Giao hàng
                  </button>
                )}

                {order.status === 'shipping' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(order.id, 'delivered')}
                    style={{
                      flex: 1,
                      minHeight: '44px',
                      borderRadius: 'var(--mgr-radius-md)',
                      backgroundColor: 'var(--mgr-success)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Đã giao thành công
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && (
            <div className="manager-panel" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <EmptyState
                icon={Package}
                title="Không tìm thấy đơn hàng nào"
                description={
                  orderStatusFilter === 'ALL'
                    ? "Hệ thống hiện chưa ghi nhận đơn hàng nào."
                    : `Không có đơn hàng nào phù hợp với bộ lọc đã chọn.`
                }
                actionText={orderStatusFilter !== 'ALL' ? "Xem tất cả" : undefined}
                onAction={orderStatusFilter !== 'ALL' ? () => { setOrderStatusFilter('ALL'); setOrderPage(1); } : undefined}
              />
            </div>
          )}

          {/* Pagination Controls Mobile */}
          {filteredOrders.length > 0 && totalOrderPages > 1 && (
            <div className="manager-pagination-bar" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                disabled={orderPage === 1}
                onClick={() => setOrderPage(prev => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                {orderPage} / {totalOrderPages}
              </span>
              <button
                type="button"
                disabled={orderPage === totalOrderPages}
                onClick={() => setOrderPage(prev => Math.min(prev + 1, totalOrderPages))}
                className="manager-page-btn"
                aria-label="Trang tiếp"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="manager-modal-overlay">
            <div className="manager-modal-box">
              {/* Modal Header */}
              <div className="manager-modal-header">
                <h2>
                  Chi tiết đơn hàng #{selectedOrder}
                </h2>
                <button
                  type="button"
                  onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                  className="manager-modal-close-btn"
                  aria-label="Đóng modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="manager-modal-body">
                {loadingDetails ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: '12px', color: 'var(--mgr-text-muted)' }}>
                    <Loader2 size={32} className="animate-spin" style={{ color: 'var(--mgr-primary)' }} />
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Đang tải thông tin đơn hàng...</span>
                  </div>
                ) : orderDetails ? (
                  <>
                    {/* Customer & Shipping Info Cards */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '16px',
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: 'var(--mgr-radius-lg)',
                      border: '1px solid var(--mgr-border)'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} style={{ color: 'var(--mgr-primary)' }} />
                          Thông tin khách hàng
                        </div>
                        <div style={{ fontSize: '0.95rem', color: 'var(--mgr-text-dark)', fontWeight: 700 }}>
                          {orderDetails.order?.user?.fullName || 'Khách vãng lai'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mgr-text-muted)', marginTop: '4px' }}>
                          Email: {orderDetails.order?.user?.email || 'Chưa có'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mgr-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} />
                          {orderDetails.order?.shippingPhone || orderDetails.order?.user?.phone || 'Chưa cập nhật'}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} style={{ color: 'var(--mgr-primary)' }} />
                          Địa chỉ giao & Thanh toán
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mgr-text-main)', lineHeight: '1.4' }}>
                          <strong>Địa chỉ:</strong> {orderDetails.order?.shippingAddress}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mgr-text-main)', marginTop: '4px' }}>
                          <strong>Thanh toán:</strong> {orderDetails.order?.paymentMethod || 'COD'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--mgr-text-main)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <strong>Trạng thái:</strong> {renderStatusBadge(orderDetails.order?.status)}
                        </div>
                      </div>
                    </div>

                    {/* Stepper Timeline Tiến trình đơn hàng */}
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
                        steps.push({ label: 'Đã hủy', time: order.cancelledAt, done: true, icon: XCircle, color: '#ef4444', isError: true });
                      } else if (isRefunded) {
                        if (order.deliveredAt) {
                          steps.push({ label: 'Đã giao hàng', time: order.deliveredAt, done: true, icon: CheckCircle, color: '#10b981' });
                        }
                        steps.push({ label: 'Đã hoàn tiền', time: order.refundedAt, done: true, icon: RotateCcw, color: 'var(--mgr-primary)', isRefunded: true });
                      } else {
                        steps.push({ label: 'Đã giao hàng', time: order.deliveredAt, done: !!order.deliveredAt, icon: CheckCircle, color: '#10b981' });
                      }

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
                          backgroundColor: '#f8fafc', 
                          borderRadius: 'var(--mgr-radius-lg)', 
                          padding: '20px 16px', 
                          border: '1px solid var(--mgr-border)' 
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--mgr-text-dark)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Clock size={16} style={{ color: 'var(--mgr-primary)' }} />
                            Tiến trình trạng thái đơn hàng
                          </div>
                          
                          {/* Stepper Progress Bar Row */}
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'flex-start', 
                            position: 'relative',
                            width: '100%'
                          }}>
                            {/* Background line */}
                            <div style={{
                              position: 'absolute',
                              top: '20px',
                              left: `${100 / (steps.length * 2)}%`,
                              right: `${100 / (steps.length * 2)}%`,
                              height: '4px',
                              backgroundColor: '#e2e8f0',
                              zIndex: 1
                            }}>
                              <div style={{
                                width: `${activeProgressPercent}%`,
                                height: '100%',
                                backgroundColor: isCancelled ? '#ef4444' : 'var(--mgr-primary)',
                                transition: 'width 0.3s ease'
                              }} />
                            </div>

                            {/* Stepper dots */}
                            {steps.map((step, idx) => {
                              const IconComponent = step.icon;
                              const isDone = step.done;
                              const circleColor = step.isError ? '#ef4444' : (step.isRefunded ? 'var(--mgr-primary)' : (isDone ? '#10b981' : '#cbd5e1'));
                              const textColor = isDone ? 'var(--mgr-text-dark)' : 'var(--mgr-text-light)';

                              return (
                                <div key={idx} style={{ 
                                  display: 'flex', 
                                  flexDirection: 'column', 
                                  alignItems: 'center', 
                                  position: 'relative', 
                                  zIndex: 2,
                                  flex: 1
                                }}>
                                  <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    backgroundColor: isDone ? circleColor : '#ffffff',
                                    border: `2.5px solid ${circleColor}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isDone ? '#ffffff' : '#94a3b8',
                                    boxShadow: isDone ? `0 0 0 3px ${circleColor}20` : 'none',
                                    transition: 'all 0.3s ease'
                                  }}>
                                    <IconComponent size={18} />
                                  </div>

                                  <div style={{ 
                                    marginTop: '8px', 
                                    fontSize: '0.72rem', 
                                    fontWeight: 700, 
                                    color: textColor,
                                    textAlign: 'center',
                                    lineHeight: '1.2',
                                    maxWidth: '85px',
                                    wordWrap: 'break-word'
                                  }}>
                                    {step.label}
                                  </div>

                                  {step.time && (
                                    <div style={{ 
                                      fontSize: '0.65rem', 
                                      color: 'var(--mgr-text-muted)', 
                                      marginTop: '2px', 
                                      textAlign: 'center' 
                                    }}>
                                      {new Date(step.time).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Yêu cầu đổi trả (nếu có) */}
                    {orderDetails.returnRequest && (
                      <div style={{
                        backgroundColor: '#fffbeb',
                        padding: '18px',
                        borderRadius: 'var(--mgr-radius-lg)',
                        border: '1px solid #fef3c7',
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
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            backgroundColor: 
                              orderDetails.returnRequest.status === 'PENDING' ? '#fef3c7' : 
                              orderDetails.returnRequest.status === 'APPROVED' ? '#d1e7dd' : '#fee2e2',
                            color: 
                              orderDetails.returnRequest.status === 'PENDING' ? '#b45309' : 
                              orderDetails.returnRequest.status === 'APPROVED' ? '#0f5132' : '#b91c1c'
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
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#78350f', marginBottom: '6px' }}>
                              Hình ảnh bằng chứng:
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {orderDetails.returnRequest.evidenceImages.split(' || ').map((img, idx) => (
                                <a key={idx} href={img} target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: '70px', height: '90px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #fcd34d' }}>
                                  <img src={img} alt={`Evidence ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {orderDetails.returnRequest.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenApproveModal(orderDetails.returnRequest.id, orderDetails.order.id)}
                              style={{
                                flex: 1,
                                padding: '10px 16px',
                                borderRadius: 'var(--mgr-radius-md)',
                                backgroundColor: 'var(--mgr-success)',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer'
                              }}
                            >
                              Đồng ý đổi trả & Hoàn tiền
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(orderDetails.returnRequest.id, orderDetails.order.id)}
                              className="manager-btn-danger"
                              style={{ flex: 1, padding: '10px 16px', fontSize: '0.875rem' }}
                            >
                              Từ chối yêu cầu
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Danh sách sách đã mua */}
                    <div>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--mgr-text-dark)', margin: '0 0 10px 0', fontWeight: 700 }}>
                        Danh sách sách đã mua ({orderDetails.items?.length || 0})
                      </h4>
                      <div className="manager-table-responsive">
                        <table className="manager-table" style={{ fontSize: '0.85rem' }}>
                          <thead>
                            <tr>
                              <th style={{ width: '50%' }}>Tên sách</th>
                              <th style={{ textAlign: 'center' }}>Số lượng</th>
                              <th style={{ textAlign: 'right' }}>Đơn giá</th>
                              <th style={{ textAlign: 'right' }}>Tổng</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderDetails.items?.map(item => (
                              <tr key={item.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {item.product?.imageUrl && (
                                      <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--mgr-border)', flexShrink: 0 }}
                                      />
                                    )}
                                    <span style={{ fontWeight: 600, color: 'var(--mgr-text-dark)' }}>
                                      {item.product?.name}
                                    </span>
                                  </div>
                                </td>
                                <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                  {item.quantity}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  {parseFloat(item.unitPrice || 0).toLocaleString('vi-VN')}đ
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--mgr-text-dark)' }}>
                                  {parseFloat(item.subtotal || (item.unitPrice * item.quantity)).toLocaleString('vi-VN')}đ
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignSelf: 'flex-end', minWidth: '260px', padding: '0 8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--mgr-text-muted)' }}>
                        <span>Tổng tiền hàng:</span>
                        <span>{parseFloat(orderDetails.order?.totalAmount || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                      {parseFloat(orderDetails.order?.discountAmount || 0) > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#ef4444' }}>
                          <span>Giảm giá:</span>
                          <span>-{parseFloat(orderDetails.order?.discountAmount).toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--mgr-text-muted)' }}>
                        <span>Phí vận chuyển:</span>
                        <span>{parseFloat(orderDetails.order?.shippingFee || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--mgr-primary)', borderTop: '1px solid var(--mgr-border)', paddingTop: '8px', marginTop: '4px' }}>
                        <span>Thành tiền:</span>
                        <span>{parseFloat(orderDetails.order?.finalAmount || 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--mgr-text-muted)' }}>
                    Không tìm thấy chi tiết đơn hàng.
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                  className="manager-btn-secondary"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REASON MODAL (CANCEL ORDER OR REJECT RETURN REQUEST) */}
        {(() => {
          const modalConfig = cancellingOrderId
            ? {
                title: `Hủy đơn hàng #${cancellingOrderId}`,
                description: 'Vui lòng nhập lý do hủy đơn hàng để thông báo cho khách hàng.',
                placeholder: 'Nhập lý do hủy đơn hàng...',
                confirmLabel: 'Xác nhận hủy đơn',
                value: cancelReason,
                onChange: setCancelReason,
                onClose: () => setCancellingOrderId(null),
                onSubmit: handleCancelOrderSubmit,
              }
            : rejectingRequest
              ? {
                  title: 'Từ chối yêu cầu đổi trả',
                  description: 'Vui lòng nhập lý do từ chối yêu cầu đổi trả của khách hàng để gửi phản hồi.',
                  placeholder: 'Nhập lý do từ chối cụ thể...',
                  confirmLabel: 'Xác nhận từ chối',
                  value: rejectReason,
                  onChange: setRejectReason,
                  onClose: () => setRejectingRequest(null),
                  onSubmit: handleRejectSubmit,
                }
              : null;

          if (!modalConfig) return null;

          return (
            <div className="manager-modal-overlay" style={{ zIndex: 2100 }}>
              <div className="manager-modal-box" style={{ maxWidth: '440px' }}>
                <div className="manager-modal-header">
                  <h3 style={{ color: '#ef4444' }}>{modalConfig.title}</h3>
                  <button
                    type="button"
                    onClick={modalConfig.onClose}
                    className="manager-modal-close-btn"
                    aria-label="Đóng"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={modalConfig.onSubmit}>
                  <div className="manager-modal-body">
                    <p style={{ fontSize: '0.875rem', color: 'var(--mgr-text-muted)', margin: 0 }}>
                      {modalConfig.description}
                    </p>
                    <textarea
                      rows={4}
                      placeholder={modalConfig.placeholder}
                      value={modalConfig.value}
                      onChange={(e) => modalConfig.onChange(e.target.value)}
                      className="manager-input"
                      style={{ width: '100%', resize: 'none' }}
                      autoFocus
                      required
                    />
                  </div>
                  <div className="manager-modal-footer">
                    <button
                      type="button"
                      onClick={modalConfig.onClose}
                      className="manager-btn-secondary"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="manager-btn-danger"
                      style={{ padding: '8px 18px', fontSize: '0.875rem' }}
                    >
                      {modalConfig.confirmLabel}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

        {/* APPROVE RETURN REQUEST MODAL */}
        {approvingRequest && (
          <div className="manager-modal-overlay" style={{ zIndex: 2100 }}>
            <div className="manager-modal-box" style={{ maxWidth: '440px', textAlign: 'center' }}>
              <div className="manager-modal-body" style={{ alignItems: 'center', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '52px',
                  height: '52px',
                  backgroundColor: '#ecfdf5',
                  color: 'var(--mgr-success)',
                  borderRadius: '50%',
                  marginTop: '12px'
                }}>
                  <CheckCircle size={28} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Duyệt yêu cầu đổi trả
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--mgr-text-muted)', lineHeight: '1.5', margin: 0 }}>
                  Bạn có chắc chắn muốn <strong>DUYỆT</strong> yêu cầu đổi trả này? Đơn hàng sẽ được chuyển sang trạng thái <strong>Đã hoàn tiền</strong> và tự động khôi phục số lượng sách tương ứng vào kho.
                </p>
              </div>
              <div className="manager-modal-footer" style={{ justifyContent: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setApprovingRequest(null)} 
                  className="manager-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="button"
                  onClick={handleApproveSubmit} 
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    borderRadius: 'var(--mgr-radius-md)',
                    backgroundColor: 'var(--mgr-success)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Xác nhận duyệt
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
