import React from 'react';
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Download, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';

const DashboardHome = ({ user, products, orders }) => {
  // Calculations for stats
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const averageOrderValue = deliveredOrders.length > 0 ? (totalRevenue / deliveredOrders.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header stats control */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Tổng quan kinh doanh
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Chào mừng trở lại, hiệu suất kinh doanh của cửa hàng đã tăng 12% trong tuần này.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Calendar size={16} />
            <span>30 ngày qua</span>
          </button>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <Download size={16} />
            <span>Xuất file CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        
        {/* CARD 1 */}
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f5f3ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wallet size={20} />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#10b981',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <ArrowUpRight size={12} />
              +14.2%
            </span>
          </div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: '20px 0 4px' }}>
            TỔNG DOANH THU
          </h3>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a' }}>
            {totalRevenue > 0 ? `${totalRevenue.toLocaleString('vi-VN')}đ` : '10.000.000đ'}
          </div>
        </div>

        {/* CARD 2 */}
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#eff6ff',
              color: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={20} />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#10b981',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <ArrowUpRight size={12} />
              +5.1%
            </span>
          </div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: '20px 0 4px' }}>
            TỔNG ĐƠN HÀNG
          </h3>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a' }}>
            {orders.length > 0 ? orders.length : '100'}
          </div>
        </div>

        {/* CARD 3 */}
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              color: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={20} />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#10b981',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <ArrowUpRight size={12} />
              +22.4%
            </span>
          </div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: '20px 0 4px' }}>
            TỶ LỆ TĂNG TRƯỞNG
          </h3>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a' }}>
            18.4%
          </div>
        </div>

        {/* CARD 4 */}
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fff7ed',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Coins size={20} />
            </div>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#ef4444',
              backgroundColor: '#fef2f2',
              padding: '2px 8px',
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}>
              <ArrowDownRight size={12} />
              -2.3%
            </span>
          </div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', margin: '20px 0 4px' }}>
            TRUNG BÌNH GIÁ ĐƠN
          </h3>
          <div style={{ fontSize: '1.625rem', fontWeight: 700, color: '#0f172a' }}>
            {averageOrderValue > 0 ? `${Math.round(averageOrderValue).toLocaleString('vi-VN')}đ` : '100.000đ'}
          </div>
        </div>

      </div>

      {/* Chart panel wrapper */}
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Biểu đồ doanh thu
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#7c3aed' }} />
              <span style={{ color: '#64748b', fontWeight: 500 }}>Đơn hàng thành công</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              <span style={{ color: '#64748b', fontWeight: 500 }}>Đơn hàng bị hủy</span>
            </div>
          </div>
        </div>

        {/* Custom CSS Bar Chart representing weeks */}
        <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '20px', padding: '10px 0' }}>
          {[
            { label: 'Tuần 1', success: 60, cancel: 20 },
            { label: 'Tuần 2', success: 75, cancel: 15 },
            { label: 'Tuần 3', success: 90, cancel: 25 },
            { label: 'Tuần 4', success: 65, cancel: 10 },
            { label: 'Tuần 5', success: 110, cancel: 30 }
          ].map((bar, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              {/* Bars wrapper */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '220px', width: '100%', justifyContent: 'center' }}>
                {/* Success Bar */}
                <div style={{
                  height: `${(bar.success / 150) * 100}%`,
                  width: '24px',
                  backgroundColor: '#7c3aed',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease',
                  position: 'relative'
                }} title={`Success: ${bar.success}`}>
                  <div style={{
                    position: 'absolute',
                    top: '-25px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 10
                  }} className="chart-tooltip">
                    {bar.success * 10000}đ
                  </div>
                </div>

                {/* Cancel Bar */}
                <div style={{
                  height: `${(bar.cancel / 150) * 100}%`,
                  width: '24px',
                  backgroundColor: '#38bdf8',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease'
                }} title={`Cancel: ${bar.cancel}`} />
              </div>

              {/* Label */}
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>{bar.label}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default DashboardHome;
