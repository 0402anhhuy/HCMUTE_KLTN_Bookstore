import { useState, useEffect } from "react";
import { Search, Check, X, ClipboardList } from "lucide-react";
import { productService } from "../../services/productService";
import AdminDetailProduct from "./AdminDetailProduct";

const AdminProducts = ({ products, categories, loadData }) => {
    // Search & Filter state
    const [productSearch, setProductSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [productStatusFilter, setProductStatusFilter] = useState("ALL");
    const [productPage, setProductPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    // Modal states
    const [selectedProductId, setSelectedProductId] = useState(null);

    // Stats states
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedCount, setApprovedCount] = useState(0);
    const [rejectedCount, setRejectedCount] = useState(0);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
                    productService.getPendingCount(),
                    productService.getApprovedCount(),
                    productService.getRejectedCount(),
                ]);
                setPendingCount(pendingRes.data?.count || 0);
                setApprovedCount(approvedRes.data?.count || 0);
                setRejectedCount(rejectedRes.data?.count || 0);
            } catch (error) {
                console.error("Lỗi khi tải số lượng sản phẩm theo trạng thái:", error);
            }
        };
        fetchCounts();
    }, [products]);

    const getImagesList = (urlStr) => {
        if (!urlStr) return [];
        return urlStr
            .split(" || ")
            .map((s) => s.trim())
            .filter(Boolean);
    };

    // Filtered and Paginated Products
    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
            (p.author &&
                p.author.toLowerCase().includes(productSearch.toLowerCase()));
        const matchesCategory =
            categoryFilter === "" ||
            (p.category && String(p.category.id) === String(categoryFilter));

        let matchesStatus = true;
        if (productStatusFilter === "ACTIVE")
            matchesStatus = p.status === "ACTIVE" && p.stockQuantity > 0;
        else if (productStatusFilter === "INACTIVE")
            matchesStatus = p.status === "INACTIVE";
        else if (productStatusFilter === "OUT_OF_STOCK")
            matchesStatus = p.stockQuantity === 0;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    const totalProductPages =
        Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
    const paginatedProducts = filteredProducts.slice(
        (productPage - 1) * ITEMS_PER_PAGE,
        productPage * ITEMS_PER_PAGE,
    );

    if (selectedProductId) {
        return (
            <AdminDetailProduct
                productId={selectedProductId}
                onBack={() => setSelectedProductId(null)}
                loadMainData={loadData}
            />
        );
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                minWidth: 0,
            }}
        >
            <style>{`
        .admin-table-row:hover {
          background-color: #f8fafc !important;
          cursor: pointer;
        }
      `}</style>
            {/* Top Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: 800,
                            color: "#0f172a",
                            margin: "0 0 6px 0",
                        }}
                    >
                        Kiểm duyệt sản phẩm
                    </h1>
                    <p
                        style={{
                            color: "#64748b",
                            fontSize: "0.95rem",
                            margin: 0,
                        }}
                    >
                        Quản lý sản phẩm, kiểm duyệt và hàng chờ tuân thủ
                    </p>
                </div>
            </div>

            {/* 3 Stats Cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "20px",
                }}
            >
                {/* Card 1 */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "24px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#64748b",
                            }}
                        >
                            ĐANG CHỜ DUYỆT
                        </span>
                        <ClipboardList size={20} color="#3b82f6" />
                    </div>
                    <div
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        {pendingCount}
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#10b981",
                        }}
                    >
                        theo thời gian thực
                    </div>
                </div>

                {/* Card 2 */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "24px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#64748b",
                            }}
                        >
                            ĐÃ DUYỆT
                        </span>
                        <Check size={20} color="#3b82f6" />
                    </div>
                    <div
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        {approvedCount}
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#10b981",
                        }}
                    >
                        đang bán
                    </div>
                </div>

                {/* Card 3 */}
                <div
                    style={{
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        padding: "24px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "12px",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#64748b",
                            }}
                        >
                            BỊ TỪ CHỐI
                        </span>
                        <X size={20} color="#ef4444" />
                    </div>
                    <div
                        style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: "#0f172a",
                            marginBottom: "8px",
                        }}
                    >
                        {rejectedCount}
                    </div>
                    <div
                        style={{
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            color: "#ef4444",
                        }}
                    >
                        cần rà soát
                    </div>
                </div>
            </div>

            {/* Table search & filter controls */}
            <div
                style={{
                    display: "flex",
                    gap: "16px",
                    padding: "16px",
                    backgroundColor: "#ffffff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                }}
            >
                <div style={{ position: "relative", flex: 1 }}>
                    <Search
                        size={18}
                        style={{
                            position: "absolute",
                            left: "14px",
                            top: "12px",
                            color: "#94a3b8",
                        }}
                    />
                    <input
                        type="text"
                        placeholder="Tìm tên sản phẩm hoặc tác giả..."
                        value={productSearch}
                        onChange={(e) => {
                            setProductSearch(e.target.value);
                            setProductPage(1);
                        }}
                        style={{
                            width: "100%",
                            padding: "10px 16px 10px 42px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            outline: "none",
                            fontSize: "0.9rem",
                        }}
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(e) => {
                        setCategoryFilter(e.target.value);
                        setProductPage(1);
                    }}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        fontSize: "0.9rem",
                        backgroundColor: "#ffffff",
                        minWidth: "160px",
                    }}
                >
                    <option value="">Tất cả danh mục</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    value={productStatusFilter}
                    onChange={(e) => {
                        setProductStatusFilter(e.target.value);
                        setProductPage(1);
                    }}
                    style={{
                        padding: "10px 16px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        outline: "none",
                        fontSize: "0.9rem",
                        backgroundColor: "#ffffff",
                        minWidth: "180px",
                    }}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Còn hàng / Đang bán</option>
                    <option value="INACTIVE">Tạm ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                </select>
            </div>

            {/* Table grid wrapper */}
            <div
                style={{
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    border: "1px solid #e2e8f0",
                    overflowX: "auto",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
            >
                <table
                    style={{
                        minWidth: "900px",
                        width: "100%",
                        borderCollapse: "collapse",
                        textAlign: "left",
                    }}
                >
                    <thead>
                        <tr
                            style={{
                                backgroundColor: "#f8fafc",
                                borderBottom: "1px solid #e2e8f0",
                            }}
                        >
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                SẢN PHẨM
                            </th>
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                DANH MỤC
                            </th>
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                TÁC GIẢ
                            </th>
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                ĐƠN GIÁ
                            </th>
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                }}
                            >
                                KHO HÀNG
                            </th>
                            <th
                                style={{
                                    padding: "16px 24px",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    color: "#64748b",
                                    textAlign: "center",
                                }}
                            >
                                TRẠNG THÁI
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedProducts.map((p) => {
                            const isOutOfStock = p.stockQuantity === 0;
                            return (
                                <tr
                                    key={p.id}
                                    className="admin-table-row"
                                    onClick={() => setSelectedProductId(p.id)}
                                    style={{
                                        borderBottom: "1px solid #f1f5f9",
                                        transition: "background-color 0.2s",
                                    }}
                                >
                                    <td style={{ padding: "16px 24px" }}>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <img
                                                src={
                                                    getImagesList(
                                                        p.imageUrl,
                                                    )[0] ||
                                                    "https://via.placeholder.com/40x60?text=Book"
                                                }
                                                alt={p.name}
                                                style={{
                                                    width: "40px",
                                                    height: "56px",
                                                    objectFit: "cover",
                                                    borderRadius: "4px",
                                                    border: "1px solid #f1f5f9",
                                                }}
                                            />
                                            <div
                                                style={{
                                                    minWidth: 0,
                                                    flex: 1,
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontWeight: 600,
                                                        color: "#0f172a",
                                                        fontSize: "0.925rem",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        maxWidth: "200px",
                                                    }}
                                                    title={p.name}
                                                >
                                                    {p.name}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: "0.75rem",
                                                        color: "#64748b",
                                                        marginTop: "2px",
                                                    }}
                                                >
                                                    ISBN: {p.isbn || "N/A"}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: "16px 24px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: "inline-flex",
                                                padding: "4px 10px",
                                                borderRadius: "999px",
                                                fontSize: "0.75rem",
                                                fontWeight: 600,
                                                backgroundColor: "#fee2e2",
                                                color: "#ef4444",
                                            }}
                                        >
                                            {p.category?.name || "N/A"}
                                        </span>
                                    </td>
                                    <td
                                        style={{
                                            padding: "16px 24px",
                                            fontSize: "0.875rem",
                                            color: "#475569",
                                            fontWeight: 500,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {p.author || "Chưa rõ"}
                                    </td>
                                    <td
                                        style={{
                                            padding: "16px 24px",
                                            fontWeight: 700,
                                            color: "#0f172a",
                                            fontSize: "0.925rem",
                                        }}
                                    >
                                        {p.price?.toLocaleString("vi-VN")}đ
                                    </td>
                                    <td
                                        style={{
                                            padding: "16px 24px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: "4px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    fontWeight: 700,
                                                    color: isOutOfStock
                                                        ? "#ef4444"
                                                        : "#0f172a",
                                                    fontSize: "0.925rem",
                                                }}
                                            >
                                                {p.stockQuantity} cuốn
                                            </span>
                                            <span
                                                style={{
                                                    display: "inline-flex",
                                                    width: "fit-content",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    fontSize: "0.675rem",
                                                    fontWeight: 700,
                                                    backgroundColor:
                                                        p.status === "ACTIVE" &&
                                                        p.stockQuantity > 0
                                                            ? "#ecfdf5"
                                                            : "#fef2f2",
                                                    color:
                                                        p.status === "ACTIVE" &&
                                                        p.stockQuantity > 0
                                                            ? "#10b981"
                                                            : "#ef4444",
                                                }}
                                            >
                                                {p.status === "ACTIVE" &&
                                                p.stockQuantity > 0
                                                    ? "Đang bán"
                                                    : isOutOfStock
                                                      ? "Hết hàng"
                                                      : "Tạm ẩn"}
                                            </span>
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: "16px 24px",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    backgroundColor: "#ef4444",
                                                    color: "#ffffff",
                                                    fontWeight: 600,
                                                    fontSize: "0.75rem",
                                                    display: "inline-flex",
                                                }}
                                            >
                                                Chờ duyệt
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        padding: "48px",
                                        textAlign: "center",
                                        color: "#94a3b8",
                                    }}
                                >
                                    Không tìm thấy sản phẩm nào phù hợp
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                {/* Pagination Controls */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "16px 24px",
                        borderTop: "1px solid #e2e8f0",
                        backgroundColor: "#ffffff",
                    }}
                >
                    <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
                        Hiển thị {paginatedProducts.length} trên tổng số{" "}
                        {filteredProducts.length} sản phẩm
                    </span>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button
                            disabled={productPage === 1}
                            onClick={() =>
                                setProductPage((prev) => Math.max(prev - 1, 1))
                            }
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                backgroundColor:
                                    productPage === 1 ? "#f1f5f9" : "#ffffff",
                                color:
                                    productPage === 1 ? "#94a3b8" : "#475569",
                                fontSize: "0.85rem",
                                cursor:
                                    productPage === 1
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            Trước
                        </button>
                        {[...Array(totalProductPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setProductPage(i + 1)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                    backgroundColor:
                                        productPage === i + 1
                                            ? "#ef4444"
                                            : "#ffffff",
                                    color:
                                        productPage === i + 1
                                            ? "#ffffff"
                                            : "#475569",
                                    fontSize: "0.85rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            disabled={productPage === totalProductPages}
                            onClick={() =>
                                setProductPage((prev) =>
                                    Math.min(prev + 1, totalProductPages),
                                )
                            }
                            style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #e2e8f0",
                                backgroundColor:
                                    productPage === totalProductPages
                                        ? "#f1f5f9"
                                        : "#ffffff",
                                color:
                                    productPage === totalProductPages
                                        ? "#94a3b8"
                                        : "#475569",
                                fontSize: "0.85rem",
                                cursor:
                                    productPage === totalProductPages
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                        >
                            Sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
