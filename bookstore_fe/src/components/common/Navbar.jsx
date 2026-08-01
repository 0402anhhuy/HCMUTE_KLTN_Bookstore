import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShoppingCart, Bell, FileText, Search } from 'lucide-react';

const Navbar = () => {
  const { user, loading, cart, logoutUser, notifications, unreadCount, markNotificationRead, markAllNotificationsAsRead, showToast, favorites = [] } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/?keyword=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/');
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (n) => {
    if (!n.read) {
      markNotificationRead(n.id);
    }
    setShowNotifications(false);

    const isStaff = user && (user.role === 'MANAGER' || user.role === 'ADMIN');
    if (isStaff) {
      if (n.referenceType === 'orders' || n.type === 'ORDER') {
        navigate('/manager?tab=orders');
      } else if (n.referenceType === 'products' || n.type === 'PRODUCT') {
        navigate('/manager?tab=products');
      } else if (n.referenceType === 'reviews' || n.type === 'REVIEW') {
        navigate('/manager?tab=reviews');
      } else if (n.referenceType === 'return_requests' || n.type === 'RETURN') {
        navigate('/manager?tab=orders');
      } else {
        navigate('/manager?tab=dashboard');
      }
    } else {
      if (n.referenceType === 'orders' || n.type === 'ORDER' || n.referenceType === 'return_requests' || n.type === 'RETURN') {
        navigate('/orders');
      } else if (n.referenceType === 'products' && n.referenceId) {
        navigate(`/product/${n.referenceId}`);
      } else {
        navigate('/profile');
      }
    }
  };

  const totalCartItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      zIndex: 1000,
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      fontFamily: "'Outfit', sans-serif"
    }}>
      {/* Brand Logo */}
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        fontWeight: '800', 
        fontSize: '1.5rem', 
        color: '#1C3F24',
        textDecoration: 'none'
      }}>
        <span>UTEShop</span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '24px', marginLeft: '32px' }}>
        <Link to="/" style={{ color: '#4A5568', fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1C3F24'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4A5568'}>
          Trang chủ
        </Link>
        <Link to="/catalog" style={{ color: '#4A5568', fontWeight: 500, fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1C3F24'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4A5568'}>
          Khám phá kho sách
        </Link>
        {user && user.role === 'MANAGER' && (
          <Link to="/manager" style={{ color: '#1C3F24', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0f2615'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1C3F24'}>
            Kênh quản lý
          </Link>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/admin" style={{ color: '#1C3F24', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0f2615'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1C3F24'}>
            Kênh quản trị
          </Link>
        )}
      </div>

      {/* Center Search Input */}
      <form onSubmit={handleNavSearch} style={{ display: 'flex', alignItems: 'center', position: 'relative', margin: '0 auto', width: '320px' }}>
        <input 
          type="text" 
          placeholder="Tìm kiếm sách..." 
          value={navSearch}
          onChange={(e) => setNavSearch(e.target.value)}
          style={{
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 36px 8px 12px',
            fontSize: '0.85rem',
            color: '#1c2e24',
            width: '100%',
            outline: 'none'
          }}
        />
        <Search 
          size={16} 
          style={{ position: 'absolute', right: '12px', color: '#718096', cursor: 'pointer' }} 
          onClick={handleNavSearch} 
        />
      </form>

      {/* Right Icons & Auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginLeft: 'auto', position: 'relative' }}>
        
        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={toggleNotifications}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: '#4A5568', display: 'flex', alignItems: 'center' }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                background: '#ef4444',
                borderRadius: '50%'
              }} />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="glass-panel" style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 1010,
              padding: '12px 0',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              textAlign: 'left'
            }}>
              <div style={{ padding: '0 16px 8px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>Thông báo</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAllNotificationsAsRead(); }}
                      style={{ fontSize: '0.75rem', color: '#10b981', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                    >
                      Đã đọc tất cả
                    </button>
                  )}
                  {unreadCount > 0 && <span style={{ fontSize: '0.75rem', color: '#718096' }}>({unreadCount})</span>}
                </div>
              </div>
              {!user ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                  Vui lòng đăng nhập để xem thông báo
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#718096', fontSize: '0.9rem' }}>
                  Không có thông báo nào
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      backgroundColor: n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)',
                      transition: 'background-color 0.2s',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.03)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(16, 185, 129, 0.05)'}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: n.read ? '#4b5563' : '#111827', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#718096', lineHeight: '1.2' }}>{n.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Document Icon (Orders list) */}
        <Link to="/orders" style={{ padding: '8px', color: '#4A5568', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <FileText size={20} />
        </Link>

        {/* Heart Icon (Wishlist) */}
        <Link 
          to="/profile?tab=favorites" 
          style={{ position: 'relative', padding: '8px', color: '#4A5568', display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          {favorites.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '1px 5px',
              border: '1.5px solid #ffffff'
            }}>
              {favorites.length}
            </span>
          )}
        </Link>

        {/* Shopping Cart */}
        <Link to="/cart" style={{ position: 'relative', padding: '8px', color: '#4A5568', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <ShoppingCart size={20} />
          {totalCartItems > 0 && (
            <span style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              background: '#ef4444',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '999px',
              padding: '1px 5px',
              border: '1.5px solid #ffffff'
            }}>
              {totalCartItems}
            </span>
          )}
        </Link>

        {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '4px', minWidth: '120px' }}>
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Đang xác thực...</span>
            </div>
        ) : user ? (
          /* User Actions - Display Name & Logout Button Directly */
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '4px' }}>
            <Link 
              to="/profile" 
              style={{ 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                color: '#4a5568', 
                textDecoration: 'none',
                cursor: 'pointer' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1C3F24'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4a5568'}
            >
              {user.fullName}
            </Link>
            <button 
              onClick={handleLogout} 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.85rem', 
                borderRadius: '4px', 
                fontWeight: '600', 
                backgroundColor: '#1C3F24', 
                color: 'white',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2615'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C3F24'}
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          /* Guest Actions - Login Button Directly */
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '4px' }}>
            <Link 
              to="/login" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.85rem', 
                borderRadius: '4px', 
                fontWeight: '600', 
                backgroundColor: '#1C3F24', 
                color: 'white', 
                textDecoration: 'none',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f2615'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1C3F24'}
            >
              <span>Đăng nhập</span>
            </Link>
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;
