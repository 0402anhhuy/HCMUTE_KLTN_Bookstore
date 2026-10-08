import { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Truck, 
  Search, 
  Phone, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Package, 
  UserCheck, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Truck as TruckIcon
} from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState/EmptyState';

const ManagerShippers = ({ shippers = [], orders = [], loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [shipperStatusFilter, setShipperStatusFilter] = useState('ALL');
  const [shipperPage, setShipperPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Selected shipper for viewing orders
  const [selectedShipperForOrders, setSelectedShipperForOrders] = useState(null);

  // Modals state for Shippers
  const [showShipperModal, setShowShipperModal] = useState(false);
  const [showEditShipperModal, setShowEditShipperModal] = useState(false);
  const [editingShipper, setEditingShipper] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [submittingShipper, setSubmittingShipper] = useState(false);

  // Form states for Shippers
  const [shipperForm, setShipperForm] = useState({
    fullName: '',
    phone: '',
    vehicle: 'Xe máy',
    status: 'ACTIVE'
  });

  const handleOpenShipperModal = () => {
    setShipperForm({
      fullName: '',
      phone: '',
      vehicle: 'Xe máy',
      status: 'ACTIVE'
    });
    setShowShipperModal(true);
  };

  const handleCreateShipper = async (e) => {
    e.preventDefault();
    const trimmedPhone = shipperForm.phone ? shipperForm.phone.trim() : '';
    const phoneRegex = /^(0|\+84)[35789]\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      showToast('Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)', 'error');
      return;
    }
    setSubmittingShipper(true);
    try {
      await api.post('/shippers', {
        ...shipperForm,
        fullName: shipperForm.fullName.trim(),
        phone: trimmedPhone
      });
      showToast('Thêm người giao hàng mới thành công!', 'success');
      setShowShipperModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi thêm người giao hàng!', 'error');
    } finally {
      setSubmittingShipper(false);
    }
  };

  const handleOpenEditShipperModal = (shipper) => {
    setEditingShipper(shipper);
    setShipperForm({
      fullName: shipper.fullName,
      phone: shipper.phone,
      vehicle: shipper.vehicle || 'Xe máy',
      status: shipper.status || 'ACTIVE'
    });
    setShowEditShipperModal(true);
  };

  const handleUpdateShipper = async (e) => {
    e.preventDefault();
    const trimmedPhone = shipperForm.phone ? shipperForm.phone.trim() : '';
    const phoneRegex = /^(0|\+84)[35789]\d{8}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      showToast('Số điện thoại không hợp lệ (gồm 10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)', 'error');
      return;
    }
    setSubmittingShipper(true);
    try {
      await api.put(`/shippers/${editingShipper.id}`, {
        ...shipperForm,
        fullName: shipperForm.fullName.trim(),
        phone: trimmedPhone
      });
      showToast('Cập nhật thông tin người giao hàng thành công!', 'success');
      setShowEditShipperModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi cập nhật người giao hàng!', 'error');
    } finally {
      setSubmittingShipper(false);
    }
  };

  const handleDeleteShipper = async () => {
    if (!showDeleteConfirm) return;
    setSubmittingShipper(true);
    try {
      await api.delete(`/shippers/${showDeleteConfirm}`);
      showToast('Đã xóa người giao hàng thành công!', 'success');
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi xóa người giao hàng!', 'error');
      setShowDeleteConfirm(null);
    } finally {
      setSubmittingShipper(false);
    }
  };

  // Helper: Count active delivery orders of shipper
  const getActiveOrdersCount = (shipperId) => {
    return orders.filter(o => o.shipper?.id === shipperId && ['preparing', 'shipping'].includes(o.status)).length;
  };

  // Statistics
  const totalShippers = shippers.length;
  const activeShippers = useMemo(() => {
    return shippers.filter(s => s.status === 'ACTIVE').length;
  }, [shippers]);
  const inactiveShippers = useMemo(() => {
    return shippers.filter(s => s.status === 'INACTIVE').length;
  }, [shippers]);

  // Filtered and Paginated Shippers
  const filteredShippers = useMemo(() => {
    return shippers.filter(s => {
      const matchesStatus = shipperStatusFilter === 'ALL' || s.status === shipperStatusFilter;

      const keyword = searchKeyword.toLowerCase().trim();
      const matchesSearch = !keyword ||
        (s.fullName && s.fullName.toLowerCase().includes(keyword)) ||
        (s.phone && s.phone.toLowerCase().includes(keyword)) ||
        (s.vehicle && s.vehicle.toLowerCase().includes(keyword)) ||
        (String(s.id).includes(keyword));

      return matchesStatus && matchesSearch;
    });
  }, [shippers, shipperStatusFilter, searchKeyword]);

  const totalShipperPages = Math.ceil(filteredShippers.length / ITEMS_PER_PAGE) || 1;
  const paginatedShippers = filteredShippers.slice(
    (shipperPage - 1) * ITEMS_PER_PAGE,
    shipperPage * ITEMS_PER_PAGE
  );

  const isFilterActive = searchKeyword !== '' || shipperStatusFilter !== 'ALL';

  const handleClearFilters = () => {
    setSearchKeyword('');
    setShipperStatusFilter('ALL');
    setShipperPage(1);
  };

  // Helper for order status badge in view orders modal
  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-warning-light)', color: 'var(--mgr-warning)', border: '1px solid var(--mgr-warning-border)' }}>Chờ xác nhận</span>;
      case 'confirmed':
        return <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-info-light)', color: 'var(--mgr-info)', border: '1px solid var(--mgr-info-border)' }}>Đã xác nhận</span>;
      case 'preparing':
        return <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-primary-light)', color: 'var(--mgr-primary)', border: '1px solid var(--mgr-primary-border)' }}>Đang chuẩn bị</span>;
      case 'shipping':
        return <span className="manager-badge" style={{ backgroundColor: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd' }}>Đang giao hàng</span>;
      case 'delivered':
        return <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-success-light)', color: 'var(--mgr-success)', border: '1px solid var(--mgr-success-border)' }}>Đã giao hàng</span>;
      case 'cancelled':
        return <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-danger-light)', color: 'var(--mgr-danger)', border: '1px solid var(--mgr-danger-border)' }}>Đã hủy</span>;
      default:
        return <span className="manager-badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--mgr-text-muted)', border: '1px solid var(--mgr-border)' }}>{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header and Summary Badges */}
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0, letterSpacing: '-0.02em' }}>
            Quản lý người giao hàng
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--mgr-text-muted)' }}>
            Quản lý đội ngũ giao vận, phân bổ đơn hàng và theo dõi trạng thái hoạt động
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Quick Summary Badges */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--mgr-radius-md)',
            backgroundColor: 'var(--mgr-bg-card)',
            border: '1px solid var(--mgr-border)',
            boxShadow: 'var(--mgr-shadow-xs)'
          }}>
            <Truck size={15} style={{ color: 'var(--mgr-primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--mgr-text-muted)', fontWeight: 600 }}>Tổng số:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--mgr-text-dark)' }}>{totalShippers}</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: 'var(--mgr-radius-md)',
            backgroundColor: 'var(--mgr-success-light)',
            border: '1px solid var(--mgr-success-border)',
            color: 'var(--mgr-success)'
          }}>
            <UserCheck size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Hoạt động:</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{activeShippers}</span>
          </div>

          <button
            type="button"
            onClick={handleOpenShipperModal}
            className="manager-btn-primary"
            style={{ height: '42px' }}
          >
            <Plus size={16} />
            <span>Thêm người giao hàng</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="manager-panel" style={{ padding: '16px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mgr-text-light)' }} />
            <input
              type="text"
              placeholder="Tìm theo họ tên, số điện thoại hoặc phương tiện..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setShipperPage(1); }}
              className="manager-search-input"
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: searchKeyword ? '36px' : '14px',
                height: '42px',
                borderRadius: 'var(--mgr-radius-md)',
                border: '1px solid var(--mgr-border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--mgr-bg-card)',
                boxSizing: 'border-box'
              }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => { setSearchKeyword(''); setShipperPage(1); }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--mgr-text-light)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div style={{ flex: '0 1 190px', minWidth: '160px' }}>
            <select
              className="manager-filter-select"
              value={shipperStatusFilter}
              onChange={(e) => { setShipperStatusFilter(e.target.value); setShipperPage(1); }}
              style={{
                height: '42px',
                width: '100%',
                padding: '0 12px',
                borderRadius: 'var(--mgr-radius-md)',
                border: '1px solid var(--mgr-border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--mgr-bg-card)',
                color: 'var(--mgr-text-dark)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm nghỉ</option>
            </select>
          </div>

          {/* Reset button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="manager-btn-secondary"
              style={{ height: '42px', padding: '0 14px', fontSize: '0.825rem' }}
              title="Đặt lại bộ lọc về mặc định"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Shippers Desktop Table (Laptop 1366-1440px) */}
      <div className="manager-table-responsive manager-desktop-table">
        <table className="manager-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>MÃ SHIPPER</th>
              <th style={{ width: '22%' }}>HỌ VÀ TÊN</th>
              <th style={{ width: '18%' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ width: '16%' }}>PHƯƠNG TIỆN</th>
              <th style={{ width: '12%' }}>ĐƠN ĐANG GIAO</th>
              <th style={{ width: '10%' }}>TRẠNG THÁI</th>
              <th style={{ width: '10%', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedShippers.map(s => {
              const activeCount = getActiveOrdersCount(s.id);
              const initials = s.fullName?.charAt(0).toUpperCase() || 'S';

              return (
                <tr key={s.id}>
                  {/* MÃ SHIPPER */}
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--mgr-primary)' }}>
                      #{s.id}
                    </span>
                  </td>

                  {/* HỌ VÀ TÊN */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--mgr-primary-light)',
                        color: 'var(--mgr-primary)',
                        border: '1px solid var(--mgr-primary-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--mgr-text-dark)', fontSize: '0.9rem' }}>
                        {s.fullName}
                      </div>
                    </div>
                  </td>

                  {/* SỐ ĐIỆN THOẠI */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: 'var(--mgr-text-main)', fontWeight: 500 }}>
                      <Phone size={14} style={{ color: 'var(--mgr-text-muted)' }} />
                      <span>{s.phone}</span>
                    </div>
                  </td>

                  {/* PHƯƠNG TIỆN */}
                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 10px',
                      borderRadius: 'var(--mgr-radius-sm)',
                      backgroundColor: '#f1f5f9',
                      color: 'var(--mgr-text-main)',
                      fontSize: '0.825rem',
                      fontWeight: 600
                    }}>
                      <TruckIcon size={13} style={{ color: 'var(--mgr-text-muted)' }} />
                      <span>{s.vehicle || 'Chưa cập nhật'}</span>
                    </span>
                  </td>

                  {/* ĐƠN ĐANG GIAO */}
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: activeCount > 0 ? 'var(--mgr-primary)' : 'var(--mgr-text-muted)',
                      fontSize: '0.875rem'
                    }}>
                      {activeCount} đơn hàng
                    </span>
                  </td>

                  {/* TRẠNG THÁI */}
                  <td>
                    <span
                      className="manager-badge"
                      style={{
                        backgroundColor: s.status === 'ACTIVE' ? 'var(--mgr-success-light)' : 'var(--mgr-danger-light)',
                        color: s.status === 'ACTIVE' ? 'var(--mgr-success)' : 'var(--mgr-danger)',
                        border: `1px solid ${s.status === 'ACTIVE' ? 'var(--mgr-success-border)' : 'var(--mgr-danger-border)'}`
                      }}
                    >
                      {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                    </span>
                  </td>

                  {/* THAO TÁC */}
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedShipperForOrders(s)}
                        className="manager-btn-icon"
                        style={{ color: 'var(--mgr-primary)' }}
                        title="Xem các đơn hàng của người giao hàng này"
                        aria-label={`Xem đơn của ${s.fullName}`}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditShipperModal(s)}
                        className="manager-btn-icon"
                        style={{ color: 'var(--mgr-info)' }}
                        title="Chỉnh sửa thông tin shipper"
                        aria-label={`Chỉnh sửa ${s.fullName}`}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(s.id)}
                        className="manager-btn-icon"
                        style={{ color: 'var(--mgr-danger)' }}
                        title="Xóa người giao hàng này"
                        aria-label={`Xóa ${s.fullName}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredShippers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '48px 16px' }}>
                  <EmptyState
                    icon={Truck}
                    title="Không tìm thấy người giao hàng nào"
                    description={
                      isFilterActive
                        ? "Không có shipper nào phù hợp với bộ lọc trạng thái hoặc từ khóa tìm kiếm."
                        : "Hệ thống hiện chưa có người giao hàng nào trong danh sách."
                    }
                    actionText={isFilterActive ? "Xóa bộ lọc" : "Thêm người giao hàng"}
                    onAction={isFilterActive ? handleClearFilters : handleOpenShipperModal}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Desktop Pagination Controls */}
        {filteredShippers.length > 0 && (
          <div className="manager-pagination-bar">
            <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
              Hiển thị {paginatedShippers.length} trên tổng số {filteredShippers.length} người giao hàng (Trang {shipperPage}/{totalShipperPages})
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={shipperPage === 1}
                onClick={() => setShipperPage(prev => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalShipperPages)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setShipperPage(i + 1)}
                  className={`manager-page-btn ${shipperPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={shipperPage === totalShipperPages}
                onClick={() => setShipperPage(prev => Math.min(prev + 1, totalShipperPages))}
                className="manager-page-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Shippers Mobile Cards (iPhone 14 Pro Max & screens <= 768px) */}
      <div className="manager-mobile-card-list">
        {paginatedShippers.map(s => {
          const activeCount = getActiveOrdersCount(s.id);
          const initials = s.fullName?.charAt(0).toUpperCase() || 'S';

          return (
            <div key={s.id} className="manager-card-item">
              <div className="manager-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--mgr-primary-light)',
                    color: 'var(--mgr-primary)',
                    border: '1px solid var(--mgr-primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <span className="manager-card-title">{s.fullName}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--mgr-primary)', fontWeight: 600 }}>
                      Mã: #{s.id}
                    </div>
                  </div>
                </div>

                <span
                  className="manager-badge"
                  style={{
                    backgroundColor: s.status === 'ACTIVE' ? 'var(--mgr-success-light)' : 'var(--mgr-danger-light)',
                    color: s.status === 'ACTIVE' ? 'var(--mgr-success)' : 'var(--mgr-danger)',
                    border: `1px solid ${s.status === 'ACTIVE' ? 'var(--mgr-success-border)' : 'var(--mgr-danger-border)'}`
                  }}
                >
                  {s.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm nghỉ'}
                </span>
              </div>

              <div className="manager-card-body">
                <div className="manager-card-row">
                  <span className="manager-card-label">Số điện thoại:</span>
                  <span className="manager-card-value" style={{ fontWeight: 600 }}>{s.phone}</span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Phương tiện:</span>
                  <span className="manager-card-value">{s.vehicle || 'Chưa cập nhật'}</span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Đơn đang phụ trách:</span>
                  <span className="manager-card-value" style={{ fontWeight: 700, color: 'var(--mgr-primary)' }}>
                    {activeCount} đơn hàng
                  </span>
                </div>
              </div>

              {/* Action Buttons (Touch target >= 44px) */}
              <div className="manager-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedShipperForOrders(s)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: 'var(--mgr-radius-md)',
                    border: '1px solid var(--mgr-primary-border)',
                    backgroundColor: 'var(--mgr-primary-light)',
                    color: 'var(--mgr-primary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Eye size={15} />
                  <span>Xem đơn</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenEditShipperModal(s)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: 'var(--mgr-radius-md)',
                    border: '1px solid var(--mgr-info-border)',
                    backgroundColor: 'var(--mgr-info-light)',
                    color: 'var(--mgr-info)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Edit size={15} />
                  <span>Sửa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(s.id)}
                  style={{
                    minHeight: '44px',
                    padding: '0 14px',
                    borderRadius: 'var(--mgr-radius-md)',
                    border: '1px solid var(--mgr-danger-border)',
                    backgroundColor: 'var(--mgr-danger-light)',
                    color: 'var(--mgr-danger)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Xóa người giao hàng"
                  aria-label={`Xóa shipper ${s.fullName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredShippers.length === 0 && (
          <div className="manager-panel" style={{ padding: '32px 16px', textAlign: 'center' }}>
            <EmptyState
              icon={Truck}
              title="Không tìm thấy người giao hàng nào"
              description={
                isFilterActive
                  ? "Không có shipper nào phù hợp với bộ lọc."
                  : "Chưa có người giao hàng nào trong danh mục."
              }
              actionText={isFilterActive ? "Xem tất cả" : undefined}
              onAction={isFilterActive ? handleClearFilters : undefined}
            />
          </div>
        )}

        {/* Mobile Pagination */}
        {filteredShippers.length > 0 && totalShipperPages > 1 && (
          <div className="manager-pagination-bar" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              disabled={shipperPage === 1}
              onClick={() => setShipperPage(prev => Math.max(prev - 1, 1))}
              className="manager-page-btn"
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
              {shipperPage} / {totalShipperPages}
            </span>
            <button
              type="button"
              disabled={shipperPage === totalShipperPages}
              onClick={() => setShipperPage(prev => Math.min(prev + 1, totalShipperPages))}
              className="manager-page-btn"
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          ADD SHIPPER MODAL
          ========================================================================= */}
      {showShipperModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '480px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Thêm người giao hàng mới
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Đăng ký thông tin shipper vào hệ thống phân bổ giao nhận
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowShipperModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateShipper}>
              <div className="manager-modal-body" style={{ gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Họ và tên người giao hàng <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Hùng..."
                    value={shipperForm.fullName}
                    onChange={(e) => setShipperForm({ ...shipperForm, fullName: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Số điện thoại liên lạc <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 0987654321 hoặc +84987654321..."
                    value={shipperForm.phone}
                    onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Phương tiện di chuyển
                  </label>
                  <select
                    value={shipperForm.vehicle}
                    onChange={(e) => setShipperForm({ ...shipperForm, vehicle: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Xe máy">Xe máy</option>
                    <option value="Xe tải">Xe tải</option>
                    <option value="Xe đạp / Xe điện">Xe đạp / Xe điện</option>
                    <option value="Ô tô">Ô tô</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Trạng thái làm việc
                  </label>
                  <select
                    value={shipperForm.status}
                    onChange={(e) => setShipperForm({ ...shipperForm, status: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Tạm nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowShipperModal(false)}
                  className="manager-btn-secondary"
                  style={{ minHeight: '44px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingShipper}
                  className="manager-btn-primary"
                  style={{ minHeight: '44px' }}
                >
                  <Plus size={16} />
                  <span>{submittingShipper ? 'Đang thêm...' : 'Tạo mới'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT SHIPPER MODAL
          ========================================================================= */}
      {showEditShipperModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '480px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Chỉnh sửa người giao hàng
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Cập nhật họ tên, số điện thoại hoặc trạng thái làm việc
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditShipperModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateShipper}>
              <div className="manager-modal-body" style={{ gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Họ và tên người giao hàng <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperForm.fullName}
                    onChange={(e) => setShipperForm({ ...shipperForm, fullName: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Số điện thoại liên lạc <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shipperForm.phone}
                    onChange={(e) => setShipperForm({ ...shipperForm, phone: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Phương tiện di chuyển
                  </label>
                  <select
                    value={shipperForm.vehicle}
                    onChange={(e) => setShipperForm({ ...shipperForm, vehicle: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="Xe máy">Xe máy</option>
                    <option value="Xe tải">Xe tải</option>
                    <option value="Xe đạp / Xe điện">Xe đạp / Xe điện</option>
                    <option value="Ô tô">Ô tô</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Trạng thái làm việc
                  </label>
                  <select
                    value={shipperForm.status}
                    onChange={(e) => setShipperForm({ ...shipperForm, status: e.target.value })}
                    style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Tạm nghỉ</option>
                  </select>
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditShipperModal(false)}
                  className="manager-btn-secondary"
                  style={{ minHeight: '44px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingShipper}
                  className="manager-btn-primary"
                  style={{ minHeight: '44px' }}
                >
                  <Edit size={16} />
                  <span>{submittingShipper ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          SHIPPER ORDERS MODAL
          ========================================================================= */}
      {selectedShipperForOrders && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '820px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Đơn hàng do shipper {selectedShipperForOrders.fullName} phụ trách
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Mã shipper: #{selectedShipperForOrders.id} • SĐT: {selectedShipperForOrders.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedShipperForOrders(null)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <div className="manager-modal-body" style={{ padding: '20px' }}>
              {/* Desktop view */}
              <div className="manager-table-responsive manager-desktop-table" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <table className="manager-table">
                  <thead>
                    <tr>
                      <th style={{ width: '14%' }}>MÃ ĐH</th>
                      <th style={{ width: '26%' }}>KHÁCH HÀNG</th>
                      <th style={{ width: '28%' }}>ĐỊA CHỈ GIAO HÀNG</th>
                      <th style={{ width: '16%' }}>TỔNG TIỀN</th>
                      <th style={{ width: '16%', textAlign: 'center' }}>TRẠNG THÁI</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).map(order => (
                      <tr key={order.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--mgr-primary)' }}>
                            #{order.id}
                          </span>
                        </td>
                        <td>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--mgr-text-dark)' }}>{order.user?.fullName || 'Khách vãng lai'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)' }}>{order.shippingPhone || order.user?.phone}</div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {order.shippingAddress || 'Chưa cung cấp'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: 'var(--mgr-text-dark)', fontSize: '0.9rem' }}>
                            {parseFloat(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {renderOrderStatusBadge(order.status)}
                        </td>
                      </tr>
                    ))}

                    {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ padding: '36px 16px' }}>
                          <EmptyState
                            icon={Package}
                            title="Chưa có đơn hàng nào"
                            description={`Người giao hàng ${selectedShipperForOrders.fullName} hiện chưa được phân công đơn hàng nào.`}
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile view */}
              <div className="manager-mobile-card-list">
                {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).map(order => (
                  <div key={order.id} className="manager-card-item">
                    <div className="manager-card-header">
                      <span className="manager-card-title" style={{ color: 'var(--mgr-primary)' }}>
                        Đơn hàng #{order.id}
                      </span>
                      {renderOrderStatusBadge(order.status)}
                    </div>
                    <div className="manager-card-body">
                      <div className="manager-card-row">
                        <span className="manager-card-label">Khách hàng:</span>
                        <span className="manager-card-value">{order.user?.fullName || 'Khách vãng lai'}</span>
                      </div>
                      <div className="manager-card-row">
                        <span className="manager-card-label">SĐT nhận:</span>
                        <span className="manager-card-value">{order.shippingPhone || order.user?.phone}</span>
                      </div>
                      <div className="manager-card-row">
                        <span className="manager-card-label">Địa chỉ:</span>
                        <span className="manager-card-value" style={{ textAlign: 'right', maxWidth: '60%' }}>{order.shippingAddress}</span>
                      </div>
                      <div className="manager-card-row" style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--mgr-border-light)' }}>
                        <span className="manager-card-label" style={{ fontWeight: 700 }}>Tổng tiền:</span>
                        <span className="manager-card-value" style={{ fontWeight: 800, color: 'var(--mgr-primary)' }}>
                          {parseFloat(order.finalAmount || order.totalAmount || 0).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {orders.filter(o => o.shipper?.id === selectedShipperForOrders.id).length === 0 && (
                  <div style={{ padding: '24px 12px' }}>
                    <EmptyState
                      icon={Package}
                      title="Chưa có đơn hàng nào"
                      description={`Người giao hàng ${selectedShipperForOrders.fullName} hiện chưa có đơn hàng nào.`}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="manager-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedShipperForOrders(null)}
                className="manager-btn-secondary"
                style={{ minHeight: '44px' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {showDeleteConfirm && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '420px', textAlign: 'center', padding: '28px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--mgr-danger-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid var(--mgr-danger-border)'
            }}>
              <Trash2 size={28} style={{ color: 'var(--mgr-danger)' }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: '0 0 8px 0' }}>
              Xác nhận xóa người giao hàng
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--mgr-text-muted)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa người giao hàng này? Thao tác này sẽ gỡ bỏ thông tin shipper khỏi hệ thống phân công đơn hàng.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="manager-btn-secondary"
                style={{ flex: 1, minHeight: '44px', justifyContent: 'center' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteShipper}
                disabled={submittingShipper}
                className="manager-btn-danger"
                style={{ flex: 1, minHeight: '44px', justifyContent: 'center' }}
              >
                <Trash2 size={16} />
                <span>{submittingShipper ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerShippers;
