import React, { useState, useEffect, useMemo } from "react";
import { X, Package, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";

const AdminAddPromotion = ({ onClose, onSave, showToast }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [discountType, setDiscountType] = useState("PERCENT");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    
    const [availableProducts, setAvailableProducts] = useState([]);
    const [categories, setCategories] = useState([{ id: "ALL", name: "Tất cả danh mục" }]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 5;

    useEffect(() => {
        const fetchData = async () => {
            setLoadingProducts(true);
            try {
                // Fetch approved products
                const resProducts = await productService.getApprovedProducts();
                const productsData = resProducts.data.content || resProducts.data || [];
                setAvailableProducts(productsData);

                // Fetch categories
                const resCategories = await categoryService.getCategories();
                const catsData = resCategories.data.content || resCategories.data || [];
                setCategories([{ id: "ALL", name: "Tất cả danh mục" }, ...catsData]);
            } catch (error) {
                console.error("Failed to load data for promotion", error);
                showToast("Lỗi tải dữ liệu", "error");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchData();
    }, [showToast]);

    // Lọc sản phẩm theo Category
    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === "ALL") return availableProducts;
        return availableProducts.filter(
            (p) => p.category?.id === selectedCategoryId || p.categoryId === selectedCategoryId
        );
    }, [availableProducts, selectedCategoryId]);

    // Tính toán phân trang
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    const currentProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Reset pagination when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId]);

    const toggleProductSelection = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds(prev => prev.filter(pId => pId !== id));
        } else {
            setSelectedProductIds(prev => [...prev, id]);
        }
    };

    const handleNextStep = () => {
        if (!title.trim()) {
            showToast("Vui lòng nhập tên chương trình", "error");
            return;
        }
        if (!discountValue || isNaN(discountValue) || Number(discountValue) <= 0) {
            showToast("Giá trị khuyến mãi không hợp lệ", "error");
            return;
        }
        if (discountType === "PERCENT" && Number(discountValue) > 100) {
            showToast("Giảm theo % không được vượt quá 100%", "error");
            return;
        }
        if (!startDate || !endDate) {
            showToast("Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc", "error");
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            showToast("Thời gian kết thúc phải sau thời gian bắt đầu", "error");
            return;
        }
        setStep(2);
    };

    const handleSave = () => {
        if (selectedProductIds.length === 0) {
            showToast("Vui lòng chọn ít nhất 1 sản phẩm áp dụng", "error");
            return;
        }

        const payload = {
            title,
            discountType,
            discountValue: Number(discountValue),
            startDate,
            endDate,
            productIds: selectedProductIds,
        };

        onSave(payload);
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(15, 23, 42, 0.4)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 2000,
            }}
        >
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    width: step === 1 ? "600px" : "800px",
                    maxWidth: "95vw",
                    maxHeight: "90vh",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    transition: "width 0.3s ease",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        padding: "20px 24px",
                        borderBottom: "1px solid #e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#f8fafc",
                    }}
                >
                    <h2 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
                        {step === 1 ? "Thiết lập Khuyến mãi mới" : "Chọn sản phẩm áp dụng"}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            padding: "6px",
                            cursor: "pointer",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s",
                            color: "#64748b"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e2e8f0"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexWrap: "wrap", gap: "24px", flex: 1, maxHeight: "calc(90vh - 140px)" }}>
                    
                    {step === 1 && (
                        /* Step 1: Basic Info */
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                    Tên chương trình <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Flash Sale 7/7, Back to school..."
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                        transition: "border-color 0.2s",
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = "#ef4444"}
                                    onBlur={(e) => e.target.style.borderColor = "#cbd5e1"}
                                />
                            </div>

                            <div style={{ display: "flex", gap: "16px" }}>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>Loại <span style={{ color: "#ef4444" }}>*</span></label>
                                    <select
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            fontSize: "0.95rem",
                                            outline: "none",
                                            backgroundColor: "#fff"
                                        }}
                                    >
                                        <option value="PERCENT">Giảm theo %</option>
                                        <option value="FIXED">Giá tiền cố định</option>
                                    </select>
                                </div>
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                        Mức giảm <span style={{ color: "#ef4444" }}>*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                        placeholder={discountType === "PERCENT" ? "VD: 10" : "VD: 50000"}
                                        style={{
                                            padding: "10px 14px",
                                            borderRadius: "8px",
                                            border: "1px solid #cbd5e1",
                                            fontSize: "0.95rem",
                                            outline: "none",
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                    Bắt đầu <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                    }}
                                />
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                    Kết thúc <span style={{ color: "#ef4444" }}>*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #cbd5e1",
                                        fontSize: "0.95rem",
                                        outline: "none",
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        /* Step 2: Product Selection */
                        <div style={{ display: "flex", width: "100%", gap: "24px" }}>
                            {/* Left Sidebar: Categories */}
                            <div style={{ 
                                width: "200px", 
                                borderRight: "1px solid #e2e8f0", 
                                paddingRight: "16px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px"
                            }}>
                                <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 10px 0", color: "#1e293b" }}>Danh mục</h3>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategoryId(cat.id)}
                                        style={{
                                            padding: "8px 12px",
                                            borderRadius: "6px",
                                            border: "none",
                                            backgroundColor: selectedCategoryId === cat.id ? "#ef4444" : "transparent",
                                            color: selectedCategoryId === cat.id ? "#fff" : "#475569",
                                            textAlign: "left",
                                            cursor: "pointer",
                                            fontWeight: selectedCategoryId === cat.id ? 600 : 500,
                                            fontSize: "0.85rem",
                                            transition: "all 0.2s"
                                        }}
                                        onMouseOver={(e) => {
                                            if (selectedCategoryId !== cat.id) {
                                                e.currentTarget.style.backgroundColor = "#f1f5f9";
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (selectedCategoryId !== cat.id) {
                                                e.currentTarget.style.backgroundColor = "transparent";
                                            }
                                        }}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Right Content: Products */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>
                                        Danh sách sản phẩm
                                    </span>
                                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>
                                        Đã chọn: {selectedProductIds.length} / {availableProducts.length}
                                    </span>
                                </div>
                                
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minHeight: "350px" }}>
                                    {loadingProducts ? (
                                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Đang tải dữ liệu...</div>
                                    ) : currentProducts.length === 0 ? (
                                        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Không có sản phẩm nào trong danh mục này</div>
                                    ) : (
                                        currentProducts.map((p) => {
                                            const isSelected = selectedProductIds.includes(p.id);
                                            return (
                                                <div 
                                                    key={p.id}
                                                    onClick={() => toggleProductSelection(p.id)}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: "12px",
                                                        padding: "12px",
                                                        borderRadius: "8px",
                                                        border: "1px solid",
                                                        borderColor: isSelected ? "#ef4444" : "#e2e8f0",
                                                        cursor: "pointer",
                                                        backgroundColor: isSelected ? "#fef2f2" : "#ffffff",
                                                        transition: "all 0.2s"
                                                    }}
                                                >
                                                    <div style={{ color: isSelected ? "#ef4444" : "#94a3b8" }}>
                                                        {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                                    </div>
                                                    <div style={{ 
                                                        width: "40px", height: "40px", borderRadius: "6px", 
                                                        backgroundColor: "#e2e8f0", display: "flex", 
                                                        alignItems: "center", justifyContent: "center", overflow: "hidden" 
                                                    }}>
                                                        {p.imageUrl ? (
                                                            <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                        ) : (
                                                            <Package size={22} color="#94a3b8" />
                                                        )}
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                                                        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                                            {p.name}
                                                        </span>
                                                        <span style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 600 }}>
                                                            {p.price?.toLocaleString()}đ
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "16px", gap: "10px" }}>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
                                                backgroundColor: currentPage === 1 ? "#f8fafc" : "#fff",
                                                color: currentPage === 1 ? "#94a3b8" : "#475569",
                                                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                                display: "flex", alignItems: "center", gap: "4px"
                                            }}
                                        >
                                            <ChevronLeft size={16} /> Trang trước
                                        </button>
                                        <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 500 }}>
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            style={{
                                                padding: "6px 12px", borderRadius: "6px", border: "1px solid #cbd5e1",
                                                backgroundColor: currentPage === totalPages ? "#f8fafc" : "#fff",
                                                color: currentPage === totalPages ? "#94a3b8" : "#475569",
                                                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                                display: "flex", alignItems: "center", gap: "4px"
                                            }}
                                        >
                                            Tiếp theo <ChevronRight size={16} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: "12px",
                        backgroundColor: "#f8fafc",
                    }}
                >
                    {step === 1 ? (
                        <>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff", color: "#475569", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleNextStep}
                                style={{
                                    padding: "10px 20px", borderRadius: "8px", border: "none",
                                    backgroundColor: "#ef4444", color: "#ffffff", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                Tiếp tục
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setStep(1)}
                                style={{
                                    padding: "10px 20px", borderRadius: "8px", border: "1px solid #cbd5e1",
                                    backgroundColor: "#ffffff", color: "#475569", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                Quay lại
                            </button>
                            <button
                                onClick={handleSave}
                                style={{
                                    padding: "10px 20px", borderRadius: "8px", border: "none",
                                    backgroundColor: "#059669", color: "#ffffff", fontWeight: 600, cursor: "pointer",
                                }}
                            >
                                Khởi tạo Khuyến mãi
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAddPromotion;
