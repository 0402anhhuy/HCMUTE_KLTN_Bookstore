import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  buildCategoryTree,
  flattenCategoryTree,
  formatCategoryLabel,
  getCategoryPath,
  isCategoryOrChildOf,
} from '../../utils/categoryTree';
import CategorySelector from '../common/CategorySelector/CategorySelector';
import { exportToCSV } from '../../utils/exportUtils';

const ManagerProducts = ({ products, categories, loadData }) => {
  const { showToast } = useApp();

  const categoryOptions = useMemo(
    () => flattenCategoryTree(buildCategoryTree(categories)),
    [categories],
  );
  const defaultCategoryId = categoryOptions.find((category) => !category.hasChildren)?.id || '';

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    author: '',
    publisher: '',
    isbn: '',
    supplierName: '',
    publicationYear: '',
    weight: '',
    dimensions: '',
    format: '',
    description: '',
    price: '',
    page: '',
    language: 'Tiếng Việt',
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
      supplierName: '',
      publicationYear: '',
      weight: '',
      dimensions: '',
      format: '',
      description: '',
      price: '',
      page: '',
      language: 'Tiếng Việt',
      stockQuantity: 0,
      imageUrl: '',
      status: 'ACTIVE',
      categoryId: defaultCategoryId
    });
    setShowAddModal(true);
  };

  const parseOptionalInt = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const buildProductPayload = () => {
    const imageList = getImagesList(productForm.imageUrl);
    return {
      name: productForm.name,
      author: productForm.author,
      publisher: productForm.publisher,
      isbn: productForm.isbn,
      supplierName: productForm.supplierName,
      publicationYear: parseOptionalInt(productForm.publicationYear),
      weight: parseOptionalInt(productForm.weight),
      dimensions: productForm.dimensions,
      format: productForm.format,
      description: productForm.description,
      price: parseFloat(productForm.price),
      page: parseInt(productForm.page, 10),
      language: productForm.language,
      stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
      imageUrl: imageList[0] || '',
      imageUrls: imageList,
      status: productForm.status
    };
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = buildProductPayload();
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
      supplierName: product.supplierName || '',
      publicationYear: product.publicationYear ?? '',
      weight: product.weight ?? '',
      dimensions: product.dimensions || '',
      format: product.format || '',
      description: product.description || '',
      price: product.price,
      page: product.page ?? '',
      language: product.language || 'Tiếng Việt',
      stockQuantity: product.stockQuantity,
      imageUrl: getImagesList(product.imageUrls || product.imageUrl).join(' || '),
      status: product.status || 'ACTIVE',
      categoryId: product.category ? product.category.id : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = buildProductPayload();
      await api.put(`/products/${editingProductId}?categoryId=${productForm.categoryId}`, payload);
      showToast('Cập nhật thông tin sản phẩm thành công!', 'success');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error(error);
      showToast('Lỗi khi cập nhật sản phẩm!', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!showDeleteConfirm) return;
    try {
      await api.delete(`/products/${showDeleteConfirm}`);
      showToast('Xóa sản phẩm thành công!', 'success');
      setShowDeleteConfirm(null);
      loadData();
    } catch (error) {
      console.error(error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Lỗi khi xóa sản phẩm!';
      showToast(errMsg, 'error');
      setShowDeleteConfirm(null);
    }
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const getImagesList = (urlStr) => {
    if (!urlStr) return [];
    if (Array.isArray(urlStr)) return urlStr.filter(Boolean);
    return String(urlStr).split('||').map(s => s.trim()).filter(Boolean);
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
    const matchesCategory = categoryFilter === '' || isCategoryOrChildOf(p.category, categoryFilter, categories);

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

  const handleExportExcel = () => {
    const headers = ["ID", "Tên sản phẩm", "ISBN", "Tác giả", "Giá (VNĐ)", "Kho", "Trạng thái", "Danh mục"];
    const rows = filteredProducts.map(p => [
      p.id,
      p.name,
      p.isbn || '',
      p.author || '',
      p.price,
      p.stockQuantity,
      p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn',
      getCategoryPath(p.category) || p.category?.name || ''
    ]);
    exportToCSV("danh_sach_san_pham.csv", headers, rows, showToast);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header and Add New button */}
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Quản lý sản phẩm
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleExportExcel}
            style={{
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
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Table search & filter controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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

        <CategorySelector
          categories={categories}
          value={categoryFilter}
          onChange={(val) => { setCategoryFilter(val); setProductPage(1); }}
          placeholder="Tất cả danh mục"
        />

        <select
          className="manager-filter-select"
          value={productStatusFilter}
          onChange={(e) => { setProductStatusFilter(e.target.value); setProductPage(1); }}
          style={{
            height: '40px',
            padding: '0 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '0.875rem',
            backgroundColor: '#ffffff',
            color: '#334155',
            minWidth: '160px'
          }}
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Còn hàng / Đang bán</option>
          <option value="INACTIVE">Tạm ẩn</option>
          <option value="OUT_OF_STOCK">Hết hàng</option>
        </select>
      </div>

      {/* Table grid wrapper */}
      <div className="manager-table-responsive" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={getImagesList(p.imageUrls || p.imageUrl)[0] || 'https://via.placeholder.com/40x60?text=Book'}
                        alt={p.name}
                        style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #f1f5f9' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.925rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ISBN: {p.isbn || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      display: 'inline-flex',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: '#f3e8ff',
                      color: '#7c3aed'
                    }}>
                      {getCategoryPath(p.category) || p.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>
                    {p.author || 'Chưa rõ'}
                  </td>
                  <td style={{ padding: '16px 24px', fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                    {p.price?.toLocaleString('vi-VN')}đ
                  </td>
                  <td style={{ padding: '16px 24px' }}>
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
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      {/* Edit */}
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#ffffff',
                          color: '#3b82f6',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Edit size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setShowDeleteConfirm(p.id)}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #fecaca',
                          backgroundColor: '#fef2f2',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '12px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
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
                  backgroundColor: productPage === i + 1 ? '#7c3aed' : '#ffffff',
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

            <form onSubmit={handleCreateProduct} className="manager-modal-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

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
                  Nhà cung cấp
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên nhà cung cấp..."
                  value={productForm.supplierName}
                  onChange={(e) => setProductForm({ ...productForm, supplierName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Năm xuất bản
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 2026"
                  value={productForm.publicationYear}
                  onChange={(e) => setProductForm({ ...productForm, publicationYear: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trọng lượng (gram)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 320"
                  value={productForm.weight}
                  onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Kích thước
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 13 x 20.5 cm"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Định dạng
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bìa mềm"
                  value={productForm.format}
                  onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
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
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id} disabled={c.hasChildren}>{formatCategoryLabel(c, c.depth)}</option>
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

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Số trang *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="Nhập số trang..."
                  value={productForm.page}
                  onChange={(e) => setProductForm({ ...productForm, page: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Ngôn ngữ *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Tiếng Việt"
                  value={productForm.language}
                  onChange={(e) => setProductForm({ ...productForm, language: e.target.value })}
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
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '4px', display: 'block', marginBottom: '8px' }}>
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
                    backgroundColor: '#7c3aed',
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

            <form onSubmit={handleUpdateProduct} className="manager-modal-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

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
                  Nhà cung cấp
                </label>
                <input
                  type="text"
                  value={productForm.supplierName}
                  onChange={(e) => setProductForm({ ...productForm, supplierName: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Năm xuất bản
                </label>
                <input
                  type="number"
                  min="0"
                  value={productForm.publicationYear}
                  onChange={(e) => setProductForm({ ...productForm, publicationYear: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Trọng lượng (gram)
                </label>
                <input
                  type="number"
                  min="0"
                  value={productForm.weight}
                  onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Kích thước
                </label>
                <input
                  type="text"
                  value={productForm.dimensions}
                  onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Định dạng
                </label>
                <input
                  type="text"
                  value={productForm.format}
                  onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
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
                  {categoryOptions.map(c => (
                    <option key={c.id} value={c.id} disabled={c.hasChildren}>{formatCategoryLabel(c, c.depth)}</option>
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
                  Số trang *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={productForm.page}
                  onChange={(e) => setProductForm({ ...productForm, page: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Ngôn ngữ *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.language}
                  onChange={(e) => setProductForm({ ...productForm, language: e.target.value })}
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
                  <span style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '4px', display: 'block', marginBottom: '8px' }}>
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
                    backgroundColor: '#7c3aed',
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

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
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
            maxWidth: '400px',
            padding: '28px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              <Trash2 size={28} style={{ color: '#ef4444' }} />
            </div>

            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
              Xác nhận xóa sản phẩm
            </h3>

            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn xóa sản phẩm này? Thao tác này không thể hoàn tác và sẽ gỡ bỏ sản phẩm vĩnh viễn khỏi cửa hàng.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteProduct}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerProducts;
