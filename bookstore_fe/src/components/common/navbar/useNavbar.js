import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { buildCategoryTree } from "@/utils/categoryTree";

export const useNavbar = () => {
    const {
        user,
        cart,
        logoutUser,
        notifications = [],
        unreadCount = 0,
        markNotificationRead,
        markAllNotificationsAsRead,
        favorites = [],
    } = useApp();

    const [navSearch, setNavSearch] = useState("");
    const [rawCategories, setRawCategories] = useState([]);
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [activeLevel1Id, setActiveLevel1Id] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [trendingKeywords, setTrendingKeywords] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(false);

    const searchBoxRef = useRef(null);
    const categoryMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Reset/sync navSearch when changing routes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const kw = params.get("keyword") || "";
        if (location.pathname !== "/catalog" || !kw) {
            setNavSearch("");
        } else {
            setNavSearch(kw);
        }
    }, [location]);

    // Gợi ý top 10 sách bestseller thực tế từ database thay vì danh sách tĩnh hardcode
    useEffect(() => {
        let isMounted = true;
        setLoadingTrending(true);

        const fetchTrending = async () => {
            try {
                // 1. Thử gọi API bestsellers
                let books = [];
                try {
                    const res = await productService.getBestsellers({ limit: 10 });
                    if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
                        books = res.data;
                    }
                } catch {
                    // API bestsellers chưa có hoặc lỗi
                }

                // 2. Fallback sang danh sách sách đã duyệt (Active) thực tế trong database
                if (books.length === 0) {
                    try {
                        const activeRes = await productService.getApprovedProducts();
                        if (activeRes && activeRes.data && Array.isArray(activeRes.data) && activeRes.data.length > 0) {
                            books = activeRes.data;
                        }
                    } catch {
                        // Fallback tiếp tục
                    }
                }

                // 3. Fallback sang searchProducts thông thường
                if (books.length === 0) {
                    try {
                        const searchRes = await productService.getProducts({ size: 10 });
                        const content = searchRes?.data?.content || (Array.isArray(searchRes?.data) ? searchRes.data : []);
                        if (content && content.length > 0) {
                            books = content;
                        }
                    } catch {
                        // Bỏ qua
                    }
                }

                if (isMounted && books.length > 0) {
                    const titles = [];
                    const seen = new Set();
                    for (const book of books) {
                        const name = (book?.name || "").trim();
                        if (name && !seen.has(name.toLowerCase())) {
                            seen.add(name.toLowerCase());
                            titles.push(name);
                            if (titles.length >= 10) break;
                        }
                    }
                    if (titles.length > 0) {
                        setTrendingKeywords(titles);
                    }
                }
            } catch (err) {
                console.error("Lỗi khi tải gợi ý sách bestseller:", err);
            } finally {
                if (isMounted) setLoadingTrending(false);
            }
        };

        fetchTrending();

        return () => {
            isMounted = false;
        };
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await categoryService.getCategories();
            const data = res.data || [];
            setRawCategories(data);
        } catch (e) {
            console.error("Failed to load categories in navbar:", e);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Xây dựng cây thư mục đa cấp từ danh sách phẳng/quan hệ parent
    // ✅ Gọi thẳng buildCategoryTree để luôn đảm bảo dựng đúng cây 3 cấp từ API
    const categoryTree = useMemo(() => {
        if (!rawCategories || rawCategories.length === 0) return [];
        return buildCategoryTree(rawCategories);
    }, [rawCategories]);

    // Thiết lập danh mục cấp 1 mặc định khi load xong
    useEffect(() => {
        if (categoryTree.length > 0 && !activeLevel1Id) {
            setActiveLevel1Id(categoryTree[0].id);
        }
    }, [categoryTree, activeLevel1Id]);

    const activeLevel1 = useMemo(() => {
        return (
            categoryTree.find((c) => String(c.id) === String(activeLevel1Id)) ||
            categoryTree[0]
        );
    }, [categoryTree, activeLevel1Id]);

    // Đóng modal khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setShowSearchModal(false);
            }
            if (
                categoryMenuRef.current &&
                !categoryMenuRef.current.contains(event.target)
            ) {
                setShowCategoryMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    const handleNavSearch = (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setShowSearchModal(false);
        if (navSearch.trim()) {
            navigate(
                `/catalog?keyword=${encodeURIComponent(navSearch.trim())}`,
            );
        } else {
            navigate("/catalog");
        }
    };

    const handleSelectKeyword = (keyword) => {
        setNavSearch(keyword);
        setShowSearchModal(false);
        navigate(`/catalog?keyword=${encodeURIComponent(keyword)}`);
    };

    const handleCategoryClick = (catId) => {
        setShowCategoryMenu(false);
        navigate(`/catalog?categoryId=${catId}`);
    };
    
    const handleNotificationClick = (n) => {
        if (!n.read) {
            markNotificationRead(n.id);
        }

        const isStaff =
            user && (user.role === "MANAGER" || user.role === "ADMIN");
        if (isStaff) {
            if (n.referenceType === "orders" || n.type === "ORDER") {
                navigate("/manager?tab=orders");
            } else if (n.referenceType === "products" || n.type === "PRODUCT") {
                navigate("/manager?tab=products");
            } else {
                navigate("/manager?tab=dashboard");
            }
        } else {
            if (n.referenceType === "orders" || n.type === "ORDER") {
                navigate("/orders");
            } else if (n.referenceType === "products" && n.referenceId) {
                navigate(`/product/${n.referenceId}`);
            } else {
                navigate("/profile");
            }
        }
    };

    const totalCartItems = cart?.items
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;

    const getAvatarInitials = (name) => {
        if (!name) return "U";
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (
            parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    };

    return {
        user,
        navSearch,
        setNavSearch,
        categoryTree,
        activeLevel1,
        activeLevel1Id,
        setActiveLevel1Id,
        showCategoryMenu,
        setShowCategoryMenu,
        categoryMenuRef,
        showSearchModal,
        setShowSearchModal,
        searchBoxRef,
        trendingKeywords,
        loadingTrending,
        notifications,
        unreadCount,
        favorites,
        totalCartItems,
        handleLogout,
        handleNavSearch,
        handleSelectKeyword,
        handleCategoryClick,
        handleNotificationClick,
        markAllNotificationsAsRead,
        getAvatarInitials,
        mobileMenuOpen,
        setMobileMenuOpen,
    };
};
