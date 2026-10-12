import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCSV } from '../../utils/exportUtils';

const ManagerRevenue = ({ user, orders }) => {
  const { showToast } = useApp();
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  const walletBalance = user?.walletBalance || 0;
  const averageOrderValue = deliveredOrders.length > 0 ? (totalRevenue / deliveredOrders.length) : 0;

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileType, setFileType] = useState('TXT');
  const [activePeriod, setActivePeriod] = useState('30 ngày');
  const [chartSubPeriod, setChartSubPeriod] = useState('Tuần');

  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    if (period === '7 ngày') {
      setChartSubPeriod('Hàng ngày');
    } else if (period === '30 ngày') {
      setChartSubPeriod('Tuần');
    } else if (period === '12 tháng') {
      setChartSubPeriod('Tháng');
    }
  };

  const handleExportReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Vui lòng chọn khoảng thời gian báo cáo!', 'error');
      return;
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (startDate > todayStr) {
      showToast('Ngày bắt đầu lớn hơn thời gian hiện tại', 'error');
      return;
    }
    if (endDate > todayStr) {
      showToast('Ngày kết thúc lớn hơn thời gian hiện tại', 'error');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showToast('Ngày bắt đầu không được lớn hơn ngày kết thúc!', 'error');
      return;
    }
    try {
      const reportOrders = deliveredOrders.filter(o => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
      const periodRevenue = reportOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
      
      let blob, filename;
      if (fileType === 'XLSX') {
        let content = "\uFEFFMã Đơn Hàng,Khách Hàng,Ngày Tạo,Tổng Tiền,Trạng Thái\n";
        reportOrders.forEach(o => {
          const dateStr = new Date(o.createdAt).toLocaleDateString('vi-VN');
          const name = o.user?.fullName || 'Khách vãng lai';
          content += `${o.id},${name},${dateStr},${o.finalAmount || 0},Đã giao hàng\n`;
        });
        content += `\nTổng doanh thu,,Thống kê từ ${startDate} đến ${endDate},${periodRevenue}đ,\n`;
        blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        filename = `Bao_cao_doanh_thu_${startDate}_den_${endDate}.csv`;
      } else {
        // TXT report
        let content = `BÁO CÁO DOANH THU BOOKSTORE\n`;
        content += `Khoảng thời gian: Từ ngày ${startDate} đến ngày ${endDate}\n`;
        content += `==================================================\n`;
        content += `TỔNG DOANH THU: ${periodRevenue.toLocaleString('vi-VN')}đ\n`;
        content += `SỐ ĐƠN HÀNG ĐÃ GIAO: ${reportOrders.length}\n`;
        content += `==================================================\n\n`;
        content += `DANH SÁCH ĐƠN HÀNG CHI TIẾT:\n`;
        reportOrders.forEach((o, index) => {
          const dateStr = new Date(o.createdAt).toLocaleDateString('vi-VN');
          const name = o.user?.fullName || 'Khách vãng lai';
          content += `${index + 1}. Mã ĐH: #${o.id} | Khách hàng: ${name} | Ngày: ${dateStr} | Tiền: ${(o.finalAmount || 0).toLocaleString('vi-VN')}đ\n`;
        });
        blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        filename = `Bao_cao_doanh_thu_${startDate}_den_${endDate}.txt`;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`Tải báo cáo ${fileType} thành công!`, 'success');
      setShowReportModal(false);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tải tệp báo cáo!', 'error');
    }
  };
  const getChartData = () => {
    const data = [];
    const now = new Date();
    
    if (chartSubPeriod === 'Hàng ngày') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
        
        const dayRevenue = deliveredOrders
          .filter(o => {
            if (!o.createdAt) return false;
            const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
            return orderDate === dateStr;
          })
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
          
        data.push({ label: dayLabel, value: dayRevenue });
      }
    } else if (chartSubPeriod === 'Tuần') {
      for (let i = 4; i >= 0; i--) {
        const start = new Date();
        start.setDate(now.getDate() - (i * 7) - 6);
        const end = new Date();
        end.setDate(now.getDate() - (i * 7));
        
        const startStr = start.toISOString().split('T')[0];
        const endStr = end.toISOString().split('T')[0];
        
        const weekLabel = `${start.getDate()}/${start.getMonth() + 1}-${end.getDate()}/${end.getMonth() + 1}`;
        
        const weekRevenue = deliveredOrders
          .filter(o => {
            if (!o.createdAt) return false;
            const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
            return orderDate >= startStr && orderDate <= endStr;
          })
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
          
        data.push({ label: weekLabel, value: weekRevenue });
      }
    } else if (chartSubPeriod === 'Tháng') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const year = d.getFullYear();
        const month = d.getMonth();
        
        const monthLabel = `T${month + 1}`;
        
        const monthRevenue = deliveredOrders
          .filter(o => {
            if (!o.createdAt) return false;
            const od = new Date(o.createdAt);
            return od.getFullYear() === year && od.getMonth() === month;
          })
          .reduce((sum, o) => sum + (o.finalAmount || 0), 0);
          
        data.push({ label: monthLabel, value: monthRevenue });
      }
    }
    return data;
  };
  
  const chartData = getChartData();
  const maxVal = Math.max(...chartData.map(d => d.value), 100000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Thống kê & Tài chính
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '4px 0 0' }}>
            Quản lý hoạt động kinh doanh của bạn
          </p>
        </div>

        <button 
          onClick={() => setShowReportModal(true)}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#7c3aed',
            color: '#ffffff',
            border: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 2px 4px rgba(124, 58, 237, 0.2)'
          }}
        >
          Tạo báo cáo
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="revenue-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        
        {/* DOANH THU */}
        <div className="manager-metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span className="metric-title" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>DOANH THU</span>
          <div className="metric-value" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <span className="metric-badge" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+12.5% so với tháng trước</span>
        </div>

        {/* SỐ DƯ VÍ */}
        <div className="manager-metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span className="metric-title" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>SỐ DƯ VÍ</span>
          <div className="metric-value" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#7c3aed', margin: '12px 0 8px' }}>
            {Math.round(walletBalance).toLocaleString('vi-VN')}đ
          </div>
          <span className="metric-badge" style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>+8.2% so với tháng trước</span>
        </div>

        {/* GIÁ TRỊ ĐƠN */}
        <div className="manager-metric-card" style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <span className="metric-title" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>GIÁ TRỊ ĐƠN</span>
          <div className="metric-value" style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', margin: '12px 0 8px' }}>
            {Math.round(averageOrderValue).toLocaleString('vi-VN')}đ
          </div>
          <span className="metric-badge" style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>({deliveredOrders.length || 0} Đơn hàng)</span>
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
            {['Hàng ngày', 'Tuần', 'Tháng'].map((sub) => (
              <button 
                key={sub} 
                onClick={() => setChartSubPeriod(sub)}
                style={{
                  padding: '4px 12px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: chartSubPeriod === sub ? '#f5f3ff' : 'transparent',
                  color: chartSubPeriod === sub ? '#7c3aed' : '#64748b',
                  cursor: 'pointer'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart elements */}
        <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 20px 0' }}>
          {chartData.map((item, index) => {
            const pct = (item.value / maxVal) * 100;
            const barHeight = Math.max((pct * 1.8), 10);
            
            let displayVal = "";
            if (item.value >= 1000000) {
              displayVal = `${(item.value / 1000000).toFixed(1)}M`;
            } else if (item.value >= 1000) {
              displayVal = `${Math.round(item.value / 1000)}k`;
            } else {
              displayVal = `${item.value}`;
            }

            return (
              <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' }}>
                <div style={{
                  width: '36px',
                  height: `${barHeight}px`,
                  background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                  borderRadius: '6px 6px 0 0',
                  position: 'relative',
                  transition: 'height 0.3s ease'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap'
                  }}>
                    {displayVal}
                  </div>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REPORT GENERATOR MODAL */}
      {showReportModal && (
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
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            fontFamily: "'Outfit', sans-serif"
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Tạo báo cáo doanh thu
            </h2>

            <form onSubmit={handleExportReport} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Từ ngày *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Đến ngày *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0', 
                    outline: 'none',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Định dạng tệp tin *
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['TXT', 'XLSX'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFileType(type)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: fileType === type ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        backgroundColor: fileType === type ? '#f5f3ff' : '#ffffff',
                        color: fileType === type ? '#7c3aed' : '#475569',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
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
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Xuất báo cáo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerRevenue;
