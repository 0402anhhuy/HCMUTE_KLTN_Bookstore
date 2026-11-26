import { useState, useEffect, useMemo } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { promotionService } from "@/services/promotionService";
import { isCategoryOrChildOf } from "@/utils/categoryTree";
import api from "@/services/api";

const calculateEndDateStr = (startStr, durationVal) => {
    if (!startStr || !durationVal || isNaN(durationVal)) return "";
    const d = new Date(startStr);
    if (isNaN(d.getTime())) return "";
    const end = new Date(d.getTime() + Number(durationVal) * 60 * 60 * 1000);
    const year = end.getFullYear();
    const month = String(end.getMonth() + 1).padStart(2, "0");
    const day = String(end.getDate()).padStart(2, "0");
    const hours = String(end.getHours()).padStart(2, "0");
    const minutes = String(end.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const useAdminEditPromotion = ({ promotion, onSave, showToast }) => {
    const formatDateTimeLocal = (isoString) => {
        if (!isoString) return "";
        const d = new Date(isoString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
    };

    const getInitialDurationHours = (start, end) => {
        if (!start || !end) return "6";
        const startMs = new Date(start).getTime();
        const endMs = new Date(end).getTime();
        if (isNaN(startMs) || isNaN(endMs) || endMs <= startMs) return "6";
        const diffHours = Math.round((endMs - startMs) / (1000 * 60 * 60));
        return String(diffHours > 0 ? diffHours : 6);
    };

    const [step, setStep] = useState(1);
    const [title, setTitle] = useState(promotion?.title || "");
    const [discountType, setDiscountType] = useState(
        promotion?.discountType || "PERCENT"
    );
    const [discountValue, setDiscountValue] = useState(
        promotion?.discountValue || ""
    );
    const [startDate, setStartDate] = useState(
        formatDateTimeLocal(promotion?.startDate) || ""
    );
    const [durationHours, setDurationHours] = useState(() =>
        getInitialDurationHours(promotion?.startDate, promotion?.endDate)
    );
    const initialEndDate = formatDateTimeLocal(promotion?.endDate) || "";
    const endDate = useMemo(
        () => calculateEndDateStr(startDate, durationHours) || initialEndDate,
        [startDate, durationHours, initialEndDate],
    );

    const [availableProducts, setAvailableProducts] = useState([]);
    const [rawCategories, setRawCategories] = useState([]);
    const [occupiedProductMap, setOccupiedProductMap] = useState({});
    const [selectedCategoryId, setSelectedCategoryIdState] = useState("ALL");
    const [productSearch, setProductSearchState] = useState("");

    const initialProductIds =
        promotion?.applicableProducts?.map((p) => p.id) || [];
    const [selectedProductIds, setSelectedProductIds] = useState(initialProductIds);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 5;

    const setSelectedCategoryId = (val) => {
        setSelectedCategoryIdState(val);
        setCurrentPage(1);
    };

    const setProductSearch = (val) => {
        setProductSearchState(val);
        setCurrentPage(1);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoadingProducts(true);
            try {
                let productsData = [];
                try {
                    const resProducts = await productService.getApprovedProducts();
                    productsData = resProducts.data?.content || resProducts.data || [];
                } catch (err) {
                    console.warn("Failed to get approved products, falling back to all products", err);
                }

                if (!productsData || productsData.length === 0) {
                    try {
                        const resAll = await api.get("/products?size=200");
                        productsData = resAll.data?.content || resAll.data || [];
                    } catch (err) {
                        console.error("Fallback fetch all products failed", err);
                    }
                }
                setAvailableProducts(productsData);

                const resCategories = await categoryService.getCategories();
                const catsData =
                    resCategories.data.content || resCategories.data || [];
                setRawCategories(catsData);

                let promos = [];
                try {
                    const resPromos = await promotionService.getPromotions();
                    promos = resPromos.data?.content || resPromos.data || [];
                } catch (err) {
                    console.warn("Failed to fetch promotions for occupied map", err);
                }

                const occupiedMap = {};
                promos.forEach((promo) => {
                    if (promotion?.id && String(promo.id) === String(promotion.id)) return;
                    if (promo.status === "EXPIRED" || promo.status === "CANCELLED" || promo.status === "INACTIVE") return;
                    if (promo.applicableProducts) {
                        promo.applicableProducts.forEach((p) => {
                            occupiedMap[p.id] = promo.title;
                        });
                    }
                });
                setOccupiedProductMap(occupiedMap);
            } catch (error) {
                console.error("Failed to load data for promotion", error);
                showToast?.("Lỗi tải dữ liệu", "error");
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchData();
    }, [showToast, promotion?.id]);

    const filteredProducts = useMemo(() => {
        return availableProducts.filter((p) => {
            const matchesSearch =
                !productSearch.trim() ||
                p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.author &&
                    p.author
                        .toLowerCase()
                        .includes(productSearch.toLowerCase()));

            const matchesCategory =
                !selectedCategoryId ||
                selectedCategoryId === "ALL" ||
                isCategoryOrChildOf(
                    p.category || p.categoryId,
                    selectedCategoryId,
                    rawCategories,
                );

            return matchesSearch && matchesCategory;
        });
    }, [availableProducts, productSearch, selectedCategoryId, rawCategories]);

    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE) || 1;

    const currentProducts = useMemo(() => {
        const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
        return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const toggleProductSelection = (id) => {
        if (occupiedProductMap[id]) {
            showToast?.(
                `Sản phẩm đã thuộc chương trình "${occupiedProductMap[id]}", không thể chọn!`,
                "warning"
            );
            return;
        }
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
        if (!startDate) {
            showToast?.("Vui lòng chọn thời gian bắt đầu", "error");
            return;
        }
        if (!durationHours || isNaN(durationHours) || Number(durationHours) <= 0) {
            showToast?.("Vui lòng chọn thời gian diễn ra hợp lệ", "error");
            return;
        }
        setStep(2);
    };

    const handleSave = () => {
        if (selectedProductIds.length === 0) {
            showToast?.("Vui lòng chọn ít nhất 1 sản phẩm áp dụng", "error");
            return;
        }

        const calculatedEndDate = calculateEndDateStr(startDate, durationHours) || endDate;

        const payload = {
            title,
            discountType,
            discountValue: Number(discountValue),
            startDate,
            endDate: calculatedEndDate,
            productIds: selectedProductIds,
        };

        onSave?.(promotion.id, payload);
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
    };
};