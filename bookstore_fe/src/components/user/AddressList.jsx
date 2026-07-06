import React, { useState } from 'react';
import { MapPin, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useApp } from '../../context/AppContext';

const AddressList = ({ user, phone, fullName, loadData }) => {
  const { updateUser, showToast } = useApp();
  const [loading, setLoading] = useState(false);

  // Address List States
  const [editingIdx, setEditingIdx] = useState(-1);
  const [editAddressInput, setEditAddressInput] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState('');
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(-1);

  const handleEditAddressSave = async (idx) => {
    if (!editAddressInput.trim()) {
      showToast('Địa chỉ không được để trống.', 'error');
      return;
    }
    setLoading(true);
    try {
      const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
      if (savedAddresses.length === 0) {
        savedAddresses.push('Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam');
      }
      savedAddresses[idx] = editAddressInput.trim();
      const updatedAddressString = savedAddresses.join(' || ');

      await api.put('/users/profile', {
        fullName: fullName.trim(),
        phone,
        address: updatedAddressString,
        avatarUrl: user.avatarUrl
      });
      updateUser({ address: updatedAddressString });
      setEditingIdx(-1);
      showToast('Cập nhật địa chỉ thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewAddress = async () => {
    if (!newAddressInput.trim()) {
      showToast('Địa chỉ không được để trống.', 'error');
      return;
    }
    setLoading(true);
    try {
      const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
      if (savedAddresses.length === 0) {
        savedAddresses.push('Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam');
      }
      savedAddresses.push(newAddressInput.trim());
      const updatedAddressString = savedAddresses.join(' || ');

      await api.put('/users/profile', {
        fullName: fullName.trim(),
        phone,
        address: updatedAddressString,
        avatarUrl: user.avatarUrl
      });
      updateUser({ address: updatedAddressString });
      setNewAddressInput('');
      setIsAddingAddress(false);
      showToast('Thêm địa chỉ mới thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || err.message || 'Có lỗi xảy ra khi thêm địa chỉ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (idx) => {
    setLoading(true);
    try {
      const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
      savedAddresses.splice(idx, 1);
      const updatedAddressString = savedAddresses.join(' || ');

      await api.put('/users/profile', {
        fullName: fullName.trim(),
        phone,
        address: updatedAddressString,
        avatarUrl: user.avatarUrl
      });
      updateUser({ address: updatedAddressString });
      showToast('Xóa địa chỉ thành công!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || err.message || 'Có lỗi xảy ra khi xóa địa chỉ.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (idx) => {
    setLoading(true);
    try {
      const savedAddresses = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
      const [selected] = savedAddresses.splice(idx, 1);
      savedAddresses.unshift(selected);
      const updatedAddressString = savedAddresses.join(' || ');

      await api.put('/users/profile', {
        fullName: fullName.trim(),
        phone,
        address: updatedAddressString,
        avatarUrl: user.avatarUrl
      });
      updateUser({ address: updatedAddressString });
      showToast('Đã thiết lập địa chỉ mặc định mới!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || err.response?.data?.message || err.message || 'Có lỗi xảy ra khi thiết lập địa chỉ mặc định.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MapPin size={18} style={{ color: '#0a422d' }} /> Danh sách địa chỉ nhận hàng
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {(() => {
          const list = user && user.address ? user.address.split(' || ').filter(Boolean) : [];
          if (list.length === 0) {
            list.push('Linh Trung, Thủ Đức, Thành phố Hồ Chí Minh, Việt Nam');
          }
          return list.map((addr, idx) => {
            const isDefault = idx === 0;
            const isEditingThis = editingIdx === idx;
            
            return (
              <div 
                key={idx} 
                style={{ 
                  border: isDefault ? '1.5px solid #10b981' : '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  position: 'relative', 
                  backgroundColor: isDefault ? '#f0fdf4' : '#fff',
                  transition: 'all 0.2s'
                }}
              >
                {/* Badge / Tag */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ 
                    display: 'inline-block', 
                    backgroundColor: isDefault ? '#d1fae5' : '#f3f4f6', 
                    color: isDefault ? '#065f46' : '#4b5563', 
                    fontSize: '0.7rem', 
                    fontWeight: 700, 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                  }}>
                    {isDefault ? 'Mặc định' : `Địa chỉ phụ ${idx}`}
                  </span>

                  {/* Action buttons (only when not editing) */}
                  {!isEditingThis && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {deleteConfirmIdx === idx ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>Xác nhận xóa?</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleDeleteAddress(idx);
                              setDeleteConfirmIdx(-1);
                            }}
                            style={{ padding: '2px 8px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                          >
                            Xóa
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmIdx(-1)}
                            style={{ padding: '2px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#fff', color: '#374151', cursor: 'pointer' }}
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <>
                          {!isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(idx)}
                              style={{ 
                                background: 'none', 
                                border: 'none', 
                                color: '#0a422d', 
                                fontSize: '0.75rem', 
                                fontWeight: 600, 
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#e6f4ea'
                              }}
                            >
                              Đặt làm mặc định
                            </button>
                          )}
                          <button 
                            type="button"
                            onClick={() => {
                              setEditingIdx(idx);
                              setEditAddressInput(addr);
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 0 }}
                            title="Chỉnh sửa"
                          >
                            <Edit size={15} />
                          </button>
                          {list.length > 1 && (
                            <button 
                              type="button"
                              onClick={() => setDeleteConfirmIdx(idx)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 0 }}
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

                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                  {user.fullName} | {phone}
                </div>

                {!isEditingThis ? (
                  <div style={{ fontSize: '0.85rem', color: '#4b5563', marginTop: '6px', lineHeight: 1.5 }}>
                    {addr}
                  </div>
                ) : (
                  <div style={{ marginTop: '10px' }}>
                    <textarea 
                      value={editAddressInput} 
                      onChange={(e) => setEditAddressInput(e.target.value)} 
                      style={{ 
                        width: '100%', 
                        padding: '8px 10px', 
                        border: '1px solid #d1d5db', 
                        borderRadius: '6px', 
                        fontSize: '0.85rem', 
                        outline: 'none', 
                        boxSizing: 'border-box', 
                        minHeight: '60px', 
                        fontFamily: 'inherit' 
                      }} 
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button" 
                        onClick={() => setEditingIdx(-1)}
                        style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#fff', cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleEditAddressSave(idx)}
                        style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#0a422d', color: '#fff', cursor: 'pointer' }}
                      >
                        Lưu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          });
        })()}

        {/* Add New Address Form Inline */}
        {isAddingAddress && (
          <div style={{ border: '1.5px dashed #0a422d', borderRadius: '8px', padding: '16px', backgroundColor: '#fafafa' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', marginBottom: '8px' }}>
              Nhập địa chỉ mới
            </div>
            <textarea 
              value={newAddressInput} 
              onChange={(e) => setNewAddressInput(e.target.value)} 
              placeholder="Ví dụ: 123 Đường Linh Trung, Phường Linh Trung, Thành phố Thủ Đức, TP. HCM"
              style={{ 
                width: '100%', 
                padding: '8px 10px', 
                border: '1px solid #d1d5db', 
                borderRadius: '6px', 
                fontSize: '0.85rem', 
                outline: 'none', 
                boxSizing: 'border-box', 
                minHeight: '60px', 
                fontFamily: 'inherit' 
              }} 
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => {
                  setIsAddingAddress(false);
                  setNewAddressInput('');
                }}
                style={{ padding: '4px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Hủy
              </button>
              <button 
                type="button" 
                onClick={handleAddNewAddress}
                style={{ padding: '4px 12px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', backgroundColor: '#0a422d', color: '#fff', cursor: 'pointer' }}
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
          onClick={() => setIsAddingAddress(true)}
          style={{ 
            marginTop: '14px', 
            width: '100%', 
            padding: '10px', 
            border: '1px dashed #0a422d', 
            borderRadius: '8px', 
            backgroundColor: 'transparent', 
            color: '#0a422d', 
            fontWeight: 600, 
            fontSize: '0.85rem', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          + Thêm địa chỉ mới
        </button>
      )}
    </div>
  );
};

export default AddressList;
