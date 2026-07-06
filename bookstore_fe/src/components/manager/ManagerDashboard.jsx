import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Truck
} from 'lucide-react';

// Import subcomponents
import DashboardHome from './DashboardHome';
import ManagerProducts from './ManagerProducts';
import ManagerOrders from './ManagerOrders';
import ManagerRevenue from './ManagerRevenue';
import ManagerReviews from './ManagerReviews';
import ManagerWarehouse from './ManagerWarehouse';
import ManagerShippers from './ManagerShippers';

const ManagerDashboard = () => {
  const { user, logoutUser, showToast } = useApp();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loading & Data State
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [shippers, setShippers] = useState([]);

  // Check role authorization
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'MANAGER' && user.role !== 'ADMIN') {
      showToast('Bạn không có quyền truy cập kênh quản lý!', 'error');
      navigate('/');
    }
  }, [user, navigate]);

  // Load all data on mount or when activeTab changes
  useEffect(() => {
    if (user && (user.role === 'MANAGER' || user.role === 'ADMIN')) {
      loadData();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await api.get('/categories');
      setCategories(catRes.data || []);

      // 2. Fetch products
      const prodRes = await api.get('/products');
      const fetchedProducts = prodRes.data.content || prodRes.data || [];
      setProducts(fetchedProducts);

      // 3. Fetch orders
      const orderRes = await api.get('/orders/all');
      setOrders(orderRes.data || []);

      // 4. Fetch reviews
      const reviewRes = await api.get('/reviews');
      setReviews(reviewRes.data || []);

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
      showToast('Lỗi tải dữ liệu kênh quản lý!', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Outfit', sans-serif",
      color: '#1e293b'
    }}>
      {/* Sidebar container */}
      <aside style={{
        width: '260px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 100
      }}>
        {/* Brand/Logo header */}
        <div style={{
          padding: '24px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', letterSpacing: '-0.025em' }}>
            Quản lý UTEShop
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748b' }}>
            Hệ Thống Quản Trị
          </span>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
            { id: 'products', label: 'Sản phẩm', icon: ShoppingBag },
            { id: 'orders', label: 'Đơn hàng', icon: ClipboardList },
            { id: 'revenue', label: 'Ví & Doanh thu', icon: Wallet },
            { id: 'reviews', label: 'Đánh giá & Bình luận', icon: MessageSquare },
            { id: 'warehouse', label: 'Quản lý giao dịch kho', icon: Warehouse },
            { id: 'shippers', label: 'Quản lý shipper', icon: Truck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isActive ? '#f5f3ff' : 'transparent',
                  color: isActive ? '#7c3aed' : '#475569',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.925rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: '12px',
                    bottom: '12px',
                    width: '4px',
                    backgroundColor: '#7c3aed',
                    borderRadius: '0 4px 4px 0'
                  }} />
                )}
                <Icon size={18} style={{ color: isActive ? '#7c3aed' : '#64748b' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div style={{ padding: '20px 16px', borderTop: '1px solid #e2e8f0' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid #fee2e2',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main panel content wrapper */}
      <div style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Top navbar header */}
        <header style={{
          height: '64px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          position: 'sticky',
          top: 0,
          zIndex: 90
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Kênh Quản Lý</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Direct Home Link */}
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              transition: 'all 0.2s'
            }}>
              <Home size={18} />
            </Link>

            {/* Bell icon */}
            <button style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Bell size={20} />
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#ef4444',
                borderRadius: '50%'
              }} />
            </button>

            {/* User display */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#7c3aed',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}>
                {user ? user.fullName.charAt(0).toUpperCase() : 'M'}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
                {user ? user.fullName : 'Manager'}
              </span>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main style={{ padding: '32px', flex: 1 }}>
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
                <ManagerRevenue orders={orders} />
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
