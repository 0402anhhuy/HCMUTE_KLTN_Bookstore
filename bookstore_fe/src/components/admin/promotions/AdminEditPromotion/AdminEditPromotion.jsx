import { X, Package, CheckSquare, Square, ChevronLeft, ChevronRight } from "lucide-react";
import { useAdminEditPromotion } from "./useAdminEditPromotion";
import { formatCategoryLabel } from "@/utils/categoryTree";
import "./AdminEditPromotion.css";

const AdminEditPromotion = ({ promotion, onClose, onSave, showToast }) => {
    const {
        step,
        setStep,
        title,
        setTitle,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        categories,
        categoryOptions,
        selectedCategoryId,
        setSelectedCategoryId,
        availableProducts,
        selectedProductIds,
        loadingProducts,
        currentPage,
        setCurrentPage,
        totalPages,
        currentProducts,
        toggleProductSelection,
        handleNextStep,
        handleSave,
    } = useAdminEditPromotion({ promotion, onSave, showToast });

    return (
        <div className="admin-edit-promotion-overlay">
            <div
                className={`admin-edit-promotion-modal ${
                    step === 1 ? "step-1" : "step-2"
                }`}
            >
                {/* Header */}
                <div className="admin-edit-promotion-header">
                    <h2 className="admin-edit-promotion-title">
                        {step === 1
                            ? "Cập nhật Khuyến mãi"
                            : "Chọn sản phẩm áp dụng"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-edit-promotion-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-edit-promotion-body">
                    {step === 1 && (
                        /* Step 1: Basic Info */
                        <div className="admin-edit-promotion-step1-container">
                            <div className="admin-edit-promotion-field-group">
                                <label className="admin-edit-promotion-label">
                                    Tên chương trình{" "}
                                    <span className="admin-edit-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Flash Sale 7/7, Back to school..."
                                    className="admin-edit-promotion-input"
                                />
                            </div>

                            <div className="admin-edit-promotion-row">
                                <div className="admin-edit-promotion-col">
                                    <label className="admin-edit-promotion-label">
                                        Loại{" "}
                                        <span className="admin-edit-promotion-required">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={discountType}
                                        onChange={(e) =>
                                            setDiscountType(e.target.value)
                                        }
                                        className="admin-edit-promotion-select"
                                    >
                                        <option value="PERCENT">
                                            Giảm theo %
                                        </option>
                                        <option value="FIXED">
                                            Giá tiền cố định
                                        </option>
                                    </select>
                                </div>
                                <div className="admin-edit-promotion-col">
                                    <label className="admin-edit-promotion-label">
                                        Mức giảm{" "}
                                        <span className="admin-edit-promotion-required">
                                            *
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        value={discountValue}
                                        onChange={(e) =>
                                            setDiscountValue(e.target.value)
                                        }
                                        placeholder={
                                            discountType === "PERCENT"
                                                ? "VD: 10"
                                                : "VD: 50000"
                                        }
                                        className="admin-edit-promotion-input"
                                    />
                                </div>
                            </div>

                            <div className="admin-edit-promotion-field-group">
                                <label className="admin-edit-promotion-label">
                                    Bắt đầu{" "}
                                    <span className="admin-edit-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="admin-edit-promotion-input"
                                />
                            </div>

                            <div className="admin-edit-promotion-field-group">
                                <label className="admin-edit-promotion-label">
                                    Kết thúc{" "}
                                    <span className="admin-edit-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="admin-edit-promotion-input"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        /* Step 2: Product Selection */
                        <div className="admin-edit-promotion-step2-container">
                            {/* Left Sidebar: Categories */}
                            <div className="admin-edit-promotion-categories-sidebar">
                                <h3 className="admin-edit-promotion-categories-title">
                                    Danh mục
                                </h3>
                                {categories
                                    .filter((cat) => cat.id === "ALL")
                                    .map((cat) => (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() =>
                                                setSelectedCategoryId(cat.id)
                                            }
                                            className={`admin-edit-promotion-category-btn ${
                                                selectedCategoryId === cat.id
                                                    ? "active"
                                                    : ""
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                {categoryOptions.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() =>
                                            setSelectedCategoryId(cat.id)
                                        }
                                        className={`admin-edit-promotion-category-btn ${
                                            selectedCategoryId === cat.id
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        {formatCategoryLabel(cat, cat.depth)}
                                    </button>
                                ))}
                            </div>

                            {/* Right Content: Products */}
                            <div className="admin-edit-promotion-products-panel">
                                <div className="admin-edit-promotion-products-header">
                                    <span className="admin-edit-promotion-products-title">
                                        Danh sách sản phẩm
                                    </span>
                                    <span className="admin-edit-promotion-products-counter">
                                        Đã chọn: {selectedProductIds.length} /{" "}
                                        {availableProducts.length}
                                    </span>
                                </div>

                                <div className="admin-edit-promotion-products-list">
                                    {loadingProducts ? (
                                        <div className="admin-edit-promotion-empty-text">
                                            Đang tải dữ liệu...
                                        </div>
                                    ) : currentProducts.length === 0 ? (
                                        <div className="admin-edit-promotion-empty-text">
                                            Không có sản phẩm nào trong danh mục
                                            này
                                        </div>
                                    ) : (
                                        currentProducts.map((p) => {
                                            const isSelected =
                                                selectedProductIds.includes(
                                                    p.id
                                                );
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() =>
                                                        toggleProductSelection(
                                                            p.id
                                                        )
                                                    }
                                                    className={`admin-edit-promotion-product-item ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                >
                                                    <div
                                                        className={`admin-edit-promotion-checkbox-icon ${
                                                            isSelected
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                    >
                                                        {isSelected ? (
                                                            <CheckSquare
                                                                size={20}
                                                            />
                                                        ) : (
                                                            <Square size={20} />
                                                        )}
                                                    </div>
                                                    <div className="admin-edit-promotion-product-thumb">
                                                        {p.imageUrl ? (
                                                            <img
                                                                src={p.imageUrl}
                                                                alt={p.name}
                                                                className="admin-edit-promotion-product-img"
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={22}
                                                                color="#94a3b8"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="admin-edit-promotion-product-info">
                                                        <span className="admin-edit-promotion-product-name">
                                                            {p.name}
                                                        </span>
                                                        <span className="admin-edit-promotion-product-price">
                                                            {p.price?.toLocaleString()}
                                                            đ
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="admin-edit-promotion-pagination">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1)
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="admin-edit-promotion-page-btn"
                                        >
                                            <ChevronLeft size={16} /> Trang
                                            trước
                                        </button>
                                        <span className="admin-edit-promotion-page-indicator">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages
                                                    )
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="admin-edit-promotion-page-btn"
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
                <div className="admin-edit-promotion-footer">
                    {step === 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="admin-edit-promotion-btn-cancel"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="admin-edit-promotion-btn-next"
                            >
                                Tiếp tục
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="admin-edit-promotion-btn-cancel"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="admin-edit-promotion-btn-save"
                            >
                                Lưu thay đổi
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminEditPromotion;