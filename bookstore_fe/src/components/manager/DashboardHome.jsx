import React, { useMemo } from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Download, 
  CheckCircle2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import { useApp } from '../../context/AppContext';

const DashboardHome = ({ user, products = [], orders = [] }) => {
  const { showToast } = useApp();

  // 1. Calculations for stats (Real Data)
  const deliveredOrders = useMemo(() => {
    return (orders || []).filter(o => {
      const st = (o.status || '').toLowerCase();
      return st === 'delivered' || st === 'completed';
    });
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return deliveredOrders.reduce(
      (sum, o) => sum + Number(o.finalAmount || o.totalAmount || 0),
      0
    );
  }, [deliveredOrders]);

  const totalOrdersCount = (orders || []).length;
  const averageOrderValue = deliveredOrders.length > 0 ? Math.round(totalRevenue / deliveredOrders.length) : 0;
  const deliveryRate = totalOrdersCount > 0 ? Math.round((deliveredOrders.length / totalOrdersCount) * 100) : 0;

  // 2. Real Weekly Orders Data (Last 5 Weeks)
  const weeklyChartData = useMemo(() => {
    const now = new Date();
    const weeks = [
      { label: 'Tuần 1', startDays: 35, endDays: 28, success: 0, cancel: 0, revenue: 0 },
      { label: 'Tuần 2', startDays: 28, endDays: 21, success: 0, cancel: 0, revenue: 0 },
      { label: 'Tuần 3', startDays: 21, endDays: 14, success: 0, cancel: 0, revenue: 0 },
      { label: 'Tuần 4', startDays: 14, endDays: 7, success: 0, cancel: 0, revenue: 0 },
      { label: 'Tuần 5', startDays: 7, endDays: 0, success: 0, cancel: 0, revenue: 0 },
    ];

    (orders || []).forEach(o => {
      const dateStr = o.deliveredAt || o.delivered_at || o.createdAt || o.created_at;
      if (!dateStr) return;
      const d = new Date(dateStr);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
      const st = (o.status || '').toLowerCase();
      const isSuccess = st === 'delivered' || st === 'completed';
      const isCancel = st === 'cancelled' || st === 'rejected';

      weeks.forEach(w => {
        if (diffDays >= w.endDays && diffDays < w.startDays) {
          if (isSuccess) {
            w.success += 1;
            w.revenue += Number(o.finalAmount || o.totalAmount || 0);
          } else if (isCancel) {
            w.cancel += 1;
          }
        }
      });
    });

    const maxVal = Math.max(...weeks.map(w => Math.max(w.success, w.cancel)), 1);
    const totalSuccess = weeks.reduce((sum, w) => sum + w.success, 0);
    const totalCancel = weeks.reduce((sum, w) => sum + w.cancel, 0);
    const total5Weeks = totalSuccess + totalCancel;
    const successRate = total5Weeks > 0 ? Math.round((totalSuccess / total5Weeks) * 100) : 100;

    return { weeks, maxVal, totalSuccess, totalCancel, total5Weeks, successRate };
  }, [orders]);

  const handleExportCSV = () => {
    const headers = ["Chỉ số", "Giá trị", "Ghi chú"];
    const rows = [
      ["Tổng doanh thu thực tế", `${totalRevenue.toLocaleString('vi-VN')}đ`, "Từ các đơn đã giao thành công"],
      ["Tổng số đơn hàng", totalOrdersCount, "Toàn bộ đơn hàng"],
      ["Tỷ lệ giao thành công", `${deliveryRate}%`, `${deliveredOrders.length}/${totalOrdersCount} đơn`],
      ["Giá trị trung bình / đơn", `${averageOrderValue.toLocaleString('vi-VN')}đ`, "AOV thực tế"]
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
            Báo cáo hiệu suất kinh doanh thực tế từ hệ thống quản lý đơn hàng
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
              gap: '4px',
              border: '1px solid #a7f3d0'
            }}>
              <CheckCircle2 size={12} />
              Thực thu
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
              gap: '4px',
              border: '1px solid #bfdbfe'
            }}>
              <CheckCircle size={12} />
              {deliveredOrders.length} hoàn tất
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tổng đơn hàng
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            {totalOrdersCount}
          </div>
        </div>

        {/* CARD 3: Tỷ lệ hoàn thành */}
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
              gap: '4px',
              border: '1px solid #bbf7d0'
            }}>
              Tỷ lệ giao
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Tỷ lệ hoàn thành
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            {deliveryRate}%
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
              color: '#d97706',
              backgroundColor: '#fffbeb',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #fde68a'
            }}>
              AOV
            </span>
          </div>
          <h3 className="metric-title" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-muted)', margin: '18px 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Trung bình giá đơn
          </h3>
          <div className="metric-value" style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--mgr-text-dark)', letterSpacing: '-0.02em' }}>
            {averageOrderValue.toLocaleString('vi-VN')}đ
          </div>
        </div>

      </div>

      {/* Chart panel wrapper */}
      <div className="manager-panel" style={{
        padding: '24px',
        backgroundColor: 'var(--mgr-bg-card)',
        borderRadius: 'var(--mgr-radius-lg)',
        border: '1px solid var(--mgr-border)',
        boxShadow: 'var(--mgr-shadow-xs)',
        overflow: 'hidden'
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

        {/* Scrollable container to prevent overflow on mobile & narrow screens */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '12px', minWidth: '380px', padding: '16px 8px 10px', borderBottom: '1px solid var(--mgr-border-light)' }}>
            {weeklyChartData.weeks.map((bar, i) => {
              const successH = bar.success > 0 ? Math.max(Math.round((bar.success / weeklyChartData.maxVal) * 100), 12) : 4;
              const cancelH = bar.cancel > 0 ? Math.max(Math.round((bar.cancel / weeklyChartData.maxVal) * 100), 12) : 4;

              return (
                <div key={i} style={{ flex: 1, minWidth: '55px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {/* Bars wrapper */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '210px', width: '100%', justifyContent: 'center' }}>
                    {/* Success Bar */}
                    <div 
                      style={{
                        height: `${successH}%`,
                        width: 'clamp(14px, 3.5vw, 24px)',
                        background: 'linear-gradient(to top, var(--mgr-primary-dark) 0%, var(--mgr-primary) 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease',
                        position: 'relative',
                        cursor: 'pointer'
                      }} 
                      title={`${bar.label}: ${bar.success} đơn thành công (${bar.revenue.toLocaleString('vi-VN')}đ)`}
                    />

                    {/* Cancel Bar */}
                    <div 
                      style={{
                        height: `${cancelH}%`,
                        width: 'clamp(14px, 3.5vw, 24px)',
                        background: 'linear-gradient(to top, #ef4444 0%, #f87171 100%)',
                        borderRadius: '6px 6px 0 0',
                        transition: 'height 0.3s ease',
                        cursor: 'pointer'
                      }} 
                      title={`${bar.label}: ${bar.cancel} đơn bị hủy`} 
                    />
                  </div>

                  {/* Label */}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--mgr-text-muted)', whiteSpace: 'nowrap' }}>
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer insight */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--mgr-primary)', fontWeight: 600 }}>
            <TrendingUp size={16} />
            <span>
              {weeklyChartData.total5Weeks > 0 
                ? `Tỷ lệ hoàn thành đơn: ${weeklyChartData.successRate}% (${weeklyChartData.totalSuccess}/${weeklyChartData.total5Weeks} đơn trong 5 tuần qua)`
                : "Dữ liệu được cập nhật tự động theo thời gian thực từ hệ thống"}
            </span>
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
