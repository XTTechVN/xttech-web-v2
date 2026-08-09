'use client';

import React, { useState } from 'react';
import { Tabs, Badge } from '@/components';
import { User, Settings, Bell } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function InteractiveTabsBadges() {
  const [activeTab1, setActiveTab1] = useState('profile');
  const [activeTab2, setActiveTab2] = useState('profile');

  const tabItems = [
    { value: 'profile', label: 'Tài khoản', icon: <User size={14} /> },
    { value: 'notifications', label: 'Thông báo', icon: <Bell size={14} /> },
    { value: 'settings', label: 'Cấu hình', icon: <Settings size={14} /> },
    { value: 'security', label: 'Bảo mật (Đang khóa)', disabled: true },
  ];

  const handleTabChange1 = (value: string) => {
    setActiveTab1(value);
    toast.success(`Chuyển sang Tab Line: ${value}`);
  };

  const handleTabChange2 = (value: string) => {
    setActiveTab2(value);
    toast.success(`Chuyển sang Tab Pill: ${value}`);
  };

  return (
    <div className="space-y-6">
      {/* Badge section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">1. Badge (Nhãn trạng thái)</h3>
        <div className="space-y-4 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
          {/* Rounded Badges */}
          <div className="space-y-2">
            <h4 className="text-xs text-gray-500 font-medium">Kiểu bo góc vừa (Default rounded)</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Mặc định</Badge>
              <Badge variant="primary">Thương hiệu</Badge>
              <Badge variant="success">Hoàn thành</Badge>
              <Badge variant="warning">Đang chờ</Badge>
              <Badge variant="danger">Thất bại</Badge>
              <Badge variant="info">Thông tin</Badge>
            </div>
          </div>

          <hr className="border-gray-150" />

          {/* Pill Badges */}
          <div className="space-y-2">
            <h4 className="text-xs text-gray-500 font-medium">Kiểu bo tròn hoàn toàn (Pill)</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" pill>Default</Badge>
              <Badge variant="primary" pill>Primary</Badge>
              <Badge variant="success" pill>Success</Badge>
              <Badge variant="warning" pill>Warning</Badge>
              <Badge variant="danger" pill>Danger</Badge>
              <Badge variant="info" pill>Info</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs section */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-400 uppercase">2. Tabs (Menu chuyển đổi)</h3>
        <div className="space-y-6 border border-gray-100 p-4 rounded-lg bg-gray-50/50">
          {/* Line Variant */}
          <div className="space-y-2">
            <h4 className="text-xs text-gray-500 font-medium">Biến thể Line (Gạch chân)</h4>
            <Tabs
              tabs={tabItems}
              activeTab={activeTab1}
              onChange={handleTabChange1}
              variant="line"
            />
          </div>

          {/* Pill Variant */}
          <div className="space-y-2">
            <h4 className="text-xs text-gray-500 font-medium">Biến thể Pill (Bo tròn hộp chọn)</h4>
            <Tabs
              tabs={tabItems}
              activeTab={activeTab2}
              onChange={handleTabChange2}
              variant="pill"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
