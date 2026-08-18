'use client';

import React, { useState } from 'react';
import { User, Camera } from 'lucide-react';
import { Modal, Input, Button } from '@/components';
import { useAuthStore } from '@/stores';
import { BASE_MINIO_URL } from '@/config';
import { AuthUser } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { updateEmployee } from '@/actions';
import toast from 'react-hot-toast';

export interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ProfileForm({ user, onClose }: { user: AuthUser | null; onClose: () => void }) {
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    username: user?.username || '',
    roles: user?.roles?.[0]?.name || '',
    positions: user?.positions?.[0]?.name || '',
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      if (!user?.id) throw new Error('Không tìm thấy ID người dùng');
      return updateEmployee(user.id, data);
    },
    onSuccess: (res) => {
      if (res && res.user) {
        useAuthStore.setState({ user: res.user });
      } else if (res && user) {
        useAuthStore.setState({ user: { ...user, ...res } });
      }
      toast.success('Cập nhật thông tin thành công!');
      onClose();
    },
    onError: (error: Error) => {
      toast.error(error?.message || 'Cập nhật thất bại');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {};
    if (profileData.fullName && profileData.fullName !== user?.fullName) payload.fullName = profileData.fullName;
    if (profileData.email && profileData.email !== user?.email) payload.email = profileData.email;
    if (profileData.phoneNumber && profileData.phoneNumber !== user?.phoneNumber) payload.phoneNumber = profileData.phoneNumber;

    if (Object.keys(payload).length === 0) {
      toast.error('Không có thông tin nào thay đổi!');
      return;
    }
    updateProfile(payload);
  };

  const avatarUrl = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${BASE_MINIO_URL}${user.avatar}`
    : null;

  return (
    <form id="profile-form" onSubmit={handleProfileSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-12 gap-6 items-center">
        <div className="col-span-12 md:col-span-4 flex justify-center">
          <div className="relative group w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/10 bg-gray-50 flex items-center justify-center transition-all duration-300 hover:border-primary/30 shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400 group-hover:text-primary transition-colors duration-300" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-8 md:border-l md:border-gray-200 md:pl-6 grid grid-cols-1 gap-4">
          <Input label="Họ và tên" name="fullName" value={profileData.fullName} onChange={handleProfileChange} placeholder="Nhập họ và tên" fullWidth />
          <Input label="Tên đăng nhập" name="username" value={profileData.username} placeholder="Tên đăng nhập" readOnly fullWidth />
          <Input label="Email" name="email" type="email" value={profileData.email} onChange={handleProfileChange} placeholder="Nhập email" fullWidth />
          <Input label="Số điện thoại" name="phoneNumber" value={profileData.phoneNumber} onChange={handleProfileChange} placeholder="Nhập số điện thoại" fullWidth />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Vai trò" name="roles" value={profileData.roles} disabled readOnly placeholder="Vai trò hệ thống" fullWidth />
            <Input label="Chức vụ" name="positions" value={profileData.positions} disabled readOnly placeholder="Chức vụ" fullWidth />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" type="button" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="primary" type="submit" loading={isPending} disabled={isPending}>
          Lưu thay đổi
        </Button>
      </div>
    </form>
  );
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuthStore();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thông tin cá nhân" size="lg">
      <ProfileForm user={user} onClose={onClose} />
    </Modal>
  );
}
