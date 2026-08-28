import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo } from "react";
import { useCatalog } from "./useCatalog";
import BookCard from "./BookCard";
import { RecommendationSection, Breadcrumb } from "@/components/common";
import { buildCategoryBreadcrumbs } from "@/utils/categoryTree";
import "./Catalog.css";

const Catalog = () => {
    const {
        keyword,
        searchInput,
        setSearchInput,
        categories,
        selectedCategory,
        setSelectedCategory,
        minPrice,
        maxPrice,
        products,
        page,
        setPage,
        totalPages,
        loading,
        categoryTree,
        handleSearch,
        handleClearFilters,
        openProductDetail,
        addToCart,
        formatPrice,
        getProductImage,
        showMoreCategory,
        setShowMoreCategory,
        availablePublishers,
        availableLanguages,
        selectedPublishers,
        togglePublisher,
        selectedLanguages,
        toggleLanguage,
        handlePriceRangeSelect,
        removeCategoryFilter,
        removePriceFilter,
        removeKeywordFilter,
    } = useCatalog();

    // Lấy tên category đang chọn để hiển thị chip
    const selectedCategoryName = useMemo(() => {
        if (!selectedCategory) return null;
        return (
            categories.find((c) => String(c.id) === String(selectedCategory))
                ?.name || "Danh mục"
        );
    }, [selectedCategory, categories]);

    // Lấy nhãn khoảng giá đang chọn
    const selectedPriceLabel = useMemo(() => {
        if (!minPrice && !maxPrice) return null;
        if (minPrice === "0" && maxPrice === "150000") return "0đ - 150.000đ";
        if (minPrice === "150000" && maxPrice === "300000")
            return "150.000đ - 300.000đ";
        if (minPrice === "300000" && maxPrice === "500000")
            return "300.000đ - 500.000đ";
        if (minPrice === "500000" && !maxPrice) return "Trên 500.000đ";
        return `${Number(minPrice).toLocaleString("vi-VN")}đ - ${maxPrice ? Number(maxPrice).toLocaleString("vi-VN") + "đ" : "trở lên"}`;
    }, [minPrice, maxPrice]);

    // Kiểm tra có filter nào đang áp dụng không
    const hasActiveFilters = Boolean(
        keyword ||
        selectedCategory ||
        minPrice ||
        maxPrice ||
        selectedPublishers.length > 0 ||
        selectedLanguages.length > 0,
    );

    // Breadcrumb tự động
    const breadcrumbItems = useMemo(() => {
        if (!selectedCategory) {
            return [{ label: "Khám phá kho sách" }];
        }
        const currentCat = categories.find(
            (c) => String(c.id) === String(selectedCategory),
        );
        if (!currentCat) {
            return [{ label: "Khám phá kho sách" }];
        }
        return [
            { label: "Khám phá kho sách", path: "/catalog" },
            ...buildCategoryBreadcrumbs(currentCat),
        ];
    }, [selectedCategory, categories]);

    const renderCategoryTree = (nodes, depth = 0) =>
        nodes.map((node) => {
            const isSelected = String(selectedCategory) === String(node.id);
            const hasChildren =
                Array.isArray(node.children) && node.children.length > 0;

            return (
                <div key={node.id} className="catalog-tree-node-wrapper">
                    <div
                        onClick={() => {
                            setSelectedCategory(String(node.id));
                            setPage(0);
                        }}
                        style={{ paddingLeft: `${depth * 14 + 4}px` }}
                        className={`catalog-tree-item-row ${isSelected ? "selected" : ""} depth-${depth}`}
                    >
                        <span className="catalog-tree-item-name">
                            {node.name}
                        </span>
                    </div>

                    {hasChildren && (
                        <div className="catalog-tree-children-box">
                            {renderCategoryTree(node.children, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });

    return (
        <div className="page-container animate-fade-in catalog-page-container">
            <Breadcrumb items={breadcrumbItems} />

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
            </form>

            {/* ACTIVE FILTER CHIPS (Hiển thị các field đang lọc xếp hàng ngang) */}
            {hasActiveFilters && (
                <div className="catalog-active-filters-bar">
                    <span className="catalog-filters-title">
                        Đang lọc theo:
                    </span>
                    <div className="catalog-chips-list">
                        {/* Chip Keyword */}
                        {keyword && (
                            <div className="catalog-filter-chip">
                                <span>Từ khóa: "{keyword}"</span>
                                <button
                                    type="button"
                                    onClick={removeKeywordFilter}
                                    className="chip-remove-btn"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Chip Category */}
                        {selectedCategoryName && (
                            <div className="catalog-filter-chip">
                                <span>Danh mục: {selectedCategoryName}</span>
                                <button
                                    type="button"
                                    onClick={removeCategoryFilter}
                                    className="chip-remove-btn"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Chip Price */}
                        {selectedPriceLabel && (
                            <div className="catalog-filter-chip">
                                <span>Giá: {selectedPriceLabel}</span>
                                <button
                                    type="button"
                                    onClick={removePriceFilter}
                                    className="chip-remove-btn"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Chips Nhà Xuất Bản */}
                        {selectedPublishers.map((pub) => (
                            <div key={pub} className="catalog-filter-chip">
                                <span>NXB: {pub}</span>
                                <button
                                    type="button"
                                    onClick={() => togglePublisher(pub)}
                                    className="chip-remove-btn"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        ))}

                        {/* Chips Ngôn Ngữ */}
                        {selectedLanguages.map((lang) => (
                            <div key={lang} className="catalog-filter-chip">
                                <span>{lang}</span>
                                <button
                                    type="button"
                                    onClick={() => toggleLanguage(lang)}
                                    className="chip-remove-btn"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        ))}

                        {/* Nút Xóa Tất Cả */}
                        <button
                            type="button"
                            onClick={handleClearFilters}
                            className="catalog-clear-all-chips-btn"
                        >
                            Xóa tất cả
                        </button>
                    </div>
                </div>
            )}

            <div className="catalog-main-layout">
                {/* Sidebar Filters */}
                <aside className="catalog-sidebar">
                    <div className="catalog-sidebar-scroll-wrapper">
                        {/* 1. NHÓM SẢN PHẨM */}
                        <div className="catalog-filter-block">
                            <div className="catalog-block-title">
                                NHÓM SẢN PHẨM
                            </div>
                            <div
                                onClick={() => {
                                    setSelectedCategory("");
                                    setPage(0);
                                }}
                                className={`catalog-tree-item-row root-item ${selectedCategory === "" ? "selected" : ""}`}
                            >
                                Tất Cả Nhóm Sản Phẩm
                            </div>

                            <div
                                className={`catalog-tree-container ${!showMoreCategory ? "collapsed" : ""}`}
                            >
                                {renderCategoryTree(categoryTree)}
                            </div>

                            <button
                                type="button"
                                className="catalog-btn-expand-more"
                                onClick={() =>
                                    setShowMoreCategory(!showMoreCategory)
                                }
                            >
                                {showMoreCategory ? "Thu Gọn" : "Xem Thêm"}{" "}
                                {showMoreCategory ? (
                                    <ChevronUp size={14} />
                                ) : (
                                    <ChevronDown size={14} />
                                )}
                            </button>
                        </div>

                        {/* 2. GIÁ */}
                        <div className="catalog-filter-block">
                            <div className="catalog-block-title">GIÁ</div>
                            <div className="catalog-checkbox-list">
                                {[
                                    {
                                        label: "0đ - 150,000đ",
                                        min: "0",
                                        max: "150000",
                                    },
                                    {
                                        label: "150,000đ - 300,000đ",
                                        min: "150000",
                                        max: "300000",
                                    },
                                    {
                                        label: "300,000đ - 500,000đ",
                                        min: "300000",
                                        max: "500000",
                                    },
                                    {
                                        label: "500,000đ - Trở Lên",
                                        min: "500000",
                                        max: "",
                                    },
                                ].map((item, idx) => {
                                    const isChecked =
                                        minPrice === item.min &&
                                        maxPrice === item.max;
                                    return (
                                        <label
                                            key={idx}
                                            className="catalog-checkbox-label"
                                            onClick={() => {
                                                if (isChecked) {
                                                    removePriceFilter();
                                                } else {
                                                    handlePriceRangeSelect(
                                                        item.min,
                                                        item.max,
                                                    );
                                                }
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {}}
                                                className="catalog-filter-input-checkbox"
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. NHÀ CUNG CẤP / NXB TỪ BE */}
                        {availablePublishers.length > 0 && (
                            <div className="catalog-filter-block">
                                <div className="catalog-block-title">
                                    NHÀ XUẤT BẢN
                                </div>
                                <div className="catalog-checkbox-list">
                                    {availablePublishers.map((pub, idx) => (
                                        <label
                                            key={idx}
                                            className="catalog-checkbox-label"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedPublishers.includes(
                                                    pub,
                                                )}
                                                onChange={() =>
                                                    togglePublisher(pub)
                                                }
                                                className="catalog-filter-input-checkbox"
                                            />
                                            <span>{pub}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 4. NGÔN NGỮ TỪ BE */}
                        {availableLanguages.length > 0 && (
                            <div className="catalog-filter-block">
                                <div className="catalog-block-title">
                                    NGÔN NGỮ
                                </div>
                                <div className="catalog-checkbox-list">
                                    {availableLanguages.map((lang, idx) => (
                                        <label
                                            key={idx}
                                            className="catalog-checkbox-label"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedLanguages.includes(
                                                    lang,
                                                )}
                                                onChange={() =>
                                                    toggleLanguage(lang)
                                                }
                                                className="catalog-filter-input-checkbox"
                                            />
                                            <span>{lang}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Content Grid */}
                <div className="catalog-content-section">
                    <div className="catalog-result-count-bar">
                        <p className="catalog-result-count-text">
                            {loading
                                ? "Đang tải dữ liệu..."
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

            <RecommendationSection title="GỢI Ý CHO BẠN" limit={10} />
        </div>
    );
};

export default Catalog;
