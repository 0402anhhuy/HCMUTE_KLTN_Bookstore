import React from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const FavoriteProducts = ({ highlight = false }) => {
  const { favorites = [], removeFavorite, addToCart } = useApp();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div 
      id="favorite-section" 
      style={{ 
        backgroundColor: '#fff', 
        border: highlight ? '2px solid #ef4444' : '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: highlight ? '0 0 12px rgba(239, 68, 68, 0.2)' : 'none',
        transition: 'all 0.3s ease'
      }}
    >
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Heart size={18} style={{ color: '#ef4444', fill: favorites.length > 0 ? '#ef4444' : 'none' }} /> 
        Sản phẩm yêu thích 
        <span style={{ fontSize: '0.8rem', color: '#ef4444', backgroundColor: '#fee2e2', padding: '2px 8px', borderRadius: '10px' }}>
          {favorites.length} món
        </span>
      </h3>

      {favorites.length === 0 ? (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: '8px', padding: '30px', textAlign: 'center', backgroundColor: '#fafafa' }}>
          <Heart size={28} style={{ color: '#fca5a5', margin: '0 auto 10px auto' }} />
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Chưa có sản phẩm yêu thích.</div>
          <Link to="/" style={{ fontSize: '0.8rem', color: '#0a422d', fontWeight: 600, textDecoration: 'none', display: 'block', marginTop: '6px' }}>Khám phá ngay</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '4px' }}>
          {favorites.map(fav => {
            const product = fav.product;
            if (!product) return null;
            return (
              <div 
                key={fav.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '10px', 
                  border: '1px solid #f3f4f6', 
                  borderRadius: '8px', 
                  backgroundColor: '#fff' 
                }}
              >
                <img 
                  src={product.imageUrl || '/placeholder.png'} 
                  alt={product.name} 
                  style={{ width: '48px', height: '64px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e5e7eb' }} 
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link 
                    to={`/product/${product.id}`} 
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  >
                    {product.name}
                  </Link>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', margin: '2px 0' }}>{product.author}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ef4444' }}>{formatPrice(product.price)}</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => addToCart(product.id, 1)}
                    disabled={product.stockQuantity === 0}
                    title="Thêm vào giỏ hàng"
                    style={{ 
                      padding: '6px', 
                      backgroundColor: '#e6f4ea', 
                      color: '#0a422d', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ShoppingCart size={14} />
                  </button>
                  <button 
                    onClick={() => removeFavorite(product.id)}
                    title="Xóa khỏi yêu thích"
                    style={{ 
                      padding: '6px', 
                      backgroundColor: '#fee2e2', 
                      color: '#ef4444', 
                      border: 'none', 
                      borderRadius: '6px', 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FavoriteProducts;
