import { Link } from "react-router-dom";
import { ShoppingCart, Bell, FileText, Search } from "lucide-react";
import { useNavbar } from "./useNavbar";
import "./Navbar.css";

const Navbar = () => {
    const {
        user,
        loading,
        navSearch,
        setNavSearch,
        showNotifications,
        notifications,
        unreadCount,
        favorites,
        totalCartItems,
        handleLogout,
        handleNavSearch,
        toggleNotifications,
        handleNotificationClick,
        markAllNotificationsAsRead,
    } = useNavbar();

    return (
        <nav className="navbar-container">
            {/* Brand Logo */}
            <Link to="/" className="navbar-brand-link">
                <span>UTEShop</span>
            </Link>

            {/* Nav Links */}
            <div className="navbar-links-group">
                <Link to="/" className="navbar-nav-link">
                    Trang chủ
                </Link>
                <Link to="/catalog" className="navbar-nav-link">
                    Khám phá kho sách
                </Link>
                {user && user.role === "MANAGER" && (
                    <Link to="/manager" className="navbar-nav-link-role">
                        Kênh quản lý
                    </Link>
                )}
                {user && user.role === "ADMIN" && (
                    <Link to="/admin" className="navbar-nav-link-role">
                        Kênh quản trị
                    </Link>
                )}
            </div>

            {/* Center Search Input */}
            <form onSubmit={handleNavSearch} className="navbar-search-form">
                <input
                    type="text"
                    placeholder="Tìm kiếm sách..."
                    value={navSearch}
                    onChange={(e) => setNavSearch(e.target.value)}
                    className="navbar-search-input"
                />
                <Search
                    size={16}
                    className="navbar-search-icon"
                    onClick={handleNavSearch}
                />
            </form>

            {/* Right Icons & Auth */}
            <div className="navbar-right-actions">
                {/* Notifications Bell */}
                <div className="navbar-icon-wrapper">
                    <button
                        type="button"
                        onClick={toggleNotifications}
                        className="navbar-icon-btn"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="navbar-unread-dot" />
                        )}
                    </button>

                    {/* Notifications Dropdown Panel */}
                    {showNotifications && (
                        <div className="glass-panel navbar-notifications-dropdown">
                            <div className="navbar-notifications-header">
                                <span className="navbar-notifications-title">
                                    Thông báo
                                </span>
                                <div className="navbar-notifications-header-actions">
                                    {unreadCount > 0 && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAllNotificationsAsRead();
                                            }}
                                            className="navbar-mark-all-read-btn"
                                        >
                                            Đã đọc tất cả
                                        </button>
                                    )}
                                    {unreadCount > 0 && (
                                        <span className="navbar-unread-count-text">
                                            ({unreadCount})
                                        </span>
                                    )}
                                </div>
                            </div>

                            {!user ? (
                                <div className="navbar-notifications-empty-box">
                                    Vui lòng đăng nhập để xem thông báo
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="navbar-notifications-empty-box">
                                    Không có thông báo nào
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() =>
                                            handleNotificationClick(n)
                                        }
                                        className={`navbar-notification-item ${
                                            n.read ? "read" : "unread"
                                        }`}
                                    >
                                        <div
                                            className={`navbar-notification-item-title ${
                                                n.read ? "read" : "unread"
                                            }`}
                                        >
                                            {n.title}
                                        </div>
                                        <div className="navbar-notification-item-message">
                                            {n.message}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Document Icon (Orders list) */}
                <Link to="/orders" className="navbar-icon-link">
                    <FileText size={20} />
                </Link>

                {/* Heart Icon (Wishlist) */}
                <Link to="/profile?tab=favorites" className="navbar-icon-link">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    </svg>
                    {favorites.length > 0 && (
                        <span className="navbar-count-badge">
                            {favorites.length}
                        </span>
                    )}
                </Link>

                {/* Shopping Cart */}
                <Link to="/cart" className="navbar-icon-link">
                    <ShoppingCart size={20} />
                    {totalCartItems > 0 && (
                        <span className="navbar-count-badge">
                            {totalCartItems}
                        </span>
                    )}
                </Link>

                {loading ? (
                    <div className="navbar-loading-box">
                        <span className="navbar-loading-text">
                            Đang xác thực...
                        </span>
                    </div>
                ) : user ? (
                    /* User Actions - Display Name & Logout Button Directly */
                    <div className="navbar-user-actions">
                        <Link to="/profile" className="navbar-user-name-link">
                            {user.fullName}
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="navbar-auth-btn"
                        >
                            Đăng xuất
                        </button>
                    </div>
                ) : (
                    /* Guest Actions - Login Button Directly */
                    <div className="navbar-guest-actions">
                        <Link to="/login" className="navbar-auth-btn">
                            <span>Đăng nhập</span>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
