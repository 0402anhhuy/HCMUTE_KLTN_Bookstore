import { useState, useMemo } from 'react';
import { 
  Star, 
  Search, 
  MessageSquare, 
  MessageSquareReply, 
  Trash2, 
  X, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  AlertTriangle,
  Send,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';
import EmptyState from '../common/EmptyState/EmptyState';

const ManagerReviews = ({ reviews = [], loadData }) => {
  const { showToast } = useApp();

  // Filters & search state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('ALL');
  const [replyFilter, setReplyFilter] = useState('ALL'); // ALL, REPLIED, UNREPLIED
  const [reviewPage, setReviewPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Reply Modal States
  const [replyReviewId, setReplyReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyUser, setReplyUser] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  // Delete Modal States
  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteUser, setDeleteUser] = useState('');
  const [submittingDelete, setSubmittingDelete] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setSubmittingReply(true);
    try {
      await api.put(`/reviews/${replyReviewId}/reply`, { reply: replyText.trim() });
      showToast('Đã gửi phản hồi đánh giá thành công!', 'success');
      setReplyReviewId(null);
      setReplyText('');
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi gửi phản hồi!', 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) return;
    setSubmittingDelete(true);
    try {
      await api.delete(`/reviews/${deleteReviewId}?reason=${encodeURIComponent(deleteReason.trim())}`);
      showToast('Đã xóa đánh giá thành công!', 'success');
      setDeleteReviewId(null);
      setDeleteReason('');
      loadData();
    } catch (error) {
      console.error(error);
      showToast(error.response?.data?.error || 'Lỗi khi xóa đánh giá!', 'error');
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Helper to extract first image
  const getProductCover = (product) => {
    if (!product) return '';
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    if (typeof product.imageUrl === 'string' && product.imageUrl) {
      return product.imageUrl.split('||')[0].trim();
    }
    return '';
  };

  // Statistics
  const totalReviewsCount = reviews.length;
  const avgRating = useMemo(() => {
    if (totalReviewsCount === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / totalReviewsCount).toFixed(1);
  }, [reviews, totalReviewsCount]);

  const unrepliedCount = useMemo(() => {
    return reviews.filter(r => !r.reply).length;
  }, [reviews]);

  // Filtered and Paginated Reviews
  const filteredReviews = useMemo(() => {
    return reviews.filter(r => {
      // Rating filter
      const matchesRating = reviewRatingFilter === 'ALL' || String(r.rating) === String(reviewRatingFilter);

      // Reply status filter
      let matchesReply = true;
      if (replyFilter === 'REPLIED') matchesReply = Boolean(r.reply);
      else if (replyFilter === 'UNREPLIED') matchesReply = !r.reply;

      // Keyword search
      const keyword = searchKeyword.toLowerCase().trim();
      const matchesSearch = !keyword || 
        (r.user?.fullName && r.user.fullName.toLowerCase().includes(keyword)) ||
        (r.product?.name && r.product.name.toLowerCase().includes(keyword)) ||
        (r.product?.isbn && r.product.isbn.toLowerCase().includes(keyword)) ||
        (r.comment && r.comment.toLowerCase().includes(keyword));

      return matchesRating && matchesReply && matchesSearch;
    });
  }, [reviews, reviewRatingFilter, replyFilter, searchKeyword]);

  const totalReviewPages = Math.ceil(filteredReviews.length / ITEMS_PER_PAGE) || 1;
  const paginatedReviews = filteredReviews.slice(
    (reviewPage - 1) * ITEMS_PER_PAGE,
    reviewPage * ITEMS_PER_PAGE
  );

  const isFilterActive = searchKeyword !== '' || reviewRatingFilter !== 'ALL' || replyFilter !== 'ALL';

  const handleClearFilters = () => {
    setSearchKeyword('');
    setReviewRatingFilter('ALL');
    setReplyFilter('ALL');
    setReviewPage(1);
  };

  const renderStars = (rating) => {
    const num = Math.min(Math.max(Number(rating) || 0, 0), 5);
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={star <= num ? '#f59e0b' : 'transparent'}
            stroke="#f59e0b"
            strokeWidth={star <= num ? 0 : 1.5}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Header and Summary Stats */}
      <div className="manager-flex-responsive-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0, letterSpacing: '-0.02em' }}>
            Đánh giá & Bình luận
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--mgr-text-muted)' }}>
            Theo dõi trải nghiệm của độc giả, phản hồi thắc mắc và kiểm duyệt nội dung
          </p>
        </div>

        {/* Quick KPI Badges */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--mgr-radius-md)',
            backgroundColor: 'var(--mgr-bg-card)',
            border: '1px solid var(--mgr-border)',
            boxShadow: 'var(--mgr-shadow-xs)'
          }}>
            <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-muted)' }}>Điểm TB:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--mgr-text-dark)' }}>{avgRating}/5.0</span>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: 'var(--mgr-radius-md)',
            backgroundColor: 'var(--mgr-bg-card)',
            border: '1px solid var(--mgr-border)',
            boxShadow: 'var(--mgr-shadow-xs)'
          }}>
            <MessageSquareReply size={16} style={{ color: 'var(--mgr-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-muted)' }}>Chờ phản hồi:</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: unrepliedCount > 0 ? 'var(--mgr-warning)' : 'var(--mgr-success)' }}>
              {unrepliedCount}
            </span>
          </div>
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
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--mgr-text-light)' }} />
            <input
              type="text"
              placeholder="Tìm theo khách hàng, tựa sách hoặc bình luận..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setReviewPage(1); }}
              className="manager-search-input"
              style={{
                width: '100%',
                paddingLeft: '38px',
                paddingRight: searchKeyword ? '36px' : '14px',
                height: '42px',
                borderRadius: 'var(--mgr-radius-md)',
                border: '1px solid var(--mgr-border)',
                outline: 'none',
                fontSize: '0.875rem',
                backgroundColor: 'var(--mgr-bg-card)',
                boxSizing: 'border-box'
              }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => { setSearchKeyword(''); setReviewPage(1); }}
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

          {/* Rating filter */}
          <div style={{ flex: '0 1 170px', minWidth: '150px' }}>
            <select
              className="manager-filter-select"
              value={reviewRatingFilter}
              onChange={(e) => { setReviewRatingFilter(e.target.value); setReviewPage(1); }}
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
              <option value="ALL">Tất cả số sao</option>
              <option value="5">5 sao (Rất tốt)</option>
              <option value="4">4 sao (Tốt)</option>
              <option value="3">3 sao (Bình thường)</option>
              <option value="2">2 sao (Chưa hài lòng)</option>
              <option value="1">1 sao (Kém)</option>
            </select>
          </div>

          {/* Reply Status filter */}
          <div style={{ flex: '0 1 180px', minWidth: '160px' }}>
            <select
              className="manager-filter-select"
              value={replyFilter}
              onChange={(e) => { setReplyFilter(e.target.value); setReviewPage(1); }}
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
              <option value="UNREPLIED">Chưa phản hồi</option>
              <option value="REPLIED">Đã phản hồi</option>
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

      {/* Desktop Reviews Table (Laptop 1366-1440px) */}
      <div className="manager-table-responsive manager-desktop-table">
        <table className="manager-table">
          <thead>
            <tr>
              <th style={{ width: '22%' }}>NGƯỜI ĐÁNH GIÁ</th>
              <th style={{ width: '38%' }}>NỘI DUNG ĐÁNH GIÁ</th>
              <th style={{ width: '26%' }}>SẢN PHẨM SÁCH</th>
              <th style={{ width: '14%', textAlign: 'center' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.map(review => {
              const coverImg = getProductCover(review.product);
              const initials = review.user?.fullName?.charAt(0).toUpperCase() || 'U';

              return (
                <tr key={review.id}>
                  {/* NGƯỜI ĐÁNH GIÁ */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--mgr-primary-light)',
                        color: 'var(--mgr-primary)',
                        border: '1px solid var(--mgr-primary-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        flexShrink: 0
                      }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--mgr-text-dark)', fontSize: '0.9rem' }}>
                          {review.user?.fullName || 'Khách vãng lai'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)', marginTop: '2px' }}>
                          {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* NỘI DUNG ĐÁNH GIÁ */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {renderStars(review.rating)}
                      <div style={{ color: 'var(--mgr-text-main)', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.45 }}>
                        "{review.comment}"
                      </div>

                      {/* Store Reply Block */}
                      {review.reply ? (
                        <div style={{
                          marginTop: '6px',
                          padding: '10px 14px',
                          borderRadius: 'var(--mgr-radius-sm)',
                          backgroundColor: 'var(--mgr-primary-light)',
                          borderLeft: '3px solid var(--mgr-primary)',
                          fontSize: '0.825rem',
                          color: 'var(--mgr-text-main)'
                        }}>
                          <div style={{ fontWeight: 700, color: 'var(--mgr-primary)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <CheckCircle2 size={13} />
                            <span>Cửa hàng phản hồi:</span>
                          </div>
                          <div>{review.reply}</div>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--mgr-warning)', fontWeight: 600, fontStyle: 'italic', marginTop: '2px' }}>
                          • Chưa có phản hồi từ cửa hàng
                        </div>
                      )}
                    </div>
                  </td>

                  {/* SẢN PHẨM SÁCH */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '38px',
                        height: '52px',
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
                            alt={review.product?.name || 'Book'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <BookOpen size={16} style={{ color: 'var(--mgr-text-light)' }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div 
                          style={{ 
                            fontWeight: 700, 
                            color: 'var(--mgr-text-dark)', 
                            fontSize: '0.875rem',
                            lineHeight: 1.3,
                            marginBottom: '2px'
                          }}
                        >
                          {review.product?.name || 'Sản phẩm không rõ'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mgr-text-muted)' }}>
                          ISBN: {review.product?.isbn || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* THAO TÁC */}
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyReviewId(review.id);
                          setReplyText(review.reply || '');
                          setReplyUser(review.user?.fullName || 'Khách hàng');
                        }}
                        className="manager-btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem', gap: '4px' }}
                        title={review.reply ? "Chỉnh sửa phản hồi" : "Phản hồi đánh giá này"}
                      >
                        <MessageSquareReply size={14} style={{ color: 'var(--mgr-primary)' }} />
                        <span>{review.reply ? 'Sửa lời đáp' : 'Phản hồi'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDeleteReviewId(review.id);
                          setDeleteReason('');
                          setDeleteUser(review.user?.fullName || 'Khách hàng');
                        }}
                        className="manager-btn-icon"
                        style={{ color: 'var(--mgr-danger)' }}
                        title="Xóa đánh giá này"
                        aria-label={`Xóa đánh giá của ${review.user?.fullName}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '48px 16px' }}>
                  <EmptyState
                    icon={MessageSquare}
                    title="Không tìm thấy đánh giá nào"
                    description={
                      isFilterActive
                        ? "Không có đánh giá nào phù hợp với bộ lọc số sao hoặc từ khóa tìm kiếm."
                        : "Cửa hàng hiện chưa có đánh giá nào từ phía khách hàng."
                    }
                    actionText={isFilterActive ? "Xóa bộ lọc" : undefined}
                    onAction={isFilterActive ? handleClearFilters : undefined}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Desktop Pagination Controls */}
        {filteredReviews.length > 0 && (
          <div className="manager-pagination-bar">
            <span style={{ fontSize: '0.825rem', color: 'var(--mgr-text-muted)' }}>
              Hiển thị {paginatedReviews.length} trên tổng số {filteredReviews.length} đánh giá (Trang {reviewPage}/{totalReviewPages})
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                disabled={reviewPage === 1}
                onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalReviewPages)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setReviewPage(i + 1)}
                  className={`manager-page-btn ${reviewPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={reviewPage === totalReviewPages}
                onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
                className="manager-page-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Reviews Cards (iPhone 14 Pro Max & screens <= 768px) */}
      <div className="manager-mobile-card-list">
        {paginatedReviews.map(review => {
          const coverImg = getProductCover(review.product);
          const initials = review.user?.fullName?.charAt(0).toUpperCase() || 'U';

          return (
            <div key={review.id} className="manager-card-item">
              {/* Header: User & Stars */}
              <div className="manager-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--mgr-primary-light)',
                    color: 'var(--mgr-primary)',
                    border: '1px solid var(--mgr-primary-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {initials}
                  </div>
                  <div>
                    <span className="manager-card-title">{review.user?.fullName || 'Khách hàng'}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--mgr-text-muted)' }}>
                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </div>
                  </div>
                </div>

                <div>
                  {renderStars(review.rating)}
                </div>
              </div>

              {/* Body: Product & Review Comment */}
              <div className="manager-card-body">
                {/* Book product preview */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: 'var(--mgr-radius-sm)',
                  backgroundColor: '#f8fafc',
                  border: '1px solid var(--mgr-border-light)'
                }}>
                  <div style={{
                    width: '28px',
                    height: '38px',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#e2e8f0',
                    flexShrink: 0
                  }}>
                    {coverImg ? (
                      <img src={coverImg} alt="Book" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <BookOpen size={14} style={{ color: 'var(--mgr-text-light)' }} />
                    )}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--mgr-text-dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {review.product?.name || 'Sản phẩm'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--mgr-text-muted)' }}>
                      ISBN: {review.product?.isbn || 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Comment text */}
                <div style={{ color: 'var(--mgr-text-main)', fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.45, marginTop: '4px' }}>
                  "{review.comment}"
                </div>

                {/* Store reply */}
                {review.reply ? (
                  <div style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    borderRadius: 'var(--mgr-radius-sm)',
                    backgroundColor: 'var(--mgr-primary-light)',
                    borderLeft: '3px solid var(--mgr-primary)',
                    fontSize: '0.8rem',
                    color: 'var(--mgr-text-main)'
                  }}>
                    <span style={{ fontWeight: 700, color: 'var(--mgr-primary)', marginRight: '4px' }}>Cửa hàng:</span>
                    {review.reply}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--mgr-warning)', fontStyle: 'italic' }}>
                    • Chưa có phản hồi từ cửa hàng
                  </div>
                )}
              </div>

              {/* Action Buttons (Touch target >= 44px) */}
              <div className="manager-card-footer" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setReplyReviewId(review.id);
                    setReplyText(review.reply || '');
                    setReplyUser(review.user?.fullName || 'Khách hàng');
                  }}
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
                  <MessageSquareReply size={16} />
                  <span>{review.reply ? 'Sửa phản hồi' : 'Phản hồi'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDeleteReviewId(review.id);
                    setDeleteReason('');
                    setDeleteUser(review.user?.fullName || 'Khách hàng');
                  }}
                  style={{
                    minHeight: '44px',
                    padding: '0 16px',
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

        {filteredReviews.length === 0 && (
          <div className="manager-panel" style={{ padding: '32px 16px', textAlign: 'center' }}>
            <EmptyState
              icon={MessageSquare}
              title="Không tìm thấy đánh giá nào"
              description={
                isFilterActive
                  ? "Không có đánh giá nào phù hợp với bộ lọc đã chọn."
                  : "Chưa có đánh giá nào từ độc giả."
              }
              actionText={isFilterActive ? "Xem tất cả" : undefined}
              onAction={isFilterActive ? handleClearFilters : undefined}
            />
          </div>
        )}

        {/* Mobile Pagination */}
        {filteredReviews.length > 0 && totalReviewPages > 1 && (
          <div className="manager-pagination-bar" style={{ justifyContent: 'center' }}>
            <button
              type="button"
              disabled={reviewPage === 1}
              onClick={() => setReviewPage(prev => Math.max(prev - 1, 1))}
              className="manager-page-btn"
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 8px' }}>
              {reviewPage} / {totalReviewPages}
            </span>
            <button
              type="button"
              disabled={reviewPage === totalReviewPages}
              onClick={() => setReviewPage(prev => Math.min(prev + 1, totalReviewPages))}
              className="manager-page-btn"
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          REPLY MODAL
          ========================================================================= */}
      {replyReviewId && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '500px' }}>
            <div className="manager-modal-header">
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mgr-text-dark)', margin: 0 }}>
                  Phản hồi đánh giá của {replyUser}
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                  Gửi lời giải đáp hoặc cảm ơn chính thức từ cửa hàng đến độc giả
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setReplyReviewId(null); setReplyText(''); }}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleReplySubmit}>
              <div className="manager-modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Nội dung phản hồi từ cửa hàng <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Nhập nội dung giải đáp, tư vấn hoặc tri ân độc giả..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--mgr-radius-sm)',
                      border: '1px solid var(--mgr-border)',
                      outline: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => { setReplyReviewId(null); setReplyText(''); }}
                  className="manager-btn-secondary"
                  style={{ minHeight: '44px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="manager-btn-primary"
                  style={{ minHeight: '44px' }}
                >
                  <Send size={16} />
                  <span>{submittingReply ? 'Đang gửi...' : 'Gửi phản hồi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          DELETE MODAL
          ========================================================================= */}
      {deleteReviewId && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: '480px' }}>
            <div className="manager-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--mgr-danger-light)',
                  color: 'var(--mgr-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--mgr-danger)', margin: 0 }}>
                    Xóa đánh giá của {deleteUser}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--mgr-text-muted)' }}>
                    Nhập lý do kiểm duyệt để thông báo đến khách hàng
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setDeleteReviewId(null); setDeleteReason(''); }}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeleteSubmit}>
              <div className="manager-modal-body">
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--mgr-text-main)', marginBottom: '6px' }}>
                    Lý do xóa đánh giá <span style={{ color: 'var(--mgr-danger)' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Ví dụ: Bình luận chứa từ ngữ thô tục, quảng cáo, spam hoặc sai lệch thông tin..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: 'var(--mgr-radius-sm)',
                      border: '1px solid var(--mgr-border)',
                      outline: 'none',
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => { setDeleteReviewId(null); setDeleteReason(''); }}
                  className="manager-btn-secondary"
                  style={{ minHeight: '44px' }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingDelete}
                  className="manager-btn-danger"
                  style={{ minHeight: '44px' }}
                >
                  <Trash2 size={16} />
                  <span>{submittingDelete ? 'Đang xóa...' : 'Xác nhận xóa'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerReviews;
