"use client";

import React, { useState } from 'react';

// Icons thư viện lucide-react
import { User, Camera, KeyRound, Eye, EyeOff } from 'lucide-react';

// Components dùng chung cho toàn bộ trang
import { Input, Button } from '@/components';

// Dữ liệu mockup
const userMockupData = {
  fullName: 'Trịnh Trần Pi Nút',
  email: 'quyen.nv@xttech.com',
  phoneNumber: '0987654321',
  username: 'quyen.nv',
  roles: 'Admin',
  positions: 'Nhân viên',
};

const ProfileCard = () => {
  const [formData, setFormData] = useState({
    fullName: userMockupData.fullName,
    email: userMockupData.email,
    phoneNumber: userMockupData.phoneNumber,
    username: userMockupData.username,
    roles: userMockupData.roles,
    positions: userMockupData.positions,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic cập nhật thông tin ở đây
  };

  return (
    <div className="flex flex-col gap-6 border border-gray-200 p-6 rounded-xl shadow-xs bg-white">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-12 gap-6 items-center">
          <div className="col-span-12 md:col-span-3 lg:col-span-2 flex justify-center">
            <div className="relative group w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/10 bg-gray-50 flex items-center justify-center transition-all duration-300 hover:border-primary/30 shadow-sm">
              <User className="w-12 h-12 md:w-16 md:h-16 text-gray-400 group-hover:text-primary transition-colors duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 cursor-pointer">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="col-span-12 md:col-span-9 lg:col-span-10 md:border-l md:border-gray-200 md:pl-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              fullWidth
            />
            <Input
              label="Tên đăng nhập"
              name="username"
              value={formData.username}
              placeholder="Tên đăng nhập"
              readOnly
              fullWidth
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email"
              fullWidth
            />
            <Input
              label="Số điện thoại"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Nhập số điện thoại"
              fullWidth
            />
            <Input
              label="Vai trò"
              name="roles"
              value={formData.roles}
              disabled
              readOnly
              placeholder="Vai trò hệ thống"
              fullWidth
            />
            <Input
              label="Chức vụ"
              name="positions"
              value={formData.positions}
              disabled
              readOnly
              placeholder="Chức vụ"
              fullWidth
            />
          </div>
        </div>

        {/* Footer chứa nút Lưu */}
        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <Button variant="outline" type="button" className="w-full sm:w-auto">
            Hủy
          </Button>
          <Button variant="primary" type="submit" className="w-full sm:w-auto">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCard;
