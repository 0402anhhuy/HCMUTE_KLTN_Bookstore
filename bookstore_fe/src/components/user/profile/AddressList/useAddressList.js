import { useState, useMemo } from "react";
import api from "@/services/api";
import { useApp } from "@/context/AppContext";

export const parseAddress = (addrStr, defaultName = "", defaultPhone = "") => {
    if (!addrStr) return { name: defaultName, phone: defaultPhone, address: "" };
    const parts = addrStr.split("|").map((s) => s.trim());
    if (parts.length >= 3) {
        return {
            name: parts[0],
            phone: parts[1],
            address: parts.slice(2).join(" | "),
        };
    }
    return {
        name: defaultName,
        phone: defaultPhone,
        address: addrStr,
    };
};

export const useAddressList = ({ user, phone, fullName }) => {
    const { updateUser, showToast } = useApp();
    const [loading, setLoading] = useState(false);

    // Address List States
    const [editingIdx, setEditingIdx] = useState(-1);
    const [editName, setEditName] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");

    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [newAddress, setNewAddress] = useState("");

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
        if (!editName.trim()) {
            showToast?.("Họ tên người nhận không được để trống.", "error");
            return;
        }
        if (!editPhone.trim()) {
            showToast?.("Số điện thoại không được để trống.", "error");
            return;
        }
        if (!editAddress.trim()) {
            showToast?.("Địa chỉ không được để trống.", "error");
            return;
        }

        setLoading(true);
        try {
            const formatted = `${editName.trim()} | ${editPhone.trim()} | ${editAddress.trim()}`;
            const savedAddresses = [...addressList];
            savedAddresses[idx] = formatted;
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName?.trim() || user?.fullName || "",
                phone: phone || user?.phone || "",
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
        if (!newName.trim()) {
            showToast?.("Họ tên người nhận không được để trống.", "error");
            return;
        }
        if (!newPhone.trim()) {
            showToast?.("Số điện thoại không được để trống.", "error");
            return;
        }
        if (!newAddress.trim()) {
            showToast?.("Địa chỉ không được để trống.", "error");
            return;
        }

        setLoading(true);
        try {
            const formatted = `${newName.trim()} | ${newPhone.trim()} | ${newAddress.trim()}`;
            const savedAddresses = [...addressList];
            savedAddresses.push(formatted);
            const updatedAddressString = savedAddresses.join(" || ");

            await api.put("/users/profile", {
                fullName: fullName?.trim() || user?.fullName || "",
                phone: phone || user?.phone || "",
                address: updatedAddressString,
                avatarUrl: user?.avatarUrl,
            });
            updateUser?.({ address: updatedAddressString });
            setNewName("");
            setNewPhone("");
            setNewAddress("");
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
                fullName: fullName?.trim() || user?.fullName || "",
                phone: phone || user?.phone || "",
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
                fullName: fullName?.trim() || user?.fullName || "",
                phone: phone || user?.phone || "",
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
    };
};
