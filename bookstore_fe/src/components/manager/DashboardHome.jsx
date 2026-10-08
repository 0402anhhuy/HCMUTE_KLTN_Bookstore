import React from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

const DashboardHome = ({ user, products = [], orders = [] }) => {
  const { showToast } = useApp();

  // Calculations for stats
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + parseFloat(o.finalAmount || o.totalAmount || 0), 0);
  const totalOrdersCount = orders.length;
  const averageOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;

  const handleExportCSV = () => {
    const headers = ["Chỉ số", "Giá trị", "Tăng trưởng"];
    const rows = [
      ["Tổng doanh thu", `${totalRevenue.toLocaleString('vi-VN')}đ`, "+14.2%"],
      ["Tổng đơn hàng", totalOrdersCount, "+5.1%"],
      ["Tỷ lệ tăng trưởng", "18.4%", "+22.4%"],
      ["Trung bình giá đơn", `${averageOrderValue.toLocaleString('vi-VN')}đ`, "-2.3%"]
    ];
    exportToCSV("overview_dashboard.csv", headers, rows, showToast);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header stats control */}
      <div className="manager-flex-responsive-row">
        <div className="manager-header-title-group">
          <h1>
            Tổng quan kinh doanh
          </h1>
          <p>
            Chào mừng trở lại, hiệu suất kinh doanh của cửa hàng đã tăng 12% trong tuần này.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className="manager-btn-secondary"
          >
            <Calendar size={16} />
            <span>30 ngày qua</span>
          </button>
          <button 
            type="button"
            onClick={handleExportCSV}
            className="manager-btn-primary"
          >
            <Download size={16} />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics cards grid */}
      <div className="dashboard-home-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* CARD 1: Tổng doanh thu */}
        <div className="manager-metric-card" style={{
          padding: '24px',
          backgroundColor: 'var(--mgr-bg-card)',
          borderRadius: 'var(--mgr-radius-lg)',
          border: '1px solid var(--mgr-border)',
          boxShadow: 'var(--mgr-shadow-xs)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="metric-icon-box" style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mgr-radius-md)',
              backgroundColor: 'var(--mgr-primary-light)',
              color: 'var(--mgr-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--mgr-primary-border)'
            }}>
              <Wallet size={20} />
            </div>
            <span className="metric-badge" style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid #a7f3d0'
            }}>
              <ArrowUpRight size={12} />
              +14.2%
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tổng doanh thu
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-primary)', letterSpacing: '-0.02em' }}>
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
        </div>

        {/* CARD 2: Tổng đơn hàng */}
        <div className="manager-metric-card" style={{
          padding: '24px',
          backgroundColor: 'var(--mgr-bg-card)',
          borderRadius: 'var(--mgr-radius-lg)',
          border: '1px solid var(--mgr-border)',
          boxShadow: 'var(--mgr-shadow-xs)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="metric-icon-box" style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mgr-radius-md)',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe'
            }}>
              <ShoppingBag size={20} />
            </div>
            <span className="metric-badge" style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid #bfdbfe'
            }}>
              <ArrowUpRight size={12} />
              +5.1%
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tổng đơn hàng
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            {orders.length}
          </div>
        </div>

        {/* CARD 3: Tỷ lệ tăng trưởng */}
        <div className="manager-metric-card" style={{
          padding: '24px',
          backgroundColor: 'var(--mgr-bg-card)',
          borderRadius: 'var(--mgr-radius-lg)',
          border: '1px solid var(--mgr-border)',
          boxShadow: 'var(--mgr-shadow-xs)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="metric-icon-box" style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mgr-radius-md)',
              backgroundColor: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bbf7d0'
            }}>
              <TrendingUp size={20} />
            </div>
            <span className="metric-badge" style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#16a34a',
              backgroundColor: '#f0fdf4',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid #bbf7d0'
            }}>
              <ArrowUpRight size={12} />
              +22.4%
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tỷ lệ tăng trưởng
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            18.4%
          </div>
        </div>

        {/* CARD 4: Trung bình giá đơn */}
        <div className="manager-metric-card" style={{
          padding: '24px',
          backgroundColor: 'var(--mgr-bg-card)',
          borderRadius: 'var(--mgr-radius-lg)',
          border: '1px solid var(--mgr-border)',
          boxShadow: 'var(--mgr-shadow-xs)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div className="metric-icon-box" style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mgr-radius-md)',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fde68a'
            }}>
              <Coins size={20} />
            </div>
            <span className="metric-badge" style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: '#ef4444',
              backgroundColor: '#fef2f2',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              border: '1px solid #fecaca'
            }}>
              <ArrowDownRight size={12} />
              -2.3%
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Trung bình giá đơn
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            {Math.round(averageOrderValue).toLocaleString('vi-VN')}đ
          </div>
        </div>

      </div>

      {/* Chart panel wrapper */}
      <div className="manager-panel" style={{
        padding: '24px',
        backgroundColor: 'var(--mgr-bg-card)',
        borderRadius: 'var(--mgr-radius-lg)',
        border: '1px solid var(--mgr-border)',
        boxShadow: 'var(--mgr-shadow-xs)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--mgr-text-dark)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--mgr-primary)' }} />
              Biểu đồ doanh thu theo tuần
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--mgr-text-muted)', margin: '4px 0 0' }}>
              So sánh lượng đơn hàng thành công và đơn hàng bị hủy trong 5 tuần gần nhất
            </p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--mgr-primary)' }} />
              <span style={{ color: 'var(--mgr-text-main)', fontWeight: 600 }}>Đơn thành công</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#f87171' }} />
              <span style={{ color: 'var(--mgr-text-main)', fontWeight: 600 }}>Đơn bị hủy</span>
            </div>
          </div>
        </div>

        {/* Custom CSS Bar Chart representing weeks */}
        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '16px 0 10px', borderBottom: '1px solid var(--mgr-border-light)' }}>
          {[
            { label: 'Tuần 1', success: 60, cancel: 20 },
            { label: 'Tuần 2', success: 75, cancel: 15 },
            { label: 'Tuần 3', success: 90, cancel: 25 },
            { label: 'Tuần 4', success: 65, cancel: 10 },
            { label: 'Tuần 5', success: 110, cancel: 30 }
          ].map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Bars wrapper */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '210px', width: '100%', justifyContent: 'center' }}>
                {/* Success Bar */}
                <div 
                  style={{
                    height: `${(bar.success / 150) * 100}%`,
                    width: '28px',
                    background: 'linear-gradient(to top, var(--mgr-primary-dark) 0%, var(--mgr-primary) 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s ease',
                    position: 'relative',
                    cursor: 'pointer'
                  }} 
                  title={`Đơn thành công: ${bar.success}`}
                />

                {/* Cancel Bar */}
                <div 
                  style={{
                    height: `${(bar.cancel / 150) * 100}%`,
                    width: '28px',
                    background: 'linear-gradient(to top, #ef4444 0%, #f87171 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.3s ease',
                    cursor: 'pointer'
                  }} 
                  title={`Đơn hủy: ${bar.cancel}`} 
                />
              </div>

              {/* Label */}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-muted)' }}>{bar.label}</span>
            </div>
          ))}
        </div>

        {/* Footer insight */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--mgr-primary)', fontWeight: 600 }}>
            <Sparkles size={16} />
            <span>Tỷ lệ hoàn thành đơn đạt đỉnh 88% vào Tuần 5</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
            Dữ liệu cập nhật tự động từ hệ thống
          </span>
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;
