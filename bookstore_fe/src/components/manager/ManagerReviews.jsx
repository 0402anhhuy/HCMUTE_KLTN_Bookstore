import React, { useState } from 'react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerReviews = ({ reviews, loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
  const [reviewPage, setReviewPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await api.delete(`/reviews/${reviewId}`);
        showToast('Đã xóa đánh giá thành công!', 'success');
        loadData();
      } catch (error) {
        console.error(error);
        showToast('Lỗi khi xóa đánh giá!', 'error');
      }
    }
  };

  // Filtered and Paginated Reviews
  const filteredReviews = reviews.filter(r => {
    if (reviewRatingFilter === 'ALL') return true;
    return String(r.rating) === String(reviewRatingFilter);
  });

  const totalReviewPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const paginatedReviews = filteredReviews.slice(
    (reviewPage - 1) * ITEMS_PER_PAGE,
    reviewPage * ITEMS_PER_PAGE
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Bình luận & Review
        </h1>

        <select
          value={reviewRatingFilter}
          onChange={(e) => { setReviewRatingFilter(e.target.value); setReviewPage(1); }}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            outline: 'none',
            fontSize: '0.9rem',
            minWidth: '180px',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="ALL">Tất cả số sao</option>
          <option value="5">5 sao</option>
          <option value="4">4 sao</option>
          <option value="3">3 sao</option>
          <option value="2">2 sao</option>
          <option value="1">1 sao</option>
        </select>
      </div>

      {/* Reviews Table */}
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
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>NGƯỜI ĐÁNH GIÁ</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SỐ SAO VÀ NỘI DUNG</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SẢN PHẨM</th>
              <th style={{ padding: '16px 24px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'right' }}>HÀNH ĐỘNG</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.map(review => (
              <tr key={review.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                
                {/* NGƯỜI ĐÁNH GIÁ */}
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.875rem'
                    }}>
                      {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{review.user?.fullName || 'Khách hàng'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                        {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* SỐ SAO VÀ NỘI DUNG */}
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ color: '#f59e0b', fontSize: '0.95rem', marginBottom: '4px', letterSpacing: '1px' }}>
                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.875rem', fontWeight: 500 }}>
                    {review.comment}
                  </div>
                </td>

                {/* SẢN PHẨM */}
                <td style={{ padding: '16px 24px' }}>
                  <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.9rem' }}>{review.product?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ISBN: {review.product?.isbn || 'N/A'}</div>
                </td>

                {/* HÀNH ĐỘNG */}
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        const reply = window.prompt(`Phản hồi đánh giá của ${review.user?.fullName || 'Khách hàng'}:`);
                        if (reply && reply.trim()) {
                          showToast('Đã gửi phản hồi thành công!', 'success');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Phản hồi
                    </button>
                    <button
                      onClick={() => handleDeleteReview(review.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>

              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  Không tìm thấy đánh giá nào phù hợp
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị {paginatedReviews.length} trên tổng số {filteredReviews.length} đánh giá
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              disabled={reviewPage === 1}
              onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: reviewPage === 1 ? '#f1f5f9' : '#ffffff',
                color: reviewPage === 1 ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: reviewPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Trước
            </button>
            {[...Array(totalReviewPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setReviewPage(i + 1)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: reviewPage === i + 1 ? '#7c3aed' : '#ffffff',
                  color: reviewPage === i + 1 ? '#ffffff' : '#475569',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={reviewPage === totalReviewPages}
              onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: reviewPage === totalReviewPages ? '#f1f5f9' : '#ffffff',
                color: reviewPage === totalReviewPages ? '#94a3b8' : '#475569',
                fontSize: '0.85rem',
                cursor: reviewPage === totalReviewPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerReviews;
