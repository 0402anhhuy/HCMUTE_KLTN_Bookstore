import React from 'react';

const ManagerRevenue = ({ orders }) => {
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const walletBalance = totalRevenue * 0.7; // 70% goes to wallet balance
  const averageOrderValue = deliveredOrders.length > 0 ? (totalRevenue / deliveredOrders.length) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Thống kê & Tài chính
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Quản lý hoạt động kinh doanh của bạn
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '8px' }}>
          {['7 ngày', '30 ngày', '12 tháng'].map((period, index) => (
            <button key={period} style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: index === 1 ? '#ffffff' : 'transparent',
              color: index === 1 ? '#0f172a' : '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: index === 1 ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}>
              {period}
            </button>
          ))}
          <button style={{
            marginLeft: '8px',
            padding: '6px 14px',
            borderRadius: '6px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Tạo báo cáo
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* DOANH THU */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>DOANH THU</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            {totalRevenue > 0 ? `${totalRevenue.toLocaleString('vi-VN')}đ` : '142.590.000đ'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+12.5% so với tháng trước</span>
        </div>

        {/* SỐ DƯ VÍ */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>SỐ DƯ VÍ</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#7c3aed', margin: '12px 0 8px' }}>
            {walletBalance > 0 ? `${Math.round(walletBalance).toLocaleString('vi-VN')}đ` : '98.210.500đ'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+8.2% so với tháng trước</span>
        </div>

        {/* GIÁ TRỊ ĐƠN */}
        <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>GIÁ TRỊ ĐƠN</span>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            {averageOrderValue > 0 ? `${Math.round(averageOrderValue).toLocaleString('vi-VN')}đ` : '4.120.000đ'}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({deliveredOrders.length || 0} Đơn hàng)</span>
        </div>

      </div>

      {/* Weekly bar chart */}
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Tổng quan doanh thu
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['Hàng ngày', 'Tuần', 'Tháng'].map((sub, i) => (
              <button key={sub} style={{
                padding: '4px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: '6px',
                backgroundColor: i === 1 ? '#f5f3ff' : 'transparent',
                color: i === 1 ? '#7c3aed' : '#64748b',
                cursor: 'pointer'
              }}>
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart elements */}
        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 20px 0' }}>
          {[
            { date: '01/05', value: 80 },
            { date: '08/05', value: 120 },
            { date: '15/05', value: 160 },
            { date: '22/05', value: 110 },
            { date: '29/05', value: 190 }
          ].map((item, index) => (
            <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
              <div style={{
                width: '32px',
                height: `${item.value}px`,
                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                borderRadius: '6px 6px 0 0',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#0f172a'
                }}>
                  {item.value}k
                </div>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerRevenue;
