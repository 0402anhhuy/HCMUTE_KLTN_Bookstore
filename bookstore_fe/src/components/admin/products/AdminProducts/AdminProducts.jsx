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
                    <option value="ACTIVE">Còn hàng / Đang bán</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
            </div>

            {/* Table grid wrapper */}
            <div className="admin-products-table-wrapper">
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
                                            <span className="admin-products-status-tag">
                                                Chờ duyệt
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
        </div>
    );
};

export default AdminProducts;
