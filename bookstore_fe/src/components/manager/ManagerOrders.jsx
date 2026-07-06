import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerOrders = ({ orders, shippers, loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderPage, setOrderPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

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
          <option value="pending">Chờ xác nhận (Pending)</option>
          <option value="confirmed">Đã xác nhận (Confirmed)</option>
          <option value="preparing">Đang chuẩn bị (Preparing)</option>
          <option value="shipping">Đang giao (Shipping)</option>
          <option value="delivered">Đã giao hàng (Delivered)</option>
          <option value="cancelled">Đã hủy (Cancelled)</option>
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
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <>
                        <button
                          onClick={() => handleDeliverOrder(order.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#7c3aed',
                            color: '#ffffff',
                            border: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          Đã giao hàng
                        </button>
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                        >
                          Hủy ĐH
                        </button>
                      </>
                    )}
                    {order.status === 'delivered' && (
                      <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Hoàn thành
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>
                        Đã hủy
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
    </div>
  );
};

export default ManagerOrders;
