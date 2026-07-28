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
            <div key={item.id} className="py-3 border-b border-gray-100 last:border-b-0 text-sm">
              <div className="flex gap-3">
                <img
                  src={item.avatar}
                  alt={item.user}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-gray-700 text-xs truncate">{item.user}</span>
                    <span className="text-xs md:text-sm text-gray-500 font-medium">{timeOnly}</span>
                  </div>
                  <p className="font-semibold text-gray-700 text-sm mt-0.5">{item.action}</p>
                  <p className={`text-[11px] font-light italic mt-0.5 ${item.status === 'success' ? 'text-success' : 'text-danger'}`}>
                    IP: {item.ip} • Vai trò: {item.role}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHistory;
