'use client';

import React, { useState } from 'react';
import { Input } from '@/components';
import { Select } from '@/components';

interface HistoryLog {
  id: string;
  time: string;
  user: string;
  role: 'admin' | 'user';
  ip: string;
  action: string;
  status: 'success' | 'failed';
  avatar?: string;
}

const SystemHistory = () => {
  // Dữ liệu mockup cho lịch sử đăng nhập hệ thống
  const mockHistoryData: HistoryLog[] = [
    {
      id: '1',
      time: '2026-07-28 09:30',
      user: 'Nguyễn Văn C',
      role: 'admin',
      ip: '192.168.1.1',
      action: 'Đăng nhập hệ thống',
      status: 'success',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    },
    {
      id: '2',
      time: '2026-07-28 09:15',
      user: 'Trần Thị B',
      role: 'user',
      ip: '192.168.1.5',
      action: 'Cập nhật hồ sơ cá nhân',
      status: 'success',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    {
      id: '3',
      time: '2026-07-28 08:45',
      user: 'Lê Văn C',
      role: 'user',
      ip: '192.168.1.12',
      action: 'Đăng nhập sai mật khẩu',
      status: 'failed',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
    },
    {
      id: '4',
      time: '2026-07-28 09:30',
      user: 'Nguyễn Văn A',
      role: 'admin',
      ip: '192.168.1.1',
      action: 'Đăng nhập hệ thống',
      status: 'success',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    },
  ];

  return (
    <div className="flex flex-col gap-4 bg-white border border-gray-300 rounded-xl p-4 shadow-xs">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-lg font-bold text-gray-800">
          <span className="hidden md:inline text-primary">Hoạt động gần đây</span>
          <span className="md:hidden text-primary">Hoạt động gần đây</span>
        </h1>
      </div>
      <div className="flex flex-col">
        {mockHistoryData.map((item) => {
          // Lấy giờ (hh:mm) từ chuỗi thời gian YYYY-MM-DD hh:mm
          const timeOnly = item.time.split(' ')[1] || item.time;

          return (
            <div key={item.id} className="grid grid-cols-12 items-center py-3 border-b border-gray-100 last:border-b-0 text-sm gap-2">
              {/* User Column */}
              <div className="col-span-4 flex items-center gap-3">
                <img src={item.avatar} alt={item.user} className="w-8 h-8 rounded-full object-cover shrink-0 border border-gray-200" />
                <span className="font-semibold text-gray-800 truncate">{item.user}</span>
              </div>

              {/* Action Column */}
              <div className="col-span-6 flex flex-col min-w-0">
                <span className="font-semibold text-gray-700">{item.action}</span>
                <span className={`text-xs font-light italic ${item.status === 'success' ? 'text-success' : 'text-danger'}`}>
                  IP: {item.ip} • Vai trò: {item.role}
                </span>
              </div>

              {/* Time Column */}
              <div className="col-span-2 text-right text-xs text-gray-500 font-medium">{timeOnly}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHistory;
