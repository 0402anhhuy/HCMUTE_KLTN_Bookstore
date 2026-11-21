import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Wallet,
  MessageSquare,
  Warehouse,
  LogOut,
  Home,
  Bell,
  Truck,
  Menu,
  X
} from 'lucide-react';
import './ManagerDashboard.css';

// Import subcomponents
import DashboardHome from './DashboardHome';
import ManagerProducts from './ManagerProducts';
import ManagerOrders from './ManagerOrders';
import ManagerRevenue from './ManagerRevenue';
import ManagerReviews from './ManagerReviews';
import ManagerWarehouse from './ManagerWarehouse';
import ManagerShippers from './ManagerShippers';

const ManagerDashboard = () => {
  const { 
    user, 
    logoutUser, 
    showToast, 
    notifications, 
    unreadCount, 
    markNotificationRead,
    markAllNotificationsAsRead
  } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab, Sidebar & Notification State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Set active tab based on query param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Loading & Data State
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [shippers, setShippers] = useState([]);

  // Load all data on mount
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    const isInitial = products.length === 0 && orders.length === 0;
    if (isInitial) {
      setLoading(true);
    }
    try {
      // 1. Fetch categories
      try {
        const catRes = await api.get('/categories');
        setCategories(catRes.data || []);
      } catch (err) {
        console.error('Error fetching categories', err);
      }

      // 2. Fetch products
      try {
        const [activeRes, pendingRes, inactiveRes, rejectedRes] = await Promise.all([
          api.get('/products', { params: { size: 1000 } }),
          api.get('/products/status/PENDING').catch(() => ({ data: [] })),
          api.get('/products/status/INACTIVE').catch(() => ({ data: [] })),
          api.get('/products/status/REJECTED').catch(() => ({ data: [] }))
        ]);

        const activeList = activeRes.data?.content || (Array.isArray(activeRes.data) ? activeRes.data : []);
        const pendingList = Array.isArray(pendingRes.data) ? pendingRes.data : [];
        const inactiveList = Array.isArray(inactiveRes.data) ? inactiveRes.data : [];
        const rejectedList = Array.isArray(rejectedRes.data) ? rejectedRes.data : [];

        const productMap = new Map();
        [...activeList, ...pendingList, ...inactiveList, ...rejectedList].forEach((p) => {
          if (p && p.id) productMap.set(p.id, p);
        });
        setProducts(Array.from(productMap.values()));
      } catch (err) {
        console.error('Error fetching products', err);
      }

      // 3. Fetch orders
      try {
        const orderRes = await api.get('/orders/all');
        const sortedOrders = (orderRes.data || []).sort((a, b) => b.id - a.id);
        setOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching orders', err);
      }

      // 4. Fetch reviews
      try {
        const reviewRes = await api.get('/reviews');
        setReviews(reviewRes.data || []);
      } catch (err) {
        console.error('Error fetching reviews', err);
      }

      // 5. Fetch real stock movements
      try {
        const movementRes = await api.get('/products/stock-movements');
        const mappedMovements = (movementRes.data || []).map(m => ({
          id: `GD${m.id}`,
          date: new Date(m.createdAt).toLocaleDateString('vi-VN'),
          type: m.movementType,
          productName: m.product ? m.product.name : 'Sản phẩm',
          quantity: m.quantity,
          managerName: m.manager ? m.manager.fullName : 'Hệ thống'
        }));
        setStockMovements(mappedMovements);
      } catch (err) {
        console.error('Error fetching stock movements', err);
      }

      // 6. Fetch shippers
      try {
        const shipperRes = await api.get('/shippers');
        setShippers(shipperRes.data || []);
      } catch (err) {
        console.error('Error fetching shippers', err);
      }

    } catch (error) {
      console.error('Error loading manager dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markNotificationRead(n.id);
    }
    setShowNotifDropdown(false);
    
    if (n.referenceType === 'orders' || n.type === 'ORDER') {
      setActiveTab('orders');
    } else if (n.referenceType === 'products' || n.type === 'PRODUCT') {
      setActiveTab('products');
    } else if (n.referenceType === 'reviews' || n.type === 'REVIEW') {
      setActiveTab('reviews');
    } else if (n.referenceType === 'return_requests' || n.type === 'RETURN') {
      setActiveTab('orders');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="manager-layout-container">
      {/* Mobile Drawer Backdrop Overlay */}
      <div 
        className={`manager-sidebar-backdrop ${isMobileSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* Sidebar container */}
      <aside className={`manager-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Brand/Logo header */}
        <div className="manager-sidebar-brand">
          <div className="manager-brand-group">
            <div className="manager-brand-logo-icon">
              <ShoppingBag size={20} />
            </div>
            <div>
              <div className="manager-brand-title">
                Bookstore
                <span className="manager-brand-badge">Manager</span>
              </div>
              <div className="manager-brand-subtitle">
                Hệ Thống Quản Trị
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="manager-sidebar-close-btn"
            aria-label="Đóng thanh điều hướng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="manager-nav-list">
          {[
            { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
            { id: 'products', label: 'Sản phẩm', icon: ShoppingBag },
            { id: 'orders', label: 'Đơn hàng', icon: ClipboardList },
            { id: 'revenue', label: 'Ví & Doanh thu', icon: Wallet },
            { id: 'reviews', label: 'Đánh giá & Bình luận', icon: MessageSquare },
            { id: 'warehouse', label: 'Quản lý giao dịch kho', icon: Warehouse },
            { id: 'shippers', label: 'Quản lý người giao hàng', icon: Truck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`manager-nav-item ${isActive ? 'active' : ''}`}
              >
                {isActive && <div className="manager-nav-indicator" />}
                <Icon size={18} style={{ color: isActive ? '#7c3aed' : '#64748b', flexShrink: 0 }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="manager-sidebar-footer">
          <button
            onClick={handleLogout}
            className="manager-logout-btn"
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main panel content wrapper */}
      <div className="manager-main-wrapper">
        
        {/* Top navbar header */}
        <header className="manager-header">
          <div className="manager-header-left">
            <button 
              className="manager-hamburger-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </button>
            <span className="manager-header-title">Kênh Quản Lý</span>
          </div>

          <div className="manager-header-right">
            {/* Direct Home Link */}
            <Link 
              to="/" 
              className="manager-icon-circle-btn"
              title="Về trang chủ Bookstore"
            >
              <Home size={18} />
            </Link>

            {/* Bell icon & Notifications Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="manager-notif-btn"
                aria-label="Thông báo"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="manager-notif-badge">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="manager-notif-dropdown">
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid var(--mgr-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#f8fafc'
                  }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--mgr-text-dark)' }}>
                      Thông báo mới
                    </span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {unreadCount > 0 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); markAllNotificationsAsRead(); }}
                          style={{ fontSize: '0.75rem', color: '#7c3aed', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                        >
                          Đã đọc tất cả
                        </button>
                      )}
                      {unreadCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)' }}>
                          ({unreadCount})
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--mgr-text-muted)', fontSize: '0.85rem' }}>
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '12px 18px',
                            borderBottom: '1px solid var(--mgr-border-light)',
                            backgroundColor: n.read ? '#ffffff' : '#f5f3ff',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            textAlign: 'left'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = n.read ? '#f8fafc' : '#ede9fe'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? '#ffffff' : '#f5f3ff'}
                        >
                          <div style={{ 
                            fontWeight: n.read ? 600 : 700, 
                            fontSize: '0.85rem', 
                            color: n.read ? 'var(--mgr-text-main)' : 'var(--mgr-primary)',
                            marginBottom: '2px' 
                          }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', lineHeight: '1.4' }}>
                            {n.message}
                          </div>
                          <div style={{ 
                            fontSize: '0.68rem', 
                            color: 'var(--mgr-text-light)', 
                            marginTop: '4px',
                            textAlign: 'right' 
                          }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User display */}
            <div className="manager-user-pill">
              <div className="manager-user-avatar">
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'M'}
              </div>
              <span className="manager-user-name">
                {user?.fullName || 'Manager'}
              </span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="manager-content-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#64748b', fontWeight: 600 }}>
              Đang tải dữ liệu...
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardHome user={user} products={products} orders={orders} />
              )}
              {activeTab === 'products' && (
                <ManagerProducts products={products} categories={categories} loadData={loadData} />
              )}
              {activeTab === 'orders' && (
                <ManagerOrders orders={orders} shippers={shippers} loadData={loadData} />
              )}
              {activeTab === 'revenue' && (
                <ManagerRevenue user={user} orders={orders} />
              )}
              {activeTab === 'reviews' && (
                <ManagerReviews reviews={reviews} loadData={loadData} />
              )}
              {activeTab === 'warehouse' && (
                <ManagerWarehouse stockMovements={stockMovements} products={products} loadData={loadData} setStockMovements={setStockMovements} />
              )}
              {activeTab === 'shippers' && (
                <ManagerShippers shippers={shippers} orders={orders} loadData={loadData} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
