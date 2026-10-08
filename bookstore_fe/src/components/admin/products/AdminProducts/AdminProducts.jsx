import {
    Search,
    X,
    Clock,
    CheckCircle2,
    AlertTriangle,
    BookOpen,
    RotateCcw,
    ChevronLeft,
    ChevronRight,
    Eye,
    Package,
} from "lucide-react";
import { useAdminProducts } from "./useAdminProducts";
import AdminDetailProduct from "../AdminDetailProduct/AdminDetailProduct";
import CategorySelector from "@/components/common/CategorySelector/CategorySelector";
import EmptyState from "@/components/common/EmptyState/EmptyState";
import { getCategoryPath } from "@/utils/categoryTree";
import "./AdminProducts.css";

const AdminProducts = ({ products = [], categories = [], loadData }) => {
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
        filteredProducts,
        totalProductPages,
        paginatedProducts,
        getImagesList,
        handleResetFilters,
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

    const isFiltered =
        productSearch !== "" ||
        categoryFilter !== "" ||
        productStatusFilter !== "ALL";

    return (
        <div className="admin-products-container">
            {/* Top Header */}
            <div className="admin-products-header">
                <div>
                    <h1 className="admin-products-title">
                        Kiểm duyệt sản phẩm
                    </h1>
                    <p className="admin-products-subtitle">
                        Quản lý danh mục sách, phê duyệt và theo dõi trạng thái kiểm duyệt hệ thống
                    </p>
                </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="admin-products-stats-grid">
                {/* Card 1: Total */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            TỔNG SẢN PHẨM
                        </span>
                        <div className="admin-products-stat-icon-wrap total">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="admin-products-stat-value">
                        {products.length}
                    </div>
                    <div className="admin-products-stat-desc neutral">
                        trong hệ thống
                    </div>
                </div>

                {/* Card 2: Pending */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            ĐANG CHỜ DUYỆT
                        </span>
                        <div className="admin-products-stat-icon-wrap pending">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="admin-products-stat-value">
                        {pendingCount}
                    </div>
                    <div className="admin-products-stat-desc warning">
                        yêu cầu xử lý
                    </div>
                </div>

                {/* Card 3: Approved */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            ĐÃ DUYỆT BÁN
                        </span>
                        <div className="admin-products-stat-icon-wrap approved">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                    <div className="admin-products-stat-value">
                        {approvedCount}
                    </div>
                    <div className="admin-products-stat-desc success">
                        sẵn sàng giao dịch
                    </div>
                </div>

                {/* Card 4: Rejected */}
                <div className="admin-products-stat-card">
                    <div className="admin-products-stat-top">
                        <span className="admin-products-stat-label">
                            BỊ TỪ CHỐI
                        </span>
                        <div className="admin-products-stat-icon-wrap rejected">
                            <AlertTriangle size={20} />
                        </div>
                    </div>
                    <div className="admin-products-stat-value">
                        {rejectedCount}
                    </div>
                    <div className="admin-products-stat-desc danger">
                        cần rà soát lại
                    </div>
                </div>
            </div>

            {/* Filter bar */}
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
                    {productSearch && (
                        <button
                            type="button"
                            className="admin-products-search-clear"
                            onClick={() => {
                                setProductSearch("");
                                setProductPage(1);
                            }}
                            title="Xóa tìm kiếm"
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>

                <div className="admin-products-category-wrapper">
                    <CategorySelector
                        categories={categories}
                        value={categoryFilter}
                        onChange={(val) => {
                            setCategoryFilter(val);
                            setProductPage(1);
                        }}
                        placeholder="Tất cả danh mục"
                    />
                </div>

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

                {isFiltered && (
                    <button
                        type="button"
                        className="admin-products-reset-btn"
                        onClick={handleResetFilters}
                        title="Đặt lại bộ lọc"
                    >
                        <RotateCcw size={15} />
                        <span>Đặt lại</span>
                    </button>
                )}
            </div>

            {/* Content area: Table (Desktop) / Cards (Mobile) / EmptyState */}
            {filteredProducts.length === 0 ? (
                <div className="admin-products-empty-container">
                    <EmptyState
                        icon={BookOpen}
                        title="Không tìm thấy sản phẩm nào"
                        description={
                            isFiltered
                                ? "Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa tìm kiếm. Vui lòng thử lại với tiêu chí khác."
                                : "Chưa có sản phẩm nào trong hệ thống."
                        }
                        actionText={isFiltered ? "Đặt lại bộ lọc" : undefined}
                        onAction={isFiltered ? handleResetFilters : undefined}
                        actionIcon={isFiltered ? RotateCcw : undefined}
                    />
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
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
                                    <th className="admin-products-th-center">
                                        THAO TÁC
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedProducts.map((p) => {
                                    const isOutOfStock = p.stockQuantity === 0;
                                    const isProductActive =
                                        p.status === "ACTIVE" && p.stockQuantity > 0;
                                    const thumbUrl =
                                        getImagesList(p.imageUrl)[0] || "";

                                    return (
                                        <tr
                                            key={p.id}
                                            className="admin-products-row"
                                            onClick={() => setSelectedProductId(p.id)}
                                        >
                                            <td className="admin-products-td">
                                                <div className="admin-products-item-box">
                                                    {thumbUrl ? (
                                                        <img
                                                            src={thumbUrl}
                                                            alt={p.name}
                                                            className="admin-products-item-thumb"
                                                            onError={(e) => {
                                                                e.target.style.display = "none";
                                                                e.target.nextElementSibling?.style.setProperty("display", "flex");
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className="admin-products-item-placeholder"
                                                        style={{ display: thumbUrl ? "none" : "flex" }}
                                                    >
                                                        <BookOpen size={20} color="#94a3b8" />
                                                    </div>
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
                                                        "Chưa phân loại"}
                                                </span>
                                            </td>
                                            <td className="admin-products-td-nowrap">
                                                <span className="admin-products-author-text">
                                                    {p.author || "Chưa rõ"}
                                                </span>
                                            </td>
                                            <td className="admin-products-td-nowrap">
                                                <span className="admin-products-price-text">
                                                    {p.price?.toLocaleString("vi-VN")}₫
                                                </span>
                                            </td>
                                            <td className="admin-products-td-nowrap">
                                                <div className="admin-products-stock-box">
                                                    <span
                                                        className={`admin-products-stock-quantity ${
                                                            isOutOfStock ? "out-of-stock" : ""
                                                        }`}
                                                    >
                                                        {p.stockQuantity} cuốn
                                                    </span>
                                                    <span
                                                        className={`admin-products-stock-badge ${
                                                            isProductActive
                                                                ? "in-stock"
                                                                : isOutOfStock
                                                                ? "out-of-stock"
                                                                : "inactive"
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
                                                <div className="admin-products-status-wrapper">
                                                    <span
                                                        className={`admin-products-status-badge ${
                                                            p.status
                                                                ? p.status.toLowerCase()
                                                                : "pending"
                                                        }`}
                                                    >
                                                        <span className="admin-status-dot" />
                                                        {p.status === "ACTIVE"
                                                            ? "Đã duyệt"
                                                            : p.status === "REJECTED"
                                                            ? "Bị từ chối"
                                                            : p.status === "INACTIVE"
                                                            ? "Tạm ẩn"
                                                            : "Chờ duyệt"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="admin-products-td-nowrap admin-products-td-center">
                                                <button
                                                    type="button"
                                                    className="admin-products-action-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedProductId(p.id);
                                                    }}
                                                    title="Kiểm duyệt & Chi tiết"
                                                >
                                                    <Eye size={15} />
                                                    <span>Kiểm duyệt</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        <div className="admin-products-pagination">
                            <span className="admin-products-pagination-info">
                                Hiển thị <strong>{paginatedProducts.length}</strong> trên tổng số{" "}
                                <strong>{filteredProducts.length}</strong> sản phẩm
                            </span>
                            <div className="admin-products-pagination-controls">
                                <button
                                    type="button"
                                    disabled={productPage === 1}
                                    onClick={() =>
                                        setProductPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    className="admin-products-page-btn arrow"
                                    title="Trang trước"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Trước</span>
                                </button>
                                {[...Array(totalProductPages)].map((_, i) => (
                                    <button
                                        type="button"
                                        key={i}
                                        onClick={() => setProductPage(i + 1)}
                                        className={`admin-products-page-btn ${
                                            productPage === i + 1 ? "active" : ""
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
                                            Math.min(prev + 1, totalProductPages)
                                        )
                                    }
                                    className="admin-products-page-btn arrow"
                                    title="Trang sau"
                                >
                                    <span>Sau</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Cards List View */}
                    <div className="admin-mobile-card-list">
                        {paginatedProducts.map((p) => {
                            const isOutOfStock = p.stockQuantity === 0;
                            const isProductActive =
                                p.status === "ACTIVE" && p.stockQuantity > 0;
                            const thumbUrl = getImagesList(p.imageUrl)[0] || "";

                            return (
                                <div
                                    key={p.id}
                                    className="admin-card-item"
                                    onClick={() => setSelectedProductId(p.id)}
                                >
                                    <div className="admin-card-header">
                                        <div className="admin-card-header-left">
                                            {thumbUrl ? (
                                                <img
                                                    src={thumbUrl}
                                                    alt={p.name}
                                                    className="admin-card-thumb"
                                                />
                                            ) : (
                                                <div className="admin-card-thumb-placeholder">
                                                    <BookOpen size={18} color="#94a3b8" />
                                                </div>
                                            )}
                                            <div className="admin-card-title-group">
                                                <div className="admin-card-title">
                                                    {p.name}
                                                </div>
                                                <div className="admin-card-isbn">
                                                    ISBN: {p.isbn || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                        <span
                                            className={`admin-products-status-badge ${
                                                p.status
                                                    ? p.status.toLowerCase()
                                                    : "pending"
                                            }`}
                                        >
                                            <span className="admin-status-dot" />
                                            {p.status === "ACTIVE"
                                                ? "Đã duyệt"
                                                : p.status === "REJECTED"
                                                ? "Bị từ chối"
                                                : p.status === "INACTIVE"
                                                ? "Tạm ẩn"
                                                : "Chờ duyệt"}
                                        </span>
                                    </div>

                                    <div className="admin-card-body">
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Tác giả:</span>
                                            <span className="admin-card-value">
                                                {p.author || "Chưa rõ"}
                                            </span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Danh mục:</span>
                                            <span className="admin-card-category">
                                                {getCategoryPath(p.category) ||
                                                    p.category?.name ||
                                                    "Chưa phân loại"}
                                            </span>
                                        </div>
                                        <div className="admin-card-row">
                                            <span className="admin-card-label">Đơn giá / Kho:</span>
                                            <span className="admin-card-value">
                                                <strong className="admin-card-price">
                                                    {p.price?.toLocaleString("vi-VN")}₫
                                                </strong>{" "}
                                                ({p.stockQuantity} cuốn -{" "}
                                                <span
                                                    className={`admin-card-stock-status ${
                                                        isProductActive
                                                            ? "in-stock"
                                                            : isOutOfStock
                                                            ? "out-of-stock"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    {isProductActive
                                                        ? "Đang bán"
                                                        : isOutOfStock
                                                        ? "Hết hàng"
                                                        : "Tạm ẩn"}
                                                </span>
                                                )
                                            </span>
                                        </div>
                                    </div>

                                    <div className="admin-card-footer">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedProductId(p.id);
                                            }}
                                            className="admin-card-btn-action"
                                        >
                                            <Eye size={16} />
                                            <span>Xem chi tiết & Kiểm duyệt</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Mobile Pagination */}
                        <div className="admin-products-mobile-pagination">
                            <span className="admin-products-pagination-info">
                                Trang {productPage} / {totalProductPages} ({filteredProducts.length} sản phẩm)
                            </span>
                            <div className="admin-products-pagination-controls">
                                <button
                                    type="button"
                                    disabled={productPage === 1}
                                    onClick={() =>
                                        setProductPage((prev) => Math.max(prev - 1, 1))
                                    }
                                    className="admin-products-page-btn arrow"
                                >
                                    <ChevronLeft size={16} />
                                    <span>Trước</span>
                                </button>
                                <button
                                    type="button"
                                    disabled={productPage === totalProductPages}
                                    onClick={() =>
                                        setProductPage((prev) =>
                                            Math.min(prev + 1, totalProductPages)
                                        )
                                    }
                                    className="admin-products-page-btn arrow"
                                >
                                    <span>Sau</span>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminProducts;
