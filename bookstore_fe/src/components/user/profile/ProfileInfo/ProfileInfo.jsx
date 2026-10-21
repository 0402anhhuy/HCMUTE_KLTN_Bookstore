import { User, Mail, Phone, Info } from "lucide-react";
import { useProfileInfo } from "./useProfileInfo";
import "./ProfileInfo.css";

const ProfileInfo = ({ fullName, setFullName, email, phone, setPhone }) => {
    const { handleFullNameChange, handlePhoneChange } = useProfileInfo({
        setFullName,
        setPhone,
    });

    return (
        <div className="profile-info-card">
            <h3 className="profile-info-title">
                <User size={18} className="profile-info-icon" /> Thông tin cá nhân
            </h3>

            <div className="profile-info-form-stack">
                <div className="profile-field-group">
                    <label className="profile-info-label">
                        <User size={15} /> Họ và tên <span className="profile-required-mark">*</span>
                    </label>
                    <div className="profile-input-wrapper">
                        <input
                            type="text"
                            value={fullName}
                            onChange={handleFullNameChange}
                            className="profile-info-input"
                            placeholder="Nhập họ và tên của bạn"
                            required
                        />
                    </div>
                </div>

                <div className="profile-field-group">
                    <label className="profile-info-label disabled">
                        <Mail size={15} /> Địa chỉ Email
                        <span className="profile-readonly-badge">Cố định</span>
                    </label>
                    <div className="profile-input-wrapper">
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="profile-info-input disabled"
                            placeholder="Địa chỉ email đăng nhập"
                        />
                    </div>
                    <span className="profile-field-helper">
                        <Info size={13} /> Email được liên kết với tài khoản và dùng để nhận thông báo đơn hàng.
                    </span>
                </div>

                <div className="profile-field-group">
                    <label className="profile-info-label">
                        <Phone size={15} /> Số điện thoại
                    </label>
                    <div className="profile-input-wrapper">
                        <input
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="profile-info-input"
                            placeholder="Ví dụ: 0909123456 (10 chữ số)"
                        />
                    </div>
                    <span className="profile-field-helper">
                        <Info size={13} /> Dùng để shipper liên hệ khi giao hàng và nhận mã xác thực.
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
