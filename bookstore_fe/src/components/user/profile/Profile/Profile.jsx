import { ShieldAlert } from "lucide-react";
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
        getInitials,
    } = useProfile();

    if (!user) {
        return (
            <div className="page-container profile-unauth-container">
                <ShieldAlert size={48} className="profile-unauth-icon" />
                <h2 className="profile-unauth-title">
                    Vui lòng đăng nhập để xem thông tin
                </h2>
            </div>
        );
    }

    return (
        <div className="page-container animate-fade-in profile-page-container">
            <div className="profile-header-meta">
                <p className="profile-subtitle">
                    Quản lý thông tin cá nhân và bảo mật tài khoản.
                </p>
            </div>

            <div className="profile-grid-layout">
                {/* LEFT COLUMN */}
                <div className="profile-col-stack">
                    {/* Box 1: Avatar Card */}
                    <div className="profile-avatar-card">
                        <div className="profile-avatar-circle">
                            {getInitials(user.fullName)}
                        </div>
                        <div>
                            <div className="profile-user-fullname">
                                {user.fullName}
                            </div>
                            <div className="profile-user-email">
                                {user.email}
                            </div>
                            <div className="profile-avatar-btn-group">
                                <button
                                    type="button"
                                    className="profile-avatar-btn-primary"
                                >
                                    Tải ảnh mới
                                </button>
                                <button
                                    type="button"
                                    className="profile-avatar-btn-outline"
                                >
                                    Xóa ảnh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Box 2: Personal Info Form */}
                    <ProfileInfo
                        fullName={fullName}
                        setFullName={setFullName}
                        email={email}
                        phone={phone}
                        setPhone={setPhone}
                    />

                    {/* Box 3: Address List */}
                    <AddressList
                        user={user}
                        phone={phone}
                        fullName={fullName}
                    />

                    {/* Form Actions */}
                    <div className="profile-form-actions">
                        <button type="button" className="profile-btn-cancel">
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleProfileSubmit}
                            disabled={loading}
                            className="profile-btn-submit"
                        >
                            {loading ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="profile-col-stack">
                    {/* Box 1: Rewards & Coupons */}
                    <CouponsRewards />

                    {/* Box 2: Favorite Products */}
                    <FavoriteProducts highlight={highlightFavorites} />

                    {/* Box 3: Security */}
                    <SecuritySettings />
                </div>
            </div>
        </div>
    );
};

export default Profile;
