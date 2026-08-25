import { ShieldCheck } from "lucide-react";
import { useSecuritySettings } from "./useSecuritySettings";
import "./SecuritySettings.css";

const SecuritySettings = () => {
    const {
        loading,
        oldPassword,
        setOldPassword,
        newPassword,
        setNewPassword,
        confirmNewPassword,
        setConfirmNewPassword,
        handlePasswordSubmit,
    } = useSecuritySettings();

    return (
        <div className="security-settings-card">
            <h3 className="security-settings-title">
                <ShieldCheck size={18} className="security-settings-icon" /> Bảo
                mật
            </h3>

            <form
                onSubmit={handlePasswordSubmit}
                className="security-settings-form"
            >
                <div className="security-settings-subhead">Đổi mật khẩu</div>
                <input
                    type="password"
                    placeholder="Mật khẩu hiện tại"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="security-settings-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="security-settings-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="security-settings-input"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="security-settings-btn-submit"
                >
                    {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
                </button>
            </form>
        </div>
    );
};

export default SecuritySettings;
