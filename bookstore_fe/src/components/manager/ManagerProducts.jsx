import { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  X, 
  Upload, 
  Image as ImageIcon,
  RotateCcw
} from 'lucide-react';
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
import EmptyState from '../common/EmptyState/EmptyState';
import { exportToCSV } from '../../utils/exportUtils';

const ManagerProducts = ({ products = [], categories = [], loadData }) => {
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
  const ITEMS_PER_PAGE = 6;

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

  const [uploadingImage, setUploadingImage] = useState(false);

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

  const getImagesList = (urlStr) => {
    if (!urlStr) return [];
    if (Array.isArray(urlStr)) return urlStr.filter(Boolean);
    return String(urlStr).split('||').map(s => s.trim()).filter(Boolean);
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
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Lỗi khi thêm sản phẩm!';
      showToast(errMsg, 'error');
    }
  };

  const handleOpenEditModal = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name || '',
      author: product.author || '',
      publisher: product.publisher || '',
      isbn: product.isbn || '',
      supplierName: product.supplierName || '',
      publicationYear: product.publicationYear ?? '',
      weight: product.weight ?? '',
      dimensions: product.dimensions || '',
      format: product.format || '',
      description: product.description || '',
      price: product.price ?? '',
      page: product.page ?? '',
      language: product.language || 'Tiếng Việt',
      stockQuantity: product.stockQuantity ?? 0,
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
      const errMsg = error.response?.data?.error || error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm!';
      showToast(errMsg, 'error');
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
    const matchesSearch = (p.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.author && p.author.toLowerCase().includes(productSearch.toLowerCase())) ||
      (p.isbn && p.isbn.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = categoryFilter === '' || isCategoryOrChildOf(p.category, categoryFilter, categories);

    let matchesStatus = true;
    if (productStatusFilter === 'ACTIVE') matchesStatus = p.status === 'ACTIVE' && p.stockQuantity > 0;
    else if (productStatusFilter === 'PENDING') matchesStatus = p.status === 'PENDING';
    else if (productStatusFilter === 'REJECTED') matchesStatus = p.status === 'REJECTED';
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
      p.stockQuantity === 0 ? 'Hết hàng' : p.status === 'ACTIVE' ? 'Đang bán' : 'Tạm ẩn',
      getCategoryPath(p.category) || p.category?.name || ''
    ]);
    exportToCSV("danh_sach_san_pham.csv", headers, rows, showToast);
  };

  const handleClearFilters = () => {
    setProductSearch('');
    setCategoryFilter('');
    setProductStatusFilter('ALL');
    setProductPage(1);
  };

  const isFilterActive = productSearch !== '' || categoryFilter !== '' || productStatusFilter !== 'ALL';

  const renderStatusBadge = (product) => {
    if (product.stockQuantity === 0) {
      return (
        <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-danger-light)', color: 'var(--mgr-danger)', border: '1px solid var(--mgr-danger-border)' }}>
          Hết hàng
        </span>
      );
    }
    if (product.status === 'ACTIVE') {
      return (
        <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-success-light)', color: 'var(--mgr-success)', border: '1px solid var(--mgr-success-border)' }}>
          Đang bán
        </span>
      );
    }
    if (product.status === 'PENDING') {
      return (
        <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-warning-light)', color: 'var(--mgr-warning)', border: '1px solid var(--mgr-warning-border)' }}>
          Chờ duyệt
        </span>
      );
    }
    if (product.status === 'REJECTED') {
      return (
        <>
          <span className="manager-badge" style={{ backgroundColor: 'var(--mgr-danger-light)', color: 'var(--mgr-danger)', border: '1px solid var(--mgr-danger-border)' }}>
            Bị từ chối
          </span>
          {product.rejectionReason && (
            <div
              style={{ width: '100%', fontSize: '0.74rem', color: 'var(--mgr-danger)', lineHeight: 1.35 }}
              title={product.rejectionReason}
            >
              Lý do: {product.rejectionReason}
            </div>
          )}
        </>
      );
    }
    return (
      <span className="manager-badge" style={{ backgroundColor: '#f1f5f9', color: 'var(--mgr-text-muted)', border: '1px solid var(--mgr-border)' }}>
        Tạm ẩn
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header and Actions */}
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0, letterSpacing: '-0.02em' }}>
            Quản lý sản phẩm
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--mgr-text-muted)' }}>
            Quản lý danh mục đầu sách, kho hàng và thiết lập giá bán niêm yết
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            type="button"
            onClick={handleExportExcel}
            className="manager-btn-secondary"
            title="Xuất dữ liệu sản phẩm đang hiển thị ra file CSV"
          >
            <Download size={16} />
            <span>Xuất CSV</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="manager-btn-primary"
          >
            <Plus size={16} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="manager-panel" style={{ padding: '16px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mgr-text-light)' }} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sách, tác giả hoặc ISBN..."
              value={productSearch}
              onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
              className="manager-search-input"
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: productSearch ? '36px' : '14px',
                height: '42px',
                borderRadius: 'var(--mgr-radius-md)',
                border: '1px solid var(--mgr-border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--mgr-bg-card)',
                boxSizing: 'border-box'
              }}
            />
            {productSearch && (
              <button
                type="button"
                onClick={() => { setProductSearch(''); setProductPage(1); }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--mgr-text-light)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ flex: '1 1 200px', minWidth: '180px' }}>
            <CategorySelector
              categories={categories}
              value={categoryFilter}
              onChange={(val) => { setCategoryFilter(val); setProductPage(1); }}
              placeholder="Tất cả danh mục"
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '0 1 180px', minWidth: '160px' }}>
            <select
              className="manager-filter-select"
              value={productStatusFilter}
              onChange={(e) => { setProductStatusFilter(e.target.value); setProductPage(1); }}
              style={{
                height: '42px',
                width: '100%',
                padding: '0 12px',
                borderRadius: 'var(--mgr-radius-md)',
                border: '1px solid var(--mgr-border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--mgr-bg-card)',
                color: 'var(--mgr-text-dark)',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang bán</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
              <option value="INACTIVE">Tạm ẩn</option>
              <option value="OUT_OF_STOCK">Hết hàng</option>
            </select>
          </div>

          {/* Reset filter button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="manager-btn-secondary"
              style={{ height: '42px', padding: '0 14px', fontSize: '0.825rem' }}
              title="Đặt lại bộ lọc về mặc định"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Products Table (Laptop 1366-1440px) */}
      <div className="manager-table-responsive manager-desktop-table">
        <table className="manager-table">
          <thead>
            <tr>
              <th style={{ width: '38%' }}>SẢN PHẨM</th>
              <th style={{ width: '16%' }}>DANH MỤC</th>
              <th style={{ width: '15%' }}>TÁC GIẢ</th>
              <th style={{ width: '13%' }}>ĐƠN GIÁ</th>
              <th style={{ width: '10%' }}>TỒN KHO</th>
              <th style={{ width: '8%', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(p => {
              const coverImg = getImagesList(p.imageUrls || p.imageUrl)[0];
              const isOutOfStock = p.stockQuantity === 0;

              return (
                <tr key={p.id}>
                  {/* SẢN PHẨM */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '46px',
                        height: '64px',
                        flexShrink: 0,
                        borderRadius: 'var(--mgr-radius-sm)',
                        overflow: 'hidden',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid var(--mgr-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={p.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon size={20} style={{ color: 'var(--mgr-text-light)' }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div 
                          style={{ 
                            fontWeight: 700, 
                            color: 'var(--mgr-text-dark)', 
                            fontSize: '0.925rem',
                            lineHeight: 1.35,
                            marginBottom: '4px'
                          }}
                        >
                          {p.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--mgr-text-muted)' }}>
                          <span>ISBN: <strong style={{ color: 'var(--mgr-text-main)' }}>{p.isbn || 'Chưa có'}</strong></span>
                          {p.publisher && (
                            <>
                              <span>•</span>
                              <span>NXB: {p.publisher}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* DANH MỤC */}
                  <td>
                    <span 
                      className="manager-badge" 
                      style={{ 
                        backgroundColor: 'var(--mgr-primary-light)', 
                        color: 'var(--mgr-primary)',
                        border: '1px solid var(--mgr-primary-border)',
                        maxWidth: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={getCategoryPath(p.category) || p.category?.name || 'N/A'}
                    >
                      {getCategoryPath(p.category) || p.category?.name || 'Chưa phân loại'}
                    </span>
                  </td>

                  {/* TÁC GIẢ */}
                  <td>
                    <span style={{ fontSize: '0.875rem', color: 'var(--mgr-text-main)', fontWeight: 500 }}>
                      {p.author || 'Chưa cập nhật'}
                    </span>
                  </td>

                  {/* ĐƠN GIÁ */}
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--mgr-text-dark)', fontSize: '0.95rem' }}>
                      {p.price ? `${Number(p.price).toLocaleString('vi-VN')}đ` : '0đ'}
                    </div>
                  </td>

                  {/* TỒN KHO & TRẠNG THÁI */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{
                        fontWeight: 700,
                        color: isOutOfStock ? 'var(--mgr-danger)' : 'var(--mgr-text-dark)',
                        fontSize: '0.875rem'
                      }}>
                        {p.stockQuantity} cuốn
                      </span>
                      {renderStatusBadge(p)}
                    </div>
                  </td>

                  {/* THAO TÁC */}
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(p)}
                        className="manager-btn-icon"
                        title="Chỉnh sửa sản phẩm"
                        aria-label={`Chỉnh sửa ${p.name}`}
                        style={{ color: 'var(--mgr-info)' }}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(p.id)}
                        className="manager-btn-icon"
                        title="Xóa sản phẩm"
                        aria-label={`Xóa ${p.name}`}
                        style={{ color: 'var(--mgr-danger)' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '48px 16px' }}>
                  <EmptyState
                    icon={BookOpen}
                    title="Không tìm thấy sản phẩm nào"
                    description={
                      isFilterActive
                        ? "Không có sản phẩm nào khớp với từ khóa tìm kiếm hoặc bộ lọc danh mục đã chọn."
                        : "Hệ thống hiện chưa có sản phẩm nào trong kho sách."
                    }
                    actionText={isFilterActive ? "Xóa bộ lọc" : "Thêm sản phẩm mới"}
                    onAction={isFilterActive ? handleClearFilters : handleOpenAddModal}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Desktop Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="manager-pagination-bar">
            <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
              Hiển thị {paginatedProducts.length} trên tổng số {filteredProducts.length} sản phẩm (Trang {productPage}/{totalProductPages})
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={productPage === 1}
                onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalProductPages)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setProductPage(i + 1)}
                  className={`manager-page-btn ${productPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={productPage === totalProductPages}
                onClick={() => setProductPage(prev => Math.min(prev + 1, totalProductPages))}
                className="manager-page-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Products Card List (iPhone 14 Pro Max 430px & screens <= 768px) */}
      <div className="manager-mobile-card-list">
        {paginatedProducts.map(p => {
          const coverImg = getImagesList(p.imageUrls || p.imageUrl)[0];
          const isOutOfStock = p.stockQuantity === 0;

          return (
            <div key={p.id} className="manager-card-item">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '56px',
                  height: '78px',
                  flexShrink: 0,
                  borderRadius: 'var(--mgr-radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid var(--mgr-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {coverImg ? (
                    <img
                      src={coverImg}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <ImageIcon size={22} style={{ color: 'var(--mgr-text-light)' }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--mgr-text-dark)', fontSize: '0.95rem', lineHeight: 1.3 }}>
                      {p.name}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--mgr-text-muted)', marginBottom: '4px' }}>
                    {p.author || 'Tác giả chưa cập nhật'}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                    <span 
                      className="manager-badge" 
                      style={{ 
                        backgroundColor: 'var(--mgr-primary-light)', 
                        color: 'var(--mgr-primary)',
                        border: '1px solid var(--mgr-primary-border)',
                        fontSize: '0.72rem'
                      }}
                    >
                      {getCategoryPath(p.category) || p.category?.name || 'Chưa phân loại'}
                    </span>
                    {renderStatusBadge(p)}
                  </div>
                </div>
              </div>

              <div className="manager-card-body" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--mgr-border-light)' }}>
                <div className="manager-card-row">
                  <span className="manager-card-label">Mã ISBN:</span>
                  <span className="manager-card-value">{p.isbn || 'Chưa có'}</span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Tồn kho:</span>
                  <span className="manager-card-value" style={{ fontWeight: 700, color: isOutOfStock ? 'var(--mgr-danger)' : 'var(--mgr-text-dark)' }}>
                    {p.stockQuantity} cuốn
                  </span>
                </div>
                <div className="manager-card-row">
                  <span className="manager-card-label">Đơn giá bán:</span>
                  <span className="manager-card-value" style={{ fontWeight: 800, color: 'var(--mgr-primary)', fontSize: '1rem' }}>
                    {p.price ? `${Number(p.price).toLocaleString('vi-VN')}đ` : '0đ'}
                  </span>
                </div>
              </div>

              {/* Mobile Card Action Buttons (Touch target >= 44px) */}
              <div className="manager-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(p)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: 'var(--mgr-radius-md)',
                    border: '1px solid var(--mgr-primary-border)',
                    backgroundColor: 'var(--mgr-primary-light)',
                    color: 'var(--mgr-primary)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Edit size={16} />
                  <span>Sửa thông tin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(p.id)}
                  style={{
                    flex: 1,
                    minHeight: '44px',
                    borderRadius: 'var(--mgr-radius-md)',
                    border: '1px solid var(--mgr-danger-border)',
                    backgroundColor: 'var(--mgr-danger-light)',
                    color: 'var(--mgr-danger)',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={16} />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="manager-panel" style={{ padding: '32px 16px', textAlign: 'center' }}>
            <EmptyState
              icon={BookOpen}
              title="Không tìm thấy sản phẩm nào"
              description={
                isFilterActive
                  ? "Không có sản phẩm nào khớp với tìm kiếm hoặc bộ lọc."
                  : "Chưa có sản phẩm nào trong kho sách."
              }
              actionText={isFilterActive ? "Xem tất cả" : "Thêm mới"}
              onAction={isFilterActive ? handleClearFilters : handleOpenAddModal}
            />
          </div>
        )}

        {/* Mobile Pagination Controls */}
        {filteredProducts.length > 0 && totalProductPages > 1 && (
          <div className="manager-pagination-bar" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              disabled={productPage === 1}
              onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
              className="manager-page-btn"
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
              {productPage} / {totalProductPages}
            </span>
            <button
              type="button"
              disabled={productPage === totalProductPages}
              onClick={() => setProductPage(prev => Math.min(prev + 1, totalProductPages))}
              className="manager-page-btn"
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          ADD PRODUCT MODAL
          ========================================================================= */}
      {showAddModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '720px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Thêm sản phẩm sách mới
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Điền các thông tin xuất bản, phân loại và giá bán đầu sách
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="manager-modal-body">
                <div className="manager-modal-form-grid">

                  {/* Section 1: Thông tin cơ bản */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>1. Thông tin cơ bản</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Tên sản phẩm sách <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Đắc Nhân Tâm, Nhà Giả Kim..."
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Tác giả
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập tên tác giả..."
                      value={productForm.author}
                      onChange={(e) => setProductForm({ ...productForm, author: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Nhà xuất bản
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: NXB Trẻ, NXB Kim Đồng..."
                      value={productForm.publisher}
                      onChange={(e) => setProductForm({ ...productForm, publisher: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Mã ISBN
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 978-604-1-12345-6"
                      value={productForm.isbn}
                      onChange={(e) => setProductForm({ ...productForm, isbn: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Nhà cung cấp
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Fahasa, Phương Nam..."
                      value={productForm.supplierName}
                      onChange={(e) => setProductForm({ ...productForm, supplierName: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Section 2: Phân loại & Giá bán */}
                  <div className="manager-form-section-title">
                    <Plus size={16} />
                    <span>2. Phân loại & Giá bán</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Danh mục sách <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="">Chọn danh mục</option>
                      {categoryOptions.map(c => (
                        <option key={c.id} value={c.id} disabled={c.hasChildren}>{formatCategoryLabel(c, c.depth)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Giá niêm yết (VNĐ) <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ví dụ: 125000"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Số lượng nhập kho ban đầu <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="Ví dụ: 50"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Trạng thái kinh doanh <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <select
                      required
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="ACTIVE">Đang bán</option>
                      <option value="INACTIVE">Tạm ẩn</option>
                    </select>
                  </div>

                  {/* Section 3: Quy cách & Xuất bản */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>3. Quy cách & Xuất bản</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Số trang <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Ví dụ: 320"
                      value={productForm.page}
                      onChange={(e) => setProductForm({ ...productForm, page: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Ngôn ngữ <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tiếng Việt, Tiếng Anh..."
                      value={productForm.language}
                      onChange={(e) => setProductForm({ ...productForm, language: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Năm xuất bản
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      placeholder="Ví dụ: 2026"
                      value={productForm.publicationYear}
                      onChange={(e) => setProductForm({ ...productForm, publicationYear: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Trọng lượng (gram)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ví dụ: 350"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Kích thước (cm)
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 13 x 20.5 cm"
                      value={productForm.dimensions}
                      onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Định dạng bìa
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Bìa mềm, Bìa cứng..."
                      value={productForm.format}
                      onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Section 4: Hình ảnh */}
                  <div className="manager-form-section-title">
                    <ImageIcon size={16} />
                    <span>4. Hình ảnh sản phẩm</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      URL ảnh hoặc tải file từ thiết bị
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Nhập đường dẫn URL ảnh (hoặc dùng nút tải ảnh)..."
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        style={{ flex: 1, minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <label 
                        className="manager-btn-secondary"
                        style={{ 
                          height: '42px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Upload size={16} />
                        <span>{uploadingImage ? 'Đang tải...' : 'Tải file'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Preview Images List */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {getImagesList(productForm.imageUrl).map((url, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            position: 'relative', 
                            width: '84px', 
                            height: '116px', 
                            borderRadius: 'var(--mgr-radius-sm)', 
                            border: '1px solid var(--mgr-border)', 
                            overflow: 'hidden', 
                            backgroundColor: '#fafafa',
                            boxShadow: 'var(--mgr-shadow-xs)'
                          }}
                        >
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(239, 68, 68, 0.95)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: 0
                            }}
                            title="Xóa ảnh này"
                            aria-label={`Xóa ảnh ${index + 1}`}
                          >
                            <X size={12} />
                          </button>
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '3px 0'
                          }}>
                            {index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}
                          </div>
                        </div>
                      ))}

                      {getImagesList(productForm.imageUrl).length === 0 && (
                        <div style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                          Chưa có ảnh nào được thêm. Ảnh đầu tiên sẽ làm ảnh bìa sản phẩm.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Mô tả */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>5. Mô tả chi tiết</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <textarea
                      rows="4"
                      placeholder="Nhập tóm tắt nội dung, đối tượng bạn đọc và điểm nổi bật của cuốn sách..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--mgr-radius-sm)', 
                        border: '1px solid var(--mgr-border)', 
                        outline: 'none', 
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="manager-btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="manager-btn-primary"
                >
                  <Plus size={16} />
                  <span>Tạo sản phẩm</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT PRODUCT MODAL
          ========================================================================= */}
      {showEditModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '720px' }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Chỉnh sửa thông tin sản phẩm
                </h2>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Cập nhật các thông số, hình ảnh và trạng thái của đầu sách
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct}>
              <div className="manager-modal-body">
                <div className="manager-modal-form-grid">

                  {/* Section 1: Thông tin cơ bản */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>1. Thông tin cơ bản</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Tên sản phẩm sách <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Tác giả
                    </label>
                    <input
                      type="text"
                      value={productForm.author}
                      onChange={(e) => setProductForm({ ...productForm, author: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Nhà xuất bản
                    </label>
                    <input
                      type="text"
                      value={productForm.publisher}
                      onChange={(e) => setProductForm({ ...productForm, publisher: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Mã ISBN
                    </label>
                    <input
                      type="text"
                      value={productForm.isbn}
                      onChange={(e) => setProductForm({ ...productForm, isbn: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Nhà cung cấp
                    </label>
                    <input
                      type="text"
                      value={productForm.supplierName}
                      onChange={(e) => setProductForm({ ...productForm, supplierName: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Section 2: Phân loại & Giá bán */}
                  <div className="manager-form-section-title">
                    <Plus size={16} />
                    <span>2. Phân loại & Giá bán</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Danh mục sách <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <select
                      required
                      value={productForm.categoryId}
                      onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="">Chọn danh mục</option>
                      {categoryOptions.map(c => (
                        <option key={c.id} value={c.id} disabled={c.hasChildren}>{formatCategoryLabel(c, c.depth)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Giá bán (VNĐ) <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Số lượng kho <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={productForm.stockQuantity}
                      onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Trạng thái kinh doanh <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <select
                      required
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
                    >
                      <option value="ACTIVE">Đang bán</option>
                      <option value="INACTIVE">Tạm ẩn</option>
                    </select>
                  </div>

                  {/* Section 3: Quy cách & Xuất bản */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>3. Quy cách & Xuất bản</span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Số trang <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={productForm.page}
                      onChange={(e) => setProductForm({ ...productForm, page: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Ngôn ngữ <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.language}
                      onChange={(e) => setProductForm({ ...productForm, language: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Năm xuất bản
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={productForm.publicationYear}
                      onChange={(e) => setProductForm({ ...productForm, publicationYear: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Trọng lượng (gram)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productForm.weight}
                      onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Kích thước (cm)
                    </label>
                    <input
                      type="text"
                      value={productForm.dimensions}
                      onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      Định dạng bìa
                    </label>
                    <input
                      type="text"
                      value={productForm.format}
                      onChange={(e) => setProductForm({ ...productForm, format: e.target.value })}
                      style={{ width: '100%', minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  {/* Section 4: Hình ảnh */}
                  <div className="manager-form-section-title">
                    <ImageIcon size={16} />
                    <span>4. Hình ảnh sản phẩm</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                      URL ảnh hoặc tải file từ thiết bị
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="Nhập đường dẫn URL ảnh (hoặc dùng nút tải ảnh)..."
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        style={{ flex: 1, minHeight: '42px', padding: '10px 14px', borderRadius: 'var(--mgr-radius-sm)', border: '1px solid var(--mgr-border)', outline: 'none', boxSizing: 'border-box' }}
                      />
                      <label 
                        className="manager-btn-secondary"
                        style={{ 
                          height: '42px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Upload size={16} />
                        <span>{uploadingImage ? 'Đang tải...' : 'Tải file'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                      </label>
                    </div>

                    {/* Preview Images List */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
                      {getImagesList(productForm.imageUrl).map((url, index) => (
                        <div 
                          key={index} 
                          style={{ 
                            position: 'relative', 
                            width: '84px', 
                            height: '116px', 
                            borderRadius: 'var(--mgr-radius-sm)', 
                            border: '1px solid var(--mgr-border)', 
                            overflow: 'hidden', 
                            backgroundColor: '#fafafa',
                            boxShadow: 'var(--mgr-shadow-xs)'
                          }}
                        >
                          <img 
                            src={url} 
                            alt={`Preview ${index + 1}`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              width: '22px',
                              height: '22px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(239, 68, 68, 0.95)',
                              color: '#ffffff',
                              border: 'none',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 'bold',
                              padding: 0
                            }}
                            title="Xóa ảnh này"
                            aria-label={`Xóa ảnh ${index + 1}`}
                          >
                            <X size={12} />
                          </button>
                          <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            color: '#ffffff',
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '3px 0'
                          }}>
                            {index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}
                          </div>
                        </div>
                      ))}

                      {getImagesList(productForm.imageUrl).length === 0 && (
                        <div style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)', fontStyle: 'italic', padding: '8px 0' }}>
                          Chưa có ảnh nào được thêm. Ảnh đầu tiên sẽ làm ảnh bìa sản phẩm.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section 5: Mô tả */}
                  <div className="manager-form-section-title">
                    <BookOpen size={16} />
                    <span>5. Mô tả chi tiết</span>
                  </div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <textarea
                      rows="4"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '10px 14px', 
                        borderRadius: 'var(--mgr-radius-sm)', 
                        border: '1px solid var(--mgr-border)', 
                        outline: 'none', 
                        fontFamily: 'inherit',
                        fontSize: '0.875rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="manager-btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="manager-btn-primary"
                >
                  <Edit size={16} />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE CONFIRMATION MODAL
          ========================================================================= */}
      {showDeleteConfirm && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '420px', textAlign: 'center', padding: '28px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'var(--mgr-danger-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid var(--mgr-danger-border)'
            }}>
              <Trash2 size={28} style={{ color: 'var(--mgr-danger)' }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: '0 0 8px 0' }}>
              Xác nhận xóa sản phẩm
            </h3>

            <p style={{ fontSize: '0.875rem', color: 'var(--mgr-text-muted)', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống? Thao tác này sẽ gỡ bỏ sản phẩm vĩnh viễn khỏi danh mục hiển thị.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="manager-btn-secondary"
                style={{ flex: 1, minHeight: '44px', justifyContent: 'center' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="manager-btn-danger"
                style={{ flex: 1, minHeight: '44px', justifyContent: 'center' }}
              >
                <Trash2 size={16} />
                <span>Xác nhận xóa</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerProducts;
