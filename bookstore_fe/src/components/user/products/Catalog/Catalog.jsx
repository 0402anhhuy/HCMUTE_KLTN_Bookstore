import { Search, X, ChevronDown, ChevronUp, ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
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

    // Tự động mở rộng các danh mục cha khi chọn 1 danh mục con
    useEffect(() => {
        if (!selectedCategory || !categories.length) return;
        const findAncestors = (nodes, targetId, path = []) => {
            for (const n of nodes) {
                if (String(n.id) === String(targetId)) return path;
                if (n.children && n.children.length) {
                    const res = findAncestors(n.children, targetId, [...path, String(n.id)]);
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
                if (r.min === "0" && r.max === "150000") return { ...r, label: "0đ - 150.000đ" };
                if (r.min === "150000" && r.max === "300000") return { ...r, label: "150.000đ - 300.000đ" };
                if (r.min === "300000" && r.max === "500000") return { ...r, label: "300.000đ - 500.000đ" };
                if (r.min === "500000" && !r.max) return { ...r, label: "Trên 500.000đ" };
                return { ...r, label: `${Number(r.min).toLocaleString("vi-VN")}đ - ${r.max ? Number(r.max).toLocaleString("vi-VN") + "đ" : "trở lên"}` };
            });
        }
        if (!minPrice && !maxPrice) return [];
        if (minPrice === "0" && maxPrice === "150000") return [{ min: minPrice, max: maxPrice, label: "0đ - 150.000đ" }];
        if (minPrice === "150000" && maxPrice === "300000") return [{ min: minPrice, max: maxPrice, label: "150.000đ - 300.000đ" }];
        if (minPrice === "300000" && maxPrice === "500000") return [{ min: minPrice, max: maxPrice, label: "300.000đ - 500.000đ" }];
        if (minPrice === "500000" && !maxPrice) return [{ min: minPrice, max: maxPrice, label: "Trên 500.000đ" }];
        return [{ min: minPrice, max: maxPrice, label: `${Number(minPrice).toLocaleString("vi-VN")}đ - ${maxPrice ? Number(maxPrice).toLocaleString("vi-VN") + "đ" : "trở lên"}` }];
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

    // Tính toán dãy số trang rút gọn (tối đa 4 số trang theo block ví dụ: 1 2 3 4 -> 4 5 6 7)
    const visiblePageNumbers = useMemo(() => {
        const maxVisible = 4;
        if (totalPages <= maxVisible) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Tính trang bắt đầu block dựa trên vị trí trang hiện tại
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
                        style={{ paddingLeft: `${depth * 10 + 6}px` }}
                        className={`catalog-tree-item-row ${isSelected ? "selected" : ""} depth-${depth}`}
                    >
                        <span className="catalog-tree-item-name">
                            {node.name}
                        </span>

                        {hasChildren && (
                            <button
                                type="button"
                                className="catalog-tree-chevron-btn"
                                onClick={(e) => toggleNodeExpand(String(node.id), e)}
                                title={isExpanded ? "Thu gọn" : "Mở rộng"}
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
                    Tìm kiếm, lọc và khám phá hàng ngàn tựa sách phong phú của
                    chúng tôi.
                </p>
            </div>

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
                        {selectedPriceLabels.map((item, idx) => (
                            <div key={idx} className="catalog-filter-chip">
                                <span>Giá: {item.label}</span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        item.min !== undefined && item.max !== undefined
                                            ? togglePriceRange(item.min, item.max)
                                            : removePriceFilter()
                                    }
                                    className="chip-remove-btn"
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

                            <div className="catalog-tree-container">
                                {renderCategoryTree(categoryTree)}
                            </div>
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
                                    const isChecked = selectedPriceRanges.some(
                                        (r) => r.min === item.min && r.max === item.max
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
                                                    togglePriceRange(item.min, item.max)
                                                }
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
