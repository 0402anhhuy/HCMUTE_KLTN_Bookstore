import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerWarehouse = ({ stockMovements, products, loadData, setStockMovements }) => {
  const { user, showToast } = useApp();

  // Filters and pagination state
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState('ALL');
  const [warehousePage, setWarehousePage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockForm, setStockForm] = useState({
    productId: '',
    productName: '',
    quantity: '',
    movementType: 'IMPORT',
    note: ''
  });

  const handleOpenWarehouseStockModal = () => {
    setStockForm({
      productId: products.length > 0 ? products[0].id : '',
      productName: products.length > 0 ? products[0].name : '',
      quantity: '',
      movementType: 'IMPORT',
      note: ''
    });
    setShowStockModal(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      const qty = parseInt(stockForm.quantity);
      if (isNaN(qty) || qty <= 0) {
        showToast('Số lượng điều chỉnh phải lớn hơn 0!', 'error');
        return;
      }
      const selectedProd = products.find(p => String(p.id) === String(stockForm.productId));
      const prodName = selectedProd ? selectedProd.name : 'Sản phẩm';

      await api.post(`/products/${stockForm.productId}/adjust-stock?quantity=${qty}&movementType=${stockForm.movementType}&note=${encodeURIComponent(stockForm.note)}`);
      showToast('Điều chỉnh tồn kho thành công!', 'success');
      setShowStockModal(false);

      // Update local movements log
      const newMov = {
        id: `GD${stockMovements.length + 1}`,
        date: new Date().toLocaleDateString('vi-VN'),
        type: stockForm.movementType,
        productName: prodName,
        quantity: qty,
        managerName: user?.fullName || 'Manager'
      };
      setStockMovements([newMov, ...stockMovements]);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi điều chỉnh tồn kho!', 'error');
    }
  };

  // Filtered and Paginated Warehouse Movements
  const filteredWarehouse = stockMovements.filter(mov => {
    if (warehouseTypeFilter === 'ALL') return true;
    return mov.type === warehouseTypeFilter;
  });

  const totalWarehousePages = Math.ceil(filteredWarehouse.length / ITEMS_PER_PAGE) || 1;
  const paginatedWarehouse = filteredWarehouse.slice(
    (warehousePage - 1) * ITEMS_PER_PAGE,
    warehousePage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Quản lý giao dịch kho
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={warehouseTypeFilter}
            onChange={(e) => { setWarehouseTypeFilter(e.target.value); setWarehousePage(1); }}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
              minWidth: '180px'
            }}
          >
            <option value="ALL">Tất cả giao dịch</option>
            <option value="IMPORT">Nhập kho (IMPORT)</option>
            <option value="EXPORT">Xuất kho (EXPORT)</option>
          </select>

          <button
            onClick={handleOpenWarehouseStockModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span> Điều chỉnh tồn kho</span>
          </button>
        </div>
      </div>

      {/* Warehouse log table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>MÃ GIAO DỊCH</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>NGÀY THỰC HIỆN</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>LOẠI GD</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SẢN PHẨM SÁCH</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SỐ LƯỢNG</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>NGƯỜI THỰC HIỆN</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWarehouse.map(mov => (
              <tr key={mov.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#475569' }}>
                  {mov.id}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#475569' }}>
                  {mov.date}
                </td>
                <td style={{ padding: '16px 24px' }}>
                  <span style={{
                    display: 'inline-flex',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: mov.type === 'IMPORT' ? '#ecfdf5' : mov.type === 'EXPORT' ? '#fff7ed' : '#f1f5f9',
                    color: mov.type === 'IMPORT' ? '#10b981' : mov.type === 'EXPORT' ? '#f97316' : '#64748b'
                  }}>
                    {mov.type === 'IMPORT' ? 'Nhập kho' : mov.type === 'EXPORT' ? 'Xuất kho' : 'Điều chỉnh'}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
                  {mov.productName}
                </td>
                <td style={{ padding: '16px 24px', fontWeight: 700, color: mov.type === 'IMPORT' ? '#10b981' : mov.type === 'EXPORT' ? '#ef4444' : '#64748b' }}>
                  {mov.type === 'IMPORT' ? '+' : mov.type === 'EXPORT' ? '-' : '='}{mov.quantity}
                </td>
                <td style={{ padding: '16px 24px', fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
                  {mov.managerName}
                </td>
              </tr>
            ))}
            {filteredWarehouse.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  Chưa có giao dịch kho nào được ghi nhận
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {paginatedWarehouse.length} trên tổng số {filteredWarehouse.length} giao dịch
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={warehousePage === 1}
              onClick={() => setWarehousePage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: warehousePage === 1 ? '#f1f5f9' : '#ffffff',
                color: warehousePage === 1 ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: warehousePage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            {[...Array(totalWarehousePages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setWarehousePage(i + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: warehousePage === i + 1 ? '#7c3aed' : '#ffffff',
                  color: warehousePage === i + 1 ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={warehousePage === totalWarehousePages}
              onClick={() => setWarehousePage(prev => Math.min(prev + 1, totalWarehousePages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: warehousePage === totalWarehousePages ? '#f1f5f9' : '#ffffff',
                color: warehousePage === totalWarehousePages ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: warehousePage === totalWarehousePages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {showStockModal && (
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
            maxWidth: '500px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Điều chỉnh tồn kho thủ công
            </h2>

            <form onSubmit={handleAdjustStock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Chọn sản phẩm sách *
                </label>
                <select
                  required
                  value={stockForm.productId}
                  onChange={(e) => {
                    const sel = products.find(p => String(p.id) === String(e.target.value));
                    setStockForm({
                      ...stockForm,
                      productId: e.target.value,
                      productName: sel ? sel.name : ''
                    });
                  }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Tồn hiện tại: {p.stockQuantity})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Loại giao dịch *
                </label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="movementType"
                      value="IMPORT"
                      checked={stockForm.movementType === 'IMPORT'}
                      onChange={(e) => setStockForm({ ...stockForm, movementType: e.target.value })}
                    />
                    Nhập kho (+ IMPORT)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: '#334155', fontWeight: 500, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="movementType"
                      value="EXPORT"
                      checked={stockForm.movementType === 'EXPORT'}
                      onChange={(e) => setStockForm({ ...stockForm, movementType: e.target.value })}
                    />
                    Xuất kho (- EXPORT)
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số lượng thay đổi *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Nhập số lượng..."
                  value={stockForm.quantity}
                  onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Lý do điều chỉnh / Ghi chú
                </label>
                <textarea
                  rows="3"
                  placeholder="Ví dụ: Nhập thêm sách đợt tháng 7, xuất trả nhà cung cấp..."
                  value={stockForm.note}
                  onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: 600,
                    cursor: 'pointer'
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
                    cursor: 'pointer'
                  }}
                >
                  Xác nhận điều chỉnh
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerWarehouse;
