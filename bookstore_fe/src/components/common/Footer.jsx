import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: '#0a422d',
      color: '#ffffff',
      padding: '60px 40px 20px',
      fontSize: '0.85rem',
      fontFamily: "'Outfit', sans-serif"
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        paddingBottom: '40px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'left'
      }}>
        {/* Column 1: Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{
            fontSize: '1.8rem',
            fontWeight: '800',
            fontFamily: "'Playfair Display', 'Georgia', serif",
            color: '#ffffff',
            margin: 0
          }}>UTEShop</h2>
          <p style={{ color: '#d2dfd8', lineHeight: '1.6' }}>
            Nơi kết nối tri thức và tình yêu sách. Chúng tôi mang lại sự lựa chọn tốt nhất với các tác phẩm kinh điển và hiện đại chất lượng cao.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {/* Social media icons placeholder */}
            <a href="#" style={{ color: '#ffffff', fontSize: '1.2rem' }}>🌐</a>
            <a href="#" style={{ color: '#ffffff', fontSize: '1.2rem' }}>📘</a>
            <a href="#" style={{ color: '#ffffff', fontSize: '1.2rem' }}>📸</a>
          </div>
        </div>

        {/* Column 2: Cửa hàng */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Cửa hàng</h3>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Về chúng tôi</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Hệ thống cửa hàng</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Tuyển dụng</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Tin tức</Link>
        </div>

        {/* Column 3: Hỗ trợ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Hỗ trợ</h3>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Vận chuyển & Giao nhận</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Thanh toán an toàn</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Chính sách bảo mật</Link>
          <Link to="/" style={{ color: '#d2dfd8' }} onMouseEnter={(e) => e.target.style.color = '#ffffff'} onMouseLeave={(e) => e.target.style.color = '#d2dfd8'}>Điều khoản dịch vụ</Link>
        </div>

        {/* Column 4: Newsletter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>Đăng ký bản tin</h3>
          <p style={{ color: '#d2dfd8', lineHeight: '1.5' }}>Nhận thông tin cập nhật về các đầu sách mới và sự kiện khuyến mại đặc biệt.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Cảm ơn bạn đã đăng ký bản tin!'); }} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <input 
              type="email" 
              placeholder="Email của bạn..." 
              required
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#f0ede6',
                color: '#1c2e24',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              style={{
                backgroundColor: '#FAF9F6',
                color: '#0a422d',
                fontWeight: '600',
                padding: '10px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#e8e5df'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#FAF9F6'; }}
            >
              Gửi
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Info */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto 0',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        color: '#d2dfd8',
        fontSize: '0.8rem'
      }}>
        <span>© 2024 UTEShop. All rights reserved. Designed and Developed by Bookstore.</span>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span>Hotline: 1900 1234 (8:00 - 21:00)</span>
          <span>Email: support@uteshop.vn</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
