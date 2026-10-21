import "./ProductDetail.css";

const ProductDetailSkeleton = () => {
    return (
        <div className="page-container animate-fade-in product-detail-container" aria-hidden="true">
            {/* Breadcrumb skeleton */}
            <div className="product-detail-breadcrumb-wrapper">
                <div className="skeleton-box" style={{ width: "240px", height: "18px", borderRadius: "6px" }} />
            </div>

            {/* Main 2-column layout skeleton */}
            <div className="product-detail-main-layout">
                {/* Left column skeleton */}
                <div className="product-detail-left-card">
                    <div className="skeleton-box product-detail-main-cover-box" style={{ height: "400px" }} />
                    <div className="product-detail-thumbs-strip" style={{ justifyContent: "center" }}>
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="skeleton-box"
                                style={{ width: "58px", height: "76px", borderRadius: "8px", flexShrink: 0 }}
                            />
                        ))}
                    </div>
                </div>

                {/* Right column skeleton */}
                <div className="product-detail-right-col">
                    {/* Main purchase card skeleton */}
                    <div className="product-detail-card-box">
                        {/* Title skeleton */}
                        <div className="skeleton-box" style={{ width: "85%", height: "28px", borderRadius: "6px", marginBottom: "8px" }} />
                        <div className="skeleton-box" style={{ width: "55%", height: "24px", borderRadius: "6px", marginBottom: "16px" }} />

                        {/* Meta items skeleton */}
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px", marginBottom: "16px" }}>
                            <div className="skeleton-box" style={{ height: "18px", width: "80%", borderRadius: "4px" }} />
                            <div className="skeleton-box" style={{ height: "18px", width: "70%", borderRadius: "4px" }} />
                            <div className="skeleton-box" style={{ height: "18px", width: "75%", borderRadius: "4px" }} />
                            <div className="skeleton-box" style={{ height: "18px", width: "65%", borderRadius: "4px" }} />
                        </div>

                        {/* Rating & stock skeleton */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                            <div className="skeleton-box" style={{ width: "100px", height: "16px", borderRadius: "4px" }} />
                            <div className="skeleton-box" style={{ width: "80px", height: "16px", borderRadius: "4px" }} />
                        </div>

                        {/* Price box skeleton */}
                        <div className="skeleton-box" style={{ height: "64px", width: "100%", borderRadius: "8px", marginBottom: "18px" }} />

                        {/* Quantity picker skeleton */}
                        <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "20px" }}>
                            <div className="skeleton-box" style={{ width: "70px", height: "18px", borderRadius: "4px" }} />
                            <div className="skeleton-box" style={{ width: "110px", height: "38px", borderRadius: "8px" }} />
                        </div>

                        {/* Action buttons skeleton */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <div className="skeleton-box" style={{ height: "48px", borderRadius: "8px" }} />
                            <div className="skeleton-box" style={{ height: "48px", borderRadius: "8px" }} />
                        </div>
                    </div>

                    {/* Shipping card skeleton */}
                    <div className="product-detail-card-box">
                        <div className="skeleton-box" style={{ width: "160px", height: "20px", borderRadius: "4px", marginBottom: "12px" }} />
                        <div className="skeleton-box" style={{ width: "100%", height: "44px", borderRadius: "6px" }} />
                    </div>

                    {/* Specs card skeleton */}
                    <div className="product-detail-card-box">
                        <div className="skeleton-box" style={{ width: "150px", height: "20px", borderRadius: "4px", marginBottom: "14px" }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                                    <div className="skeleton-box" style={{ width: "120px", height: "16px", borderRadius: "4px" }} />
                                    <div className="skeleton-box" style={{ width: "180px", height: "16px", borderRadius: "4px" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
