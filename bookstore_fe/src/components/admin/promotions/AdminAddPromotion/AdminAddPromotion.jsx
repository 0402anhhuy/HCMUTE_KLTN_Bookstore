import {
    X,
    Package,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useAdminAddPromotion } from "./useAdminAddPromotion";
import { formatCategoryLabel } from "@/utils/categoryTree";
import "./AdminAddPromotion.css";

const AdminAddPromotion = ({ onClose, onSave, showToast }) => {
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
    } = useAdminAddPromotion({ onSave, showToast });

    return (
        <div className="admin-add-promotion-overlay">
            <div
                className={`admin-add-promotion-modal ${
                    step === 1 ? "step-1" : "step-2"
                }`}
            >
                {/* Header */}
                <div className="admin-add-promotion-header">
                    <h2 className="admin-add-promotion-title">
                        {step === 1
                            ? "Thiết lập Khuyến mãi mới"
                            : "Chọn sản phẩm áp dụng"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="admin-add-promotion-close-btn"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="admin-add-promotion-body">
                    {step === 1 && (
                        /* Step 1: Basic Info */
                        <div className="admin-add-promotion-step1-container">
                            <div className="admin-add-promotion-field-group">
                                <label className="admin-add-promotion-label">
                                    Tên chương trình{" "}
                                    <span className="admin-add-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="VD: Flash Sale 7/7, Back to school..."
                                    className="admin-add-promotion-input"
                                />
                            </div>

                            <div className="admin-add-promotion-row">
                                <div className="admin-add-promotion-col">
                                    <label className="admin-add-promotion-label">
                                        Loại{" "}
                                        <span className="admin-add-promotion-required">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={discountType}
                                        onChange={(e) =>
                                            setDiscountType(e.target.value)
                                        }
                                        className="admin-add-promotion-select"
                                    >
                                        <option value="PERCENT">
                                            Giảm theo %
                                        </option>
                                        <option value="FIXED">
                                            Giá tiền cố định
                                        </option>
                                    </select>
                                </div>
                                <div className="admin-add-promotion-col">
                                    <label className="admin-add-promotion-label">
                                        Mức giảm{" "}
                                        <span className="admin-add-promotion-required">
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
                                        className="admin-add-promotion-input"
                                    />
                                </div>
                            </div>

                            <div className="admin-add-promotion-field-group">
                                <label className="admin-add-promotion-label">
                                    Bắt đầu{" "}
                                    <span className="admin-add-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(e.target.value)
                                    }
                                    className="admin-add-promotion-input"
                                />
                            </div>

                            <div className="admin-add-promotion-field-group">
                                <label className="admin-add-promotion-label">
                                    Kết thúc{" "}
                                    <span className="admin-add-promotion-required">
                                        *
                                    </span>
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="admin-add-promotion-input"
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        /* Step 2: Product Selection */
                        <div className="admin-add-promotion-step2-container">
                            {/* Left Sidebar: Categories */}
                            <div className="admin-add-promotion-categories-sidebar">
                                <h3 className="admin-add-promotion-categories-title">
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
                                            className={`admin-add-promotion-category-btn ${
                                                selectedCategoryId === cat.id
                                                    ? "active-all"
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
                                            setSelectedCategoryId(
                                                String(cat.id),
                                            )
                                        }
                                        className={`admin-add-promotion-category-tree-btn ${
                                            selectedCategoryId ===
                                            String(cat.id)
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        {formatCategoryLabel(cat, cat.depth)}
                                    </button>
                                ))}
                            </div>

                            {/* Right Content: Products */}
                            <div className="admin-add-promotion-products-panel">
                                <div className="admin-add-promotion-products-header">
                                    <span className="admin-add-promotion-products-title">
                                        Danh sách sản phẩm
                                    </span>
                                    <span className="admin-add-promotion-products-counter">
                                        Đã chọn: {selectedProductIds.length} /{" "}
                                        {availableProducts.length}
                                    </span>
                                </div>

                                <div className="admin-add-promotion-products-list">
                                    {loadingProducts ? (
                                        <div className="admin-add-promotion-empty-text">
                                            Đang tải dữ liệu...
                                        </div>
                                    ) : currentProducts.length === 0 ? (
                                        <div className="admin-add-promotion-empty-text">
                                            Không có sản phẩm nào trong danh mục
                                            này
                                        </div>
                                    ) : (
                                        currentProducts.map((p) => {
                                            const isSelected =
                                                selectedProductIds.includes(
                                                    p.id,
                                                );
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() =>
                                                        toggleProductSelection(
                                                            p.id,
                                                        )
                                                    }
                                                    className={`admin-add-promotion-product-item ${
                                                        isSelected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                >
                                                    <div
                                                        className={`admin-add-promotion-checkbox-icon ${
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
                                                    <div className="admin-add-promotion-product-thumb">
                                                        {p.imageUrl ? (
                                                            <img
                                                                src={p.imageUrl}
                                                                alt={p.name}
                                                                className="admin-add-promotion-product-img"
                                                            />
                                                        ) : (
                                                            <Package
                                                                size={22}
                                                                color="#94a3b8"
                                                            />
                                                        )}
                                                    </div>
                                                    <div className="admin-add-promotion-product-info">
                                                        <span className="admin-add-promotion-product-name">
                                                            {p.name}
                                                        </span>
                                                        <span className="admin-add-promotion-product-price">
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
                                    <div className="admin-add-promotion-pagination">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.max(prev - 1, 1),
                                                )
                                            }
                                            disabled={currentPage === 1}
                                            className="admin-add-promotion-page-btn"
                                        >
                                            <ChevronLeft size={16} /> Trang
                                            trước
                                        </button>
                                        <span className="admin-add-promotion-page-indicator">
                                            Trang {currentPage} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) =>
                                                    Math.min(
                                                        prev + 1,
                                                        totalPages,
                                                    ),
                                                )
                                            }
                                            disabled={
                                                currentPage === totalPages
                                            }
                                            className="admin-add-promotion-page-btn"
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
                <div className="admin-add-promotion-footer">
                    {step === 1 ? (
                        <>
                            <button
                                type="button"
                                onClick={onClose}
                                className="admin-add-promotion-btn-cancel"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="admin-add-promotion-btn-next"
                            >
                                Tiếp tục
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="admin-add-promotion-btn-cancel"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                className="admin-add-promotion-btn-submit"
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
