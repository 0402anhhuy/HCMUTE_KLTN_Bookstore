import { useState, useMemo } from "react";
import { 
  Plus, 
  Warehouse, 
  Search, 
  ArrowDownLeft, 
  ArrowUpRight, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  BookOpen
} from "lucide-react";
import api from "../../services/api";
import { useApp } from "../../context/AppContext";
import EmptyState from "../common/EmptyState/EmptyState";

const ManagerWarehouse = ({
  stockMovements = [],
  products = [],
  loadData,
  setStockMovements,
}) => {
  const { user, showToast } = useApp();

  // Filters and search state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState("ALL");
  const [warehousePage, setWarehousePage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Modal states
  const [showStockModal, setShowStockModal] = useState(false);
  const [submittingStock, setSubmittingStock] = useState(false);
  const [stockForm, setStockForm] = useState({
    productId: "",
    productName: "",
    quantity: "",
    movementType: "IMPORT",
    note: "",
  });

  const handleOpenWarehouseStockModal = () => {
    setStockForm({
      productId: products.length > 0 ? products[0].id : "",
      productName: products.length > 0 ? products[0].name : "",
      quantity: "",
      movementType: "IMPORT",
      note: "",
    });
    setShowStockModal(true);
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    try {
      const rawQty = String(stockForm.quantity || "").trim();
      if (!rawQty || !/^\d+$/.test(rawQty)) {
        showToast("Số lượng điều chỉnh phải là số nguyên dương hợp lệ!", "error");
        return;
      }
      const qty = parseInt(rawQty, 10);
      if (isNaN(qty) || qty <= 0) {
        showToast("Số lượng điều chỉnh phải lớn hơn 0!", "error");
        return;
      }
      if (qty > 1000000) {
        showToast("Số lượng điều chỉnh tối đa là 1.000.000 cuốn mỗi lần!", "error");
        return;
      }
      const selectedProd = products.find(
        (p) => String(p.id) === String(stockForm.productId),
      );
      if (!selectedProd) {
        showToast("Vui lòng chọn sản phẩm sách!", "error");
        return;
      }
      if (stockForm.movementType === "EXPORT" && qty > (selectedProd.stockQuantity || 0)) {
        showToast(
          `Số lượng tồn kho hiện tại (${selectedProd.stockQuantity || 0}) không đủ để xuất ${qty} cuốn!`,
          "error",
        );
        return;
      }
      const prodName = selectedProd.name || "Sản phẩm";

      setSubmittingStock(true);
      await api.post(
        `/products/${stockForm.productId}/adjust-stock?quantity=${qty}&movementType=${stockForm.movementType}&note=${encodeURIComponent(stockForm.note || "")}`,
      );
      showToast("Điều chỉnh tồn kho thành công!", "success");
      setShowStockModal(false);

      // Update local movements log
      const newMov = {
        id: `GD${stockMovements.length + 1}`,
        date: new Date().toLocaleDateString("vi-VN"),
        type: stockForm.movementType,
        productName: prodName,
        quantity: qty,
        managerName: user?.fullName || "Manager",
      };
      setStockMovements([newMov, ...stockMovements]);
      loadData();
    } catch (error) {
      console.error(error);
      showToast(
        error.response?.data?.error || "Lỗi điều chỉnh tồn kho!",
        "error",
      );
    } finally {
      setSubmittingStock(false);
    }
  };

  // Helper to find matching product for thumbnail
  const findProductByName = (name) => {
    if (!name) return null;
    return products.find(p => p.name === name || p.id === name);
  };

  const getProductCover = (product) => {
    if (!product) return '';
    if (Array.isArray(product.imageUrls) && product.imageUrls.length > 0) {
      return product.imageUrls[0];
    }
    if (typeof product.imageUrl === 'string' && product.imageUrl) {
      return product.imageUrl.split('||')[0].trim();
    }
    return '';
  };

  // Statistics
  const totalCount = stockMovements.length;
  const importCount = useMemo(() => {
    return stockMovements.filter(m => m.type === "IMPORT").length;
  }, [stockMovements]);
  const exportCount = useMemo(() => {
    return stockMovements.filter(m => m.type === "EXPORT").length;
  }, [stockMovements]);

  // Filtered and Paginated Warehouse Movements
  const filteredWarehouse = useMemo(() => {
    return stockMovements.filter((mov) => {
      const matchesType = warehouseTypeFilter === "ALL" || mov.type === warehouseTypeFilter;

      const keyword = searchKeyword.toLowerCase().trim();
      const matchesSearch = !keyword ||
        (mov.id && String(mov.id).toLowerCase().includes(keyword)) ||
        (mov.productName && mov.productName.toLowerCase().includes(keyword)) ||
        (mov.productTitle && mov.productTitle.toLowerCase().includes(keyword)) ||
        (mov.managerName && mov.managerName.toLowerCase().includes(keyword)) ||
        (mov.performer && mov.performer.toLowerCase().includes(keyword));

      return matchesType && matchesSearch;
    });
  }, [stockMovements, warehouseTypeFilter, searchKeyword]);

  const totalWarehousePages = Math.ceil(filteredWarehouse.length / ITEMS_PER_PAGE) || 1;
  const paginatedWarehouse = filteredWarehouse.slice(
    (warehousePage - 1) * ITEMS_PER_PAGE,
    warehousePage * ITEMS_PER_PAGE,
  );

  const isFilterActive = searchKeyword !== "" || warehouseTypeFilter !== "ALL";

  const handleClearFilters = () => {
    setSearchKeyword("");
    setWarehouseTypeFilter("ALL");
    setWarehousePage(1);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Header and Adjustment Action */}
      <div
        className="manager-flex-responsive-row"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.65rem",
              fontWeight: 800,
              color: "var(--mgr-text-dark)",
              margin: 0,
              letterSpacing: "-0.02em"
            }}
          >
            Quản lý giao dịch kho
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "var(--mgr-text-muted)" }}>
            Theo dõi nhật ký biến động kho hàng và thực hiện nhập/xuất kho thủ công
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Quick Summary Badges */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "var(--mgr-radius-md)",
            backgroundColor: "var(--mgr-bg-card)",
            border: "1px solid var(--mgr-border)",
            boxShadow: "var(--mgr-shadow-xs)"
          }}>
            <span style={{ fontSize: "0.8rem", color: "var(--mgr-text-muted)", fontWeight: 600 }}>Tổng GD:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--mgr-text-dark)" }}>{totalCount}</span>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "var(--mgr-radius-md)",
            backgroundColor: "var(--mgr-success-light)",
            border: "1px solid var(--mgr-success-border)",
            color: "var(--mgr-success)"
          }}>
            <ArrowDownLeft size={15} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Nhập:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{importCount}</span>
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "var(--mgr-radius-md)",
            backgroundColor: "var(--mgr-warning-light)",
            border: "1px solid var(--mgr-warning-border)",
            color: "var(--mgr-warning)"
          }}>
            <ArrowUpRight size={15} />
            <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Xuất:</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{exportCount}</span>
          </div>

          <button
            type="button"
            onClick={handleOpenWarehouseStockModal}
            className="manager-btn-primary"
            style={{ height: "42px" }}
          >
            <Plus size={16} />
            <span>Điều chỉnh tồn kho</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="manager-panel" style={{ padding: "16px" }}>
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center"
        }}>
          {/* Search box */}
          <div style={{ position: "relative", flex: "1 1 260px", minWidth: "220px" }}>
            <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--mgr-text-light)" }} />
            <input
              type="text"
              placeholder="Tìm theo mã GD, tên sách, người thực hiện..."
              value={searchKeyword}
              onChange={(e) => { setSearchKeyword(e.target.value); setWarehousePage(1); }}
              className="manager-search-input"
              style={{
                width: "100%",
                paddingLeft: "38px",
                paddingRight: searchKeyword ? "36px" : "14px",
                height: "42px",
                borderRadius: "var(--mgr-radius-md)",
                border: "1px solid var(--mgr-border)",
                outline: "none",
                fontSize: "0.875rem",
                backgroundColor: "var(--mgr-bg-card)",
                boxSizing: "border-box"
              }}
            />
            {searchKeyword && (
              <button
                type="button"
                onClick={() => { setSearchKeyword(""); setWarehousePage(1); }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--mgr-text-light)",
                  cursor: "pointer",
                  padding: "4px"
                }}
                aria-label="Xóa từ khóa tìm kiếm"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Transaction Type Filter */}
          <div style={{ flex: "0 1 200px", minWidth: "170px" }}>
            <select
              className="manager-filter-select"
              value={warehouseTypeFilter}
              onChange={(e) => {
                setWarehouseTypeFilter(e.target.value);
                setWarehousePage(1);
              }}
              style={{
                height: "42px",
                width: "100%",
                padding: "0 12px",
                borderRadius: "var(--mgr-radius-md)",
                border: "1px solid var(--mgr-border)",
                outline: "none",
                fontSize: "0.875rem",
                backgroundColor: "var(--mgr-bg-card)",
                color: "var(--mgr-text-dark)",
                cursor: "pointer",
                boxSizing: "border-box"
              }}
            >
              <option value="ALL">Tất cả giao dịch</option>
              <option value="IMPORT">Nhập kho (IMPORT)</option>
              <option value="EXPORT">Xuất kho (EXPORT)</option>
            </select>
          </div>

          {/* Reset button */}
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="manager-btn-secondary"
              style={{ height: "42px", padding: "0 14px", fontSize: "0.825rem" }}
              title="Đặt lại bộ lọc về mặc định"
            >
              <RotateCcw size={14} />
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {/* Warehouse Movements Desktop Table (Laptop 1366-1440px) */}
      <div className="manager-table-responsive manager-desktop-table">
        <table className="manager-table">
          <thead>
            <tr>
              <th style={{ width: "14%" }}>MÃ GIAO DỊCH</th>
              <th style={{ width: "16%" }}>NGÀY THỰC HIỆN</th>
              <th style={{ width: "16%" }}>LOẠI GD</th>
              <th style={{ width: "28%" }}>SẢN PHẨM SÁCH</th>
              <th style={{ width: "12%" }}>SỐ LƯỢNG</th>
              <th style={{ width: "14%" }}>NGƯỜI THỰC HIỆN</th>
            </tr>
          </thead>
          <tbody>
            {paginatedWarehouse.map((mov) => {
              const matchedProduct = findProductByName(mov.productName || mov.productTitle);
              const coverImg = getProductCover(matchedProduct);

              return (
                <tr key={mov.id}>
                  {/* MÃ GIAO DỊCH */}
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--mgr-primary)" }}>
                      #{mov.id}
                    </span>
                  </td>

                  {/* NGÀY THỰC HIỆN */}
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "var(--mgr-text-main)" }}>
                      {mov.date || "—"}
                    </span>
                  </td>

                  {/* LOẠI GD */}
                  <td>
                    {mov.type === "IMPORT" ? (
                      <span
                        className="manager-badge"
                        style={{
                          backgroundColor: "var(--mgr-success-light)",
                          color: "var(--mgr-success)",
                          border: "1px solid var(--mgr-success-border)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <ArrowDownLeft size={13} />
                        <span>Nhập kho</span>
                      </span>
                    ) : mov.type === "EXPORT" ? (
                      <span
                        className="manager-badge"
                        style={{
                          backgroundColor: "var(--mgr-warning-light)",
                          color: "var(--mgr-warning)",
                          border: "1px solid var(--mgr-warning-border)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <ArrowUpRight size={13} />
                        <span>Xuất kho</span>
                      </span>
                    ) : (
                      <span
                        className="manager-badge"
                        style={{
                          backgroundColor: "#f1f5f9",
                          color: "var(--mgr-text-muted)",
                          border: "1px solid var(--mgr-border)"
                        }}
                      >
                        Điều chỉnh
                      </span>
                    )}
                  </td>

                  {/* SẢN PHẨM SÁCH */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{
                        width: "36px",
                        height: "48px",
                        flexShrink: 0,
                        borderRadius: "var(--mgr-radius-sm)",
                        overflow: "hidden",
                        backgroundColor: "#f1f5f9",
                        border: "1px solid var(--mgr-border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt="Book"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        ) : (
                          <BookOpen size={16} style={{ color: "var(--mgr-text-light)" }} />
                        )}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "var(--mgr-text-dark)",
                            fontSize: "0.875rem",
                            lineHeight: 1.3
                          }}
                        >
                          {mov.productTitle || mov.productName || "Sản phẩm không rõ"}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* SỐ LƯỢNG */}
                  <td>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "3px 8px",
                        borderRadius: "var(--mgr-radius-sm)",
                        fontWeight: 800,
                        fontSize: "0.875rem",
                        backgroundColor: mov.type === "IMPORT" ? "var(--mgr-success-light)" : "var(--mgr-danger-light)",
                        color: mov.type === "IMPORT" ? "var(--mgr-success)" : "var(--mgr-danger)",
                        border: `1px solid ${mov.type === "IMPORT" ? "var(--mgr-success-border)" : "var(--mgr-danger-border)"}`
                      }}
                    >
                      {mov.type === "IMPORT" ? `+${mov.quantity}` : mov.type === "EXPORT" ? `-${mov.quantity}` : `${mov.quantity}`} cuốn
                    </span>
                  </td>

                  {/* NGƯỜI THỰC HIỆN */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: "var(--mgr-primary-light)",
                        color: "var(--mgr-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700
                      }}>
                        {(mov.managerName || mov.performer || "M").charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: "0.85rem", color: "var(--mgr-text-main)", fontWeight: 500 }}>
                        {mov.managerName || mov.performer || "Quản lý"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredWarehouse.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "48px 16px" }}>
                  <EmptyState
                    icon={Warehouse}
                    title="Chưa có giao dịch kho nào"
                    description={
                      isFilterActive
                        ? "Không có nhật ký kho nào phù hợp với bộ lọc hoặc từ khóa tìm kiếm."
                        : "Hệ thống chưa ghi nhận lượt nhập hoặc xuất kho sách nào."
                    }
                    actionText={isFilterActive ? "Xóa bộ lọc" : "Điều chỉnh kho ngay"}
                    onAction={isFilterActive ? handleClearFilters : handleOpenWarehouseStockModal}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Desktop Pagination Controls */}
        {filteredWarehouse.length > 0 && (
          <div className="manager-pagination-bar">
            <span style={{ fontSize: "0.825rem", color: "var(--mgr-text-muted)" }}>
              Hiển thị {paginatedWarehouse.length} trên tổng số {filteredWarehouse.length} giao dịch kho (Trang {warehousePage}/{totalWarehousePages})
            </span>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                disabled={warehousePage === 1}
                onClick={() => setWarehousePage((prev) => Math.max(prev - 1, 1))}
                className="manager-page-btn"
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalWarehousePages)].map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setWarehousePage(i + 1)}
                  className={`manager-page-btn ${warehousePage === i + 1 ? "active" : ""}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={warehousePage === totalWarehousePages}
                onClick={() => setWarehousePage((prev) => Math.min(prev + 1, totalWarehousePages))}
                className="manager-page-btn"
                aria-label="Trang sau"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warehouse Movements Mobile Cards (iPhone 14 Pro Max & screens <= 768px) */}
      <div className="manager-mobile-card-list">
        {paginatedWarehouse.map((mov) => (
          <div key={mov.id} className="manager-card-item">
            <div className="manager-card-header">
              <span className="manager-card-title" style={{ color: "var(--mgr-primary)" }}>
                Mã GD #{mov.id}
              </span>
              {mov.type === "IMPORT" ? (
                <span
                  className="manager-badge"
                  style={{
                    backgroundColor: "var(--mgr-success-light)",
                    color: "var(--mgr-success)",
                    border: "1px solid var(--mgr-success-border)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ArrowDownLeft size={12} />
                  <span>Nhập kho</span>
                </span>
              ) : mov.type === "EXPORT" ? (
                <span
                  className="manager-badge"
                  style={{
                    backgroundColor: "var(--mgr-warning-light)",
                    color: "var(--mgr-warning)",
                    border: "1px solid var(--mgr-warning-border)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px"
                  }}
                >
                  <ArrowUpRight size={12} />
                  <span>Xuất kho</span>
                </span>
              ) : (
                <span
                  className="manager-badge"
                  style={{ backgroundColor: "#f1f5f9", color: "var(--mgr-text-muted)", border: "1px solid var(--mgr-border)" }}
                >
                  Điều chỉnh
                </span>
              )}
            </div>

            <div className="manager-card-body">
              <div className="manager-card-row">
                <span className="manager-card-label">Sách:</span>
                <span className="manager-card-value" style={{ fontWeight: 700, maxWidth: "68%", textAlign: "right" }}>
                  {mov.productTitle || mov.productName || "Chưa xác định"}
                </span>
              </div>
              <div className="manager-card-row">
                <span className="manager-card-label">Biến động:</span>
                <span
                  className="manager-card-value"
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: mov.type === "IMPORT" ? "var(--mgr-success)" : "var(--mgr-danger)"
                  }}
                >
                  {mov.type === "IMPORT" ? `+${mov.quantity}` : mov.type === "EXPORT" ? `-${mov.quantity}` : `${mov.quantity}`} cuốn
                </span>
              </div>
              <div className="manager-card-row">
                <span className="manager-card-label">Ngày thực hiện:</span>
                <span className="manager-card-value">{mov.date || "—"}</span>
              </div>
              <div className="manager-card-row">
                <span className="manager-card-label">Người phụ trách:</span>
                <span className="manager-card-value">{mov.managerName || mov.performer || "Quản lý"}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredWarehouse.length === 0 && (
          <div className="manager-panel" style={{ padding: "32px 16px", textAlign: "center" }}>
            <EmptyState
              icon={Warehouse}
              title="Không tìm thấy nhật ký kho nào"
              description={
                isFilterActive
                  ? "Không có nhật ký kho nào phù hợp với bộ lọc đã chọn."
                  : "Chưa có giao dịch biến động tồn kho nào."
              }
              actionText={isFilterActive ? "Xem tất cả" : undefined}
              onAction={isFilterActive ? handleClearFilters : undefined}
            />
          </div>
        )}

        {/* Mobile Pagination */}
        {filteredWarehouse.length > 0 && totalWarehousePages > 1 && (
          <div className="manager-pagination-bar" style={{ justifyContent: "center" }}>
            <button
              type="button"
              disabled={warehousePage === 1}
              onClick={() => setWarehousePage((prev) => Math.max(prev - 1, 1))}
              className="manager-page-btn"
              aria-label="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "0 8px" }}>
              {warehousePage} / {totalWarehousePages}
            </span>
            <button
              type="button"
              disabled={warehousePage === totalWarehousePages}
              onClick={() => setWarehousePage((prev) => Math.min(prev + 1, totalWarehousePages))}
              className="manager-page-btn"
              aria-label="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          STOCK ADJUSTMENT MODAL
          ========================================================================= */}
      {showStockModal && (
        <div className="manager-modal-overlay">
          <div className="manager-modal-box" style={{ maxWidth: "520px" }}>
            <div className="manager-modal-header">
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--mgr-text-dark)", margin: 0 }}>
                  Điều chỉnh tồn kho thủ công
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--mgr-text-muted)" }}>
                  Cập nhật số lượng nhập mới hoặc xuất kho đối soát sách
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="manager-modal-close-btn"
                aria-label="Đóng cửa sổ"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAdjustStock}>
              <div className="manager-modal-body" style={{ gap: "16px" }}>

                {/* Chọn sản phẩm sách */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--mgr-text-main)",
                      marginBottom: "6px",
                    }}
                  >
                    Chọn sản phẩm sách <span style={{ color: "var(--mgr-danger)" }}>*</span>
                  </label>
                  <select
                    required
                    value={stockForm.productId}
                    onChange={(e) => {
                      const sel = products.find(
                        (p) => String(p.id) === String(e.target.value),
                      );
                      setStockForm({
                        ...stockForm,
                        productId: e.target.value,
                        productName: sel ? sel.name : "",
                      });
                    }}
                    style={{
                      width: "100%",
                      minHeight: "42px",
                      padding: "10px 14px",
                      borderRadius: "var(--mgr-radius-sm)",
                      border: "1px solid var(--mgr-border)",
                      outline: "none",
                      backgroundColor: "var(--mgr-bg-card)",
                      fontSize: "0.875rem",
                      boxSizing: "border-box"
                    }}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — (Tồn kho: {p.stockQuantity} cuốn)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Loại giao dịch (Card selector) */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--mgr-text-main)",
                      marginBottom: "6px",
                    }}
                  >
                    Loại hình giao dịch kho <span style={{ color: "var(--mgr-danger)" }}>*</span>
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => setStockForm({ ...stockForm, movementType: "IMPORT" })}
                      style={{
                        minHeight: "44px",
                        padding: "10px",
                        borderRadius: "var(--mgr-radius-md)",
                        border: stockForm.movementType === "IMPORT"
                          ? "2px solid var(--mgr-success)"
                          : "1px solid var(--mgr-border)",
                        backgroundColor: stockForm.movementType === "IMPORT"
                          ? "var(--mgr-success-light)"
                          : "var(--mgr-bg-card)",
                        color: stockForm.movementType === "IMPORT"
                          ? "var(--mgr-success)"
                          : "var(--mgr-text-main)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <ArrowDownLeft size={16} />
                      <span>Nhập kho (+ IMPORT)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStockForm({ ...stockForm, movementType: "EXPORT" })}
                      style={{
                        minHeight: "44px",
                        padding: "10px",
                        borderRadius: "var(--mgr-radius-md)",
                        border: stockForm.movementType === "EXPORT"
                          ? "2px solid var(--mgr-warning)"
                          : "1px solid var(--mgr-border)",
                        backgroundColor: stockForm.movementType === "EXPORT"
                          ? "var(--mgr-warning-light)"
                          : "var(--mgr-bg-card)",
                        color: stockForm.movementType === "EXPORT"
                          ? "var(--mgr-warning)"
                          : "var(--mgr-text-main)",
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <ArrowUpRight size={16} />
                      <span>Xuất kho (- EXPORT)</span>
                    </button>
                  </div>
                </div>

                {/* Số lượng thay đổi */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--mgr-text-main)",
                      marginBottom: "6px",
                    }}
                  >
                    Số lượng sách điều chỉnh <span style={{ color: "var(--mgr-danger)" }}>*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="1000000"
                    step="1"
                    placeholder="Nhập số lượng sách (1 - 1.000.000)..."
                    value={stockForm.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || (val.length <= 7 && /^\d+$/.test(val))) {
                        setStockForm({
                          ...stockForm,
                          quantity: val,
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      minHeight: "42px",
                      padding: "10px 14px",
                      borderRadius: "var(--mgr-radius-sm)",
                      border: "1px solid var(--mgr-border)",
                      outline: "none",
                      fontSize: "0.875rem",
                      boxSizing: "border-box"
                    }}
                  />
                </div>

                {/* Ghi chú lý do */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "var(--mgr-text-main)",
                      marginBottom: "6px",
                    }}
                  >
                    Ghi chú / Lý do điều chỉnh
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Nhập bổ sung đợt mới từ NXB Trẻ, xuất trả nhà cung cấp do lỗi in..."
                    value={stockForm.note}
                    onChange={(e) =>
                      setStockForm({
                        ...stockForm,
                        note: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "var(--mgr-radius-sm)",
                      border: "1px solid var(--mgr-border)",
                      outline: "none",
                      fontFamily: "inherit",
                      fontSize: "0.875rem",
                      resize: "vertical",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              </div>

              <div className="manager-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="manager-btn-secondary"
                  style={{ minHeight: "44px" }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingStock}
                  className="manager-btn-primary"
                  style={{ minHeight: "44px" }}
                >
                  <Plus size={16} />
                  <span>{submittingStock ? "Đang xử lý..." : "Xác nhận điều chỉnh"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManagerWarehouse;
