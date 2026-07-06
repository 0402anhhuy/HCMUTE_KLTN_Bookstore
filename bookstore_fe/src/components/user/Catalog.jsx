import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { Search, Filter, BookOpen, Star, ShoppingCart, X } from 'lucide-react';

// Import local image assets
import matNguCover from '../../assets/mat_ngu_cuoc_doi.png';
import longTinCover from '../../assets/long_tin.png';
import ngheThuatCover from '../../assets/nghe_thuat_ve.png';
import quanLyCover from '../../assets/quan_ly_cam_xuc.png';

const BookCard = ({ product, openProductDetail, addToCart, formatPrice, getProductImage }) => (
  <div
    onClick={() => openProductDetail(product)}
    style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '16px',
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.2s ease',
      textAlign: 'left'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
  >
    <div style={{ height: '220px', borderRadius: '8px', background: '#f4f5f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', position: 'relative', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      {product.imageUrl ? (
        <img src={getProductImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <BookOpen size={48} style={{ color: '#0a422d', opacity: 0.5 }} />
      )}
      {product.stockQuantity === 0 && (
        <span style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.7)', color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>Hết hàng</span>
      )}
    </div>
    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', minHeight: '2.6rem', lineHeight: '1.4', color: '#1c2e24' }}>
      {product.name}
    </div>
    <div style={{ color: '#718096', fontSize: '0.78rem', marginBottom: '8px' }}>Tác giả: {product.author}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px', marginTop: 'auto' }}>
      <div style={{ display: 'flex', color: '#ecc94b' }}>
        {[...Array(5)].map((_, i) => (<Star key={i} size={12} fill="currentColor" style={{ stroke: 'none' }} />))}
      </div>
      <span style={{ fontSize: '0.72rem', color: '#a0aec0' }}>(5.0)</span>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0a422d' }}>{formatPrice(product.price)}</span>
      <button
        onClick={(e) => { e.stopPropagation(); if (product.stockQuantity > 0) addToCart(product.id, 1); }}
        style={{ padding: '8px', borderRadius: '50%', backgroundColor: '#0a422d', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
        disabled={product.stockQuantity === 0}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#072e20'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a422d'}
      >
        <ShoppingCart size={14} />
      </button>
    </div>
  </div>
);

const Catalog = () => {
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchInput, setSearchInput] = useState(keyword);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchProducts(); }, [page, selectedCategory, keyword]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?page=${page}&size=12`;
      if (keyword.trim()) url += `&keyword=${encodeURIComponent(keyword)}`;
      if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;
      const response = await api.get(url);
      setProducts(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    if (searchInput.trim()) setSearchParams({ keyword: searchInput.trim() });
    else setSearchParams({});
  };

  const handleApplyFilters = () => { setPage(0); fetchProducts(); };

  const handleClearFilters = () => {
    setSearchParams({});
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchInput('');
    setPage(0);
    setTimeout(() => fetchProducts(), 50);
  };

  const openProductDetail = (product) => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getProductImage = (product) => {
    if (!product || !product.imageUrl) return null;
    const url = product.imageUrl;
    if (url.includes('mat_ngu_cuoc_doi')) return matNguCover;
    if (url.includes('long_tin')) return longTinCover;
    if (url.includes('nghe_thuat_ve')) return ngheThuatCover;
    if (url.includes('quan_ly_cam_xuc')) return quanLyCover;
    return url;
  };

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Page Title */}
      <div style={{ marginBottom: '28px', marginTop: '10px', textAlign: 'left' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0a422d', margin: '0 0 6px 0', fontFamily: "'Playfair Display', 'Georgia', serif" }}>
          Khám phá kho sách
        </h1>
        <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0 }}>
          Tìm kiếm, lọc và khám phá hàng ngàn tựa sách phong phú của chúng tôi.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Tìm theo tên sách, tác giả..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '0.95rem', outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" style={{ padding: '12px 24px', backgroundColor: '#0a422d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
          Tìm kiếm
        </button>
        {(keyword || selectedCategory || minPrice || maxPrice) && (
          <button type="button" onClick={handleClearFilters} style={{ padding: '12px 16px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', borderRadius: '8px', fontWeight: 500, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <X size={14} /> Xóa lọc
          </button>
        )}
      </form>

      <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

        {/* Sidebar Filters */}
        <div style={{ width: '240px', flexShrink: 0, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
            <Filter size={16} style={{ color: '#0a422d' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0a422d', margin: 0 }}>Bộ lọc</h3>
          </div>

          {/* Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Thể loại</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '9px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', backgroundColor: '#fff' }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>

          {/* Price Ranges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>Khoảng giá (VND)</label>
            <input type="number" placeholder="Từ" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
            <input type="number" placeholder="Đến" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button onClick={handleApplyFilters} style={{ width: '100%', padding: '10px', backgroundColor: '#0a422d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
            Áp dụng lọc
          </button>
        </div>

        {/* Main Grid */}
        <div style={{ flex: 1 }}>
          {/* Result count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0 }}>
              {loading ? 'Đang tải...' : `Hiển thị ${products.length} sản phẩm${keyword ? ` cho "${keyword}"` : ''}`}
            </p>
          </div>

          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#718096' }}>Đang tải dữ liệu sách...</div>
          ) : products.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#718096', backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              Không tìm thấy đầu sách nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
              {products.map(product => (
                <BookCard key={product.id} product={product} openProductDetail={openProductDetail} addToCart={addToCart} formatPrice={formatPrice} getProductImage={getProductImage} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: page === 0 ? '#f3f4f6' : '#fff', cursor: page === 0 ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>
                ← Trước
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i)} style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: page === i ? '#0a422d' : '#fff', color: page === i ? '#fff' : '#374151', cursor: 'pointer', fontWeight: page === i ? 700 : 500, fontSize: '0.85rem' }}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: page === totalPages - 1 ? '#f3f4f6' : '#fff', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 500, color: '#374151', fontSize: '0.85rem' }}>
                Tiếp →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
