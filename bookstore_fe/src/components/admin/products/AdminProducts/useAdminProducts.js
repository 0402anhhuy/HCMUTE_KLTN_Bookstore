import { useState, useEffect, useMemo } from "react";
import { productService } from "@/services/productService";
import { buildCategoryTree, flattenCategoryTree } from "@/utils/categoryTree";

export const useAdminProducts = ({ products = [], categories = [] }) => {
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

    const categoryOptions = useMemo(
        () => flattenCategoryTree(buildCategoryTree(categories)),
        [categories],
    );

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const [pendingRes, approvedRes, rejectedRes] =
                    await Promise.all([
                        productService.getPendingCount(),
                        productService.getApprovedCount(),
                        productService.getRejectedCount(),
                    ]);
                setPendingCount(pendingRes.data?.count || 0);
                setApprovedCount(approvedRes.data?.count || 0);
                setRejectedCount(rejectedRes.data?.count || 0);
            } catch (error) {
                console.error(
                    "Lỗi khi tải số lượng sản phẩm theo trạng thái:",
                    error,
                );
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
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch =
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.author &&
                    p.author
                        .toLowerCase()
                        .includes(productSearch.toLowerCase()));
            const matchesCategory =
                categoryFilter === "" ||
                (p.category &&
                    String(p.category.id) === String(categoryFilter));

            let matchesStatus = true;
            if (productStatusFilter === "PENDING")
                matchesStatus = p.status === "PENDING";
            else if (productStatusFilter === "ACTIVE")
                matchesStatus = p.status === "ACTIVE";
            else if (productStatusFilter === "REJECTED")
                matchesStatus = p.status === "REJECTED";
            else if (productStatusFilter === "INACTIVE")
                matchesStatus = p.status === "INACTIVE";
            else if (productStatusFilter === "OUT_OF_STOCK")
                matchesStatus = p.stockQuantity === 0;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [products, productSearch, categoryFilter, productStatusFilter]);

    const totalProductPages =
        Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;

    const paginatedProducts = useMemo(() => {
        return filteredProducts.slice(
            (productPage - 1) * ITEMS_PER_PAGE,
            productPage * ITEMS_PER_PAGE,
        );
    }, [filteredProducts, productPage]);

    return {
        productSearch,
        setProductSearch,
        categoryFilter,
        setCategoryFilter,
        productStatusFilter,
        setProductStatusFilter,
        productPage,
        setProductPage,
        selectedProductId,
        setSelectedProductId,
        pendingCount,
        approvedCount,
        rejectedCount,
        categoryOptions,
        filteredProducts,
        totalProductPages,
        paginatedProducts,
        getImagesList,
    };
};
