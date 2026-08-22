import { Search, Filter, X } from "lucide-react";
import { formatCategoryLabel } from "@/utils/categoryTree";
import { useCatalog } from "./useCatalog";
import BookCard from "./BookCard";
import "./Catalog.css";

const Catalog = () => {
    const {
        keyword,
        searchInput,
        setSearchInput,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        products,
        page,
        setPage,
        totalPages,
        loading,
        categoryTree,
        handleSearch,
        handleApplyFilters,
        handleClearFilters,
        openProductDetail,
        addToCart,
        formatPrice,
        getProductImage,
    } = useCatalog();

    const renderCategoryTree = (nodes, depth = 0) =>
        nodes.map((node) => {
            const isLeaf = !node.children || node.children.length === 0;
            const isSelected = String(selectedCategory) === String(node.id);

            return (
                <div
                    key={node.id}
                    style={{ marginLeft: depth > 0 ? `${depth * 12}px` : 0 }}
                >
                    <button
                        type="button"
                        onClick={() => {
                            if (isLeaf) {
                                setSelectedCategory(String(node.id));
                                setPage(0);
                            }
                        }}
                        disabled={!isLeaf}
                        className={`catalog-category-item-btn ${isSelected ? "selected" : ""} ${
                            !isLeaf ? "disabled-node" : ""
                        }`}
                    >
                        {formatCategoryLabel(node, depth)}
                    </button>

                    {!isLeaf && (
                        <div className="catalog-category-sub-tree">
                            {renderCategoryTree(node.children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });

    return (
        <div className="page-container animate-fade-in catalog-page-container">
            {/* Page Title */}
            <div className="catalog-header">
                <h1 className="catalog-title">Khám phá kho sách</h1>
                <p className="catalog-subtitle">
                    Tìm kiếm, lọc và khám phá hàng ngàn tựa sách phong phú của
                    chúng tôi.
                </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="catalog-search-form">
                <div className="catalog-search-input-wrapper">
                    <Search size={18} className="catalog-search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên sách, tác giả..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="catalog-search-input"
                    />
                </div>
                <button type="submit" className="catalog-search-btn">
                    Tìm kiếm
                </button>
                {(keyword || selectedCategory || minPrice || maxPrice) && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="catalog-clear-filter-btn"
                    >
                        <X size={14} /> Xóa lọc
                    </button>
                )}
            </form>

            <div className="catalog-main-layout">
                {/* Sidebar Filters */}
                <div className="catalog-sidebar">
                    <div className="catalog-filter-header">
                        <Filter
                            size={16}
                            className="catalog-filter-header-icon"
                        />
                        <h3 className="catalog-filter-header-title">Bộ lọc</h3>
                    </div>

                    {/* Categories */}
                    <div className="catalog-filter-group">
                        <label className="catalog-filter-label">Thể loại</label>
                        <div className="catalog-category-scroll-box">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedCategory("");
                                    setPage(0);
                                }}
                                className={`catalog-category-item-btn ${
                                    selectedCategory === "" ? "selected" : ""
                                }`}
                            >
                                Tất cả danh mục
                            </button>
                            {renderCategoryTree(categoryTree)}
                        </div>
                    </div>

                    {/* Price Ranges */}
                    <div className="catalog-filter-group">
                        <label className="catalog-filter-label">
                            Khoảng giá (VND)
                        </label>
                        <input
                            type="number"
                            placeholder="Từ"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="catalog-price-input"
                        />
                        <input
                            type="number"
                            placeholder="Đến"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="catalog-price-input"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleApplyFilters}
                        className="catalog-apply-btn"
                    >
                        Áp dụng lọc
                    </button>
                </div>

                {/* Main Grid */}
                <div className="catalog-content-section">
                    {/* Result count */}
                    <div className="catalog-result-count-bar">
                        <p className="catalog-result-count-text">
                            {loading
                                ? "Đang tải..."
                                : `Hiển thị ${products.length} sản phẩm${
                                      keyword ? ` cho "${keyword}"` : ""
                                  }`}
                        </p>
                    </div>

                    {loading ? (
                        <div className="catalog-loading-box">
                            Đang tải dữ liệu sách...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="catalog-empty-box">
                            Không tìm thấy đầu sách nào phù hợp với bộ lọc.
                        </div>
                    ) : (
                        <div className="catalog-grid">
                            {products.map((product) => (
                                <BookCard
                                    key={product.id}
                                    product={product}
                                    openProductDetail={openProductDetail}
                                    addToCart={addToCart}
                                    formatPrice={formatPrice}
                                    getProductImage={getProductImage}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="catalog-pagination">
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) => Math.max(0, p - 1))
                                }
                                disabled={page === 0}
                                className="catalog-page-nav-btn"
                            >
                                ← Trước
                            </button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setPage(i)}
                                    className={`catalog-page-btn ${page === i ? "active" : ""}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                onClick={() =>
                                    setPage((p) =>
                                        Math.min(totalPages - 1, p + 1),
                                    )
                                }
                                disabled={page === totalPages - 1}
                                className="catalog-page-nav-btn"
                            >
                                Tiếp →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Catalog;
