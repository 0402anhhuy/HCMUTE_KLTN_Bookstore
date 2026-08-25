import { useState, useMemo } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const useAddressList = ({ user, phone, fullName }) => {
    const { updateUser, showToast } = useApp();
    const [loading, setLoading] = useState(false);

    // Address List States
    const [editingIdx, setEditingIdx] = useState(-1);
    const [editAddressInput, setEditAddressInput] = useState("");
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newAddressInput, setNewAddressInput] = useState("");
    const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(-1);

    const addressList = useMemo(() => {
        const list =
            user && user.address
                ? user.address.split(" || ").filter(Boolean)
                : [];
        if (list.length === 0) {
            list.push("Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam");
        }
        return list;
    }, [user]);

    const handleEditAddressSave = async (idx) => {
        if (!editAddressInput.trim()) {
            showToast?.("Địa chỉ không được để trống.", "error");
            return;
        }
        setLoading(true);
        try {
            const savedAddresses = [...addressList];
            savedAddresses[idx] = editAddressInput.trim();
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone,
                address: updatedAddressString,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ address: updatedAddressString });
            setEditingIdx(-1);
            showToast?.("Cập nhật địa chỉ thành công!", "success");
        } catch (err) {
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi cập nhật.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddNewAddress = async () => {
        if (!newAddressInput.trim()) {
            showToast?.("Địa chỉ không được để trống.", "error");
            return;
        }
        setLoading(true);
        try {
            const savedAddresses = [...addressList];
            savedAddresses.push(newAddressInput.trim());
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone,
                address: updatedAddressString,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ address: updatedAddressString });
            setNewAddressInput("");
            setIsAddingAddress(false);
            showToast?.("Thêm địa chỉ mới thành công!", "success");
        } catch (err) {
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi thêm địa chỉ.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (idx) => {
        setLoading(true);
        try {
            const savedAddresses = [...addressList];
            savedAddresses.splice(idx, 1);
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone,
                address: updatedAddressString,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ address: updatedAddressString });
            showToast?.("Xóa địa chỉ thành công!", "success");
        } catch (err) {
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi xóa địa chỉ.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSetDefaultAddress = async (idx) => {
        setLoading(true);
        try {
            const savedAddresses = [...addressList];
            const [selected] = savedAddresses.splice(idx, 1);
            savedAddresses.unshift(selected);
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName.trim(),
                phone,
                address: updatedAddressString,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ address: updatedAddressString });
            showToast?.("Đã thiết lập địa chỉ mặc định mới!", "success");
        } catch (err) {
            showToast?.(
                err.response?.data?.error ||
                    err.response?.data?.message ||
                    err.message ||
                    "Có lỗi xảy ra khi thiết lập địa chỉ mặc định.",
                "error",
            );
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        addressList,
        editingIdx,
        setEditingIdx,
        editAddressInput,
        setEditAddressInput,
        isAddingAddress,
        setIsAddingAddress,
        newAddressInput,
        setNewAddressInput,
        deleteConfirmIdx,
        setDeleteConfirmIdx,
        handleEditAddressSave,
        handleAddNewAddress,
        handleDeleteAddress,
        handleSetDefaultAddress,
    };
};
