import { useState } from "react";
import { ShieldCheck, Lock, Eye, EyeOff, KeyRound, Info, Loader2 } from "lucide-react";
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

    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="security-settings-card">
            <h3 className="security-settings-title">
                <ShieldCheck size={18} className="security-settings-icon" /> Bảo mật & Đổi mật khẩu
            </h3>

            <form
                onSubmit={handlePasswordSubmit}
                className="security-settings-form"
            >
                <div className="security-field-group">
                    <label className="security-label">
                        <Lock size={15} /> Mật khẩu hiện tại
                    </label>
                    <div className="security-input-wrapper">
                        <input
                            type={showOld ? "text" : "password"}
                            placeholder="Nhập mật khẩu hiện tại"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="security-settings-input"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowOld(!showOld)}
                            className="security-eye-btn"
                            aria-label={showOld ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="security-field-group">
                    <label className="security-label">
                        <KeyRound size={15} /> Mật khẩu mới
                    </label>
                    <div className="security-input-wrapper">
                        <input
                            type={showNew ? "text" : "password"}
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="security-settings-input"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="security-eye-btn"
                            aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="security-field-group">
                    <label className="security-label">
                        <KeyRound size={15} /> Xác nhận mật khẩu mới
                    </label>
                    <div className="security-input-wrapper">
                        <input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu mới"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="security-settings-input"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="security-eye-btn"
                            aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                <div className="security-hint-box">
                    <Info size={15} className="security-hint-icon" />
                    <span>Để bảo vệ tài khoản, mật khẩu mới nên có ít nhất 6 ký tự và khác với mật khẩu cũ.</span>
                </div>

                <div className="security-actions-row">
                    <button
                        type="submit"
                        disabled={loading}
                        className="security-settings-btn-submit"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> Đang cập nhật...
                            </>
                        ) : (
                            "Cập nhật mật khẩu"
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SecuritySettings;
