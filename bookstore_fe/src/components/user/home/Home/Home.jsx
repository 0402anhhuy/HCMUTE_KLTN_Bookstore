import { useState, useRef, useEffect, useCallback } from "react";
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
    GraduationCap,
    BookMarked,
    LineChart,
    Sparkles,
} from "lucide-react";
import { formatCategoryLabel } from "@/utils/categoryTree";
import heroBooks from "@/assets/hero_books.png";
import publisherPlaceholder from "@/assets/publisher_placeholder.svg";
import { useHome } from "./useHome";
import "./Home.css";
import { RecommendationSection, CarouselArrow } from "@/components/common";
import { resolveBookCardPricing } from "@/components/common/BookCard/bookCardPricing";
import { useNavigate } from "react-router-dom";

// Hàm loại bỏ tiêu đề sách bị lặp lại ở đầu phần mô tả sản phẩm
const formatCleanDescription = (description, bookName) => {
    if (!description) {
        return "Tác phẩm được tái bản với chất lượng bìa cao cấp, đem lại trải nghiệm đọc sách tuyệt vời nhất cho độc giả yêu mến sách.";
    }
    let cleaned = description.trim();
    if (bookName) {
        const cleanName = bookName.trim().toLowerCase();
        if (cleaned.toLowerCase().startsWith(cleanName)) {
            cleaned = cleaned.slice(cleanName.length).replace(/^[\s:\-–—\n]+/, "").trim();
        }
    }
    return cleaned || description;
};

const Home = () => {
    // Điều khiển slider "Nhà xuất bản & Đối tác" bằng nút prev/next
    const publishersSliderRef = useRef(null);
    const [canScrollPublishersPrev, setCanScrollPublishersPrev] =
        useState(false);
    const [canScrollPublishersNext, setCanScrollPublishersNext] =
        useState(false);

    const updatePublishersScrollState = useCallback(() => {
        const el = publishersSliderRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        setCanScrollPublishersPrev(el.scrollLeft > 4);
        setCanScrollPublishersNext(el.scrollLeft < maxScroll - 4);
    }, []);

    const scrollPublishers = (direction) => {
        const el = publishersSliderRef.current;
        if (!el) return;
        const amount = Math.max(el.clientWidth * 0.8, 220);
        el.scrollBy({
            left: direction === "prev" ? -amount : amount,
            behavior: "smooth",
        });
    };

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
        page,
        totalElements,
        totalPages,
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
        trendingProducts,
        timeLeft,
        flashSaleProducts,
        categories,
        bestsellerList,
        activeBestseller,
        selectedBestsellerId,
        setSelectedBestsellerId,
        bestsellerReviews,
        bestsellerRating,
        loadingBestsellerReviews,
        loadingBestsellers,
        activeBestsellerTab,
        handleBestsellerTabChange,
        publishers,
        handlePublisherClick,
        handlePromoCardClick,
        selectedPublishers,
        togglePublisher,
    } = useHome();

    const navigate = useNavigate();
    const [isBestsellerDescExpanded, setIsBestsellerDescExpanded] = useState(false);

    // Theo dõi trạng thái cuộn của slider để bật/tắt nút prev/next
    useEffect(() => {
        const el = publishersSliderRef.current;
        if (!el) return undefined;

        updatePublishersScrollState();
        el.addEventListener("scroll", updatePublishersScrollState, {
            passive: true,
        });
        window.addEventListener("resize", updatePublishersScrollState);

        return () => {
            el.removeEventListener("scroll", updatePublishersScrollState);
            window.removeEventListener("resize", updatePublishersScrollState);
        };
    }, [updatePublishersScrollState, loading, publishers]);

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
                                fetchProducts();
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
                        <span className="home-hero-tag">Bộ sưu tập sách mới 2026</span>
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
                                        fetchProducts();
                                    }}
                                    className={`home-category-node-btn ${selectedCategory === ""
                                            ? "selected"
                                            : ""
                                        }`}
                                >
                                    Tất cả danh mục
                                </button>
                                {renderCategoryTree(categoryTree, 0)}
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
                                    onChange={(e) => {
                                        setMinPrice(e.target.value);
                                        setPage(0);
                                    }}
                                />
                                <span className="home-price-separator">-</span>
                                <input
                                    type="number"
                                    className="form-input home-price-input"
                                    placeholder="Đến"
                                    value={maxPrice}
                                    onChange={(e) => {
                                        setMaxPrice(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Publishers */}
                        {publishers.length > 0 && (
                            <div className="home-filter-group">
                                <label className="home-filter-label">
                                    Nhà xuất bản
                                </label>
                                <div className="home-category-tree-scroll">
                                    {publishers.slice(0, 15).map((pub) => {
                                        const active = selectedPublishers.includes(
                                            String(pub.id),
                                        );
                                        return (
                                            <button
                                                key={pub.id}
                                                type="button"
                                                onClick={() =>
                                                    togglePublisher(pub)
                                                }
                                                className={`home-category-node-btn ${active ? "selected" : ""}`}
                                            >
                                                {pub.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
                                {!loading && (
                                    <span className="home-results-count">
                                        {` (${totalElements} sản phẩm)`}
                                    </span>
                                )}
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

                        {/* Phân trang kết quả lọc */}
                        {!loading && totalPages > 1 && (
                            <div className="home-filter-pagination">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={page <= 0}
                                    onClick={() =>
                                        setPage((p) => Math.max(0, p - 1))
                                    }
                                >
                                    Trước
                                </button>
                                <span className="home-filter-page-info">
                                    Trang {page + 1} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages - 1, p + 1),
                                        )
                                    }
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (

                /* ================= STOREFRONT FAHASA-STYLE SECTIONS ================= */
                <div className="home-storefront-layout">
                    {/* A. 4 BANNER KHUYẾN MÃI NHỎ */}
                    <div className="home-promo-banners-grid">
                        <div
                            className="home-promo-card home-promo-card-edu"
                            onClick={() => {
                                const matchedCat = (categories || []).find((c) => {
                                    const name = (c?.name || "").toLowerCase();
                                    return name.includes("kỹ năng") || name.includes("tâm lý") || name.includes("giáo dục");
                                });
                                if (matchedCat) {
                                    navigate(`/catalog?categoryId=${matchedCat.id}`);
                                } else {
                                    navigate("/catalog");
                                }
                            }}
                        >
                            <div className="home-promo-watermark">
                                <GraduationCap size={58} />
                            </div>
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    <GraduationCap size={13} /> Hành trang đến trường
                                </span>
                                <h4 className="home-promo-title">
                                    Tủ sách học tập
                                </h4>
                                <span className="home-promo-btn">
                                    Khám phá ngay →
                                </span>
                            </div>
                        </div>

                        <div
                            className="home-promo-card home-promo-card-lit"
                            onClick={() => handlePromoCardClick("lit")}
                        >
                            <div className="home-promo-watermark">
                                <BookMarked size={58} />
                            </div>
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    <BookMarked size={13} /> Tủ sách văn học
                                </span>
                                <h4 className="home-promo-title">
                                    Giảm đến 40%
                                </h4>
                                <span className="home-promo-btn">
                                    Khám phá ngay →
                                </span>
                            </div>
                        </div>

                        <div
                            className="home-promo-card home-promo-card-biz"
                            onClick={() => handlePromoCardClick("biz")}
                        >
                            <div className="home-promo-watermark">
                                <LineChart size={58} />
                            </div>
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    <LineChart size={13} /> Sách kinh tế & quản trị
                                </span>
                                <h4 className="home-promo-title">
                                    Đồng giá 99K
                                </h4>
                                <span className="home-promo-btn">
                                    Khám phá ngay →
                                </span>
                            </div>
                        </div>

                        <div
                            className="home-promo-card home-promo-card-manga"
                            onClick={() => handlePromoCardClick("manga")}
                        >
                            <div className="home-promo-watermark">
                                <Sparkles size={58} />
                            </div>
                            <div className="home-promo-content">
                                <span className="home-promo-subtitle">
                                    <Sparkles size={13} /> Manga & Light novel
                                </span>
                                <h4 className="home-promo-title">Ưu đãi 35%</h4>
                                <span className="home-promo-btn">
                                    Khám phá ngay →
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
                                    <div className="flash-sale-timer tabular-nums">
                                        <span className="timer-pulse-dot" />
                                        <span className="timer-label">
                                            Kết thúc trong
                                        </span>
                                        <span className="timer-digit">
                                            {String(timeLeft.hours ?? 0).padStart(2, "0")}
                                        </span>
                                        <span className="timer-separator">:</span>
                                        <span className="timer-digit">
                                            {String(timeLeft.minutes ?? 0).padStart(2, "0")}
                                        </span>
                                        <span className="timer-separator">:</span>
                                        <span className="timer-digit">
                                            {String(timeLeft.seconds ?? 0).padStart(2, "0")}
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
                                <Award size={20} color="#0a422d" /> Danh mục sản phẩm
                            </h3>
                        </div>
                        {(() => {
                            const validCategories = (categories || []).filter((cat) => {
                                const name = (cat?.name || "").trim().toLowerCase();
                                return (
                                    name !== "sách trong nước" &&
                                    !name.includes("kinh tế chính trị") &&
                                    !name.includes("quản trị kinh doanh")
                                );
                            });

                            const subCategories = [];
                            validCategories.forEach((cat) => {
                                const children = cat.children || cat.subCategories;
                                if (Array.isArray(children) && children.length > 0) {
                                    subCategories.push(...children);
                                } else if (cat.parentId || cat.parent_id || cat.parent) {
                                    subCategories.push(cat);
                                }
                            });

                            const displayCategories = subCategories.length > 0 ? subCategories : validCategories;
                            const itemsToDisplay = displayCategories.slice(0, 10);

                            return (
                                <div
                                    className="home-quick-categories-grid"
                                    style={{
                                        "--cat-count": itemsToDisplay.length || 6,
                                    }}
                                >
                                    {itemsToDisplay.map((cat) => (
                                        <div
                                            key={cat.id}
                                            className="home-quick-cat-item"
                                            onClick={() =>
                                                navigate(`/catalog?categoryId=${cat.id}`)
                                            }
                                        >
                                            <div className="home-quick-cat-icon">
                                                {cat.imageUrl ? (
                                                    <img
                                                        src={cat.imageUrl}
                                                        alt={cat.name}
                                                        className="home-quick-cat-img"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src =
                                                                "https://placehold.co/48x48?text=Book";
                                                        }}
                                                    />
                                                ) : (
                                                    <Award size={24} color="#0a422d" />
                                                )}
                                            </div>
                                            <span className="home-quick-cat-name">
                                                {cat.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>

                    {/* D. XU HƯỚNG MUA SẮM (TRENDING SECTION VỚI TABS) */}
                    <div className="home-fahasa-section">
                        <div className="home-fahasa-section-header trend-header">
                            <h3 className="home-fahasa-title">
                                <TrendingUp size={20} color="#0a422d" /> Xu hướng mua sắm
                            </h3>
                        </div>
                        <div className="home-tabs-bar">
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("all")}
                            >
                                Xu hướng theo ngày
                            </button>
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "hot" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("hot")}
                            >
                                Sách Hot - Giảm sốc
                            </button>
                            <button
                                type="button"
                                className={`home-tab-btn ${activeTrendTab === "bestseller" ? "active" : ""}`}
                                onClick={() => setActiveTrendTab("bestseller")}
                            >
                                Bestseller ngoại văn
                            </button>
                        </div>

                        <div className="home-fahasa-products-grid">
                            {(trendingProducts || []).map((product) => (
                                <BookCard
                                    key={product.id}
                                    product={product}
                                    openProductDetail={openProductDetail}
                                    addToCart={addToCart}
                                    formatPrice={formatPrice}
                                    getProductImage={getProductImage}
                                    showBadge={
                                        activeTrendTab === "hot"
                                            ? "Giảm sốc"
                                            : activeTrendTab === "bestseller"
                                              ? "Ngoại văn"
                                              : "Xu hướng"
                                    }
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
                                <Flame size={22} color="#0a422d" /> Bảng xếp hạng bán chạy
                            </h3>
                        </div>

                        {/* Category Tabs Bar */}
                        <div className="bestseller-category-tabs">
                            <button
                                type="button"
                                className={`bestseller-tab-btn ${activeBestsellerTab === "all" ? "active" : ""}`}
                                onClick={() => handleBestsellerTabChange("all")}
                            >
                                Tất cả
                            </button>
                            {categories
                                .filter((cat) => {
                                    const name = (cat?.name || "").trim().toLowerCase();
                                    return (
                                        name !== "sách trong nước" &&
                                        !name.includes("kinh tế chính trị") &&
                                        !name.includes("quản trị kinh doanh")
                                    );
                                })
                                .slice(0, 8)
                                .map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    className={`bestseller-tab-btn ${activeBestsellerTab === String(cat.id) ? "active" : ""}`}
                                    onClick={() =>
                                        handleBestsellerTabChange(cat.id)
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
                                {loadingBestsellers && bestsellerList.length === 0 && (
                                    <div className="bestseller-loading-hint">
                                        Đang tải bảng xếp hạng...
                                    </div>
                                )}
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
                                                    Đã bán {product.soldCount ?? 0}
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
                                                    Đã bán {activeBestseller.soldCount ?? 0}
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
                                                    {getDiscountPercent(activeBestseller) > 0 && getOriginalPrice(activeBestseller) && (
                                                        <>
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
                                                        </>
                                                    )}
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
                                                {formatCleanDescription(
                                                    activeBestseller.description,
                                                    activeBestseller.name,
                                                )}
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
                                                    {loadingBestsellerReviews ? (
                                                        <span className="bestseller-reviews-loading">
                                                            Đang tải...
                                                        </span>
                                                    ) : bestsellerReviews.length > 0 ? (
                                                        <>
                                                            <strong>
                                                                {bestsellerRating.toFixed(1)} / 5
                                                            </strong>
                                                            {[1, 2, 3, 4, 5].map((starIdx) => (
                                                                <Star
                                                                    key={starIdx}
                                                                    size={14}
                                                                    fill={
                                                                        bestsellerRating >= starIdx
                                                                            ? "#f59e0b"
                                                                            : "none"
                                                                    }
                                                                    color={
                                                                        bestsellerRating >= starIdx
                                                                            ? "#f59e0b"
                                                                            : "#cbd5e1"
                                                                    }
                                                                />
                                                            ))}
                                                            <span className="bestseller-review-count">
                                                                ({bestsellerReviews.length} đánh giá)
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="bestseller-no-reviews-text">
                                                                Chưa có đánh giá
                                                            </span>
                                                            <div className="bestseller-empty-stars">
                                                                {[1, 2, 3, 4, 5].map((starIdx) => (
                                                                    <Star
                                                                        key={starIdx}
                                                                        size={14}
                                                                        fill="none"
                                                                        color="#cbd5e1"
                                                                    />
                                                                ))}
                                                            </div>
                                                            <span className="bestseller-review-count">
                                                                (0 đánh giá)
                                                            </span>
                                                        </>
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

                    {publishers && publishers.length > 0 && (
                        <div className="home-fahasa-section home-publishers-section">
                            <div className="home-fahasa-section-header">
                                <h3 className="home-fahasa-title">
                                    <Building2 size={20} color="#0a422d" /> Nhà xuất bản & Đối tác
                                </h3>
                            </div>
                            <div className="home-publishers-carousel">
                                <CarouselArrow
                                    direction="prev"
                                    onClick={() => scrollPublishers("prev")}
                                    disabled={!canScrollPublishersPrev}
                                    ariaLabel="Xem nhà xuất bản trước"
                                    className="home-publishers-arrow"
                                />
                                <div
                                    className={`home-publishers-viewport ${canScrollPublishersPrev ? "can-scroll-prev" : ""} ${canScrollPublishersNext ? "can-scroll-next" : ""}`}
                                >
                                    <div
                                        className="home-publishers-slider"
                                        ref={publishersSliderRef}
                                    >
                                        {publishers.map((pub) => (
                                            <div
                                                key={pub.id}
                                                className="home-publisher-item"
                                                onClick={() =>
                                                    handlePublisherClick(pub)
                                                }
                                            >
                                                <div
                                                    className={`home-publisher-box ${pub.highlight ? "highlight" : ""}`}
                                                >
                                                    <img
                                                        src={
                                                            pub.logoUrl ||
                                                            publisherPlaceholder
                                                        }
                                                        alt={`Logo ${pub.name}`}
                                                        className={`home-publisher-logo-img ${pub.logoUrl ? "" : "is-placeholder"}`}
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            // Ảnh thật lỗi -> quay về placeholder
                                                            if (
                                                                e.currentTarget
                                                                    .src !==
                                                                publisherPlaceholder
                                                            ) {
                                                                e.currentTarget.src =
                                                                    publisherPlaceholder;
                                                                e.currentTarget.classList.add(
                                                                    "is-placeholder",
                                                                );
                                                            }
                                                        }}
                                                    />
                                                </div>
                                                <span className="home-publisher-label">
                                                    {pub.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <CarouselArrow
                                    direction="next"
                                    onClick={() => scrollPublishers("next")}
                                    disabled={!canScrollPublishersNext}
                                    ariaLabel="Xem nhà xuất bản tiếp theo"
                                    className="home-publishers-arrow"
                                />
                            </div>
                        </div>
                    )}
                    <RecommendationSection title="Gợi ý dành cho bạn" limit={10} />
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
    const { discountPercent, computedOriginalPrice, hasDiscount } = resolveBookCardPricing({
        product,
        originalPrice,
        showBadge,
    });

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

            <div className="book-card-name" style={{ textWrap: "balance" }}>
                {product.name}
            </div>
            <div className="book-card-author">
                Tác giả: {product.author || "Đang cập nhật"}
            </div>

            {/* Giá gốc + tag giảm giá ở trên, giá hiện tại ở dưới */}
            <div className="book-card-price-group tabular-nums">
                {hasDiscount ? (
                    <div className="book-card-original-price-row">
                        <span className="book-card-original-price">
                            {formatPrice(computedOriginalPrice)}
                        </span>
                        <span className="book-card-discount-rate">
                            -{discountPercent}%
                        </span>
                    </div>
                ) : (
                    <div className="book-card-original-price-placeholder" />
                )}
                <span className="book-card-price-val">
                    {formatPrice(product.price)}
                </span>
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
                    {[1, 2, 3, 4, 5].map((starIdx) => {
                        const rating = product.averageRating || product.rating || 0;
                        const isFilled = rating >= starIdx;
                        return (
                            <Star
                                key={starIdx}
                                size={13}
                                fill={isFilled ? "#ecc94b" : "none"}
                                color={isFilled ? "#ecc94b" : "#cbd5e1"}
                                strokeWidth={1.5}
                                className="book-card-star-icon"
                            />
                        );
                    })}
                    <span className="book-card-rating-text">
                        {product.averageRating && product.averageRating > 0
                            ? `(${product.averageRating.toFixed(1)})`
                            : product.reviewCount
                            ? `(${product.reviewCount})`
                            : "(0)"}
                    </span>
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
