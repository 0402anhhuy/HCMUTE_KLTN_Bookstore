import React, { useState } from 'react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const ManagerReviews = ({ reviews, loadData }) => {
  const { showToast } = useApp();

  // Filters and pagination state
  const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
  const [reviewPage, setReviewPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  // Reply Modal States
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyUser, setReplyUser] = useState('');

  // Delete Modal States
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteUser, setDeleteUser] = useState('');

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await api.put(`/reviews/${replyReviewId}/reply`, { reply: replyText.trim() });
      showToast('Đã gửi phản hồi thành công!', 'success');
      setReplyReviewId(null);
      setReplyText('');
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi gửi phản hồi!', 'error');
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) return;
    try {
      await api.delete(`/reviews/${deleteReviewId}?reason=${encodeURIComponent(deleteReason.trim())}`);
      showToast('Đã xóa đánh giá thành công!', 'success');
      setDeleteReviewId(null);
      setDeleteReason('');
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi xóa đánh giá!', 'error');
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
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            minWidth: '160px',
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

      {/* Reviews Table (Desktop) */}
      <div className="manager-desktop-table manager-table-responsive" style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left' }}>
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
                  {review.reply && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      borderLeft: '3px solid #7c3aed',
                      fontSize: '0.8rem',
                      color: '#475569',
                      textAlign: 'left'
                    }}>
                      <span style={{ fontWeight: 700, color: '#7c3aed', marginRight: '6px' }}>Cửa hàng phản hồi:</span>
                      {review.reply}
                    </div>
                  )}
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
                        setReplyReviewId(review.id);
                        setReplyText(review.reply || '');
                        setReplyUser(review.user?.fullName || 'Khách hàng');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#7c3aed',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer'
                      }}
                    >
                      {review.reply ? 'Sửa phản hồi' : 'Phản hồi'}
                    </button>
                    <button
                      onClick={() => {
                        setDeleteReviewId(review.id);
                        setDeleteReason('');
                        setDeleteUser(review.user?.fullName || 'Khách hàng');
                      }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' }}>
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

      {/* Reviews Cards (Mobile-first card view) */}
      <div className="manager-mobile-card-list">
        {paginatedReviews.map(review => (
          <div key={review.id} className="manager-card-item">
            <div className="manager-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}>
                  {review.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <span className="manager-card-title">{review.user?.fullName || 'Khách hàng'}</span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </div>
                </div>
              </div>
              <div style={{ color: '#f59e0b', fontSize: '0.95rem', letterSpacing: '1px' }}>
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
            </div>

            <div className="manager-card-body">
              <div style={{ fontWeight: 600, color: '#2563eb', fontSize: '0.9rem', marginBottom: '4px' }}>
                📖 {review.product?.name}
              </div>
              <div style={{ color: '#334155', fontSize: '0.875rem', fontWeight: 500, lineHeight: '1.4' }}>
                "{review.comment}"
              </div>
              {review.reply && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#f8fafc',
                  borderLeft: '3px solid #7c3aed',
                  fontSize: '0.8rem',
                  color: '#475569'
                }}>
                  <span style={{ fontWeight: 700, color: '#7c3aed', marginRight: '6px' }}>Cửa hàng:</span>
                  {review.reply}
                </div>
              )}
            </div>

            <div className="manager-card-footer">
              <button
                onClick={() => {
                  setReplyReviewId(review.id);
                  setReplyText(review.reply || '');
                  setReplyUser(review.user?.fullName || 'Khách hàng');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  border: '1px solid #ddd6fe',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                {review.reply ? 'Sửa phản hồi' : 'Phản hồi'}
              </button>
              <button
                onClick={() => {
                  setDeleteReviewId(review.id);
                  setDeleteReason('');
                  setDeleteUser(review.user?.fullName || 'Khách hàng');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  color: '#ef4444',
                  border: '1px solid #fecaca',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            Không tìm thấy đánh giá nào phù hợp
          </div>
        )}
      </div>
      </div>

      {/* REPLY MODAL */}
      {replyReviewId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px', textAlign: 'left' }}>
              Phản hồi đánh giá của {replyUser}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px', textAlign: 'left' }}>
              Gửi phản hồi chính thức từ cửa hàng đến khách hàng này.
            </p>
            
            <form onSubmit={handleReplySubmit}>
              <textarea 
                rows={4} 
                placeholder="Nhập nội dung phản hồi của cửa hàng..." 
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  marginBottom: '20px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                required
              />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setReplyReviewId(null); setReplyText(''); }} 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#7c3aed',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Gửi phản hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteReviewId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ef4444', marginBottom: '8px', textAlign: 'left' }}>
              Xóa đánh giá của {deleteUser}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px', textAlign: 'left' }}>
              Bạn đang thực hiện xóa đánh giá của khách hàng. Hãy nhập lý do xóa để gửi thông báo cho khách hàng này.
            </p>
            
            <form onSubmit={handleDeleteSubmit}>
              <textarea 
                rows={3} 
                placeholder="Nhập lý do xóa đánh giá (ví dụ: bình luận chứa ngôn từ không phù hợp, quảng cáo...)" 
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box',
                  marginBottom: '20px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                required
              />
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => { setDeleteReviewId(null); setDeleteReason(''); }} 
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  Xác nhận xóa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ManagerReviews;
