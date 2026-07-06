import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerShippers = ({ shippers, orders = [], loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [shipperStatusFilter, setShipperStatusFilter] = useState('ALL');
  const [shipperPage, setShipperPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Selected shipper for viewing orders
  const [selectedShipperForOrders, setSelectedShipperForOrders] = useState(null);

  // Modals state for Shippers
  const [showShipperModal, setShowShipperModal] = useState(false);
  const [showEditShipperModal, setShowEditShipperModal] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);

  // Form states for Shippers
  const [shipperForm, setShipperForm] = useState({
    fullName: '',
    phone: '',
    vehicle: '',
    status: 'ACTIVE'
  });

  const handleOpenShipperModal = () => {
    setShipperForm({
      fullName: '',
      phone: '',
      vehicle: '',
      status: 'ACTIVE'
    });
    setShowShipperModal(true);
  };

  const handleCreateShipper = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shippers', shipperForm);
      showToast('Thêm shipper thành công!', 'success');
      setShowShipperModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi thêm shipper!', 'error');
    }
  };

  const handleOpenEditShipperModal = (shipper) => {
    setEditingShipper(shipper);
    setShipperForm({
      fullName: shipper.fullName,
      phone: shipper.phone,
      vehicle: shipper.vehicle || '',
      status: shipper.status || 'ACTIVE'
    });
    setShowEditShipperModal(true);
  };

  const handleUpdateShipper = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/shippers/${editingShipper.id}`, shipperForm);
      showToast('Cập nhật shipper thành công!', 'success');
      setShowEditShipperModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi cập nhật shipper!', 'error');
    }
  };

  const handleDeleteShipper = async (shipperId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa shipper này?')) {
      try {
        await api.delete(`/shippers/${shipperId}`);
        showToast('Đã xóa shipper thành công!', 'success');
        loadData();
      } catch (error) {
        console.error(error);
        showToast(error.response?.data?.error || 'Lỗi khi xóa shipper!', 'error');
      }
    }
  };

  // Filtered and Paginated Shippers
  const filteredShippers = shippers.filter(s => {
    if (shipperStatusFilter === 'ALL') return true;
    return s.status === shipperStatusFilter;
  });

  const totalShipperPages = Math.ceil(filteredShippers.length / ITEMS_PER_PAGE) || 1;
  const paginatedShippers = filteredShippers.slice(
    (shipperPage - 1) * ITEMS_PER_PAGE,
    shipperPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Quản lý người giao hàng (Shipper)
        </h1>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={shipperStatusFilter}
            onChange={(e) => { setShipperStatusFilter(e.target.value); setShipperPage(1); }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '0.9rem',
              minWidth: '180px',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (ACTIVE)</option>
            <option value="INACTIVE">Tạm nghỉ (INACTIVE)</option>
          </select>

          <button
            onClick={handleOpenShipperModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>+ Thêm shipper</span>
          </button>
        </div>
      </div>

      {/* Shippers Table */}
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
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MÃ SHIPPER</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>HỌ VÀ TÊN</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>PHƯƠNG TIỆN (VEHICLE)</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TRẠNG THÁI</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedShippers.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#475569' }}>
                  #{s.id}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {s.fullName}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                  {s.phone}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>
                  {s.vehicle || 'Chưa cập nhật'}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: s.status === 'ACTIVE' ? '#ecfdf5' : '#fef2f2',
                    color: s.status === 'ACTIVE' ? '#10b981' : '#ef4444'
                  }}>
                    {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={() => setSelectedShipperForOrders(s)}
                      title="Xem các đơn hàng của shipper này"
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#10b981',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEditShipperModal(s)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Edit size={15} />
                    </button>
                    <button
                      onClick={() => handleDeleteShipper(s.id)}
                      style={{
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #fecaca',
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredShippers.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy shipper giao hàng nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {paginatedShippers.length} trên tổng số {filteredShippers.length} shipper
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={shipperPage === 1}
              onClick={() => setShipperPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: shipperPage === 1 ? '#f1f5f9' : '#ffffff',
                color: shipperPage === 1 ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: shipperPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            {[...Array(totalShipperPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setShipperPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: shipperPage === i + 1 ? '#7c3aed' : '#ffffff',
                  color: shipperPage === i + 1 ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={shipperPage === totalShipperPages}
              onClick={() => setShipperPage(prev => Math.min(prev + 1, totalShipperPages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: shipperPage === totalShipperPages ? '#f1f5f9' : '#ffffff',
                color: shipperPage === totalShipperPages ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: shipperPage === totalShipperPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ADD SHIPPER MODAL */}
      {showShipperModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Thêm shipper giao hàng mới
            </h2>

            <form onSubmit={handleCreateShipper} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên shipper..."
                  value={shipperForm.fullName}
                  onChange={(e) => setShipperForm({ ...shipperForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số điện thoại liên lạc..."
                  value={shipperForm.phone}
                  onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Phương tiện di chuyển (Vehicle)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Honda Wave, Xe máy, Xe tải..."
                  value={shipperForm.vehicle}
                  onChange={(e) => setShipperForm({ ...shipperForm, vehicle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trạng thái làm việc
                </label>
                <select
                  value={shipperForm.status}
                  onChange={(e) => setShipperForm({ ...shipperForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Tạm nghỉ (INACTIVE)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowShipperModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tạo mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT SHIPPER MODAL */}
      {showEditShipperModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '450px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Chỉnh sửa thông tin shipper
            </h2>

            <form onSubmit={handleUpdateShipper} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  value={shipperForm.fullName}
                  onChange={(e) => setShipperForm({ ...shipperForm, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số điện thoại *
                </label>
                <input
                  type="text"
                  required
                  value={shipperForm.phone}
                  onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Phương tiện di chuyển (Vehicle)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Honda Wave, Xe máy, Xe tải..."
                  value={shipperForm.vehicle}
                  onChange={(e) => setShipperForm({ ...shipperForm, vehicle: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trạng thái làm việc
                </label>
                <select
                  value={shipperForm.status}
                  onChange={(e) => setShipperForm({ ...shipperForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Tạm nghỉ (INACTIVE)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditShipperModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 24px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* SHIPPER ORDERS MODAL */}
      {selectedShipperForOrders && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '800px',
            maxHeight: '80vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Đơn hàng do Shipper {selectedShipperForOrders.fullName} phụ trách
              </h2>
              <button
                onClick={() => setSelectedShipperForOrders(null)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Đóng
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MÃ ĐH</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>KHÁCH HÀNG</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ĐỊA CHỈ GIAO HÀNG</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TỔNG TIỀN</th>
                    <th style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).map(order => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>
                        #{order.id}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.875rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.user?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{order.shippingPhone || order.user?.phone}</div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.825rem', color: '#475569', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {order.shippingAddress}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>
                        {parseFloat(order.finalAmount || order.totalAmount).toLocaleString('vi-VN')}đ
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
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
                    </tr>
                  ))}
                  {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                        Shipper này hiện chưa được giao đơn hàng nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerShippers;
