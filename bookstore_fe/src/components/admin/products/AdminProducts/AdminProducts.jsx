import { Search, Check, X, ClipboardList } from "lucide-react";
import { useAdminProducts } from "./useAdminProducts";
import AdminDetailProduct from "../AdminDetailProduct/AdminDetailProduct";
import CategorySelector from "@/components/common/CategorySelector/CategorySelector";
import { formatCategoryLabel, getCategoryPath } from "@/utils/categoryTree";
import "./AdminProducts.css";

const AdminProducts = ({ products, categories, loadData }) => {
    const {
        productSearch,
        setProductSearch,
        categoryFilter,
        setCategoryFilter,
        productStatusFilter,
        setProductStatusFilter,
        productPage,
        setProductPage,
        selectedProductId,
        setSelectedProductId,
        pendingCount,
        approvedCount,
        rejectedCount,
        categoryOptions,
        filteredProducts,
        totalProductPages,
        paginatedProducts,
        getImagesList,
    } = useAdminProducts({ products, categories });

    if (selectedProductId) {
        return (
            <AdminDetailProduct
                productId={selectedProductId}
                onBack={() => setSelectedProductId(null)}
                loadMainData={loadData}
            />
        );
    }

    return (
        <div className="admin-products-container">
            {/* Top Header */}
            <div className="admin-products-header">
                <div>
                    <h1 className="admin-products-title">
                        Kiểm duyệt sản phẩm
                    </h1>
                    <p className="admin-products-subtitle">
                        Quản lý sản phẩm, kiểm duyệt và hàng chờ tuân thủ
                    </p>
                </div>
            </div>

            {/* 3 Stats Cards */}
            <div className="admin-products-stats-grid">
                {/* Card 1 */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            ĐANG CHỜ DUYỆT
                        </span>
                        <ClipboardList size={20} color="#3b82f6" />
                    </div>
                    <div className="admin-products-stat-value">
                        {pendingCount}
                    </div>
                    <div className="admin-products-stat-desc success">
                        theo thời gian thực
                    </div>
                </div>

                {/* Card 2 */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            ĐÃ DUYỆT
                        </span>
                        <Check size={20} color="#3b82f6" />
                    </div>
                    <div className="admin-products-stat-value">
                        {approvedCount}
                    </div>
                    <div className="admin-products-stat-desc success">
                        đang bán
                    </div>
                </div>

                {/* Card 3 */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            BỊ TỪ CHỐI
                        </span>
                        <X size={20} color="#ef4444" />
                    </div>
                    <div className="admin-products-stat-value">
                        {rejectedCount}
                    </div>
                    <div className="admin-products-stat-desc danger">
                        cần rà soát
                    </div>
                </div>
            </div>

            {/* Table search & filter controls */}
            <div className="admin-products-filter-bar">
                <div className="admin-products-search-wrapper">
                    <Search size={18} className="admin-products-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm tên sản phẩm hoặc tác giả..."
                        value={productSearch}
                        onChange={(e) => {
                            setProductSearch(e.target.value);
                            setProductPage(1);
                        }}
                        className="admin-products-search-input"
                    />
                </div>

                <CategorySelector
                    categories={categories}
                    value={categoryFilter}
                    onChange={(val) => {
                        setCategoryFilter(val);
                        setProductPage(1);
                    }}
                    placeholder="Tất cả danh mục"
                />

                <select
                    value={productStatusFilter}
                    onChange={(e) => {
                        setProductStatusFilter(e.target.value);
                        setProductPage(1);
                    }}
                    className="admin-products-status-select"
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ duyệt</option>
                    <option value="ACTIVE">Đã duyệt (Đang bán)</option>
                    <option value="REJECTED">Bị từ chối</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
            </div>

            {/* Table grid wrapper (Desktop) */}
            <div className="admin-desktop-table admin-products-table-wrapper">
                <table className="admin-products-table">
                    <thead>
                        <tr className="admin-products-thead-row">
                            <th className="admin-products-th">SẢN PHẨM</th>
                            <th className="admin-products-th">DANH MỤC</th>
                            <th className="admin-products-th">TÁC GIẢ</th>
                            <th className="admin-products-th">ĐƠN GIÁ</th>
                            <th className="admin-products-th">KHO HÀNG</th>
                            <th className="admin-products-th-center">
                                TRẠNG THÁI
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map((p) => {
                            const isOutOfStock = p.stockQuantity === 0;
                            const isProductActive =
                                p.status === "ACTIVE" && p.stockQuantity > 0;

                            return (
                                <tr
                                    key={p.id}
                                    className="admin-products-row"
                                    onClick={() => setSelectedProductId(p.id)}
                                >
                                    <td className="admin-products-td">
                                        <div className="admin-products-item-box">
                                            <img
                                                src={
                                                    getImagesList(
                                                        p.imageUrl,
                                                    )[0] ||
                                                    "https://via.placeholder.com/40x60?text=Book"
                                                }
                                                alt={p.name}
                                                className="admin-products-item-thumb"
                                            />
                                            <div className="admin-products-item-info">
                                                <div
                                                    className="admin-products-item-name"
                                                    title={p.name}
                                                >
                                                    {p.name}
                                                </div>
                                                <div className="admin-products-item-isbn">
                                                    ISBN: {p.isbn || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="admin-products-td-nowrap">
                                        <span
                                            className="admin-products-category-badge"
                                            title={
                                                getCategoryPath(p.category) ||
                                                p.category?.name ||
                                                "N/A"
                                            }
                                        >
                                            {getCategoryPath(p.category) ||
                                                p.category?.name ||
                                                "N/A"}
                                        </span>
                                    </td>
                                    <td className="admin-products-td-nowrap">
                                        <span className="admin-products-author-text">
                                            {p.author || "Chưa rõ"}
                                        </span>
                                    </td>
                                    <td className="admin-products-td">
                                        <span className="admin-products-price-text">
                                            {p.price?.toLocaleString("vi-VN")}đ
                                        </span>
                                    </td>
                                    <td className="admin-products-td-nowrap">
                                        <div className="admin-products-stock-box">
                                            <span
                                                className={`admin-products-stock-quantity ${isOutOfStock
                                                        ? "out-of-stock"
                                                        : ""
                                                    }`}
                                            >
                                                {p.stockQuantity} cuốn
                                            </span>
                                            <span
                                                className={`admin-products-stock-badge ${isProductActive
                                                        ? "in-stock"
                                                        : "out-of-stock"
                                                    }`}
                                            >
                                                {isProductActive
                                                    ? "Đang bán"
                                                    : isOutOfStock
                                                        ? "Hết hàng"
                                                        : "Tạm ẩn"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="admin-products-td-nowrap">
                                        <div className="admin-products-action-box">
                                            <span className={`admin-products-status-tag ${p.status ? p.status.toLowerCase() : 'pending'}`}>
                                                {p.status === "ACTIVE" ? "Đã duyệt" : p.status === "REJECTED" ? "Bị từ chối" : p.status === "INACTIVE" ? "Tạm ẩn" : "Chờ duyệt"}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="admin-products-empty-cell"
                                >
                                    Không tìm thấy sản phẩm nào phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="admin-products-pagination">
                    <span className="admin-products-pagination-info">
                        Hiển thị {paginatedProducts.length} trên tổng số{" "}
                        {filteredProducts.length} sản phẩm
                    </span>
                    <div className="admin-products-pagination-controls">
                        <button
                            type="button"
                            disabled={productPage === 1}
                            onClick={() =>
                                setProductPage((prev) => Math.max(prev - 1, 1))
                            }
                            className="admin-products-page-btn"
                        >
                            Trước
                        </button>
                        {[...Array(totalProductPages)].map((_, i) => (
                            <button
                                type="button"
                                key={i}
                                onClick={() => setProductPage(i + 1)}
                                className={`admin-products-page-btn ${productPage === i + 1 ? "active" : ""
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            type="button"
                            disabled={productPage === totalProductPages}
                            onClick={() =>
                                setProductPage((prev) =>
                                    Math.min(prev + 1, totalProductPages),
                                )
                            }
                            className="admin-products-page-btn"
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Cards List View */}
            <div className="admin-mobile-card-list">
                {paginatedProducts.map((p) => {
                    const isOutOfStock = p.stockQuantity === 0;
                    const isProductActive = p.status === "ACTIVE" && p.stockQuantity > 0;
                    return (
                        <div key={p.id} className="admin-card-item" onClick={() => setSelectedProductId(p.id)}>
                            <div className="admin-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <img
                                        src={getImagesList(p.imageUrl)[0] || "https://via.placeholder.com/40x60?text=Book"}
                                        alt={p.name}
                                        style={{ width: '40px', height: '52px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                                    />
                                    <div>
                                        <div className="admin-card-title">{p.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ISBN: {p.isbn || "N/A"}</div>
                                    </div>
                                </div>
                                <span className={`admin-products-stock-badge ${isProductActive ? "in-stock" : "out-of-stock"}`}>
                                    {isProductActive ? "Đang bán" : isOutOfStock ? "Hết hàng" : "Tạm ẩn"}
                                </span>
                            </div>

                            <div className="admin-card-body">
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Tác giả:</span>
                                    <span className="admin-card-value">{p.author || "Chưa rõ"}</span>
                                </div>
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Danh mục:</span>
                                    <span style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600 }}>
                                        {getCategoryPath(p.category) || p.category?.name || "N/A"}
                                    </span>
                                </div>
                                <div className="admin-card-row">
                                    <span className="admin-card-label">Đơn giá / Kho:</span>
                                    <span className="admin-card-value">
                                        <strong style={{ color: '#ef4444' }}>{p.price?.toLocaleString("vi-VN")}đ</strong> ({p.stockQuantity} cuốn)
                                    </span>
                                </div>
                            </div>

                            <div className="admin-card-footer">
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedProductId(p.id); }}
                                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #3b82f6', backgroundColor: '#eff6ff', color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    Xem chi tiết & Kiểm duyệt
                                </button>
                            </div>
                        </div>
                    );
                })}
                {filteredProducts.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#64748b', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        Không tìm thấy sản phẩm nào phù hợp
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
