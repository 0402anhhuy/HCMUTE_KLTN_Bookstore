import { useState, useEffect, useMemo } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { buildCategoryTree, flattenCategoryTree } from "@/utils/categoryTree";

export const useAdminAddPromotion = ({ onSave, showToast }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [discountType, setDiscountType] = useState("PERCENT");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [availableProducts, setAvailableProducts] = useState([]);
    const [categories, setCategories] = useState([
        { id: "ALL", name: "Tất cả danh mục" },
    ]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 5;

    const categoryOptions = useMemo(
        () =>
            flattenCategoryTree(
                buildCategoryTree(categories.filter((c) => c.id !== "ALL")),
            ),
        [categories],
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoadingProducts(true);
            try {
                const resProducts = await productService.getApprovedProducts();
                const productsData =
                    resProducts.data.content || resProducts.data || [];
                setAvailableProducts(productsData);

                const resCategories = await categoryService.getCategories();
                const catsData =
                    resCategories.data.content || resCategories.data || [];
                setCategories([
                    { id: "ALL", name: "Tất cả danh mục" },
                    ...catsData,
                ]);
            } catch (error) {
                console.error("Failed to load data for promotion", error);
                showToast?.("Lỗi tải dữ liệu", "error");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchData();
    }, [showToast]);

    const filteredProducts = useMemo(() => {
        if (selectedCategoryId === "ALL") return availableProducts;
        return availableProducts.filter(
            (p) =>
                String(p.category?.id || p.categoryId) ===
                String(selectedCategoryId),
        );
    }, [availableProducts, selectedCategoryId]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

    const currentProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId]);

    const toggleProductSelection = (id) => {
        if (selectedProductIds.includes(id)) {
            setSelectedProductIds((prev) => prev.filter((pId) => pId !== id));
        } else {
            setSelectedProductIds((prev) => [...prev, id]);
        }
    };

    const handleNextStep = () => {
        if (!title.trim()) {
            showToast?.("Vui lòng nhập tên chương trình", "error");
            return;
        }
        if (
            !discountValue ||
            isNaN(discountValue) ||
            Number(discountValue) <= 0
        ) {
            showToast?.("Giá trị khuyến mãi không hợp lệ", "error");
            return;
        }
        if (discountType === "PERCENT" && Number(discountValue) > 100) {
            showToast?.("Giảm theo % không được vượt quá 100%", "error");
            return;
        }
        if (!startDate || !endDate) {
            showToast?.(
                "Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc",
                "error",
            );
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            showToast?.(
                "Thời gian kết thúc phải sau thời gian bắt đầu",
                "error",
            );
            return;
        }
        setStep(2);
    };

    const handleSave = () => {
        if (selectedProductIds.length === 0) {
            showToast?.("Vui lòng chọn ít nhất 1 sản phẩm áp dụng", "error");
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

        onSave?.(payload);
    };

    return {
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
    };
};
