import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { categoryService } from "@/services/categoryService";
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

    const trendingKeywords = [
        "Bố con cá gai",
        "Xứ cát",
        "higashino keigo",
        "dune",
        "suy tưởng",
        "sách giáo khoa",
        "Chúa nhẫn",
        "keigo",
        "chúa tể những chiếc nhẫn",
        "việt nam danh tác",
        "haruki murakami",
        "nhà giả kim",
        "kitchen",
        "nguyễn nhật ánh",
        "kem đá",
        "ray dalio",
        "tội ác và hình phạt",
        "hoàng tử bé",
        "Anne tóc đỏ",
        "Cứu tinh xứ cát",
    ];

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
