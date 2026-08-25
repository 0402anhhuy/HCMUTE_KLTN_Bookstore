import { User } from "lucide-react";
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
                <User size={18} className="profile-info-icon" /> Thông tin cá
                nhân
            </h3>

            <div className="profile-info-form-stack">
                <div>
                    <label className="profile-info-label">Tên</label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={handleFullNameChange}
                        className="profile-info-input"
                        required
                    />
                </div>

                <div>
                    <label className="profile-info-label disabled">
                        Địa chỉ email
                    </label>
                    <input
                        type="email"
                        value={email}
                        disabled
                        className="profile-info-input"
                    />
                </div>

                <div>
                    <label className="profile-info-label">Số điện thoại</label>
                    <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="profile-info-input"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
