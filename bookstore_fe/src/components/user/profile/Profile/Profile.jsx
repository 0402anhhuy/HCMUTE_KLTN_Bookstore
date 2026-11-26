import { useNavigate } from "react-router-dom";
import {
    ShieldAlert,
    User,
    MapPin,
    Heart,
    Gift,
    Lock,
    Save,
    RotateCcw,
    Wallet,
    Coins,
    Sparkles,
} from "lucide-react";
import { Breadcrumb, EmptyState } from "@/components/common";
import { useProfile } from "./useProfile";
import "./Profile.css";

// 1. Các subcomponent nằm trong folder anh em thuộc 'profile/' (phải lùi 1 cấp '../')
import ProfileInfo from "../ProfileInfo/ProfileInfo";
import AddressList from "../AddressList/AddressList";
import CouponsRewards from "../CouponsRewards/CouponsRewards";

// 2. FavoriteProducts nằm bên folder 'products/' (lùi 2 cấp '../../')
import FavoriteProducts from "../../products/FavoriteProducts/FavoriteProducts";

// 3. SecuritySettings nằm bên folder 'setting/' (lùi 2 cấp '../../')
import SecuritySettings from "../../setting/SecuritySettings/SecuritySettings";

const Profile = () => {
    const navigate = useNavigate();
    const {
        user,
        fullName,
        setFullName,
        phone,
        setPhone,
        email,
        loading,
        highlightFavorites,
        handleProfileSubmit,
        handleResetForm,
        getInitials,
        activeTab,
        setActiveTab,
    } = useProfile();

    if (!user) {
        return (
            <div className="page-container animate-fade-in profile-page-container">
                <Breadcrumb
                    items={[
                        { label: "Trang chủ", to: "/" },
                        { label: "Tài khoản của tôi" },
                    ]}
                />
                <EmptyState
                    icon={Lock}
                    title="Vui lòng đăng nhập để xem thông tin"
                    description="Bạn cần đăng nhập để quản lý thông tin cá nhân, danh sách địa chỉ và các quyền lợi thành viên."
                    actionText="Đăng nhập ngay"
                    onAction={() => navigate("/login")}
                />
            </div>
        );
    }

    const formatVND = (amount) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount || 0);
    };

    return (
        <div className="page-container animate-fade-in profile-page-container">
            <Breadcrumb
                items={[
                    { label: "Trang chủ", to: "/" },
                    { label: "Tài khoản của tôi" },
                ]}
            />

            <div className="profile-header-meta">
                <h1 className="profile-title">Tài khoản của tôi</h1>
                <p className="profile-subtitle">
                    Quản lý thông tin cá nhân, sổ địa chỉ và ưu đãi thành viên.
                </p>
            </div>

            <div className="profile-layout-container">
                {/* SIDEBAR NAVIGATION */}
                <div className="profile-sidebar">
                    <div className="profile-sidebar-user-info">
                        <div className="profile-avatar-circle">
                            {getInitials(user.fullName)}
                        </div>
                        <div className="profile-sidebar-user-meta">
                            <span className="profile-sidebar-welcome">Xin chào,</span>
                            <h4 className="profile-sidebar-name">{user.fullName}</h4>
                            <span className="profile-sidebar-role-badge">
                                <Sparkles size={12} /> Thành viên thân thiết
                            </span>
                        </div>
                    </div>

                    <div className="profile-sidebar-stats-row">
                        <div className="profile-sidebar-stat-item">
                            <Coins size={14} className="stat-coin-icon" />
                            <div className="stat-meta">
                                <span className="stat-label">Xu tích lũy</span>
                                <strong className="stat-val">{user.rewardPoints || 0}</strong>
                            </div>
                        </div>
                        <div className="profile-sidebar-stat-item">
                            <Wallet size={14} className="stat-wallet-icon" />
                            <div className="stat-meta">
                                <span className="stat-label">Ví điện tử</span>
                                <strong className="stat-val">{formatVND(user.walletBalance || 0)}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="profile-nav-menu">
                        <button
                            type="button"
                            className={`profile-nav-item ${activeTab === "info" ? "active" : ""}`}
                            onClick={() => setActiveTab("info")}
                        >
                            <User size={18} />
                            <span>Thông tin cá nhân</span>
                        </button>
                        <button
                            type="button"
                            className={`profile-nav-item ${activeTab === "addresses" ? "active" : ""}`}
                            onClick={() => setActiveTab("addresses")}
                        >
                            <MapPin size={18} />
                            <span>Danh sách địa chỉ</span>
                        </button>
                        <button
                            type="button"
                            className={`profile-nav-item ${activeTab === "favorites" ? "active" : ""}`}
                            onClick={() => setActiveTab("favorites")}
                        >
                            <Heart size={18} />
                            <span>Sản phẩm yêu thích</span>
                        </button>
                        <button
                            type="button"
                            className={`profile-nav-item ${activeTab === "coupons" ? "active" : ""}`}
                            onClick={() => setActiveTab("coupons")}
                        >
                            <Gift size={18} />
                            <span>Kho Xu & Ví Voucher</span>
                        </button>
                        <button
                            type="button"
                            className={`profile-nav-item ${activeTab === "security" ? "active" : ""}`}
                            onClick={() => setActiveTab("security")}
                        >
                            <Lock size={18} />
                            <span>Đổi mật khẩu</span>
                        </button>
                    </div>
                </div>

                {/* CONTENT AREA */}
                <div className="profile-content-area">
                    {activeTab === "info" && (
                        <div className="profile-tab-pane animate-fade-in">
                            <div className="profile-avatar-card">
                                <div className="profile-avatar-circle-large">
                                    {getInitials(user.fullName)}
                                </div>
                                <div className="profile-avatar-details">
                                    <div className="profile-user-fullname">{user.fullName}</div>
                                    <div className="profile-user-email">{user.email}</div>
                                    <div className="profile-user-badges-row">
                                        <span className="profile-badge-tier">
                                            <Sparkles size={12} /> Thành viên BookStore
                                        </span>
                                        {user.phone && (
                                            <span className="profile-badge-phone">
                                                SĐT: {user.phone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ProfileInfo
                                fullName={fullName}
                                setFullName={setFullName}
                                email={email}
                                phone={phone}
                                setPhone={setPhone}
                            />

                            <div className="profile-form-actions">
                                <button
                                    type="button"
                                    onClick={handleResetForm}
                                    className="profile-btn-cancel"
                                >
                                    <RotateCcw size={15} /> Đặt lại
                                </button>
                                <button
                                    type="button"
                                    onClick={handleProfileSubmit}
                                    disabled={loading}
                                    className="profile-btn-submit"
                                >
                                    <Save size={15} />
                                    {loading ? "Đang lưu..." : "Lưu thay đổi"}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "addresses" && (
                        <div className="profile-tab-pane animate-fade-in">
                            <AddressList user={user} phone={phone} fullName={fullName} />
                        </div>
                    )}

                    {activeTab === "favorites" && (
                        <div className="profile-tab-pane animate-fade-in">
                            <FavoriteProducts highlight={highlightFavorites} />
                        </div>
                    )}

                    {activeTab === "coupons" && (
                        <div className="profile-tab-pane animate-fade-in">
                            <CouponsRewards />
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="profile-tab-pane animate-fade-in">
                            <SecuritySettings />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
