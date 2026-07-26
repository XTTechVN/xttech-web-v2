'use client';

import React from 'react';
import { Dropdown, Button } from '@/components';
import { User, Settings, Shield, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function InteractiveDropdowns() {
  const handleItemClick = (label: string) => {
    toast.success(`Bạn chọn hành động: ${label}`);
  };

  const menuItems = [
    {
      label: 'Thông tin cá nhân',
      icon: <User size={14} />,
      onClick: () => handleItemClick('Thông tin cá nhân'),
    },
    {
      label: 'Cài đặt tài khoản',
      icon: <Settings size={14} />,
      onClick: () => handleItemClick('Cài đặt tài khoản'),
    },
    {
      label: 'Bảo mật & Quyền riêng tư',
      icon: <Shield size={14} />,
      onClick: () => handleItemClick('Bảo mật & Quyền riêng tư'),
    },
    {
      label: 'Tùy chọn bị khóa',
      icon: <Settings size={14} />,
      disabled: true,
      onClick: () => handleItemClick('Tùy chọn bị khóa'),
    },
    {
      label: 'Đăng xuất hệ thống',
      icon: <LogOut size={14} />,
      danger: true,
      onClick: () => handleItemClick('Đăng xuất hệ thống'),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-6 items-center">
        {/* Left Aligned */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500">Căn lề Trái (Mặc định)</h3>
          <Dropdown
            trigger={
              <Button rightIcon={<ChevronDown size={14} />}>
                Quản lý tài khoản
              </Button>
            }
            items={menuItems}
            align="left"
          />
        </div>

        {/* Right Aligned */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500">Căn lề Phải</h3>
          <Dropdown
            trigger={
              <Button variant="outline" rightIcon={<ChevronDown size={14} />}>
                Thao tác nhanh
              </Button>
            }
            items={menuItems}
            align="right"
          />
        </div>

        {/* Ghost Trigger */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500">Trigger dạng Ghost</h3>
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" rightIcon={<ChevronDown size={14} />}>
                Tùy chọn
              </Button>
            }
            items={menuItems}
            align="left"
          />
        </div>

        {/* Hover Trigger */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-gray-500">Kích hoạt bằng Hover</h3>
          <Dropdown
            trigger={
              <Button variant="outline" rightIcon={<ChevronDown size={14} />}>
                Rê chuột vào
              </Button>
            }
            items={menuItems}
            align="left"
            triggerOn="hover"
          />
        </div>
      </div>
    </div>
  );
}
