import { Filter, BookOpen, Star, ShoppingCart } from "lucide-react";
import { formatCategoryLabel } from "@/utils/categoryTree";
import heroBooks from "@/assets/hero_books.png";
import { useHome } from "./useHome";
import "./Home.css";

const Home = () => {
    const {
        addToCart,
        keyword,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        setMinPrice,
        maxPrice,
        setMaxPrice,
        products,
        setPage,
        loading,
        categoryTree,
        isSearchActive,
        handleClearFilters,
        openProductDetail,
        scrollToBestsellers,
        formatPrice,
        getProductImage,
        fetchProducts,
    } = useHome();

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
                        className={`home-category-node-btn ${isSelected ? "selected" : ""} ${
                            !isLeaf ? "disabled-node" : ""
                        }`}
                    >
                        {formatCategoryLabel(node, depth)}
                    </button>

                    {!isLeaf && (
                        <div className="home-category-subnodes-grid">
                            {renderCategoryTree(node.children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });

    return (
        <div className="page-container animate-fade-in home-page-container">
            {/* 1. HERO BANNER - Visible only when not searching */}
            {!isSearchActive && (
                <div className="home-hero-banner">
                    <div className="home-hero-content">
                        <span className="home-hero-tag">BỘ SƯU TẬP MỚI</span>
                        <h1 className="home-hero-title">
                            Nâng cao tri thức với bộ sưu tập sách mới 2024.
                        </h1>
                        <p className="home-hero-description">
                            Khám phá những tựa sách mới được tuyển chọn kỹ
                            lưỡng, từ những tác phẩm nghệ thuật, tâm lý học kinh
                            điển đến những kiến thức hiện đại nhất.
                        </p>
                        <button
                            type="button"
                            onClick={scrollToBestsellers}
                            className="home-hero-btn"
                        >
                            Mua sắm ngay →
                        </button>
                    </div>

                    <div className="home-hero-image-wrapper">
                        <img
                            src={heroBooks}
                            alt="Book stack"
                            className="home-hero-img"
                        />
                    </div>
                </div>
            )}

            {/* 2. MAIN CATALOG / SEARCH VIEW */}
            {isSearchActive ? (
                <div className="home-search-layout">
                    {/* Sidebar Filters */}
                    <div className="glass-panel sidebar-filters home-sidebar-filters">
                        <div className="home-sidebar-header">
                            <Filter size={18} className="home-sidebar-icon" />
                            <h3 className="home-sidebar-title">Bộ lọc sách</h3>
                        </div>

                        {/* Categories */}
                        <div className="home-filter-group">
                            <label className="home-filter-label">
                                Thể loại
                            </label>
                            <div className="home-category-tree-scroll">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory("");
                                        setPage(0);
                                    }}
                                    className={`home-category-node-btn ${
                                        selectedCategory === ""
                                            ? "selected"
                                            : ""
                                    }`}
                                >
                                    Tất cả danh mục
                                </button>
                                {renderCategoryTree(categoryTree)}
                            </div>
                        </div>

                        {/* Price Ranges */}
                        <div className="home-filter-group">
                            <label className="home-filter-label">
                                Khoảng giá (VND)
                            </label>
                            <div className="home-price-inputs-row">
                                <input
                                    type="number"
                                    className="form-input home-price-input"
                                    placeholder="Từ"
                                    value={minPrice}
                                    onChange={(e) =>
                                        setMinPrice(e.target.value)
                                    }
                                />
                                <span className="home-price-separator">-</span>
                                <input
                                    type="number"
                                    className="form-input home-price-input"
                                    placeholder="Đến"
                                    value={maxPrice}
                                    onChange={(e) =>
                                        setMaxPrice(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="home-filter-actions-row">
                            <button
                                type="button"
                                className="btn-secondary home-btn-clear-filter"
                                onClick={handleClearFilters}
                            >
                                Xóa lọc
                            </button>
                            <button
                                type="button"
                                className="btn-primary home-btn-apply-filter"
                                onClick={() => {
                                    setPage(0);
                                    fetchProducts();
                                }}
                            >
                                Lọc sách
                            </button>
                        </div>
                    </div>

                    {/* Search Result Main Grid */}
                    <div className="home-search-results-main">
                        <div className="home-results-header">
                            <h2 className="home-results-title">
                                Kết quả tìm kiếm {keyword && `cho "${keyword}"`}
                            </h2>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="home-btn-back-home"
                            >
                                Quay lại trang chủ
                            </button>
                        </div>

                        {loading ? (
                            <div className="home-loading-box">
                                Đang tải dữ liệu sách...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="glass-panel home-empty-box">
                                Không tìm thấy đầu sách nào phù hợp.
                            </div>
                        ) : (
                            <div className="home-products-grid">
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
                    </div>
                </div>
            ) : (
                /* Storefront Layout */
                <div className="home-storefront-layout">
                    {/* A. BESTSELLERS SECTION */}
                    <div
                        id="bestsellers-section"
                        className="home-section-stack"
                    >
                        <div className="home-section-header">
                            <h2 className="home-section-title">
                                Sách bán chạy nhất
                            </h2>
                            <span className="home-section-see-all">
                                Xem tất cả &gt;
                            </span>
                        </div>

                        {loading ? (
                            <div className="home-loading-box">
                                Đang tải sách...
                            </div>
                        ) : (
                            <div className="home-storefront-grid">
                                {products.slice(0, 4).map((product) => (
                                    <BookCard
                                        key={product.id}
                                        product={product}
                                        openProductDetail={openProductDetail}
                                        addToCart={addToCart}
                                        formatPrice={formatPrice}
                                        getProductImage={getProductImage}
                                        showBadge="BESTSELLER"
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* B. MOST VIEWED SECTION */}
                    <div className="home-section-stack">
                        <div className="home-section-header">
                            <h2 className="home-section-title">
                                Xem nhiều nhất
                            </h2>
                            <span className="home-section-see-all">
                                Xem tất cả &gt;
                            </span>
                        </div>

                        {loading ? (
                            <div className="home-loading-box">
                                Đang tải sách...
                            </div>
                        ) : (
                            <div className="home-storefront-grid">
                                {products.slice(0, 4).map((product) => (
                                    <BookCard
                                        key={product.id}
                                        product={product}
                                        openProductDetail={openProductDetail}
                                        addToCart={addToCart}
                                        formatPrice={formatPrice}
                                        getProductImage={getProductImage}
                                        showBadge="NỔI BẬT"
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Reusable BookCard Component
const BookCard = ({
    product,
    openProductDetail,
    addToCart,
    formatPrice,
    getProductImage,
    showBadge,
}) => {
    const isBestseller = showBadge === "BESTSELLER";

    return (
        <div
            className="glass-card book-card-item"
            onClick={() => openProductDetail(product)}
        >
            {/* Book Image */}
            <div className="book-card-image-box">
                {/* Badge */}
                {showBadge && (
                    <span
                        className={`book-card-badge ${
                            isBestseller ? "bestseller" : "featured"
                        }`}
                    >
                        {showBadge}
                    </span>
                )}

                {product.imageUrl ? (
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="book-card-img"
                    />
                ) : (
                    <BookOpen
                        size={48}
                        className="book-card-placeholder-icon"
                    />
                )}

                {product.stockQuantity === 0 && (
                    <span className="book-card-out-of-stock-overlay">
                        Hết hàng
                    </span>
                )}
            </div>

            {/* Book Name */}
            <div className="book-card-name">{product.name}</div>

            {/* Author */}
            <div className="book-card-author">Tác giả: {product.author}</div>

            {/* Rating Stars */}
            <div className="book-card-rating-row">
                <div className="book-card-stars-wrapper">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill="currentColor"
                            className="book-card-star-icon"
                        />
                    ))}
                </div>
                <span className="book-card-rating-text">(5.0)</span>
            </div>

            {/* Price & Cart button */}
            <div className="book-card-footer-row">
                <span className="book-card-price-val">
                    {formatPrice(product.price)}
                </span>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (product.stockQuantity > 0) addToCart(product.id, 1);
                    }}
                    disabled={product.stockQuantity === 0}
                    className="book-card-btn-add-cart"
                >
                    <ShoppingCart size={15} />
                </button>
            </div>
        </div>
    );
};

export default Home;
