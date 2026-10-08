import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState/EmptyState';

const ManagerRevenue = ({ user, orders = [] }) => {
  const { showToast } = useApp();

  const deliveredOrders = useMemo(() => {
    return (orders || [])
      .filter(o => o.status === 'delivered')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders]);

  const totalRevenue = useMemo(() => {
    return deliveredOrders.reduce((sum, o) => sum + (o.finalAmount || 0), 0);
  }, [deliveredOrders]);

  const walletBalance = user?.walletBalance || 0;
  const averageOrderValue = deliveredOrders.length > 0 ? (totalRevenue / deliveredOrders.length) : 0;
  const deliveredCount = deliveredOrders.length;

  // Report Modal States
  const [showReportModal, setShowReportModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fileType, setFileType] = useState('XLSX');
  const [chartSubPeriod, setChartSubPeriod] = useState('Tuần');

  // Transactions Pagination State
  const [txPage, setTxPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalTxPages = Math.ceil(deliveredOrders.length / ITEMS_PER_PAGE) || 1;
  const paginatedDeliveredOrders = deliveredOrders.slice(
    (txPage - 1) * ITEMS_PER_PAGE,
    txPage * ITEMS_PER_PAGE
  );

  const handleExportReport = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast('Vui lòng chọn khoảng thời gian báo cáo!', 'error');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header and Report Action */}
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0, letterSpacing: '-0.02em' }}>
            Ví & Doanh thu
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--mgr-text-muted)' }}>
            Theo dõi dòng tiền, thống kê doanh thu thực nhận và xuất báo cáo tài chính
          </p>
        </div>

        <button 
          type="button"
          onClick={() => setShowReportModal(true)}
          className="manager-btn-primary"
          title="Tạo và xuất báo cáo tài chính theo khoảng thời gian"
        >
          <FileSpreadsheet size={16} />
          <span>Tạo báo cáo</span>
        </button>
      </div>

      {/* Financial Metrics Cards (4 Cards Grid) */}
      <div className="revenue-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        
        {/* DOANH THU THỰC NHẬN */}
        <div className="manager-metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">DOANH THU THỰC NHẬN</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--mgr-primary-light)', color: 'var(--mgr-primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--mgr-primary)', margin: '10px 0 6px' }}>
            {totalRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: 'var(--mgr-success)', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>Từ đơn giao thành công</span>
          </div>
        </div>

        {/* SỐ DƯ VÍ ĐỐI TÁC */}
        <div className="manager-metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">SỐ DƯ VÍ HIỆN TẠI</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--mgr-info-light)', color: 'var(--mgr-info)' }}>
              <Wallet size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--mgr-text-dark)', margin: '10px 0 6px' }}>
            {Math.round(walletBalance).toLocaleString('vi-VN')}đ
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--mgr-text-muted)', fontWeight: 500 }}>
            Số dư khả dụng trong ví
          </div>
        </div>

        {/* GIÁ TRỊ TRUNG BÌNH ĐƠN */}
        <div className="manager-metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">GIÁ TRỊ ĐƠN TB</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--mgr-warning-light)', color: 'var(--mgr-warning)' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--mgr-text-dark)', margin: '10px 0 6px' }}>
            {Math.round(averageOrderValue).toLocaleString('vi-VN')}đ
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--mgr-text-muted)', fontWeight: 500 }}>
            Doanh thu / Đơn giao
          </div>
        </div>

        {/* TỔNG ĐƠN ĐÃ GIAO */}
        <div className="manager-metric-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="metric-title">ĐƠN GIAO THÀNH CÔNG</span>
            <div className="metric-icon-box" style={{ backgroundColor: 'var(--mgr-success-light)', color: 'var(--mgr-success)' }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div className="metric-value" style={{ color: 'var(--mgr-text-dark)', margin: '10px 0 6px' }}>
            {deliveredCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--mgr-success)', fontWeight: 600 }}>
            Đơn hoàn tất đối soát
          </div>
        </div>

      </div>

      {/* Revenue Chart Section */}
      <div className="manager-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0, letterSpacing: '-0.01em' }}>
              Biểu đồ phân tích doanh thu
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
              Thống kê doanh thu theo mốc thời gian đã chọn
            </p>
          </div>

          <div style={{ 
            display: 'inline-flex', 
            padding: '4px', 
            borderRadius: 'var(--mgr-radius-md)', 
            backgroundColor: '#f1f5f9', 
            border: '1px solid var(--mgr-border)' 
          }}>
            {['Hàng ngày', 'Tuần', 'Tháng'].map((sub) => (
              <button 
                key={sub} 
                type="button"
                onClick={() => setChartSubPeriod(sub)}
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: 'none',
                  borderRadius: 'var(--mgr-radius-sm)',
                  backgroundColor: chartSubPeriod === sub ? '#ffffff' : 'transparent',
                  color: chartSubPeriod === sub ? 'var(--mgr-primary)' : 'var(--mgr-text-muted)',
                  cursor: 'pointer',
                  boxShadow: chartSubPeriod === sub ? 'var(--mgr-shadow-xs)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart canvas wrapper with smooth horizontal scroll for mobile */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '8px' }}>
          <div style={{ minWidth: '460px', height: '240px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '24px 16px 8px' }}>
            {chartData.map((item, index) => {
              const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
              const barHeight = Math.max((pct * 1.6), 12);
              
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
                    width: '38px',
                    height: `${barHeight}px`,
                    background: item.value > 0 
                      ? 'linear-gradient(180deg, var(--mgr-primary) 0%, #a78bfa 100%)' 
                      : '#e2e8f0',
                    borderRadius: '6px 6px 0 0',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    boxShadow: item.value > 0 ? '0 4px 10px rgba(124, 58, 237, 0.2)' : 'none'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '-24px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: item.value > 0 ? 'var(--mgr-text-dark)' : 'var(--mgr-text-light)',
                      whiteSpace: 'nowrap'
                    }}>
                      {displayVal}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Completed Revenue Transactions Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
            Lịch sử đơn hàng ghi nhận doanh thu
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
            Danh sách các đơn hàng đã giao thành công được tính vào tổng doanh thu cửa hàng
          </p>
        </div>

        {/* Desktop Transactions Table */}
        <div className="manager-table-responsive manager-desktop-table">
          <table className="manager-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>MÃ ĐƠN</th>
                <th style={{ width: '26%' }}>KHÁCH HÀNG</th>
                <th style={{ width: '20%' }}>NGÀY HOÀN THÀNH</th>
                <th style={{ width: '18%' }}>PHƯƠNG THỨC TT</th>
                <th style={{ width: '14%' }}>DOANH THU</th>
                <th style={{ width: '10%', textAlign: 'center' }}>TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeliveredOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--mgr-primary)' }}>
                      #{order.id}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--mgr-text-dark)' }}>
                        {order.user?.fullName || 'Khách vãng lai'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)' }}>
                        {order.shippingPhone || order.user?.phone || 'Chưa cập nhật SĐT'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-main)' }}>
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="manager-badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--mgr-text-main)', border: '1px solid var(--mgr-border)' }}>
                      {order.paymentMethod || 'COD'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--mgr-text-dark)', fontSize: '0.925rem' }}>
                      {(order.finalAmount || 0).toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-success-light)', color: 'var(--mgr-success)', border: '1px solid var(--mgr-success-border)' }}>
                      Đã giao
                    </span>
                  </td>
                </tr>
              ))}

              {deliveredOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 16px' }}>
                    <EmptyState
                      icon={Wallet}
                      title="Chưa có doanh thu được ghi nhận"
                      description="Sau khi đơn hàng được giao thành công đến tay người mua, dòng tiền doanh thu sẽ được hiển thị chi tiết tại đây."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Desktop Pagination */}
          {deliveredOrders.length > 0 && (
            <div className="manager-pagination-bar">
              <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
                Hiển thị {paginatedDeliveredOrders.length} trên tổng số {deliveredOrders.length} đơn hoàn thành (Trang {txPage}/{totalTxPages})
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  disabled={txPage === 1}
                  onClick={() => setTxPage(prev => Math.max(prev - 1, 1))}
                  className="manager-page-btn"
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalTxPages)].map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setTxPage(i + 1)}
                    className={`manager-page-btn ${txPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={txPage === totalTxPages}
                  onClick={() => setTxPage(prev => Math.min(prev + 1, totalTxPages))}
                  className="manager-page-btn"
                  aria-label="Trang sau"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Transactions Card View */}
        <div className="manager-mobile-card-list">
          {paginatedDeliveredOrders.map(order => (
            <div key={order.id} className="manager-card-item">
              <div className="manager-card-header">
                <span className="manager-card-title" style={{ color: 'var(--mgr-primary)' }}>
                  Đơn hàng #{order.id}
                </span>
                <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-success-light)', color: 'var(--mgr-success)', border: '1px solid var(--mgr-success-border)' }}>
                  Đã giao
                </span>
              </div>

              <div className="manager-card-body">
                <div className="manager-card-row">
                  <span className="manager-card-label">Khách hàng:</span>
                  <span className="manager-card-value">
                    {order.user?.fullName || 'Khách vãng lai'}
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Ngày hoàn thành:</span>
                  <span className="manager-card-value">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Hình thức TT:</span>
                  <span className="manager-card-value">
                    {order.paymentMethod || 'COD'}
                  </span>
                </div>
                <div className="manager-card-row" style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed var(--mgr-border-light)' }}>
                  <span className="manager-card-label" style={{ fontWeight: 700, color: 'var(--mgr-text-dark)' }}>Thực thu:</span>
                  <span className="manager-card-value" style={{ fontWeight: 800, color: 'var(--mgr-primary)', fontSize: '1.05rem' }}>
                    {(order.finalAmount || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          ))}

          {deliveredOrders.length === 0 && (
            <div className="manager-panel" style={{ padding: '32px 16px', textAlign: 'center' }}>
              <EmptyState
                icon={Wallet}
                title="Chưa có doanh thu được ghi nhận"
                description="Các đơn hàng được giao thành công sẽ hiển thị lịch sử đối soát tại đây."
              />
            </div>
          )}

          {/* Mobile Pagination */}
          {deliveredOrders.length > 0 && totalTxPages > 1 && (
            <div className="manager-pagination-bar" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                disabled={txPage === 1}
                onClick={() => setTxPage(prev => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
                {txPage} / {totalTxPages}
              </span>
              <button
                type="button"
                disabled={txPage === totalTxPages}
                onClick={() => setTxPage(prev => Math.min(prev + 1, totalTxPages))}
                className="manager-page-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          REPORT GENERATOR MODAL
          ========================================================================= */}
      {showReportModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '480px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Tạo báo cáo doanh thu
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Xuất dữ liệu đối soát doanh thu chi tiết theo khoảng thời gian
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleExportReport}>
              <div className="manager-modal-body" style={{ gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Từ ngày <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      style={{ 
                        width: '100%', 
                        minHeight: '42px',
                        padding: '10px 14px', 
                        borderRadius: 'var(--mgr-radius-sm)', 
                        border: '1px solid var(--mgr-border)', 
                        outline: 'none',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Đến ngày <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      style={{ 
                        width: '100%', 
                        minHeight: '42px',
                        padding: '10px 14px', 
                        borderRadius: 'var(--mgr-radius-sm)', 
                        border: '1px solid var(--mgr-border)', 
                        outline: 'none',
                        fontSize: '0.875rem',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Định dạng xuất tệp <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setFileType('XLSX')}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        borderRadius: 'var(--mgr-radius-md)',
                        border: fileType === 'XLSX' ? '2px solid var(--mgr-primary)' : '1px solid var(--mgr-border)',
                        backgroundColor: fileType === 'XLSX' ? 'var(--mgr-primary-light)' : '#ffffff',
                        color: fileType === 'XLSX' ? 'var(--mgr-primary)' : 'var(--mgr-text-main)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FileSpreadsheet size={18} />
                      <span>Excel (.CSV)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFileType('TXT')}
                      style={{
                        flex: 1,
                        minHeight: '44px',
                        borderRadius: 'var(--mgr-radius-md)',
                        border: fileType === 'TXT' ? '2px solid var(--mgr-primary)' : '1px solid var(--mgr-border)',
                        backgroundColor: fileType === 'TXT' ? 'var(--mgr-primary-light)' : '#ffffff',
                        color: fileType === 'TXT' ? 'var(--mgr-primary)' : 'var(--mgr-text-main)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FileText size={18} />
                      <span>Văn bản (.TXT)</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="manager-btn-secondary"
                  style={{ minHeight: '44px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="manager-btn-primary"
                  style={{ minHeight: '44px' }}
                >
                  <Download size={16} />
                  <span>Tải báo cáo về máy</span>
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
