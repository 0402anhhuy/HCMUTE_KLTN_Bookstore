import React, { useEffect, useState } from 'react';
import { Eye, Check, X, ClipboardList, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const AdminDetailProduct = ({ productId, onBack, loadMainData }) => {
  const { showToast } = useApp();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${productId}`);
        setProduct(response.data);
      } catch (err) {
        console.error(err);
        showToast('Không thể tải chi tiết sản phẩm', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId, showToast]);

  const handleApprove = async () => {
    try {
      await api.put(`/products/${productId}`, { ...product, status: 'ACTIVE' });
      showToast('Đã duyệt sản phẩm thành công', 'success');
      loadMainData && loadMainData();
      onBack();
    } catch (err) {
      showToast('Lỗi khi duyệt sản phẩm', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await api.put(`/products/${productId}`, { ...product, status: 'INACTIVE' });
      showToast('Đã từ chối sản phẩm', 'success');
      loadMainData && loadMainData();
      onBack();
    } catch (err) {
      showToast('Lỗi khi từ chối sản phẩm', 'error');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải thông tin sản phẩm...</div>;
  }

  if (!product) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>Không tìm thấy sản phẩm!</div>;
  }

  const images = product.imageUrl ? product.imageUrl.split(' || ').map(s => s.trim()).filter(Boolean) : [];
  const displayImage = images.length > 0 ? images[0] : 'https://via.placeholder.com/300x400?text=No+Image';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.3s' }}>
      
      {/* Top Header */}
      <div>
        <button 
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '16px', fontWeight: 600, fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Quay lại danh sách
        </button>
      </div>

      {/* Main Detail Box */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #c8d1de', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header inside box */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Eye size={20} color="#92400e" />
            <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', letterSpacing: '0.5px' }}>SẢN PHẨM {product.id}</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#ffedd5', color: '#9a3412', fontSize: '0.75rem', fontWeight: 700 }}>Ưu tiên cao</span>
            <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.75rem', fontWeight: 700 }}>{product.category?.name || 'Đồ điện tử'}</span>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ display: 'flex', padding: '32px', gap: '40px' }}>
          
          {/* Left Cover Image */}
          <div style={{ flexShrink: 0, width: '260px', height: '360px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
            <img src={displayImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Right Details */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', textTransform: 'uppercase' }}>{product.name}</h2>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155', margin: '0 0 24px 0' }}>{product.author || 'Đang cập nhật'}</h3>

            <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>MÔ TẢ</div>
            <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, margin: '0 0 28px 0', textAlign: 'justify' }}>
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </p>

            <div style={{ marginBottom: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>GIÁ</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {product.price?.toLocaleString('vi-VN')}Đ
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ padding: '24px 32px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <button 
            onClick={handleReject}
            style={{ padding: '12px 32px', borderRadius: '6px', border: '1px solid #ef4444', backgroundColor: '#ffffff', color: '#ef4444', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
          >
            Từ chối
          </button>
          <button 
            onClick={handleApprove}
            style={{ padding: '12px 32px', borderRadius: '6px', border: 'none', backgroundColor: '#b45309', color: '#ffffff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' }}
          >
            Duyệt sản phẩm
          </button>
        </div>

      </div>
    </div>
  );
};

export default AdminDetailProduct;
