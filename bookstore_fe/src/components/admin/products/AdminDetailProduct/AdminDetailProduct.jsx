import { ArrowLeft, Check, X, BookOpen, Layers } from "lucide-react";
import { useAdminDetailProduct } from "./useAdminDetailProduct";
import "./AdminDetailProduct.css";

const AdminDetailProduct = ({ productId, onBack, loadMainData }) => {
    const { product, loading, displayImage, handleApprove, handleReject } =
        useAdminDetailProduct({ productId, onBack, loadMainData });

    if (loading) {
        return (
            <div className="admin-detail-product-state">
                <div className="admin-detail-spinner" />
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="admin-detail-product-state error">
                <p>Không tìm thấy thông tin sản phẩm!</p>
                <button
                    type="button"
                    onClick={onBack}
                    className="admin-detail-product-back-btn"
                >
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>
            </div>
        );
    }

    const isPending = product.status === "PENDING";
    const isActive = product.status === "ACTIVE";
    const isRejected = product.status === "REJECTED";

    return (
        <div className="admin-detail-product-container">
            {/* Top Navigation */}
            <div className="admin-detail-nav-bar">
                <button
                    type="button"
                    onClick={onBack}
                    className="admin-detail-product-back-btn"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách sản phẩm</span>
                </button>
            </div>

            {/* Main Detail Card */}
            <div className="admin-detail-product-card">
                {/* Header inside card */}
                <div className="admin-detail-product-card-header">
                    <div className="admin-detail-product-id-wrapper">
                        <Layers size={18} className="admin-detail-id-icon" />
                        <span className="admin-detail-product-id-text">
                            SẢN PHẨM #{product.id}
                        </span>
                    </div>
                    <div className="admin-detail-product-badges-group">
                        <span
                            className={`admin-detail-status-pill ${
                                isActive
                                    ? "active"
                                    : isPending
                                    ? "pending"
                                    : isRejected
                                    ? "rejected"
                                    : "inactive"
                            }`}
                        >
                            <span className="admin-status-dot" />
                            {isActive
                                ? "Đã duyệt"
                                : isPending
                                ? "Chờ duyệt"
                                : isRejected
                                ? "Bị từ chối"
                                : "Tạm ẩn"}
                        </span>
                        <span className="admin-detail-product-category-badge">
                            {product.category?.name || "Chưa phân loại"}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="admin-detail-product-body">
                    {/* Left Cover Image */}
                    <div className="admin-detail-product-cover-wrapper">
                        {displayImage ? (
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="admin-detail-product-cover-img"
                                onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextElementSibling?.style.setProperty("display", "flex");
                                }}
                            />
                        ) : null}
                        <div
                            className="admin-detail-cover-placeholder"
                            style={{ display: displayImage ? "none" : "flex" }}
                        >
                            <BookOpen size={48} color="#94a3b8" />
                            <span>Không có ảnh bìa</span>
                        </div>
                    </div>

                    {/* Right Details */}
                    <div className="admin-detail-product-info-panel">
                        <h2 className="admin-detail-product-name">
                            {product.name}
                        </h2>
                        <div className="admin-detail-product-author-wrap">
                            <span className="admin-detail-author-label">Tác giả:</span>
                            <span className="admin-detail-product-author">
                                {product.author || "Đang cập nhật"}
                            </span>
                        </div>

                        {/* Price & Stock highlight box */}
                        <div className="admin-detail-price-box">
                            <div>
                                <div className="admin-detail-box-label">ĐƠN GIÁ NIÊM YẾT</div>
                                <div className="admin-detail-product-price">
                                    {product.price?.toLocaleString("vi-VN")}₫
                                </div>
                            </div>
                            <div className="admin-detail-box-divider" />
                            <div>
                                <div className="admin-detail-box-label">TỒN KHO</div>
                                <div className="admin-detail-product-stock">
                                    {product.stockQuantity || 0} <span className="stock-unit">cuốn</span>
                                </div>
                            </div>
                        </div>

                        {/* Description Section */}
                        <div className="admin-detail-section-title">Mô tả sản phẩm</div>
                        <div className="admin-detail-product-description">
                            {product.description || "Chưa có nội dung mô tả cho sản phẩm này."}
                        </div>

                        {/* Specifications Grid */}
                        <div className="admin-detail-section-title">Thông số xuất bản</div>
                        <div className="admin-detail-product-specs-grid">
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Nhà cung cấp:</span>
                                <span className="spec-value">{product.supplierName || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Năm XB:</span>
                                <span className="spec-value">{product.publicationYear || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Số trang:</span>
                                <span className="spec-value">{product.page || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Ngôn ngữ:</span>
                                <span className="spec-value">{product.language || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Định dạng:</span>
                                <span className="spec-value">{product.format || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Kích thước:</span>
                                <span className="spec-value">{product.dimensions || "Đang cập nhật"}</span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Trọng lượng:</span>
                                <span className="spec-value">
                                    {product.weight ? `${product.weight} g` : "Đang cập nhật"}
                                </span>
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <span className="spec-label">Mã ISBN:</span>
                                <span className="spec-value isbn">{product.isbn || "Đang cập nhật"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="admin-detail-product-footer">
                    <button
                        type="button"
                        onClick={handleReject}
                        className="admin-detail-product-btn-reject"
                    >
                        <X size={16} />
                        <span>Từ chối sản phẩm</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="admin-detail-product-btn-approve"
                    >
                        <Check size={16} />
                        <span>Phê duyệt sản phẩm</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDetailProduct;
