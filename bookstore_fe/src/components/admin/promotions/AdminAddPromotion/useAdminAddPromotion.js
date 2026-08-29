import { useState, useEffect, useMemo } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
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

export const useAdminAddPromotion = ({ onSave, showToast }) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState("");
    const [discountType, setDiscountType] = useState("PERCENT");
    const [discountValue, setDiscountValue] = useState("");
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        now.setMinutes(0, 0, 0);
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    });
    const [durationHours, setDurationHours] = useState("6");
    const [endDate, setEndDate] = useState("");

    const [availableProducts, setAvailableProducts] = useState([]);
    const [rawCategories, setRawCategories] = useState([]);
    const [occupiedProductMap, setOccupiedProductMap] = useState({});
    const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
    const [productSearch, setProductSearch] = useState("");
    const [selectedProductIds, setSelectedProductIds] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 5;

    useEffect(() => {
        if (startDate && durationHours) {
            setEndDate(calculateEndDateStr(startDate, durationHours));
        }
    }, [startDate, durationHours]);

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
                setRawCategories(catsData);

                const resPromos = await api.get("/promotions");
                const promos = resPromos.data || [];
                const occupiedMap = {};
                promos.forEach((promo) => {
                    if (promo.status === "EXPIRED" || promo.status === "CANCELLED") return;
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
    }, [showToast]);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategoryId, productSearch]);

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
