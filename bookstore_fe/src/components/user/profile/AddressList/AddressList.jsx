import { MapPin, Edit, Trash2 } from "lucide-react";
import { useAddressList, parseAddress } from "./useAddressList";
import "./AddressList.css";

const AddressList = ({ user, phone, fullName }) => {
    const {
        addressList,
        editingIdx,
        setEditingIdx,
        editName,
        setEditName,
        editPhone,
        setEditPhone,
        editAddress,
        setEditAddress,
        isAddingAddress,
        setIsAddingAddress,
        newName,
        setNewName,
        newPhone,
        setNewPhone,
        newAddress,
        setNewAddress,
        deleteConfirmIdx,
        setDeleteConfirmIdx,
        handleEditAddressSave,
        handleAddNewAddress,
        handleDeleteAddress,
        handleSetDefaultAddress,
    } = useAddressList({ user, phone, fullName });

    return (
        <div className="address-list-card">
            <h3 className="address-list-title">
                <MapPin size={18} className="address-list-icon" /> Danh sách địa
                chỉ nhận hàng
            </h3>

            <div className="address-list-stack">
                {addressList.map((addr, idx) => {
                    const isDefault = idx === 0;
                    const isEditingThis = editingIdx === idx;
                    const parsed = parseAddress(addr, fullName || user?.fullName, phone);

                    return (
                        <div
                            key={idx}
                            className={`address-item-card ${isDefault ? "default" : ""}`}
                        >
                            {/* Badge / Tag */}
                            <div className="address-item-top">
                                <span
                                    className={`address-badge ${isDefault ? "default" : ""}`}
                                >
                                    {isDefault
                                        ? "Mặc định"
                                        : `Địa chỉ phụ ${idx}`}
                                </span>

                                {/* Action buttons (only when not editing) */}
                                {!isEditingThis && (
                                    <div className="address-actions-group">
                                        {deleteConfirmIdx === idx ? (
                                            <div className="address-delete-confirm-box">
                                                <span className="address-delete-confirm-text">
                                                    Xác nhận xóa?
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        handleDeleteAddress(
                                                            idx,
                                                        );
                                                        setDeleteConfirmIdx(-1);
                                                    }}
                                                    className="address-btn-delete-confirm"
                                                >
                                                    Xóa
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDeleteConfirmIdx(-1)
                                                    }
                                                    className="address-btn-cancel-mini"
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                {!isDefault && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSetDefaultAddress(
                                                                idx,
                                                            )
                                                        }
                                                        className="address-btn-set-default"
                                                    >
                                                        Đặt làm mặc định
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingIdx(idx);
                                                        setEditName(parsed.name);
                                                        setEditPhone(parsed.phone);
                                                        setEditAddress(parsed.address);
                                                    }}
                                                    className="address-btn-icon-edit"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit size={15} />
                                                </button>
                                                {addressList.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteConfirmIdx(
                                                                idx,
                                                            )
                                                        }
                                                        className="address-btn-icon-trash"
                                                        title="Xóa địa chỉ"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {!isEditingThis ? (
                                <>
                                    <div className="address-recipient-info">
                                        {parsed.name} | {parsed.phone}
                                    </div>
                                    <div className="address-text-display">
                                        {parsed.address}
                                    </div>
                                </>
                            ) : (
                                <div className="address-edit-box">
                                    <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            placeholder="Họ tên người nhận"
                                            style={{
                                                flex: 1,
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0",
                                                fontSize: "0.9rem",
                                                outline: "none"
                                            }}
                                        />
                                        <input
                                            type="text"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="Số điện thoại nhận"
                                            style={{
                                                flex: 1,
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                border: "1px solid #e2e8f0",
                                                fontSize: "0.9rem",
                                                outline: "none"
                                            }}
                                        />
                                    </div>
                                    <textarea
                                        value={editAddress}
                                        onChange={(e) =>
                                            setEditAddress(e.target.value)
                                        }
                                        className="address-textarea"
                                        placeholder="Địa chỉ nhận hàng cụ thể"
                                    />
                                    <div className="address-edit-actions">
                                        <button
                                            type="button"
                                            onClick={() => setEditingIdx(-1)}
                                            className="address-btn-action-cancel"
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleEditAddressSave(idx)
                                            }
                                            className="address-btn-action-save"
                                        >
                                            Lưu
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Add New Address Form Inline */}
                {isAddingAddress && (
                    <div className="address-add-card">
                        <div className="address-add-title">
                            Nhập địa chỉ mới
                        </div>
                        <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Họ tên người nhận"
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "0.9rem",
                                    outline: "none"
                                }}
                            />
                            <input
                                type="text"
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)}
                                placeholder="Số điện thoại nhận"
                                style={{
                                    flex: 1,
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "1px solid #e2e8f0",
                                    fontSize: "0.9rem",
                                    outline: "none"
                                }}
                            />
                        </div>
                        <textarea
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="Ví dụ: 123 Đường Linh Trung, Phường Linh Trung, Thành phố Thủ Đức, TP. HCM"
                            className="address-textarea"
                        />
                        <div className="address-edit-actions">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingAddress(false);
                                    setNewName("");
                                    setNewPhone("");
                                    setNewAddress("");
                                }}
                                className="address-btn-action-cancel"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleAddNewAddress}
                                className="address-btn-action-save"
                            >
                                Thêm địa chỉ
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {!isAddingAddress && editingIdx === -1 && (
                <button
                    type="button"
                    onClick={() => {
                        setIsAddingAddress(true);
                        setNewName(fullName || user?.fullName || "");
                        setNewPhone(phone || user?.phone || "");
                        setNewAddress("");
                    }}
                    className="address-btn-open-add"
                >
                    + Thêm địa chỉ mới
                </button>
            )}
        </div>
    );
};

export default AddressList;
