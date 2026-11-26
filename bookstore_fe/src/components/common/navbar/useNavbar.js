import { useState, useEffect, useRef, useMemo } from "react";
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
    const [loadingTrending, setLoadingTrending] = useState(true);

    const searchBoxRef = useRef(null);
    const categoryMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [prevRouteKey, setPrevRouteKey] = useState(() => `${location.pathname}${location.search}`);

    const currentRouteKey = `${location.pathname}${location.search}`;
    if (currentRouteKey !== prevRouteKey) {
        setPrevRouteKey(currentRouteKey);
        const params = new URLSearchParams(location.search);
        const kw = params.get("keyword") || "";
        setNavSearch(location.pathname === "/catalog" && kw ? kw : "");
    }

    // Lấy top 10 sách bestseller thực tế từ DB để hiển thị gợi ý tìm kiếm
    useEffect(() => {
        let isMounted = true;
        productService
            .getBestsellers({ limit: 10 })
            .then((res) => {
                if (isMounted) {
                    const data = Array.isArray(res.data) ? res.data : [];
                    const titles = data
                        .map((p) => p.name?.trim())
                        .filter(Boolean)
                        .slice(0, 10);
                    if (titles.length > 0) {
                        setTrendingKeywords(titles);
                    }
                }
            })
            .catch((err) => {
                console.error("Lỗi khi tải từ khóa gợi ý bán chạy:", err);
            })
            .finally(() => {
                if (isMounted) setLoadingTrending(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        categoryService
            .getCategories()
            .then((res) => {
                if (active) setRawCategories(res.data || []);
            })
            .catch((e) => {
                console.error("Failed to load categories in navbar:", e);
            });
        return () => {
            active = false;
        };
    }, []);

    // Xây dựng cây thư mục đa cấp từ danh sách phẳng/quan hệ parent
    // ✅ Gọi thẳng buildCategoryTree để luôn đảm bảo dựng đúng cây 3 cấp từ API
    const categoryTree = useMemo(() => {
        if (!rawCategories || rawCategories.length === 0) return [];
        return buildCategoryTree(rawCategories);
    }, [rawCategories]);

    const resolvedLevel1Id = activeLevel1Id ?? categoryTree[0]?.id ?? null;

    const activeLevel1 = useMemo(() => {
        return (
            categoryTree.find((c) => String(c.id) === String(resolvedLevel1Id)) ||
            categoryTree[0]
        );
    }, [categoryTree, resolvedLevel1Id]);

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
