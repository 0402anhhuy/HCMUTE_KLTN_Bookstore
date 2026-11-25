import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutGrid,
    ChevronDown,
    Search,
    Bell,
    ShoppingCart,
    User,
    Lock,
    FileText,
    Heart,
    LogOut,
    ShieldCheck,
    LayoutDashboard,
    BookOpen,
    Menu,
    X,
    TrendingUp,
} from "lucide-react";
import { useNavbar } from "./useNavbar";
import "./Navbar.css";

const Navbar = () => {
    const location = useLocation();
    const {
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
    } = useNavbar();

    const displayUserName = (() => {
        const name = (user?.fullName || user?.name || user?.email || "")
            .toString()
            .trim();
        if (!name) return "Tài khoản";
        return name.split(" ").filter(Boolean).pop();
    })();

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        setUserMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, []);

    return (
        <nav className="navbar-container">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand-link">
                <span>Bookstore</span>
            </Link>

            {/* Fahasa Mega Menu Danh mục sản phẩm */}
            <div
                className="navbar-category-wrapper"
                ref={categoryMenuRef}
                onMouseEnter={() => setShowCategoryMenu(true)}
                onMouseLeave={() => setShowCategoryMenu(false)}
            >
                <button
                    type="button"
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="navbar-category-btn"
                    aria-label="Danh mục sách"
                >
                    <LayoutGrid size={22} />
                    <ChevronDown size={14} />
                </button>

                {showCategoryMenu && (
                    <div className="navbar-mega-menu">
                        <div className="mega-menu-content-header">
                            <BookOpen size={20} color="#0a422d" />
                            <h3>Danh mục sản phẩm</h3>
                        </div>

                        <div className="mega-menu-sub-grid">
                            {categoryTree.map((rootCat) => (
                                <div
                                    key={rootCat.id}
                                    className="mega-menu-group"
                                >
                                    <h5
                                        className="mega-menu-level2-title"
                                        onClick={() =>
                                            handleCategoryClick(rootCat.id)
                                        }
                                    >
                                        {rootCat.name}
                                    </h5>

                                    {rootCat.children &&
                                        rootCat.children.length > 0 && (
                                            <ul className="mega-menu-level3-list">
                                                {rootCat.children.map(
                                                    (subCat) => (
                                                        <li
                                                            key={subCat.id}
                                                            className="mega-menu-level3-item"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCategoryClick(
                                                                    subCat.id,
                                                                );
                                                            }}
                                                        >
                                                            {subCat.name}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Bar with Trending Modal */}
            <div className="navbar-search-container" ref={searchBoxRef}>
                <form onSubmit={handleNavSearch} className="navbar-search-form">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tên sách..."
                        value={navSearch}
                        onFocus={() => setShowSearchModal(true)}
                        onChange={(e) => setNavSearch(e.target.value)}
                        className="navbar-search-input"
                    />
                    <button
                        type="submit"
                        className="navbar-search-btn"
                        aria-label="Tìm kiếm"
                    >
                        <Search size={18} />
                    </button>
                </form>

                {showSearchModal && (
                    <div className="navbar-search-modal">
                        <h4 className="navbar-search-modal-title">
                            <TrendingUp
                                size={16}
                                style={{
                                    display: "inline",
                                    marginRight: "6px",
                                    verticalAlign: "middle",
                                    color: "#0a422d",
                                }}
                            />
                            Được tìm kiếm nhiều nhất
                        </h4>
                        {trendingKeywords.length > 0 ? (
                            <div className="navbar-search-tags-grid">
                                {trendingKeywords.map((keyword, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => handleSelectKeyword(keyword)}
                                        className="navbar-search-tag-chip"
                                        title={`Tìm kiếm "${keyword}"`}
                                    >
                                        {keyword}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: "0.85rem", color: "#6b7280", padding: "4px 0" }}>
                                {loadingTrending ? "Đang tải gợi ý..." : "Chưa có từ khóa tìm kiếm nổi bật."}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Navigation Actions */}
            <div className="navbar-right-actions">
                {/* 1. THÔNG BÁO */}
                <div className="navbar-action-item">
                    <div className="navbar-action-icon-wrapper">
                        <Bell size={22} />
                        {unreadCount > 0 && (
                            <span className="navbar-unread-dot" />
                        )}
                    </div>
                    <span className="navbar-action-label">Thông Báo</span>

                    <div className="navbar-hover-panel">
                        <div className="navbar-modal-card navbar-notif-modal">
                            <div className="navbar-notif-modal-header">
                                <div className="navbar-notif-modal-title">
                                    <Bell size={18} />
                                    <span>Thông báo</span>
                                </div>
                                {user && unreadCount > 0 && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAllNotificationsAsRead();
                                        }}
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#10b981",
                                            border: "none",
                                            background: "none",
                                            cursor: "pointer",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Đã đọc tất cả
                                    </button>
                                )}
                            </div>

                            {!user ? (
                                <div className="navbar-guest-auth-box">
                                    <div className="navbar-lock-circle">
                                        <Lock size={32} />
                                    </div>
                                    <p className="navbar-guest-auth-msg">
                                        Vui lòng đăng nhập để xem thông báo
                                    </p>
                                    <Link
                                        to="/login"
                                        className="navbar-btn-login-solid"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="navbar-btn-register-outline"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="navbar-guest-auth-box">
                                    <p
                                        style={{
                                            color: "#6b7280",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        Không có thông báo mới nào
                                    </p>
                                </div>
                            ) : (
                                <div className="navbar-notif-list">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            onClick={() =>
                                                handleNotificationClick(n)
                                            }
                                            className={`navbar-notif-item ${
                                                n.read ? "read" : "unread"
                                            }`}
                                        >
                                            <div className="navbar-notif-item-title">
                                                {n.title}
                                            </div>
                                            <div className="navbar-notif-item-desc">
                                                {n.message}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. GIỎ HÀNG */}
                <Link to="/cart" className="navbar-action-item">
                    <div className="navbar-action-icon-wrapper">
                        <ShoppingCart size={22} />
                        {totalCartItems > 0 && (
                            <span className="navbar-count-badge">
                                {totalCartItems}
                            </span>
                        )}
                    </div>
                    <span className="navbar-action-label">Giỏ Hàng</span>
                </Link>

                {/* 3. TÀI KHOẢN */}
                <div ref={userMenuRef} className="navbar-action-item">
                    <div
                        className="navbar-action-icon-wrapper"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUserMenuOpen((prev) => !prev);
                        }}
                    >
                        {user ? (
                            <div className="navbar-mini-avatar">
                                {getAvatarInitials(user.fullName)}
                            </div>
                        ) : (
                            <User size={22} />
                        )}
                    </div>
                    <span
                        className="navbar-action-label"
                        onClick={(e) => {
                            e.stopPropagation();
                            setUserMenuOpen((prev) => !prev);
                        }}
                    >
                        {user ? displayUserName : "Tài khoản"}
                    </span>

                    <div
                        className={`navbar-hover-panel ${userMenuOpen ? "show-user-menu" : "hide-user-menu"}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="navbar-modal-card navbar-user-modal">
                            {!user ? (
                                <div className="navbar-account-guest-box">
                                    <Link
                                        to="/login"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="navbar-btn-login-solid"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setUserMenuOpen(false)}
                                        className="navbar-btn-register-outline"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <div className="navbar-account-logged-header">
                                        <div className="navbar-account-logged-name">
                                            {user.fullName}
                                        </div>
                                        <div className="navbar-account-logged-email">
                                            {user.email}
                                        </div>
                                        {user.role && (
                                            <span className="navbar-account-logged-role">
                                                {user.role}
                                            </span>
                                        )}
                                    </div>

                                    <div className="navbar-account-nav-list">
                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="navbar-account-nav-item"
                                        >
                                            <User size={16} />
                                            <span>Thông tin tài khoản</span>
                                        </Link>

                                        <Link
                                            to="/orders"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="navbar-account-nav-item"
                                        >
                                            <FileText size={16} />
                                            <span>Đơn hàng của tôi</span>
                                        </Link>

                                        <Link
                                            to="/profile?tab=favorites"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="navbar-account-nav-item"
                                        >
                                            <Heart size={16} />
                                            <span>Sách yêu thích</span>
                                        </Link>

                                        {user.role === "ADMIN" && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="navbar-account-nav-item"
                                            >
                                                <ShieldCheck size={16} />
                                                <span>
                                                    Trang quản trị (Admin)
                                                </span>
                                            </Link>
                                        )}

                                        {user.role === "MANAGER" && (
                                            <Link
                                                to="/manager"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="navbar-account-nav-item"
                                            >
                                                <LayoutDashboard size={16} />
                                                <span>
                                                    Trang quản lý (Manager)
                                                </span>
                                            </Link>
                                        )}

                                        <div className="navbar-account-divider" />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleLogout();
                                                setUserMenuOpen(false);
                                            }}
                                            className="navbar-account-nav-item logout"
                                        >
                                            <LogOut size={16} />
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Toggle Button */}
                <button
                    type="button"
                    className="navbar-hamburger-btn"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle Mobile Menu"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation Drawer */}
            {mobileMenuOpen && (
                <div className="navbar-mobile-drawer">
                    <div className="navbar-mobile-drawer-header">
                        <div className="navbar-mobile-user-info">
                            {user ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div className="navbar-mini-avatar">
                                        {getAvatarInitials(user.fullName)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
                                            {user.fullName}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="navbar-mobile-drawer-btn-primary"
                                    >
                                        Đăng nhập
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="navbar-mobile-drawer-btn-outline"
                                    >
                                        Đăng ký
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="navbar-mobile-drawer-body">
                        {/* Mobile Category List */}
                        <div className="navbar-mobile-section">
                            <h5 className="navbar-mobile-section-title">
                                <LayoutGrid size={16} />
                                <span>Danh mục sản phẩm</span>
                            </h5>
                            <div className="navbar-mobile-category-list">
                                {categoryTree.map((cat) => (
                                    <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() => {
                                            handleCategoryClick(cat.id);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="navbar-mobile-category-item"
                                    >
                                        <span>{cat.name}</span>
                                        <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Quick Links */}
                        <div className="navbar-mobile-section">
                            <h5 className="navbar-mobile-section-title">Điều hướng</h5>
                            <div className="navbar-mobile-nav-links">
                                <Link
                                    to="/"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="navbar-mobile-nav-link"
                                >
                                    Trang chủ
                                </Link>
                                <Link
                                    to="/catalog"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="navbar-mobile-nav-link"
                                >
                                    Tất cả sản phẩm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
