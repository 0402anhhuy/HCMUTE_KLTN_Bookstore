import { useState } from "react";
import {
    Filter,
    BookOpen,
    Star,
    ShoppingCart,
    Zap,
    TrendingUp,
    Flame,
    Award,
    User,
    Building2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { formatCategoryLabel } from "@/utils/categoryTree";
import heroBooks from "@/assets/hero_books.png";
import { useHome } from "./useHome";
import "./Home.css";
import { RecommendationSection } from "@/components/common";
import { useNavigate } from "react-router-dom";

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
        formatPrice,
        getProductImage,
        fetchProducts,
        getOriginalPrice,
        getDiscountPercent,
        activeTrendTab,
        setActiveTrendTab,
        timeLeft,
        flashSaleProducts,
        categories,
        bestsellerList,
        activeBestseller,
        selectedBestsellerId,
        setSelectedBestsellerId,
        activeBestsellerTab,
        setActiveBestsellerTab,
        publishers,
        handlePublisherClick,
    } = useHome();

    const navigate = useNavigate();
    const [isBestsellerDescExpanded, setIsBestsellerDescExpanded] = useState(false);

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
                        className={`home-category-node-btn ${isSelected ? "selected" : ""} ${!isLeaf ? "disabled-node" : ""
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
                            Nâng cao tri thức với bộ sưu tập sách mới 2026.
                        </h1>
                        <p className="home-hero-description">
                            Khám phá những tựa sách mới được tuyển chọn kỹ
                            lưỡng, từ những tác phẩm nghệ thuật, tâm lý học kinh
                            điển đến những kiến thức hiện đại nhất.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate("/catalog")}
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
                                    className={`home-category-node-btn ${selectedCategory === ""
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
                // 1. Thêm import icon ở đầu file Home.jsx:

                // 2. Trong JSX, thay thế phần Storefront Layout (dưới dòng `{/* 2. MAIN CATALOG / SEARCH VIEW */}`)[cite: 2]:
                /* ================= STOREFRONT FAHASA-STYLE SECTIONS ================= */
                <div className="home-storefront-layout">
                    {/* A. 4 BANNER KHUYẾN MÃI NHỎ */}
                    <div className="home-promo-banners-grid">
                        <div className="home-promo-card">
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    HÀNH TRANG ĐẾN TRƯỜNG
                                </span>
                                <h4 className="home-promo-title">
                                    Giảm đến 50%
                                </h4>
                                <span className="home-promo-btn">
                                    MUA NGAY →
                                </span>
                            </div>
                        </div>
                        <div className="home-promo-card">
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    TỦ SÁCH VĂN HỌC
                                </span>
                                <h4 className="home-promo-title">
                                    Giảm đến 40%
                                </h4>
                                <span className="home-promo-btn">
                                    MUA NGAY →
                                </span>
                            </div>
                        </div>
                        <div className="home-promo-card">
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    SÁCH KINH TẾ
                                </span>
                                <h4 className="home-promo-title">
                                    Đồng giá 99K
                                </h4>
                                <span className="home-promo-btn">
                                    MUA NGAY →
                                </span>
                            </div>
                        </div>
                        <div className="home-promo-card">
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    MANGA - LIGHT NOVEL
                                </span>
                                <h4 className="home-promo-title">Ưu đãi 35%</h4>
                                <span className="home-promo-btn">
                                    MUA NGAY →
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* B. FLASH SALE COUNTDOWN SECTION */}
                    {flashSaleProducts && flashSaleProducts.length > 0 && (
                        <div className="home-fahasa-section flash-sale-box">
                            <div className="home-fahasa-section-header">
                                <div className="flash-sale-title-group">
                                    <span className="flash-sale-badge">
                                        <Zap size={18} fill="#ffffff" /> FLASH SALE
                                    </span>
                                    <div className="flash-sale-timer">
                                        <span className="timer-label">
                                            Kết thúc trong
                                        </span>
                                        <span className="timer-digit">
                                            {timeLeft.hours}
                                        </span>{" "}
                                        :
                                        <span className="timer-digit">
                                            {timeLeft.minutes}
                                        </span>{" "}
                                        :
                                        <span className="timer-digit">
                                            {timeLeft.seconds}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className="home-fahasa-see-all"
                                    onClick={() => fetchProducts()}
                                >
                                    Xem tất cả &gt;
                                </span>
                            </div>

                            <div className="home-fahasa-products-carousel">
                                {flashSaleProducts.map((product) => (
                                    <BookCard
                                        key={product.id}
                                        product={product}
                                        openProductDetail={openProductDetail}
                                        addToCart={addToCart}
                                        formatPrice={formatPrice}
                                        getProductImage={getProductImage}
                                        showBadge={`-${getDiscountPercent(product)}%`}
                                        originalPrice={getOriginalPrice(product)}
                                        isFlashSale={true}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* C. DANH MỤC NỔI BẬT (ICON/CARD TIÊU BIỂU) */}
                    <div className="home-fahasa-section">
                        <div className="home-fahasa-section-header">
                            <h3 className="home-fahasa-title">
                                <Award size={20} color="#0a422d" /> Danh mục sản
                                phẩm
                            </h3>
                        </div>
                        <div className="home-quick-categories-grid">
                            {categories.slice(0, 10).map((cat) => (
                                <div
                                    key={cat.id}
                                    className="home-quick-cat-item"
                                    onClick={() =>
                                        navigate(
                                            `/catalog?categoryId=${cat.id}`,
                                        )
                                    }
                                >
                                    <div className="home-quick-cat-icon">
                                        📚
                                    </div>
                                    <span className="home-quick-cat-name">
                                        {cat.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* D. XU HƯỚNG MUA SẮM (TRENDING SECTION VỚI TABS) */}
                    <div className="home-fahasa-section">
                        <div className="home-fahasa-section-header trend-header">
                            <h3 className="home-fahasa-title">
                                <TrendingUp size={20} color="#0a422d" /> Xu
                                Hướng Mua Sắm
                            </h3>
                        </div>
                        <div className="home-tabs-bar">
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("all")}
                            >
                                Xu Hướng Theo Ngày
                            </button>
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "hot" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("hot")}
                            >
                                Sách HOT - Giảm Sốc
                            </button>
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "bestseller" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("bestseller")}
                            >
                                Bestseller Ngoại Văn
                            </button>
                        </div>

                        <div className="home-fahasa-products-grid">
                            {products.slice(0, 10).map((product) => (
                                <BookCard
                                    key={product.id}
                                    product={product}
                                    openProductDetail={openProductDetail}
                                    addToCart={addToCart}
                                    formatPrice={formatPrice}
                                    getProductImage={getProductImage}
                                    showBadge="XU HƯỚNG"
                                    originalPrice={getOriginalPrice(product)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* E. BEST SELLERS SECTION (2 COLUMNS WITH INDEPENDENT SCROLLS) */}
                    <div
                        id="bestsellers-section"
                        className="home-fahasa-section bestsellers-interactive-section"
                    >
                        {/* Header */}
                        <div className="home-fahasa-section-header">
                            <h3 className="home-fahasa-title">
                                <Flame size={22} color="#0a422d" /> Best Sellers
                            </h3>
                        </div>

                        {/* Category Tabs Bar */}
                        <div className="bestseller-category-tabs">
                            <button
                                type="button"
                                className={`bestseller-tab-btn ${activeBestsellerTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveBestsellerTab("all")}
                            >
                                Tất cả
                            </button>
                            {categories.slice(0, 8).map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`bestseller-tab-btn ${activeBestsellerTab === String(cat.id) ? "active" : ""}`}
                                    onClick={() =>
                                        setActiveBestsellerTab(String(cat.id))
                                    }
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* 2-Column Interactive Container */}
                        <div className="bestseller-dual-container">
                            {/* Left Column: Top 10 List */}
                            <div className="bestseller-left-column">
                                {bestsellerList.map((product, index) => {
                                    const rank = index + 1;
                                    const isSelected =
                                        String(product.id) ===
                                        String(selectedBestsellerId);
                                    const isTop3 = rank <= 3;

                                    return (
                                        <div
                                            key={product.id}
                                            className={`bestseller-rank-item ${isSelected ? "active" : ""}`}
                                            onClick={() => {
                                                setSelectedBestsellerId(
                                                    product.id,
                                                );
                                                setIsBestsellerDescExpanded(false);
                                            }}
                                        >
                                            <span
                                                className={`bestseller-rank-num ${isTop3 ? "top3" : ""}`}
                                            >
                                                {rank}
                                            </span>

                                            <div className="bestseller-rank-thumb">
                                                {product.imageUrl ? (
                                                    <img
                                                        src={getProductImage(
                                                            product,
                                                        )}
                                                        alt={product.name}
                                                        className="bestseller-rank-img"
                                                    />
                                                ) : (
                                                    <BookOpen
                                                        size={24}
                                                        color="#0a422d"
                                                    />
                                                )}
                                            </div>

                                            <div className="bestseller-rank-info">
                                                <span
                                                    className={`bestseller-rank-badge ${isTop3 ? "top3" : ""}`}
                                                >
                                                    <Flame size={12} /> Top{" "}
                                                    {rank}
                                                </span>
                                                <h5 className="bestseller-rank-name">
                                                    {product.name}
                                                </h5>
                                                <span className="bestseller-rank-sold">
                                                    Đã bán trong tuần{" "}
                                                    {((product.id * 19) % 150) +
                                                        10}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Column: Active Book Details (Independent Scroll) */}
                            <div className="bestseller-right-column">
                                {activeBestseller ? (
                                    <div className="bestseller-detail-card">
                                        {/* Top Row: Big Cover + Summary Meta */}
                                        <div className="bestseller-detail-top-grid">
                                            <div className="bestseller-detail-cover-box">
                                                {activeBestseller.imageUrl ? (
                                                    <img
                                                        src={getProductImage(
                                                            activeBestseller,
                                                        )}
                                                        alt={
                                                            activeBestseller.name
                                                        }
                                                        className="bestseller-detail-img"
                                                    />
                                                ) : (
                                                    <BookOpen
                                                        size={60}
                                                        color="#0a422d"
                                                    />
                                                )}
                                            </div>

                                            <div className="bestseller-detail-meta-box">
                                                <h4
                                                    className="bestseller-detail-title"
                                                    onClick={() =>
                                                        openProductDetail(
                                                            activeBestseller,
                                                        )
                                                    }
                                                >
                                                    {activeBestseller.name}
                                                </h4>

                                                <span className="bestseller-detail-sold-text">
                                                    Đã bán trong tuần{" "}
                                                    {((activeBestseller.id *
                                                        19) %
                                                        150) +
                                                        10}
                                                </span>

                                                <div className="bestseller-detail-attributes">
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                        <User size={15} color="#0a422d" /> Tác giả:{" "}
                                                        <strong>
                                                            {activeBestseller.author ||
                                                                "Đang cập nhật"}
                                                        </strong>
                                                    </span>
                                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
                                                        <Building2 size={15} color="#0a422d" /> NXB:{" "}
                                                        <strong>
                                                            {activeBestseller.publisher ||
                                                                "Phụ Nữ Việt Nam"}
                                                        </strong>
                                                    </span>
                                                </div>

                                                <div className="bestseller-detail-price-row">
                                                    <span className="bestseller-detail-price">
                                                        {formatPrice(
                                                            activeBestseller.price,
                                                        )}
                                                    </span>
                                                    <span className="bestseller-detail-original-price">
                                                        {formatPrice(
                                                            getOriginalPrice(
                                                                activeBestseller,
                                                            ),
                                                        )}
                                                    </span>
                                                    <span className="bestseller-detail-discount-tag">
                                                        -
                                                        {getDiscountPercent(
                                                            activeBestseller,
                                                        )}
                                                        %
                                                    </span>
                                                </div>

                                                <button
                                                    type="button"
                                                    className="bestseller-btn-add-cart"
                                                    onClick={() =>
                                                        addToCart(
                                                            activeBestseller.id,
                                                            1,
                                                        )
                                                    }
                                                    disabled={
                                                        activeBestseller.stockQuantity ===
                                                        0
                                                    }
                                                >
                                                    <ShoppingCart size={18} />{" "}
                                                    Thêm vào giỏ hàng
                                                </button>
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div className="bestseller-description-section">
                                            <h5 className="bestseller-desc-heading">
                                                Mô tả sản phẩm
                                            </h5>
                                            <div
                                                className={`bestseller-desc-text ${
                                                    !isBestsellerDescExpanded
                                                        ? "collapsed"
                                                        : ""
                                                }`}
                                            >
                                                {activeBestseller.description ||
                                                    "Tác phẩm được tái bản với chất lượng bìa cao cấp, đem lại trải nghiệm đọc sách tuyệt vời nhất cho độc giả yêu mến sách."}
                                            </div>
                                            {activeBestseller.description &&
                                                activeBestseller.description
                                                    .length > 100 && (
                                                    <div className="bestseller-desc-toggle-wrapper">
                                                        <button
                                                            type="button"
                                                            className="bestseller-btn-toggle-desc"
                                                            onClick={() =>
                                                                setIsBestsellerDescExpanded(
                                                                    !isBestsellerDescExpanded,
                                                                )
                                                            }
                                                        >
                                                            {isBestsellerDescExpanded ? (
                                                                <>
                                                                    Thu gọn{" "}
                                                                    <ChevronUp
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Xem thêm{" "}
                                                                    <ChevronDown
                                                                        size={
                                                                            15
                                                                        }
                                                                    />
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                        </div>

                                        {/* Review Snippet */}
                                        <div className="bestseller-review-section">
                                            <div className="bestseller-review-header">
                                                <span>Đánh giá sản phẩm</span>
                                                <div className="bestseller-stars">
                                                    <strong>5.0 / 5</strong>
                                                    {[...Array(5)].map(
                                                        (_, i) => (
                                                            <Star
                                                                key={i}
                                                                size={14}
                                                                fill="#f59e0b"
                                                                color="#f59e0b"
                                                            />
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="bestseller-btn-view-detail"
                                                onClick={() =>
                                                    openProductDetail(
                                                        activeBestseller,
                                                    )
                                                }
                                            >
                                                XEM CHI TIẾT SẢN PHẨM
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bestseller-empty-view">
                                        Đang tải thông tin chi tiết...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="home-fahasa-section home-publishers-section">
                        <div className="home-publishers-slider">
                            {publishers.map((pub) => (
                                <div
                                    key={pub.id}
                                    className="home-publisher-item"
                                    onClick={() =>
                                        handlePublisherClick(pub.name)
                                    }
                                >
                                    <div
                                        className={`home-publisher-box ${pub.highlight ? "highlight" : ""}`}
                                    >
                                        <span className="home-publisher-icon">
                                            🏢
                                        </span>
                                        <span className="home-publisher-brand-name">
                                            {pub.shortName}
                                        </span>
                                    </div>
                                    <span className="home-publisher-label">
                                        {pub.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <RecommendationSection title="GỢI Ý CHO BẠN" limit={10} />
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
    originalPrice,
    isFlashSale,
}) => {
    return (
        <div
            className="glass-card book-card-item"
            onClick={() => openProductDetail(product)}
        >
            <div className="book-card-image-box">
                {showBadge && (
                    <span className="book-card-badge">{showBadge}</span>
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

            <div className="book-card-name">{product.name}</div>
            <div className="book-card-author">
                Tác giả: {product.author || "Đang cập nhật"}
            </div>

            {/* Giá hiện tại và giá gốc gạch ngang */}
            <div className="book-card-price-group">
                <span className="book-card-price-val">
                    {formatPrice(product.price)}
                </span>
                {originalPrice && (
                    <span className="book-card-original-price">
                        {formatPrice(originalPrice)}
                    </span>
                )}
            </div>

            {/* Thanh tiến độ Flash Sale */}
            {isFlashSale && (() => {
                const sold = product.promoUsedCount ?? product.soldCount ?? 0;
                const stock = product.stockQuantity ?? 0;
                const total = sold + stock;
                const progressPercent = total > 0 ? Math.min(100, Math.round((sold / total) * 100)) : 0;

                return (
                    <div className="book-card-progress-box">
                        <div
                            className="book-card-progress-bar"
                            style={{
                                width: `${progressPercent}%`,
                            }}
                        />
                        <span className="book-card-progress-text">
                            {sold > 0 ? `ĐÃ BÁN ${sold}` : "VỪA MỞ BÁN"}
                        </span>
                    </div>
                );
            })()}

            <div className="book-card-footer-row">
                <div className="book-card-stars-wrapper">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={13}
                            fill="currentColor"
                            className="book-card-star-icon"
                        />
                    ))}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (product.stockQuantity > 0) addToCart(product.id, 1);
                    }}
                    disabled={product.stockQuantity === 0}
                    className="book-card-btn-add-cart"
                    aria-label="Thêm vào giỏ"
                >
                    <ShoppingCart size={15} />
                </button>
            </div>
        </div>
    );
};

export default Home;
