import {
    X,
    ChevronDown,
    ChevronRight,
    SlidersHorizontal,
    SearchX,
    RotateCcw,
    Layers,
    Tag,
    Building2,
    DollarSign,
} from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useCatalog } from "./useCatalog";
import BookCard from "./BookCard";
import BookCardSkeleton from "./BookCardSkeleton";
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
        selectedPublishers,
        togglePublisher,
        selectedPriceRanges = [],
        togglePriceRange,
        selectedCategoryName,
        removeCategoryFilter,
        removePriceFilter,
        removeKeywordFilter,
    } = useCatalog();

    // State quản lý mở rộng Accordion từng nhánh danh mục
    const [expandedNodeIds, setExpandedNodeIds] = useState({});
    // State đóng mở bộ lọc trên mobile
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    // Tự động mở rộng các danh mục cha khi chọn 1 danh mục con
    useEffect(() => {
        if (!selectedCategory || !categories.length) return;
        const findAncestors = (nodes, targetId, path = []) => {
            for (const n of nodes) {
                if (String(n.id) === String(targetId)) return path;
                if (n.children && n.children.length) {
                    const res = findAncestors(n.children, targetId, [
                        ...path,
                        String(n.id),
                    ]);
                    if (res) return res;
                }
            }
            return null;
        };
        const ancestorIds = findAncestors(categoryTree, selectedCategory);
        if (ancestorIds && ancestorIds.length) {
            setExpandedNodeIds((prev) => {
                const updated = { ...prev };
                ancestorIds.forEach((id) => {
                    updated[id] = true;
                });
                return updated;
            });
        }
    }, [selectedCategory, categoryTree, categories]);

    const toggleNodeExpand = (nodeId, e) => {
        e.stopPropagation();
        setExpandedNodeIds((prev) => ({
            ...prev,
            [nodeId]: !prev[nodeId],
        }));
    };

    // Lấy tên category đang chọn để hiển thị chip
    const selectedCategoryNameDisplay = useMemo(() => {
        if (!selectedCategory) return null;
        return (
            categories.find((c) => String(c.id) === String(selectedCategory))
                ?.name || "Danh mục"
        );
    }, [selectedCategory, categories]);

    // Lấy danh sách nhãn khoảng giá đang chọn
    const selectedPriceLabels = useMemo(() => {
        if (selectedPriceRanges.length > 0) {
            return selectedPriceRanges.map((r) => {
                if (r.min === "0" && r.max === "150000")
                    return { ...r, label: "0đ - 150.000đ" };
                if (r.min === "150000" && r.max === "300000")
                    return { ...r, label: "150.000đ - 300.000đ" };
                if (r.min === "300000" && r.max === "500000")
                    return { ...r, label: "300.000đ - 500.000đ" };
                if (r.min === "500000" && !r.max)
                    return { ...r, label: "Trên 500.000đ" };
                return {
                    ...r,
                    label: `${Number(r.min).toLocaleString("vi-VN")}đ - ${
                        r.max
                            ? Number(r.max).toLocaleString("vi-VN") + "đ"
                            : "trở lên"
                    }`,
                };
            });
        }
        if (!minPrice && !maxPrice) return [];
        if (minPrice === "0" && maxPrice === "150000")
            return [{ min: minPrice, max: maxPrice, label: "0đ - 150.000đ" }];
        if (minPrice === "150000" && maxPrice === "300000")
            return [
                { min: minPrice, max: maxPrice, label: "150.000đ - 300.000đ" },
            ];
        if (minPrice === "300000" && maxPrice === "500000")
            return [
                { min: minPrice, max: maxPrice, label: "300.000đ - 500.000đ" },
            ];
        if (minPrice === "500000" && !maxPrice)
            return [{ min: minPrice, max: maxPrice, label: "Trên 500.000đ" }];
        return [
            {
                min: minPrice,
                max: maxPrice,
                label: `${Number(minPrice).toLocaleString("vi-VN")}đ - ${
                    maxPrice
                        ? Number(maxPrice).toLocaleString("vi-VN") + "đ"
                        : "trở lên"
                }`,
            },
        ];
    }, [minPrice, maxPrice, selectedPriceRanges]);

    // Kiểm tra có filter nào đang áp dụng không
    const hasActiveFilters = Boolean(
        keyword ||
            selectedCategory ||
            minPrice ||
            maxPrice ||
            selectedPriceRanges.length > 0 ||
            selectedPublishers.length > 0,
    );

    // Đếm tổng số tiêu chí filter đang kích hoạt
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (keyword) count++;
        if (selectedCategory) count++;
        if (selectedPriceRanges.length > 0) count += selectedPriceRanges.length;
        else if (minPrice || maxPrice) count++;
        if (selectedPublishers.length > 0) count += selectedPublishers.length;
        return count;
    }, [
        keyword,
        selectedCategory,
        selectedPriceRanges,
        minPrice,
        maxPrice,
        selectedPublishers,
    ]);

    // Tính toán dãy số trang rút gọn (tối đa 4 số trang theo block ví dụ: 1 2 3 4 -> 4 5 6 7)
    const visiblePageNumbers = useMemo(() => {
        const maxVisible = 4;
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        let start = Math.floor(page / 3) * 3 + 1;
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }, [page, totalPages]);

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
            const isExpanded = Boolean(expandedNodeIds[String(node.id)]);

            return (
                <div key={node.id} className="catalog-tree-node-wrapper">
                    <div
                        onClick={() => {
                            setSelectedCategory(String(node.id));
                            setPage(0);
                        }}
                        style={{ paddingLeft: `${depth * 10 + 8}px` }}
                        className={`catalog-tree-item-row ${isSelected ? "selected" : ""} depth-${depth}`}
                    >
                        <span className="catalog-tree-item-name">
                            {node.name}
                        </span>

                        {hasChildren && (
                            <button
                                type="button"
                                className="catalog-tree-chevron-btn"
                                onClick={(e) =>
                                    toggleNodeExpand(String(node.id), e)
                                }
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
                                aria-label={isExpanded ? "Thu gọn" : "Mở rộng"}
                            >
                                {isExpanded ? (
                                    <ChevronDown size={14} />
                                ) : (
                                    <ChevronRight size={14} />
                                )}
                            </button>
                        )}
                    </div>

                    {hasChildren && isExpanded && (
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
                    Tìm kiếm, chọn lọc và khám phá hàng ngàn tựa sách giá trị tại Fahasa Bookstore.
                </p>
            </div>

            {/* ACTIVE FILTER CHIPS BAR */}
            {hasActiveFilters && (
                <div className="catalog-active-filters-bar">
                    <span className="catalog-filters-title">
                        Đang lọc:
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
                                    title="Xóa từ khóa"
                                    aria-label="Xóa từ khóa"
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
                                    title="Xóa danh mục"
                                    aria-label="Xóa danh mục"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Chip Price */}
                        {selectedPriceLabels.map((item, idx) => (
                            <div key={idx} className="catalog-filter-chip">
                                <span>Giá: {item.label}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        item.min !== undefined &&
                                        item.max !== undefined
                                            ? togglePriceRange(
                                                  item.min,
                                                  item.max,
                                              )
                                            : removePriceFilter()
                                    }
                                    className="chip-remove-btn"
                                    title="Xóa khoảng giá"
                                    aria-label="Xóa khoảng giá"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        ))}

                        {/* Chips Nhà Xuất Bản */}
                        {selectedPublishers.map((pub) => (
                            <div key={pub} className="catalog-filter-chip">
                                <span>NXB: {pub}</span>
                                <button
                                    type="button"
                                    onClick={() => togglePublisher(pub)}
                                    className="chip-remove-btn"
                                    title={`Xóa lọc NXB ${pub}`}
                                    aria-label={`Xóa lọc NXB ${pub}`}
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
                            <RotateCcw size={12} />
                            <span>Xóa tất cả</span>
                        </button>
                    </div>
                </div>
            )}

            <div className="catalog-main-layout">
                {/* Sidebar Filters */}
                <aside
                    className={`catalog-sidebar ${
                        mobileFilterOpen ? "mobile-open" : "mobile-collapsed"
                    }`}
                >
                    <div className="catalog-sidebar-header-mobile">
                        <span className="catalog-sidebar-mobile-title">
                            Bộ lọc tìm kiếm
                        </span>
                        <button
                            type="button"
                            className="catalog-sidebar-mobile-close"
                            onClick={() => setMobileFilterOpen(false)}
                            aria-label="Đóng bộ lọc"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="catalog-sidebar-scroll-wrapper">
                        {/* 1. NHÓM SẢN PHẨM */}
                        <div className="catalog-filter-block">
                            <div className="catalog-block-title">
                                <Layers size={14} className="catalog-block-icon" />
                                <span>Nhóm sản phẩm</span>
                            </div>
                            <div
                                onClick={() => {
                                    setSelectedCategory("");
                                    setPage(0);
                                }}
                                className={`catalog-tree-item-row root-item ${
                                    selectedCategory === "" ? "selected" : ""
                                }`}
                            >
                                Tất cả nhóm sản phẩm
                            </div>

                            <div className="catalog-tree-container">
                                {renderCategoryTree(categoryTree)}
                            </div>
                        </div>

                        {/* 2. KHOẢNG GIÁ */}
                        <div className="catalog-filter-block">
                            <div className="catalog-block-title">
                                <DollarSign size={14} className="catalog-block-icon" />
                                <span>Khoảng giá</span>
                            </div>
                            <div className="catalog-checkbox-list">
                                {[
                                    {
                                        label: "0đ - 150.000đ",
                                        min: "0",
                                        max: "150000",
                                    },
                                    {
                                        label: "150.000đ - 300.000đ",
                                        min: "150000",
                                        max: "300000",
                                    },
                                    {
                                        label: "300.000đ - 500.000đ",
                                        min: "300000",
                                        max: "500000",
                                    },
                                    {
                                        label: "Trên 500.000đ",
                                        min: "500000",
                                        max: "",
                                    },
                                ].map((item, idx) => {
                                    const isChecked = selectedPriceRanges.some(
                                        (r) =>
                                            r.min === item.min &&
                                            r.max === item.max,
                                    );
                                    return (
                                        <label
                                            key={idx}
                                            className="catalog-checkbox-label"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() =>
                                                    togglePriceRange(
                                                        item.min,
                                                        item.max,
                                                    )
                                                }
                                                className="catalog-filter-input-checkbox"
                                            />
                                            <span>{item.label}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. NHÀ XUẤT BẢN TỪ DATABASE */}
                        {availablePublishers.length > 0 && (
                            <div className="catalog-filter-block">
                                <div className="catalog-block-title">
                                    <Building2 size={14} className="catalog-block-icon" />
                                    <span>Nhà xuất bản</span>
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
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="catalog-content-section">
                    <div className="catalog-toolbar-bar">
                        <div className="catalog-result-count-box">
                            <p className="catalog-result-count-text">
                                {loading ? (
                                    "Đang tìm kiếm sách..."
                                ) : (
                                    <>
                                        Hiển thị <strong>{products.length}</strong> tựa sách
                                        {keyword ? (
                                            <span> cho "<em>{keyword}</em>"</span>
                                        ) : null}
                                    </>
                                )}
                            </p>
                        </div>

                        {/* Nút bấm mở bộ lọc trên Mobile */}
                        <button
                            type="button"
                            className={`catalog-mobile-filter-trigger ${
                                activeFilterCount > 0 ? "has-active" : ""
                            }`}
                            onClick={() => setMobileFilterOpen((prev) => !prev)}
                        >
                            <SlidersHorizontal size={15} />
                            <span>Bộ lọc</span>
                            {activeFilterCount > 0 && (
                                <span className="catalog-mobile-filter-badge">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="catalog-grid">
                            {Array.from({ length: 12 }).map((_, idx) => (
                                <BookCardSkeleton key={idx} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="catalog-empty-state">
                            <div className="catalog-empty-icon-wrap">
                                <SearchX size={44} strokeWidth={1.5} />
                            </div>
                            <h3 className="catalog-empty-title">
                                Không tìm thấy tựa sách phù hợp
                            </h3>
                            <p className="catalog-empty-desc">
                                {keyword
                                    ? `Không có kết quả nào cho "${keyword}". Hãy thử tìm kiếm bằng từ khóa ngắn gọn hơn hoặc bỏ bớt các bộ lọc.`
                                    : "Không có đầu sách nào khớp với các bộ lọc bạn đã chọn. Vui lòng thử chọn lại danh mục hoặc khoảng giá khác."}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="catalog-empty-reset-btn"
                                >
                                    <RotateCcw size={15} />
                                    <span>Xóa tất cả bộ lọc</span>
                                </button>
                            )}
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
                            {visiblePageNumbers.map((pNum) => {
                                const pageIndex = pNum - 1;
                                return (
                                    <button
                                        key={pNum}
                                        type="button"
                                        onClick={() => setPage(pageIndex)}
                                        className={`catalog-page-btn ${
                                            page === pageIndex ? "active" : ""
                                        }`}
                                    >
                                        {pNum}
                                    </button>
                                );
                            })}
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
