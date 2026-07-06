import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCcw, HeadphonesIcon } from 'lucide-react';

// Import local image assets (fallback)
import matNguCover from '../../assets/mat_ngu_cuoc_doi.png';
import longTinCover from '../../assets/long_tin.png';
import ngheThuatCover from '../../assets/nghe_thuat_ve.png';
import quanLyCover from '../../assets/quan_ly_cam_xuc.png';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();

  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('Tất cả');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    setQty(1);
    setRatingFilter('Tất cả');
    setActiveImageIdx(0);
    try {
      const prodRes = await api.get(`/products/${id}`);
      setProduct(prodRes.data);
      
      // Fetch reviews
      try {
        const revRes = await api.get(`/reviews/product/${id}`);
        setReviews(revRes.data || []);
      } catch (revErr) {
        console.error("Failed to fetch product reviews:", revErr);
      }
      
      // Fetch similar products (same category)
      if (prodRes.data.category) {
        const simRes = await api.get(`/products?categoryId=${prodRes.data.category.id}&size=5`);
        // Filter out current product
        setSimilarProducts((simRes.data.content || []).filter(p => p.id !== prodRes.data.id).slice(0, 4));
      } else {
        const simRes = await api.get(`/products?size=5`);
        setSimilarProducts((simRes.data.content || []).filter(p => p.id !== prodRes.data.id).slice(0, 4));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getProductImage = (prod) => {
    if (!prod || !prod.imageUrl) return null;
    const url = prod.imageUrl;
    if (url.includes('mat_ngu_cuoc_doi')) return matNguCover;
    if (url.includes('long_tin')) return longTinCover;
    if (url.includes('nghe_thuat_ve')) return ngheThuatCover;
    if (url.includes('quan_ly_cam_xuc')) return quanLyCover;
    return url;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0).replace('₫', 'đ');
  };

  const handleAddToCart = async () => {
    if (product && product.stockQuantity > 0) {
      await addToCart(product.id, qty);
    }
  };

  const handleBuyNow = async () => {
    if (product && product.stockQuantity > 0) {
      navigate(`/checkout?productId=${product.id}&qty=${qty}`);
    }
  };

  if (loading) return <div style={{ padding: '80px 0', textAlign: 'center' }}>Đang tải...</div>;
  if (!product) return <div style={{ padding: '80px 0', textAlign: 'center' }}>Không tìm thấy sản phẩm</div>;

  const mainImageUrl = getProductImage(product);
  const productImages = [
    { url: mainImageUrl, style: {} },
    { url: mainImageUrl, style: { transform: 'scale(1.4)', transformOrigin: 'center' } },
    { url: mainImageUrl, style: { filter: 'sepia(50%) contrast(110%)' } },
    { url: mainImageUrl, style: { filter: 'hue-rotate(180deg)' } },
  ];

  return (
    <div className="page-container animate-fade-in" style={{ paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto', textAlign: 'left', backgroundColor: '#f9fafb', paddingTop: '20px' }}>
      
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#6b7280', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Trang chủ</Link>
        <span>&gt;</span>
        <Link to="/catalog" style={{ color: '#6b7280', textDecoration: 'none' }}>Khám phá kho sách</Link>
        <span>&gt;</span>
        <span style={{ color: '#111827', fontWeight: 500 }}>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        
        {/* Left: Image Gallery */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Main Image */}
          <div style={{ 
            width: '100%', 
            paddingTop: '135%', // 3:4 aspect ratio approx
            position: 'relative', 
            borderRadius: '12px', 
            backgroundColor: '#fafafa',
            border: '1px solid #f3f4f6',
            overflow: 'hidden'
          }}>
            {mainImageUrl ? (
              <img 
                src={productImages[activeImageIdx]?.url || mainImageUrl} 
                alt={product.name} 
                style={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain',
                  transition: 'all 0.3s ease',
                  ...productImages[activeImageIdx]?.style
                }} 
              />
            ) : (
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>Không có ảnh</div>
            )}
          </div>
          {/* Thumbnails */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {productImages.map((imgObj, idx) => (
              <div 
                key={idx} 
                onClick={() => setActiveImageIdx(idx)}
                style={{ 
                  width: '70px', 
                  height: '90px', 
                  borderRadius: '8px', 
                  border: activeImageIdx === idx ? '2px solid #0a422d' : '1px solid #e5e7eb', 
                  overflow: 'hidden', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s'
                }}
              >
                {mainImageUrl && (
                  <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img 
                      src={imgObj.url} 
                      alt="thumb" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '100%', 
                        objectFit: 'contain', 
                        opacity: activeImageIdx === idx ? 1 : 0.6,
                        transition: 'all 0.2s',
                        ...imgObj.style
                      }} 
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'inline-block', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '4px', alignSelf: 'flex-start', marginBottom: '16px' }}>
            Sách bán chạy
          </div>
          
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111827', margin: '0 0 16px 0', lineHeight: 1.2, fontFamily: "'Playfair Display', serif" }}>
            {product.name}
          </h1>
          
          <div style={{ fontSize: '0.9rem', color: '#4b5563', marginBottom: '12px' }}>
            Tác giả: <span style={{ fontWeight: 600, color: '#111827' }}>{product.author}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', color: '#ecc94b', gap: '4px', marginBottom: '24px' }}>
            {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" stroke="none" />)}
            <span style={{ color: '#6b7280', fontSize: '0.85rem', marginLeft: '6px' }}>(5.0 / 1.205 đánh giá)</span>
          </div>

          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#111827', margin: '0 0 24px 0' }}>
            {formatPrice(product.price)}
          </div>

          <p style={{ color: '#4b5563', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '32px' }}>
            {product.description ? product.description.substring(0, 250) + '...' : 'Bản in đặc biệt kỷ niệm, bao gồm các hình vẽ nguyên bản. Tác phẩm kinh điển này là một bức tranh sống động về tình thương và sự kiên cường. Một cuốn sách không thể thiếu trong tủ sách của mọi gia đình Việt.'}
          </p>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Định dạng</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Bìa cứng (Hardcover)</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Số trang</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{product.isbn ? product.isbn.substring(0,3) : '345'} trang</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Ngôn ngữ</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>Tiếng Việt</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Nhà xuất bản</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827' }}>{product.publisher}</div>
            </div>
          </div>

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <span style={{ fontSize: '0.9rem', color: '#4b5563' }}>Số lượng:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '6px', overflow: 'hidden', height: '40px' }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: '40px', height: '100%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#4b5563' }}>-</button>
              <div style={{ width: '40px', textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>{qty}</div>
              <button onClick={() => setQty(Math.min(product.stockQuantity, qty + 1))} style={{ width: '40px', height: '100%', background: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#4b5563' }}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '40px' }}>
            <button 
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              style={{ width: '100%', height: '52px', backgroundColor: '#0a422d', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer' }}
            >
              <ShoppingCart size={18} /> Thêm vào giỏ hàng
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              style={{ width: '100%', height: '52px', backgroundColor: '#ffffff', color: '#0a422d', border: '2px solid #0a422d', borderRadius: '8px', fontWeight: 700, fontSize: '1rem', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer' }}
            >
              Mua ngay
            </button>
          </div>

          {/* Features */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.85rem' }}>
              <Truck size={18} /> <span>Miễn phí vận chuyển toàn quốc</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.85rem' }}>
              <ShieldCheck size={18} /> <span>Bảo vệ khách hàng 100%</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.85rem' }}>
              <RefreshCcw size={18} /> <span>Đổi trả dễ dàng 30 ngày</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontSize: '0.85rem' }}>
              <HeadphonesIcon size={18} /> <span>Hỗ trợ khách hàng 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div style={{ marginTop: '50px', backgroundColor: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '24px', fontFamily: "'Playfair Display', serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={24} fill="#ecc94b" stroke="none" /> Đánh giá sản phẩm
        </h2>

        {/* Rating Summary Card */}
        <div style={{ display: 'flex', gap: '40px', backgroundColor: '#fafafa', borderRadius: '12px', padding: '24px', marginBottom: '30px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center', paddingRight: '40px', borderRight: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>
              {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '4px' }}>trên 5</div>
            <div style={{ display: 'flex', justifyContent: 'center', color: '#ecc94b', gap: '4px', marginTop: '8px' }}>
              {[1, 2, 3, 4, 5].map(i => <Star key={i} size={18} fill="currentColor" stroke="none" />)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>({reviews.length > 0 ? reviews.length : 2} đánh giá thực tế)</div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {['Tất cả', '5 Sao', '4 Sao', '3 Sao', '2 Sao', '1 Sao'].map((label, idx) => (
              <button 
                key={idx}
                type="button"
                onClick={() => setRatingFilter(label)}
                style={{ 
                  padding: '8px 16px', 
                  backgroundColor: ratingFilter === label ? '#0a422d' : '#fff', 
                  color: ratingFilter === label ? '#fff' : '#374151', 
                  border: ratingFilter === label ? '1px solid #0a422d' : '1px solid #d1d5db', 
                  borderRadius: '20px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {(reviews.length > 0 ? reviews : [
            {
              id: 'mock-1',
              user: { fullName: 'Nguyễn Anh Huy' },
              rating: 5,
              comment: 'Sách in rất đẹp, chất lượng giấy dày dặn và bìa cứng cầm rất chắc tay. Nội dung cực kỳ thực tế và bổ ích, rất đáng tiền!',
              reviewedAt: '2026-07-02T08:15:00Z'
            },
            {
              id: 'mock-2',
              user: { fullName: 'Lê Hoài Nam' },
              rating: 5,
              comment: 'Đã nhận được sách, giao hàng nhanh trong 2 ngày. Gói hàng bọc chống sốc kỹ càng. Nội dung sách truyền cảm hứng rất nhiều.',
              reviewedAt: '2026-07-04T14:22:00Z'
            }
          ])
          .filter(rev => {
            if (ratingFilter === 'Tất cả') return true;
            const starVal = parseInt(ratingFilter.split(' ')[0], 10);
            return rev.rating === starVal;
          })
          .map((rev, idx) => (
            <div key={rev.id || idx} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#e6f4ea', color: '#0a422d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                  {rev.user?.fullName ? rev.user.fullName.split(' ').pop()[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {rev.user?.fullName || 'Người dùng ẩn danh'}
                    <span style={{ fontSize: '0.7rem', color: '#059669', backgroundColor: '#d1fae5', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Đã mua hàng</span>
                  </div>
                  <div style={{ display: 'flex', color: '#ecc94b', gap: '2px', marginTop: '2px' }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={12} fill={i <= rev.rating ? 'currentColor' : 'none'} stroke={i <= rev.rating ? 'none' : '#ecc94b'} />
                    ))}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#9ca3af' }}>
                  {new Date(rev.reviewedAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.6, margin: '6px 0 0 52px' }}>
                {rev.comment}
              </p>
            </div>
          ))}
          {(reviews.length > 0 || ratingFilter === 'Tất cả') ? null : (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px 0', fontSize: '0.9rem' }}>
              Không có đánh giá nào {ratingFilter.toLowerCase()} cho sản phẩm này.
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <div style={{ marginTop: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Playfair Display', serif" }}>
              Sách cùng thể loại "{product.category?.name || 'Tổng hợp'}"
            </h2>
            <Link to="/catalog" style={{ color: '#6b7280', fontSize: '0.9rem', textDecoration: 'none' }}>Xem tất cả &gt;</Link>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {similarProducts.map(p => (
              <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ height: '280px', borderRadius: '8px', backgroundColor: '#f3f4f6', marginBottom: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getProductImage(p) ? <img src={getProductImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#9ca3af' }}>No Image</span>}
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '12px' }}>{p.author}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 800, color: '#111827', fontSize: '1.1rem' }}>{formatPrice(p.price)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', color: '#ecc94b', gap: '2px', fontSize: '0.8rem' }}><Star size={12} fill="currentColor" stroke="none" /> 4.9</div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(p.id, 1); }}
                  style={{ width: '100%', padding: '10px', marginTop: '16px', backgroundColor: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', fontWeight: 600, color: '#374151', cursor: 'pointer' }}
                >
                  Thêm vào giỏ
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
