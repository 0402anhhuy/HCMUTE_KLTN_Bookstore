import {
    X,
    Package,
    CheckSquare,
    Square,
    ChevronLeft,
    ChevronRight,
    Search,
    Clock,
} from "lucide-react";
import { useAdminAddPromotion } from "./useAdminAddPromotion";
import CategorySelector from "@/components/common/CategorySelector/CategorySelector";
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
        durationHours,
        setDurationHours,
        endDate,
        rawCategories,
        occupiedProductMap,
        selectedCategoryId,
        setSelectedCategoryId,
        productSearch,
        setProductSearch,
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

    const formatEndDatePreview = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

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

                            <div className="admin-add-promotion-row">
                                <div className="admin-add-promotion-col">
                                    <label className="admin-add-promotion-label">
                                        Thời điểm bắt đầu{" "}
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
                                <div className="admin-add-promotion-col">
                                    <label className="admin-add-promotion-label">
                                        Thời gian diễn ra{" "}
                                        <span className="admin-add-promotion-required">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={durationHours}
                                        onChange={(e) =>
                                            setDurationHours(e.target.value)
                                        }
                                        className="admin-add-promotion-select"
                                    >
                                        <option value="2">2 giờ</option>
                                        <option value="4">4 giờ</option>
                                        <option value="6">6 giờ (Flash Sale chuẩn)</option>
                                        <option value="12">12 giờ (Nửa ngày)</option>
                                        <option value="24">24 giờ (1 ngày)</option>
                                        <option value="48">48 giờ (2 ngày)</option>
                                        <option value="72">72 giờ (3 ngày)</option>
                                        <option value="168">168 giờ (1 tuần)</option>
                                    </select>
                                </div>
                            </div>

                            {endDate && (
                                <div className="admin-add-promotion-duration-hint">
                                    <Clock size={16} color="#ef4444" />
                                    <span>
                                        Dự kiến kết thúc lúc:{" "}
                                        <strong>{formatEndDatePreview(endDate)}</strong>
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        /* Step 2: Product Selection */
                        <div className="admin-add-promotion-step2-wrapper">
                            {/* Filter Bar */}
                            <div className="admin-add-promotion-filter-bar">
                                <CategorySelector
                                    categories={rawCategories}
                                    value={
                                        selectedCategoryId === "ALL"
                                            ? ""
                                            : selectedCategoryId
                                    }
                                    onChange={(val) =>
                                        setSelectedCategoryId(val || "ALL")
                                    }
                                    placeholder="Tất cả danh mục"
                                />
                                <div className="admin-add-promotion-search-box">
                                    <Search
                                        size={18}
                                        className="admin-add-promotion-search-icon"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên sản phẩm hoặc tác giả..."
                                        value={productSearch}
                                        onChange={(e) =>
                                            setProductSearch(e.target.value)
                                        }
                                        className="admin-add-promotion-search-input"
                                    />
                                </div>
                            </div>

                            {/* Products List Panel */}
                            <div className="admin-add-promotion-products-panel">
                                <div className="admin-add-promotion-products-header">
                                    <span className="admin-add-promotion-products-title">
                                        Danh sách sản phẩm
                                    </span>
                                    <span className="admin-add-promotion-products-counter">
                                        Đã chọn: <strong>{selectedProductIds.length}</strong> /{" "}
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
                                            Không có sản phẩm nào phù hợp với bộ lọc
                                        </div>
                                    ) : (
                                        currentProducts.map((p) => {
                                            const isSelected =
                                                selectedProductIds.includes(
                                                    p.id,
                                                );
                                            const occupiedTitle = occupiedProductMap?.[p.id];
                                            const isOccupied = !!occupiedTitle;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() =>
                                                        !isOccupied && toggleProductSelection(
                                                            p.id,
                                                        )
                                                    }
                                                    className={`admin-add-promotion-product-item ${
                                                        isSelected || isOccupied
                                                            ? "selected"
                                                            : ""
                                                    } ${isOccupied ? "disabled-occupied" : ""}`}
                                                    style={
                                                        isOccupied
                                                            ? {
                                                                  opacity: 0.75,
                                                                  cursor: "not-allowed",
                                                                  backgroundColor: "#f1f5f9",
                                                                  borderColor: "#cbd5e1",
                                                              }
                                                            : {}
                                                    }
                                                    title={isOccupied ? `Sản phẩm này đã được áp dụng ở sự kiện "${occupiedTitle}"` : ""}
                                                >
                                                    <div
                                                        className={`admin-add-promotion-checkbox-icon ${
                                                            isSelected || isOccupied
                                                                ? "selected"
                                                                : ""
                                                        }`}
                                                        style={isOccupied ? { color: "#94a3b8" } : {}}
                                                    >
                                                        {isSelected || isOccupied ? (
                                                            <CheckSquare
                                                                size={20}
                                                                color={isOccupied ? "#94a3b8" : undefined}
                                                            />
                                                        ) : (
                                                            <Square size={20} color="#cbd5e1" />
                                                        )}
                                                    </div>
                                                    <div
                                                        className="admin-add-promotion-product-thumb"
                                                        style={isOccupied ? { filter: "grayscale(70%)" } : {}}
                                                    >
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
                                                        <span
                                                            className="admin-add-promotion-product-name"
                                                            style={isOccupied ? { color: "#475569" } : {}}
                                                        >
                                                            {p.name}
                                                        </span>
                                                        <span
                                                            className="admin-add-promotion-product-price"
                                                            style={isOccupied ? { color: "#94a3b8" } : {}}
                                                        >
                                                            {p.price?.toLocaleString("vi-VN")}đ
                                                        </span>
                                                    </div>
                                                    {isOccupied && (
                                                        <span
                                                            style={{
                                                                fontSize: "11px",
                                                                color: "#475569",
                                                                fontWeight: 600,
                                                                backgroundColor: "#e2e8f0",
                                                                padding: "4px 10px",
                                                                borderRadius: "12px",
                                                                border: "1px solid #cbd5e1",
                                                                marginLeft: "auto",
                                                                flexShrink: 0,
                                                                display: "inline-flex",
                                                                alignItems: "center",
                                                                gap: "4px"
                                                            }}
                                                        >
                                                            Đã áp dụng ở SK {occupiedTitle}
                                                        </span>
                                                    )}
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
                                            <ChevronLeft size={16} /> Trước
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
                                            Sau <ChevronRight size={16} />
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
