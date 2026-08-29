import { Link } from "react-router-dom";
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
} from "lucide-react";
import { useNavbar } from "./useNavbar";
import "./Navbar.css";

const Navbar = () => {
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
    } = useNavbar();

    return (
        <nav className="navbar-container">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand-link">
                <span>UTEShop</span>
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
                        {/* Cột trái: Danh mục cấp 1 */}
                        <div className="mega-menu-sidebar">
                            <h4 className="mega-menu-heading">
                                Danh mục sản phẩm
                            </h4>
                            {categoryTree.map((cat) => (
                                <button
                                    type="button"
                                    key={cat.id}
                                    onMouseEnter={() =>
                                        setActiveLevel1Id(cat.id)
                                    }
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`mega-menu-level1-item ${
                                        String(activeLevel1Id) ===
                                        String(cat.id)
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Cột phải: Cấp 2 và Cấp 3 tương ứng */}
                        <div className="mega-menu-content">
                            {activeLevel1 && (
                                <>
                                    <div className="mega-menu-content-header">
                                        <BookOpen size={20} color="#0a422d" />
                                        <h3
                                            onClick={() =>
                                                handleCategoryClick(
                                                    activeLevel1.id,
                                                )
                                            }
                                        >
                                            {activeLevel1.name}
                                        </h3>
                                    </div>

                                    <div className="mega-menu-sub-grid">
                                        {activeLevel1.children &&
                                        activeLevel1.children.length > 0 ? (
                                            activeLevel1.children.map(
                                                (level2) => (
                                                    <div
                                                        key={level2.id}
                                                        className="mega-menu-group"
                                                    >
                                                        <h5
                                                            className="mega-menu-level2-title"
                                                            onClick={() =>
                                                                handleCategoryClick(
                                                                    level2.id,
                                                                )
                                                            }
                                                        >
                                                            {level2.name}
                                                        </h5>

                                                        {level2.children &&
                                                            level2.children
                                                                .length > 0 && (
                                                                <ul className="mega-menu-level3-list">
                                                                    {level2.children
                                                                        .slice(
                                                                            0,
                                                                            6,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                level3,
                                                                            ) => (
                                                                                <li
                                                                                    key={
                                                                                        level3.id
                                                                                    }
                                                                                    className="mega-menu-level3-item"
                                                                                    onClick={() =>
                                                                                        handleCategoryClick(
                                                                                            level3.id,
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        level3.name
                                                                                    }
                                                                                </li>
                                                                            ),
                                                                        )}
                                                                </ul>
                                                            )}

                                                        {/* Đã bỏ nút Xem tất cả */}
                                                    </div>
                                                ),
                                            )
                                        ) : (
                                            <p
                                                style={{
                                                    color: "#9ca3af",
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                Chưa có phân loại con cho danh
                                                mục này.
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Bar with Trending Modal */}
            <div className="navbar-search-container" ref={searchBoxRef}>
                <form onSubmit={handleNavSearch} className="navbar-search-form">
                    <input
                        type="text"
                        placeholder="Tìm kiếm tựa sách, tác giả, thể loại..."
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
                            Được tìm kiếm nhiều nhất
                        </h4>
                        <div className="navbar-search-tags-grid">
                            {trendingKeywords.map((keyword, index) => (
                                <button
                                    type="button"
                                    key={index}
                                    onClick={() => handleSelectKeyword(keyword)}
                                    className="navbar-search-tag-chip"
                                >
                                    {keyword}
                                </button>
                            ))}
                        </div>
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
                <div className="navbar-action-item">
                    <div className="navbar-action-icon-wrapper">
                        {user ? (
                            <div className="navbar-mini-avatar">
                                {getAvatarInitials(user.fullName)}
                            </div>
                        ) : (
                            <User size={22} />
                        )}
                    </div>
                    <span className="navbar-action-label">
                        {user ? user.fullName.split(" ").pop() : "Tài khoản"}
                    </span>

                    <div className="navbar-hover-panel">
                        <div className="navbar-modal-card navbar-user-modal">
                            {!user ? (
                                <div className="navbar-account-guest-box">
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
                                            className="navbar-account-nav-item"
                                        >
                                            <User size={16} />
                                            <span>Thông tin tài khoản</span>
                                        </Link>

                                        <Link
                                            to="/orders"
                                            className="navbar-account-nav-item"
                                        >
                                            <FileText size={16} />
                                            <span>Đơn hàng của tôi</span>
                                        </Link>

                                        <Link
                                            to="/profile?tab=favorites"
                                            className="navbar-account-nav-item"
                                        >
                                            <Heart size={16} />
                                            <span>Sách yêu thích</span>
                                        </Link>

                                        {user.role === "ADMIN" && (
                                            <Link
                                                to="/admin"
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
                                            onClick={handleLogout}
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
            </div>
        </nav>
    );
};

export default Navbar;
