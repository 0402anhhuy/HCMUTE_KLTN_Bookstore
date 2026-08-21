import { Eye, ArrowLeft } from "lucide-react";
import { useAdminDetailProduct } from "./useAdminDetailProduct";
import "./AdminDetailProduct.css";

const AdminDetailProduct = ({ productId, onBack, loadMainData }) => {
    const { product, loading, displayImage, handleApprove, handleReject } =
        useAdminDetailProduct({ productId, onBack, loadMainData });

    if (loading) {
        return (
            <div className="admin-detail-product-loading">
                Đang tải thông tin sản phẩm...
            </div>
        );
    }

    if (!product) {
        return (
            <div className="admin-detail-product-empty">
                Không tìm thấy sản phẩm!
            </div>
        );
    }

    return (
        <div className="admin-detail-product-container">
            {/* Top Header */}
            <div>
                <button
                    type="button"
                    onClick={onBack}
                    className="admin-detail-product-back-btn"
                >
                    <ArrowLeft size={16} /> Quay lại danh sách
                </button>
            </div>

            {/* Main Detail Box */}
            <div className="admin-detail-product-card">
                {/* Header inside box */}
                <div className="admin-detail-product-card-header">
                    <div className="admin-detail-product-id-wrapper">
                        <Eye size={20} color="#92400e" />
                        <span className="admin-detail-product-id-text">
                            SẢN PHẨM {product.id}
                        </span>
                    </div>
                    <div className="admin-detail-product-badges-group">
                        <span className="admin-detail-product-priority-badge">
                            Ưu tiên cao
                        </span>
                        <span className="admin-detail-product-category-badge">
                            {product.category?.name || "Đồ điện tử"}
                        </span>
                    </div>
                </div>

                {/* Body Content */}
                <div className="admin-detail-product-body">
                    {/* Left Cover Image */}
                    <div className="admin-detail-product-cover-wrapper">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="admin-detail-product-cover-img"
                        />
                    </div>

                    {/* Right Details */}
                    <div className="admin-detail-product-info-panel">
                        <h2 className="admin-detail-product-name">
                            {product.name}
                        </h2>
                        <h3 className="admin-detail-product-author">
                            {product.author || "Đang cập nhật"}
                        </h3>

                        <div className="admin-detail-product-section-label">
                            MÔ TẢ
                        </div>
                        <p className="admin-detail-product-description">
                            {product.description ||
                                "Chưa có mô tả cho sản phẩm này."}
                        </p>

                        <div className="admin-detail-product-section-label">
                            GIÁ
                        </div>
                        <div className="admin-detail-product-price">
                            {product.price?.toLocaleString("vi-VN")}Đ
                        </div>

                        <div className="admin-detail-product-specs-grid">
                            <div className="admin-detail-product-spec-item">
                                <b>Nhà cung cấp:</b>{" "}
                                {product.supplierName || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Năm XB:</b>{" "}
                                {product.publicationYear || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Số trang:</b>{" "}
                                {product.page || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Ngôn ngữ:</b>{" "}
                                {product.language || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Định dạng:</b>{" "}
                                {product.format || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Kích thước:</b>{" "}
                                {product.dimensions || "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>Trọng lượng:</b>{" "}
                                {product.weight
                                    ? `${product.weight} g`
                                    : "Đang cập nhật"}
                            </div>
                            <div className="admin-detail-product-spec-item">
                                <b>ISBN:</b> {product.isbn || "Đang cập nhật"}
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
                        Từ chối
                    </button>
                    <button
                        type="button"
                        onClick={handleApprove}
                        className="admin-detail-product-btn-approve"
                    >
                        Duyệt sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDetailProduct;
