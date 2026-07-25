import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Check, X, ClipboardList } from 'lucide-react';
import AdminDetailProduct from './AdminDetailProduct';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const AdminProducts = ({ products, categories, loadData }) => {
  const { showToast } = useApp();

  // Search & Filter state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('ALL');
  const [productPage, setProductPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    author: '',
    publisher: '',
    isbn: '',
    description: '',
    price: '',
    stockQuantity: 0,
    imageUrl: '',
    status: 'ACTIVE',
    categoryId: ''
  });

  const handleOpenAddModal = () => {
    setProductForm({
      name: '',
      author: '',
      publisher: '',
      isbn: '',
      description: '',
      price: '',
      stockQuantity: 0,
      imageUrl: '',
      status: 'ACTIVE',
      categoryId: categories.length > 0 ? categories[0].id : ''
    });
    setShowAddModal(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        author: productForm.author,
        publisher: productForm.publisher,
        isbn: productForm.isbn,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        imageUrl: productForm.imageUrl,
        status: productForm.status
      };
      await api.post(`/products?categoryId=${productForm.categoryId}`, payload);
      showToast('Thêm sản phẩm mới thành công!', 'success');
      setShowAddModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi thêm sản phẩm!', 'error');
    }
  };

  const handleOpenEditModal = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      author: product.author || '',
      publisher: product.publisher || '',
      isbn: product.isbn || '',
      description: product.description || '',
      price: product.price,
      stockQuantity: product.stockQuantity,
      imageUrl: product.imageUrl || '',
      status: product.status || 'ACTIVE',
      categoryId: product.category ? product.category.id : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: productForm.name,
        author: productForm.author,
        publisher: productForm.publisher,
        isbn: productForm.isbn,
        description: productForm.description,
        price: parseFloat(productForm.price),
        stockQuantity: parseInt(productForm.stockQuantity) || 0,
        imageUrl: productForm.imageUrl,
        status: productForm.status
      };
      await api.put(`/products/${editingProductId}?categoryId=${productForm.categoryId}`, payload);
      showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi cập nhật sản phẩm!', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/products/${id}`);
        showToast('Xóa sản phẩm thành công!', 'success');
        loadData();
      } catch (error) {
        console.error(error);
        showToast('Lỗi khi xóa sản phẩm!', 'error');
      }
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const getImagesList = (urlStr) => {
    if (!urlStr) return [];
    return urlStr.split(' || ').map(s => s.trim()).filter(Boolean);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploadingImage(true);
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const newUrl = response.data.url;
      setProductForm(prev => {
        const currentList = getImagesList(prev.imageUrl);
        const newList = [...currentList, newUrl];
        return { ...prev, imageUrl: newList.join(' || ') };
      });
      showToast('Tải ảnh lên thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.error || 'Lỗi khi tải ảnh lên!', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => {
      const currentList = getImagesList(prev.imageUrl);
      const newList = currentList.filter((_, idx) => idx !== index);
      return { ...prev, imageUrl: newList.join(' || ') };
    });
  };

  // Filtered and Paginated Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.author && p.author.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = categoryFilter === '' || (p.category && String(p.category.id) === String(categoryFilter));
    
    let matchesStatus = true;
    if (productStatusFilter === 'ACTIVE') matchesStatus = p.status === 'ACTIVE' && p.stockQuantity > 0;
    else if (productStatusFilter === 'INACTIVE') matchesStatus = p.status === 'INACTIVE';
    else if (productStatusFilter === 'OUT_OF_STOCK') matchesStatus = p.stockQuantity === 0;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalProductPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const paginatedProducts = filteredProducts.slice(
    (productPage - 1) * ITEMS_PER_PAGE,
    productPage * ITEMS_PER_PAGE
  );

  if (selectedProductId) {
    return <AdminDetailProduct productId={selectedProductId} onBack={() => setSelectedProductId(null)} loadMainData={loadData} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
      <style>{`
        .admin-table-row:hover {
          background-color: #f8fafc !important;
          cursor: pointer;
        }
      `}</style>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>Kiểm duyệt sản phẩm</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Quản lý sản phẩm, kiểm duyệt và hàng chờ tuân thủ.</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            color: '#475569',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            Xuất Excel
          </button>
          <button 
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>+ Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* 3 Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {/* Card 1 */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>ĐANG CHỜ DUYỆT</span>
            <ClipboardList size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>5</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>+5 hôm nay</div>
        </div>

        {/* Card 2 */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>ĐÃ DUYỆT</span>
            <Check size={20} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>52</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981' }}>đang bán</div>
        </div>

        {/* Card 3 */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>BỊ TỪ CHỐI</span>
            <X size={20} color="#ef4444" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>0</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>cần rà soát</div>
        </div>
      </div>

      {/* Table search & filter controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Tìm tên sản phẩm hoặc tác giả..."
            value={productSearch}
            onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
            style={{
              width: '100%',
              padding: '10px 16px 10px 42px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setProductPage(1); }}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '0.9rem',
            backgroundColor: '#ffffff',
            minWidth: '160px'
          }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={productStatusFilter}
          onChange={(e) => { setProductStatusFilter(e.target.value); setProductPage(1); }}
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
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Còn hàng / Đang bán</option>
          <option value="INACTIVE">Tạm ẩn</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>
      </div>

      {/* Table grid wrapper */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SẢN PHẨM</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>DANH MỤC</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TÁC GIẢ</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ĐƠN GIÁ</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>KHO HÀNG</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(p => {
              const isOutOfStock = p.stockQuantity === 0;
              return (
                <tr 
                  key={p.id} 
                  className="admin-table-row"
                  onClick={() => setSelectedProductId(p.id)}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={getImagesList(p.imageUrl)[0] || 'https://via.placeholder.com/40x60?text=Book'} 
                        alt={p.name}
                        style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #f1f5f9' }}
                      />
                      <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.925rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }} title={p.name}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ISBN: {p.isbn || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#fee2e2',
                      color: '#ef4444'
                    }}>
                      {p.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#475569', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    {p.author || 'Chưa rõ'}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                    {p.price?.toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        color: isOutOfStock ? '#ef4444' : '#0f172a',
                        fontSize: '0.925rem'
                      }}>
                        {p.stockQuantity} cuốn
                      </span>
                      <span style={{
                        display: 'inline-flex',
                        width: 'fit-content',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.675rem',
                        fontWeight: 700,
                        backgroundColor: p.status === 'ACTIVE' && p.stockQuantity > 0 ? '#ecfdf5' : '#fef2f2',
                        color: p.status === 'ACTIVE' && p.stockQuantity > 0 ? '#10b981' : '#ef4444'
                      }}>
                        {p.status === 'ACTIVE' && p.stockQuantity > 0 ? 'Đang bán' : isOutOfStock ? 'Hết hàng' : 'Tạm ẩn'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          backgroundColor: '#ef4444',
                          color: '#ffffff',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          display: 'inline-flex'
                        }}
                      >
                        Chờ duyệt
                      </span>
                    </div>
                  </td>

                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy sản phẩm nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {paginatedProducts.length} trên tổng số {filteredProducts.length} sản phẩm
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={productPage === 1}
              onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: productPage === 1 ? '#f1f5f9' : '#ffffff',
                color: productPage === 1 ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: productPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            {[...Array(totalProductPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setProductPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: productPage === i + 1 ? '#ef4444' : '#ffffff',
                  color: productPage === i + 1 ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage(prev => Math.min(prev + 1, totalProductPages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: productPage === totalProductPages ? '#f1f5f9' : '#ffffff',
                color: productPage === totalProductPages ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: productPage === totalProductPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
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
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Thêm sản phẩm sách mới
            </h2>

            <form onSubmit={handleCreateProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Đắc Nhân Tâm, Mật Ngữ Cuộc Đời..."
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tác giả
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên tác giả..."
                  value={productForm.author}
                  onChange={(e) => setProductForm({ ...productForm, author: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Nhà xuất bản
                </label>
                <input
                  type="text"
                  placeholder="Nhập nhà xuất bản..."
                  value={productForm.publisher}
                  onChange={(e) => setProductForm({ ...productForm, publisher: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Mã ISBN
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã ISBN..."
                  value={productForm.isbn}
                  onChange={(e) => setProductForm({ ...productForm, isbn: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Danh mục sách *
                </label>
                <select
                  required
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Giá bán (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Nhập giá bán..."
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số lượng kho *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Nhập số lượng ban đầu..."
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Danh sách ảnh sản phẩm (Có thể tải lên nhiều ảnh)
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="URL ảnh hoặc nhập URL..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                  <label style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    Tải ảnh từ máy
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block', marginBottom: '8px' }}>
                    Đang tải ảnh lên...
                  </span>
                )}

                {/* Uploaded images display */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {getImagesList(productForm.imageUrl).map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: '80px', height: '110px', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                      <img src={url} alt={`img-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: 0
                        }}
                      >
                        ✕
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        padding: '2px 0'
                      }}>
                        Ảnh {index + 1} {index === 0 && "(Bìa)"}
                      </div>
                    </div>
                  ))}
                  {getImagesList(productForm.imageUrl).length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Chưa có ảnh nào được tải lên.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows="3"
                  placeholder="Nhập mô tả chi tiết sản phẩm..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Tạo mới
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && (
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
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: '0 0 24px' }}>
              Chỉnh sửa thông tin sản phẩm
            </h2>

            <form onSubmit={handleUpdateProduct} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Tác giả
                </label>
                <input
                  type="text"
                  value={productForm.author}
                  onChange={(e) => setProductForm({ ...productForm, author: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Nhà xuất bản
                </label>
                <input
                  type="text"
                  value={productForm.publisher}
                  onChange={(e) => setProductForm({ ...productForm, publisher: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Mã ISBN
                </label>
                <input
                  type="text"
                  value={productForm.isbn}
                  onChange={(e) => setProductForm({ ...productForm, isbn: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Danh mục sách *
                </label>
                <select
                  required
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Giá bán (VND) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số lượng kho *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={productForm.stockQuantity}
                  onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trạng thái kinh doanh *
                </label>
                <select
                  required
                  value={productForm.status}
                  onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', backgroundColor: '#ffffff' }}
                >
                  <option value="ACTIVE">Đang bán</option>
                  <option value="INACTIVE">Tạm ẩn</option>
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Danh sách ảnh sản phẩm (Có thể tải lên nhiều ảnh)
                </label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="URL ảnh hoặc nhập URL..."
                    value={productForm.imageUrl}
                    onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                  <label style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    border: '1px solid #cbd5e1',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    Tải ảnh từ máy
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                {uploadingImage && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block', marginBottom: '8px' }}>
                    Đang tải ảnh lên...
                  </span>
                )}

                {/* Uploaded images display */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {getImagesList(productForm.imageUrl).map((url, index) => (
                    <div key={index} style={{ position: 'relative', width: '80px', height: '110px', borderRadius: '6px', border: '1px solid #e2e8f0', overflow: 'hidden', backgroundColor: '#fafafa' }}>
                      <img src={url} alt={`img-${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button 
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(239, 68, 68, 0.9)',
                          color: '#ffffff',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          padding: 0
                        }}
                      >
                        ✕
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(15, 23, 42, 0.65)',
                        color: '#ffffff',
                        fontSize: '0.65rem',
                        textAlign: 'center',
                        padding: '2px 0'
                      }}>
                        Ảnh {index + 1} {index === 0 && "(Bìa)"}
                      </div>
                    </div>
                  ))}
                  {getImagesList(productForm.imageUrl).length === 0 && (
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      Chưa có ảnh nào được tải lên.
                    </div>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Lưu thay đổi
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
