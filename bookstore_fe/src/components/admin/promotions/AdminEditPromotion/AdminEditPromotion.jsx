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
import { useAdminEditPromotion } from "./useAdminEditPromotion";
import CategorySelector from "@/components/common/CategorySelector/CategorySelector";
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
    } = useAdminEditPromotion({ promotion, onSave, showToast });

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

                            <div className="admin-edit-promotion-row">
                                <div className="admin-edit-promotion-col">
                                    <label className="admin-edit-promotion-label">
                                        Thời điểm bắt đầu{" "}
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
                                <div className="admin-edit-promotion-col">
                                    <label className="admin-edit-promotion-label">
                                        Thời gian diễn ra{" "}
                                        <span className="admin-edit-promotion-required">
                                            *
                                        </span>
                                    </label>
                                    <select
                                        value={durationHours}
                                        onChange={(e) =>
                                            setDurationHours(e.target.value)
                                        }
                                        className="admin-edit-promotion-select"
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
                                <div className="admin-edit-promotion-duration-hint">
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
                        <div className="admin-edit-promotion-step2-wrapper">
                            {/* Filter Bar */}
                            <div className="admin-edit-promotion-filter-bar">
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
                                <div className="admin-edit-promotion-search-box">
                                    <Search
                                        size={18}
                                        className="admin-edit-promotion-search-icon"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Tìm theo tên sản phẩm hoặc tác giả..."
                                        value={productSearch}
                                        onChange={(e) =>
                                            setProductSearch(e.target.value)
                                        }
                                        className="admin-edit-promotion-search-input"
                                    />
                                </div>
                            </div>

                            {/* Products List Panel */}
                            <div className="admin-edit-promotion-products-panel">
                                <div className="admin-edit-promotion-products-header">
                                    <span className="admin-edit-promotion-products-title">
                                        Danh sách sản phẩm
                                    </span>
                                    <span className="admin-edit-promotion-products-counter">
                                        Đã chọn: <strong>{selectedProductIds.length}</strong> /{" "}
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
                                            Không có sản phẩm nào phù hợp với bộ lọc
                                        </div>
                                    ) : (
                                        currentProducts.map((p) => {
                                            const isSelected =
                                                selectedProductIds.includes(
                                                    p.id
                                                );
                                            const occupiedTitle = occupiedProductMap?.[p.id];
                                            const isOccupied = !!occupiedTitle;
                                            return (
                                                <div
                                                    key={p.id}
                                                    onClick={() =>
                                                        !isOccupied && toggleProductSelection(
                                                            p.id
                                                        )
                                                    }
                                                    className={`admin-edit-promotion-product-item ${
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
                                                        className={`admin-edit-promotion-checkbox-icon ${
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
                                                        className="admin-edit-promotion-product-thumb"
                                                        style={isOccupied ? { filter: "grayscale(70%)" } : {}}
                                                    >
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
                                                        <span
                                                            className="admin-edit-promotion-product-name"
                                                            style={isOccupied ? { color: "#475569" } : {}}
                                                        >
                                                            {p.name}
                                                        </span>
                                                        <span
                                                            className="admin-edit-promotion-product-price"
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
                                            <ChevronLeft size={16} /> Trước
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
                                            Sau <ChevronRight size={16} />
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