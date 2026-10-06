import "./Catalog.css";

const BookCardSkeleton = () => {
    return (
        <div className="book-card-container book-card-skeleton" aria-hidden="true">
            <div className="book-card-cover-wrapper skeleton-box skeleton-cover" />

            <div className="skeleton-box skeleton-line skeleton-title-1" />
            <div className="skeleton-box skeleton-line skeleton-title-2" />

            <div className="skeleton-box skeleton-line skeleton-author" />

            <div className="book-card-rating-row">
                <div className="skeleton-box skeleton-rating" />
            </div>

            <div className="book-card-bottom-row">
                <div className="skeleton-box skeleton-price" />
                <div className="skeleton-box skeleton-btn" />
            </div>
        </div>
    );
};

export default BookCardSkeleton;
