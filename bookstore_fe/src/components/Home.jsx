import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import api from '../services/api';
import { Search, Filter, BookOpen, Star, ShoppingCart, X, ArrowLeft, ArrowRight } from 'lucide-react';

// Import local image assets
import heroBooks from '../assets/hero_books.png';
import matNguCover from '../assets/mat_ngu_cuoc_doi.png';
import longTinCover from '../assets/long_tin.png';
import ngheThuatCover from '../assets/nghe_thuat_ve.png';
import quanLyCover from '../assets/quan_ly_cam_xuc.png';

const Home = () => {
  const { addToCart } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('keyword') || '';

  // Search/Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Pagination & Loading states
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Selected Product Detail Modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productReviews, setProductReviews] = useState([]);
  const [detailQty, setDetailQty] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, keyword]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
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
    } catch (e) {
      console.error('Failed to load products:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchParams({});
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setPage(0);
    setTimeout(() => {
      fetchProducts();
    }, 50);
  };

  const openProductDetail = (product) => {
    navigate(`/product/${product.id}`);
  };

  const formatPrice = (price) => {
    if (!price) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleModalAddCart = async () => {
    const success = await addToCart(selectedProduct.id, detailQty);
    if (success) {
      setSelectedProduct(null);
    }
  };

  // Helper to resolve product image to beautiful local covers if matching
  const getProductImage = (product) => {
    if (!product || !product.imageUrl) return null;
    const url = product.imageUrl;
    if (url.includes('mat_ngu_cuoc_doi')) return matNguCover;
    if (url.includes('long_tin')) return longTinCover;
    if (url.includes('nghe_thuat_ve')) return ngheThuatCover;
    if (url.includes('quan_ly_cam_xuc')) return quanLyCover;
    return url;
  };

  // Check if we are in active search mode
  const isSearchActive = !!keyword || !!selectedCategory || !!minPrice || !!maxPrice;

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* 1. HERO BANNER - Visible only when not searching */}
      {!isSearchActive && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F9F8F3',
          border: '1px solid #E8E5DF',
          borderRadius: '16px',
          padding: '40px 60px',
          marginBottom: '40px',
          marginTop: '20px',
          gap: '40px',
          boxShadow: '0 4px 20px rgba(10, 66, 45, 0.03)'
        }}>
          {/* Left Text */}
          <div style={{ flex: 1.2, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <span style={{ 
              color: '#0a422d', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              letterSpacing: '2px', 
              textTransform: 'uppercase' 
            }}>
              BỘ SƯU TẬP MỚI
            </span>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 800, 
              color: '#0a422d', 
              fontFamily: "'Playfair Display', 'Georgia', serif",
              lineHeight: 1.2,
              margin: 0
            }}>
              Nâng cao tri thức với bộ sưu tập sách mới 2024.
            </h1>
            <p style={{ 
              color: '#556355', 
              fontSize: '0.95rem', 
              lineHeight: 1.6,
              margin: 0
            }}>
              Khám phá những tựa sách mới được tuyển chọn kỹ lưỡng, từ những tác phẩm nghệ thuật, tâm lý học kinh điển đến những kiến thức hiện đại nhất.
            </p>
            <button 
              onClick={() => {
                const element = document.getElementById('bestsellers-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                width: 'fit-content',
                backgroundColor: '#0a422d',
                color: '#ffffff',
                border: 'none',
                borderRadius: '30px',
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#072e20'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a422d'}
            >
              Mua sắm ngay →
            </button>
          </div>

          {/* Right Image */}
          <div style={{ flex: 0.8, display: 'flex', justifyContent: 'center' }}>
            <img 
              src={heroBooks} 
              alt="Book stack" 
              style={{ 
                maxHeight: '280px', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))'
              }} 
            />
          </div>
        </div>
      )}

      {/* 2. MAIN CATALOG / SEARCH VIEW */}
      {isSearchActive ? (
        // Search Results layout with filters
        <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
          {/* Sidebar Filters */}
          <div className="glass-panel sidebar-filters" style={{ width: '260px', padding: '24px', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2ded5', paddingBottom: '12px' }}>
              <Filter size={18} style={{ color: '#0a422d' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0a422d' }}>Bộ lọc sách</h3>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>Thể loại</label>
              <select 
                className="form-input" 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', backgroundColor: '#ffffff', border: '1px solid #d2cfc9' }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Price Ranges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4a5568' }}>Khoảng giá (VND)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Từ" 
                  value={minPrice} 
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #d2cfc9' }}
                />
                <span style={{ color: '#718096' }}>-</span>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="Đến" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{ width: '100%', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #d2cfc9' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button className="btn-secondary" onClick={handleClearFilters} style={{ flex: 1, padding: '10px', fontSize: '0.85rem', border: '1px solid #d2cfc9' }}>
                Xóa lọc
              </button>
              <button className="btn-primary" onClick={() => { setPage(0); fetchProducts(); }} style={{ flex: 1, padding: '10px', fontSize: '0.85rem', backgroundColor: '#0a422d' }}>
                Lọc sách
              </button>
            </div>
          </div>

          {/* Search Result Main Grid */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0a422d', fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Kết quả tìm kiếm {keyword && `cho "${keyword}"`}
              </h2>
              <button onClick={handleClearFilters} style={{ fontSize: '0.85rem', color: '#0056C6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Quay lại trang chủ
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '80px 0', textAlign: 'center', color: '#718096' }}>Đang tải dữ liệu sách...</div>
            ) : products.length === 0 ? (
              <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: '#718096' }}>
                Không tìm thấy đầu sách nào phù hợp.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '24px' }}>
                {products.map(product => (
                  <BookCard key={product.id} product={product} openProductDetail={openProductDetail} addToCart={addToCart} formatPrice={formatPrice} getProductImage={getProductImage} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Mock Premium Storefront Layout
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* A. BESTSELLERS SECTION */}
          <div id="bestsellers-section" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #0a422d', paddingBottom: '8px' }}>
              <h2 style={{ 
                fontSize: '1.6rem', 
                fontWeight: 800, 
                color: '#0a422d', 
                fontFamily: "'Playfair Display', 'Georgia', serif",
                margin: 0,
                paddingBottom: '4px'
              }}>
                Sách bán chạy nhất
              </h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a422d', cursor: 'pointer' }}>
                Xem tất cả &gt;
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', color: '#718096' }}>Đang tải sách...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {products.slice(0, 4).map(product => (
                  <BookCard key={product.id} product={product} openProductDetail={openProductDetail} addToCart={addToCart} formatPrice={formatPrice} getProductImage={getProductImage} showBadge="BESTSELLER" />
                ))}
              </div>
            )}
          </div>

          {/* B. MOST VIEWED SECTION */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1.5px solid #0a422d', paddingBottom: '8px' }}>
              <h2 style={{ 
                fontSize: '1.6rem', 
                fontWeight: 800, 
                color: '#0a422d', 
                fontFamily: "'Playfair Display', 'Georgia', serif",
                margin: 0,
                paddingBottom: '4px'
              }}>
                Xem nhiều nhất
              </h2>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0a422d', cursor: 'pointer' }}>
                Xem tất cả &gt;
              </span>
            </div>

            {loading ? (
              <div style={{ padding: '40px 0', color: '#718096' }}>Đang tải sách...</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {products.slice(0, 4).map(product => (
                  <BookCard key={product.id} product={product} openProductDetail={openProductDetail} addToCart={addToCart} formatPrice={formatPrice} getProductImage={getProductImage} showBadge="NỔI BẬT" />
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

// Reusable BookCard Component
const BookCard = ({ product, openProductDetail, addToCart, formatPrice, getProductImage, showBadge }) => {
  return (
    <div 
      className="glass-card" 
      onClick={() => openProductDetail(product)}
      style={{ 
        padding: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%', 
        cursor: 'pointer', 
        textAlign: 'left', 
        backgroundColor: '#ffffff',
        border: '1px solid #E8E5DF',
        borderRadius: '12px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 66, 45, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Book Image */}
      <div style={{ 
        height: '240px', 
        borderRadius: '8px', 
        background: '#f4f5f6',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: '14px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #e2e8f0'
      }}>
        {/* Badge */}
        {showBadge && (
          <span style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: showBadge === 'BESTSELLER' ? '#e28743' : '#3b82f6',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 10
          }}>
            {showBadge}
          </span>
        )}

        {product.imageUrl ? (
          <img src={getProductImage(product)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <BookOpen size={48} style={{ color: '#0a422d', opacity: 0.5 }} />
        )}
        
        {product.stockQuantity === 0 && (
          <span style={{ 
            position: 'absolute', 
            top: '0', 
            left: '0', 
            right: '0', 
            bottom: '0', 
            backgroundColor: 'rgba(255,255,255,0.7)', 
            color: '#ef4444', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '0.9rem'
          }}>
            Hết hàng
          </span>
        )}
      </div>

      {/* Book Name */}
      <div style={{ 
        fontWeight: 700, 
        fontSize: '0.95rem', 
        marginBottom: '4px', 
        overflow: 'hidden', 
        textOverflow: 'ellipsis', 
        display: '-webkit-box', 
        WebkitLineClamp: 2, 
        WebkitBoxOrient: 'vertical', 
        minHeight: '2.8rem', 
        lineHeight: '1.4', 
        color: '#1c2e24' 
      }}>
        {product.name}
      </div>

      {/* Author */}
      <div style={{ color: '#718096', fontSize: '0.8rem', marginBottom: '8px' }}>
        Tác giả: {product.author}
      </div>

      {/* Rating Stars */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px', marginTop: 'auto' }}>
        <div style={{ display: 'flex', color: '#ecc94b' }}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill="currentColor" style={{ stroke: 'none' }} />
          ))}
        </div>
        <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>(5.0)</span>
      </div>

      {/* Price & Cart button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0a422d' }}>
          {formatPrice(product.price)}
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (product.stockQuantity > 0) addToCart(product.id, 1);
          }}
          style={{ 
            padding: '8px', 
            borderRadius: '50%', 
            backgroundColor: '#0a422d',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          disabled={product.stockQuantity === 0}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#072e20'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a422d'}
        >
          <ShoppingCart size={15} />
        </button>
      </div>
    </div>
  );
};

export default Home;
