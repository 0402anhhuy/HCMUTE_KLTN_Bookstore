import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, ChevronRight, X, Check, Filter } from "lucide-react";
import { buildCategoryTree, flattenCategoryTree } from "@/utils/categoryTree";
import "./CategorySelector.css";

const CategorySelector = ({
    categories = [],
    value = "",
    onChange,
    placeholder = "Tất cả danh mục",
    allowSelectParent = true,
    align = "left",
    className = "",
    style = {},
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeL1, setActiveL1] = useState(null);
    const [activeL2, setActiveL2] = useState(null);
    const [activeL3, setActiveL3] = useState(null);
    const containerRef = useRef(null);

    // Build tree and flat list
    const categoryTree = useMemo(
        () => buildCategoryTree(categories),
        [categories],
    );

    const flatCategories = useMemo(
        () => flattenCategoryTree(categoryTree),
        [categoryTree],
    );

    // Selected category object
    const selectedCategory = useMemo(() => {
        if (!value) return null;
        return flatCategories.find(
            (c) => String(c.id) === String(value),
        );
    }, [value, flatCategories]);

    // Format display label
    const displayLabel = useMemo(() => {
        if (!selectedCategory) return placeholder;
        if (selectedCategory.fullPath) {
            return selectedCategory.fullPath.replace(/ \/ /g, " › ");
        }
        return selectedCategory.name;
    }, [selectedCategory, placeholder]);

    // On open: set initial active columns matching current selection lineage
    useEffect(() => {
        if (isOpen) {
            setSearchQuery("");
            if (selectedCategory) {
                const findLineage = (node, targetId, path = []) => {
                    if (String(node.id) === String(targetId)) return [...path, node];
                    if (node.children) {
                        for (const child of node.children) {
                            const found = findLineage(child, targetId, [...path, node]);
                            if (found) return found;
                        }
                    }
                    return null;
                };

                let lineage = null;
                for (const root of categoryTree) {
                    lineage = findLineage(root, value);
                    if (lineage) break;
                }

                if (lineage && lineage.length > 0) {
                    setActiveL1(lineage[0] || null);
                    setActiveL2(lineage[1] || null);
                    setActiveL3(lineage[2] || null);
                    return;
                }
            }

            if (categoryTree.length > 0) {
                const l1 = categoryTree[0];
                const l2 = l1.children?.[0] || null;
                const l3 = l2?.children?.[0] || null;
                setActiveL1(l1);
                setActiveL2(l2);
                setActiveL3(l3);
            }
        }
    }, [isOpen, selectedCategory, value, categoryTree]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Filter search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const q = searchQuery.toLowerCase().trim();
        return flatCategories.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                (c.fullPath && c.fullPath.toLowerCase().includes(q)),
        );
    }, [searchQuery, flatCategories]);

    const handleSelect = (catId) => {
        onChange(catId);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setIsOpen(false);
    };

    const [computedAlign, setComputedAlign] = useState(align);

    // Smart positioning: Auto-detect viewport boundary on open
    useEffect(() => {
        if (isOpen && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const spaceOnRight = window.innerWidth - rect.left;
            if (align === "right" || spaceOnRight < 620) {
                setComputedAlign("right");
            } else {
                setComputedAlign("left");
            }
        }
    }, [isOpen, align]);

    const hasL4Children = useMemo(() => {
        return Boolean(activeL3 && activeL3.children && activeL3.children.length > 0);
    }, [activeL3]);

    const handleItemClick = (c, level, e) => {
        if (e) e.stopPropagation();
        const hasChildren = c.children && c.children.length > 0;

        if (level === 1) {
            if (hasChildren) {
                const isAlreadyActive = activeL1 && String(activeL1.id) === String(c.id);
                if (isAlreadyActive) {
                    handleSelect(c.id);
                } else {
                    setActiveL1(c);
                    const l2 = c.children?.[0] || null;
                    const l3 = l2?.children?.[0] || null;
                    setActiveL2(l2);
                    setActiveL3(l3);
                }
            } else {
                handleSelect(c.id);
            }
        } else if (level === 2) {
            if (hasChildren) {
                const isAlreadyActive = activeL2 && String(activeL2.id) === String(c.id);
                if (isAlreadyActive) {
                    handleSelect(c.id);
                } else {
                    setActiveL2(c);
                    setActiveL3(c.children?.[0] || null);
                }
            } else {
                handleSelect(c.id);
            }
        } else if (level === 3) {
            if (hasChildren) {
                const isAlreadyActive = activeL3 && String(activeL3.id) === String(c.id);
                if (isAlreadyActive) {
                    handleSelect(c.id);
                } else {
                    setActiveL3(c);
                }
            } else {
                handleSelect(c.id);
            }
        } else {
            handleSelect(c.id);
        }
    };

    return (
        <div
            className={`sleek-cat-selector ${className}`}
            style={style}
            ref={containerRef}
        >
            {/* Trigger Button */}
            <div
                className={`sleek-cat-trigger ${isOpen ? "open" : ""} ${selectedCategory ? "has-value" : ""
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="sleek-cat-trigger-left">
                    <Filter size={15} className="sleek-cat-trigger-icon" />
                    <span className="sleek-cat-trigger-text" title={displayLabel}>
                        {displayLabel}
                    </span>
                </div>

                <div className="sleek-cat-trigger-right">
                    {selectedCategory && (
                        <button
                            type="button"
                            className="sleek-cat-clear-btn"
                            onClick={handleClear}
                            title="Bỏ chọn"
                        >
                            <X size={13} />
                        </button>
                    )}
                    <ChevronDown
                        size={15}
                        className={`sleek-cat-arrow ${isOpen ? "rotate" : ""}`}
                    />
                </div>
            </div>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className={`sleek-cat-popover ${computedAlign === "right" ? "align-right" : "align-left"}`}>
                    {/* Search Bar */}
                    <div className="sleek-cat-search-row">
                        <Search size={15} className="sleek-cat-search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm nhanh thể loại (vd: Việt Nam danh tác, Hồi ký...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="sleek-cat-search-input"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="sleek-cat-search-reset"
                                onClick={() => setSearchQuery("")}
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    {/* Mode A: Search Results */}
                    {searchQuery.trim() ? (
                        <div className="sleek-cat-search-results">
                            {searchResults.length > 0 ? (
                                searchResults.map((cat) => {
                                    const isSelected =
                                        String(cat.id) === String(value);
                                    const pathParts = (cat.fullPath || cat.name).split(" / ");

                                    return (
                                        <div
                                            key={cat.id}
                                            className={`sleek-cat-search-item ${isSelected ? "selected" : ""
                                                }`}
                                            onClick={() => handleSelect(cat.id)}
                                        >
                                            <div className="sleek-cat-search-item-path">
                                                {pathParts.map((part, idx) => (
                                                    <React.Fragment key={idx}>
                                                        {idx > 0 && (
                                                            <span className="sleek-cat-sep">
                                                                ›
                                                            </span>
                                                        )}
                                                        <span
                                                            className={
                                                                idx ===
                                                                    pathParts.length - 1
                                                                    ? "sleek-cat-leaf"
                                                                    : "sleek-cat-parent"
                                                            }
                                                        >
                                                            {part}
                                                        </span>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            {isSelected && (
                                                <Check
                                                    size={14}
                                                    className="sleek-cat-check"
                                                />
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="sleek-cat-empty">
                                    Không tìm thấy thể loại nào phù hợp
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Mode B: Cascading Columns (3 hoặc 4 cột tùy số cấp con) */
                        <div className={`sleek-cat-columns ${hasL4Children ? "cols-4" : "cols-3"}`}>
                            {/* Column 1: Cấp 1 */}
                            <div className="sleek-cat-col">
                                <div className="sleek-cat-col-title">DANH MỤC</div>
                                <div className="sleek-cat-col-list">
                                    <div
                                        className={`sleek-cat-item all-item ${!value ? "selected" : ""
                                            }`}
                                        onClick={() => handleSelect("")}
                                    >
                                        <span>Tất cả danh mục</span>
                                        {!value && (
                                            <Check
                                                size={13}
                                                className="sleek-cat-check"
                                            />
                                        )}
                                    </div>

                                    {categoryTree.map((c) => {
                                        const isL1Active =
                                            activeL1 &&
                                            String(activeL1.id) === String(c.id);
                                        const isSelected =
                                            String(c.id) === String(value);

                                        return (
                                            <div
                                                key={c.id}
                                                className={`sleek-cat-item ${isL1Active ? "active" : ""
                                                    } ${isSelected ? "selected" : ""}`}
                                                onClick={(e) => handleItemClick(c, 1, e)}
                                                onMouseEnter={() => {
                                                    setActiveL1(c);
                                                    const l2 = c.children?.[0] || null;
                                                    const l3 = l2?.children?.[0] || null;
                                                    setActiveL2(l2);
                                                    setActiveL3(l3);
                                                }}
                                                title={c.name}
                                            >
                                                <span className="sleek-cat-item-name">
                                                    {c.name}
                                                </span>
                                                {c.children &&
                                                    c.children.length > 0 ? (
                                                    <ChevronRight
                                                        size={13}
                                                        className="sleek-cat-item-arrow"
                                                    />
                                                ) : isSelected ? (
                                                    <Check
                                                        size={13}
                                                        className="sleek-cat-check"
                                                    />
                                                ) : null}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Column 2: Cấp 2 */}
                            <div className="sleek-cat-col">
                                <div className="sleek-cat-col-title">
                                    {activeL1 ? activeL1.name : "CẤP 2"}
                                </div>
                                <div className="sleek-cat-col-list">
                                    {activeL1 &&
                                        activeL1.children &&
                                        activeL1.children.length > 0 ? (
                                        activeL1.children.map((c) => {
                                            const isL2Active =
                                                activeL2 &&
                                                String(activeL2.id) ===
                                                String(c.id);
                                            const isSelected =
                                                String(c.id) === String(value);

                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`sleek-cat-item ${isL2Active ? "active" : ""
                                                        } ${isSelected ? "selected" : ""
                                                        }`}
                                                    onClick={(e) => handleItemClick(c, 2, e)}
                                                    onMouseEnter={() => {
                                                        setActiveL2(c);
                                                        setActiveL3(c.children?.[0] || null);
                                                    }}
                                                    title={c.name}
                                                >
                                                    <span className="sleek-cat-item-name">
                                                        {c.name}
                                                    </span>
                                                    {c.children &&
                                                        c.children.length > 0 ? (
                                                        <ChevronRight
                                                            size={13}
                                                            className="sleek-cat-item-arrow"
                                                        />
                                                    ) : isSelected ? (
                                                        <Check
                                                            size={13}
                                                            className="sleek-cat-check"
                                                        />
                                                    ) : null}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="sleek-cat-col-empty">
                                            {activeL1
                                                ? "Không có nhóm con"
                                                : "Chọn Cấp 1"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 3: Cấp 3 */}
                            <div className="sleek-cat-col">
                                <div className="sleek-cat-col-title">
                                    {activeL2 ? activeL2.name : "CẤP 3"}
                                </div>
                                <div className="sleek-cat-col-list">
                                    {activeL2 &&
                                        activeL2.children &&
                                        activeL2.children.length > 0 ? (
                                        activeL2.children.map((c) => {
                                            const isL3Active =
                                                activeL3 &&
                                                String(activeL3.id) ===
                                                String(c.id);
                                            const isSelected =
                                                String(c.id) === String(value);

                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`sleek-cat-item ${isL3Active ? "active" : ""
                                                        } ${isSelected ? "selected" : ""
                                                        }`}
                                                    onClick={(e) => handleItemClick(c, 3, e)}
                                                    onMouseEnter={() => setActiveL3(c)}
                                                    title={c.name}
                                                >
                                                    <span className="sleek-cat-item-name">
                                                        {c.name}
                                                    </span>
                                                    {c.children &&
                                                        c.children.length > 0 ? (
                                                        <ChevronRight
                                                            size={13}
                                                            className="sleek-cat-item-arrow"
                                                        />
                                                    ) : isSelected ? (
                                                        <Check
                                                            size={13}
                                                            className="sleek-cat-check"
                                                        />
                                                    ) : null}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="sleek-cat-col-empty">
                                            {activeL2
                                                ? "Không có nhóm con"
                                                : "Chọn Cấp 2"}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Column 4: Cấp 4 (Chỉ hiện khi có nhóm con cấp 4) */}
                            {hasL4Children && (
                                <div className="sleek-cat-col">
                                    <div className="sleek-cat-col-title">
                                        {activeL3 ? activeL3.name : "CẤP 4"}
                                    </div>
                                    <div className="sleek-cat-col-list">
                                        {activeL3.children.map((c) => {
                                            const isSelected =
                                                String(c.id) === String(value);

                                            return (
                                                <div
                                                    key={c.id}
                                                    className={`sleek-cat-item ${isSelected ? "selected" : ""
                                                        }`}
                                                    onClick={(e) => handleItemClick(c, 4, e)}
                                                    title={c.name}
                                                >
                                                    <span className="sleek-cat-item-name">
                                                        {c.name}
                                                    </span>
                                                    {isSelected && (
                                                        <Check
                                                            size={13}
                                                            className="sleek-cat-check"
                                                        />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CategorySelector;
